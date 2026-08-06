"use server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { canManageVoteCandidates, ownedCandidateBlobUrls, readVoteCandidate } from "@/lib/events/vote-candidates";
import { deleteNewBlobAfterFailedSave } from "@/lib/images/blob-cleanup";

function feedback(eventId:string,type:"ok"|"error",message:string):never{redirect(`/competition/events/${eventId}?tab=results&candidate${type==="ok"?"Saved":"Error"}=${encodeURIComponent(message)}#afstemningskandidater`)}
async function actorFor(eventId:string){const actor=await requireCurrentUser();if(!canManageVoteCandidates(actor.role))feedback(eventId,"error","Du har ikke adgang til at administrere afstemningskandidater.");if(!await prisma.event.findUnique({where:{id:eventId},select:{id:true}}))feedback(eventId,"error","Eventet findes ikke længere.");return actor;}
function refresh(eventId:string){revalidatePath(`/competition/events/${eventId}`);revalidatePath(`/events/${eventId}`);revalidatePath(`/events/${eventId}/vote`);revalidatePath("/afstemning");}

export async function saveVoteCandidateAction(eventId:string,candidateId:string,formData:FormData){
  const actor=await actorFor(eventId);
  const previous=await prisma.voteCandidate.findUnique({where:{id:candidateId},select:{eventId:true,imageUrl:true}});
  try{
    const values=readVoteCandidate(formData);
    if(values.participantId&&!await prisma.participant.findFirst({where:{id:values.participantId,competition:{eventId}},select:{id:true}}))throw new Error("Den valgte deltager hører ikke til eventet.");
    if(previous&&previous.eventId!==eventId)throw new Error("Kandidaten hører ikke til eventet.");
    const visibility={active:formData.get("active")==="on",public:formData.get("public")==="on"};
    const candidate=previous
      ? await prisma.voteCandidate.update({where:{id:candidateId},data:{...values,...visibility}})
      : await prisma.voteCandidate.create({data:{id:candidateId,eventId,createdById:actor.id,...values,...visibility}});
    await writeAuditLog({actorId:actor.id,action:previous?"VOTE_CANDIDATE_UPDATED":"VOTE_CANDIDATE_CREATED",target:`VoteCandidate:${candidate.id}`,details:{eventId,participantId:candidate.participantId}});
    refresh(eventId);
    const obsolete=ownedCandidateBlobUrls([previous?.imageUrl&&previous.imageUrl!==candidate.imageUrl?previous.imageUrl:null]);
    if(obsolete.length)try{await del(obsolete)}catch{}
    feedback(eventId,"ok",previous?"Kandidaten blev opdateret.":"Kandidaten blev oprettet.");
  }catch(error){await deleteNewBlobAfterFailedSave(String(formData.get("imageUrl")??"")||null,previous?.imageUrl);feedback(eventId,"error",error instanceof Error?error.message:"Kandidaten kunne ikke gemmes.");}
}

export async function toggleVoteCandidateAction(eventId:string,id:string,visible:boolean){const actor=await actorFor(eventId);const updated=await prisma.voteCandidate.updateMany({where:{id,eventId},data:{active:visible,public:visible}});if(!updated.count)feedback(eventId,"error","Kandidaten findes ikke længere.");await writeAuditLog({actorId:actor.id,action:visible?"VOTE_CANDIDATE_SHOWN":"VOTE_CANDIDATE_HIDDEN",target:`VoteCandidate:${id}`,details:{eventId}});refresh(eventId);feedback(eventId,"ok",visible?"Kandidaten blev aktiveret.":"Kandidaten blev skjult.");}
export async function moveVoteCandidateAction(eventId:string,id:string,direction:"up"|"down"){await actorFor(eventId);const rows=await prisma.voteCandidate.findMany({where:{eventId},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}],select:{id:true,sortOrder:true}});const index=rows.findIndex(row=>row.id===id);const other=direction==="up"?index-1:index+1;if(index<0||other<0||other>=rows.length)feedback(eventId,"error","Kandidaten kan ikke flyttes længere.");await prisma.$transaction([prisma.voteCandidate.update({where:{id:rows[index].id},data:{sortOrder:rows[other].sortOrder}}),prisma.voteCandidate.update({where:{id:rows[other].id},data:{sortOrder:rows[index].sortOrder}})]);refresh(eventId);feedback(eventId,"ok","Sorteringen blev opdateret.");}
export async function deleteVoteCandidateAction(eventId:string,id:string,formData:FormData){const actor=await actorFor(eventId);if(formData.get("confirm")!=="delete")feedback(eventId,"error","Bekræft sletning af kandidaten.");const candidate=await prisma.voteCandidate.findFirst({where:{id,eventId},select:{imageUrl:true}});if(!candidate)feedback(eventId,"error","Kandidaten findes ikke længere.");await prisma.$transaction(async tx=>{await tx.publicVote.deleteMany({where:{candidateId:id}});await tx.voteCandidate.delete({where:{id}})});await writeAuditLog({actorId:actor.id,action:"VOTE_CANDIDATE_DELETED",target:`VoteCandidate:${id}`,details:{eventId}});refresh(eventId);const urls=ownedCandidateBlobUrls([candidate.imageUrl]);if(urls.length)try{await del(urls)}catch{}feedback(eventId,"ok","Kandidaten blev slettet.");}
