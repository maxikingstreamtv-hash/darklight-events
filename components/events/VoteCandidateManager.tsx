"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import ImageUploadField from "@/components/images/ImageUploadField";
import { deleteVoteCandidateAction, moveVoteCandidateAction, saveVoteCandidateAction } from "@/app/competition/judging/candidate-actions";

type Option={id:string;label:string};
type Candidate={id:string;imageUrl:string;participantId:string|null;active:boolean;public:boolean;sortOrder:number};
const field="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white";

export default function VoteCandidateManager({eventId,candidates,participants,feedback}:{eventId:string;candidates:Candidate[];participants:Option[];feedback?:{type:"ok"|"error";message:string}}){
  const [draftId]=useState(()=>crypto.randomUUID());
  return <section id="afstemningskandidater" className="mb-7 scroll-mt-8 rounded-[2rem] border border-white/10 bg-black p-6">
    <h3 className="text-2xl font-black">Stemmekandidater</h3><p className="mt-2 text-sm text-zinc-400">Tilføj de billeder, som brugerne kan stemme på.</p>
    {feedback?<p className={`mt-4 rounded-xl border p-3 text-sm font-bold ${feedback.type==="ok"?"border-emerald-400/30 bg-emerald-400/10 text-emerald-100":"border-red-400/30 bg-red-400/10 text-red-100"}`}>{feedback.message}</p>:null}
    <details className="mt-5 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-black">Tilføj billede</summary><CandidateForm eventId={eventId} candidateId={draftId} participants={participants}/></details>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{candidates.map(candidate=><article key={candidate.id} className="overflow-hidden rounded-2xl border border-white/10"><div className="aspect-[4/3] bg-zinc-950"><img src={candidate.imageUrl} alt="Stemmekandidat" className="h-full w-full object-cover"/></div><details className="p-4"><summary className="cursor-pointer font-black">Redigér</summary><CandidateForm eventId={eventId} candidateId={candidate.id} candidate={candidate} participants={participants}/></details><div className="flex flex-wrap gap-2 border-t border-white/10 p-4"><form action={moveVoteCandidateAction.bind(null,eventId,candidate.id,"up")}><button className="rounded-full border border-white/15 px-3 py-2 text-sm font-bold">Op</button></form><form action={moveVoteCandidateAction.bind(null,eventId,candidate.id,"down")}><button className="rounded-full border border-white/15 px-3 py-2 text-sm font-bold">Ned</button></form><form action={deleteVoteCandidateAction.bind(null,eventId,candidate.id)} className="flex items-center gap-2"><label className="text-xs text-zinc-400"><input name="confirm" type="checkbox" value="delete"/> Bekræft</label><button className="rounded-full border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200">Slet</button></form></div></article>)}</div>
  </section>;
}

function CandidateForm({eventId,candidateId,candidate,participants}:{eventId:string;candidateId:string;candidate?:Candidate;participants:Option[]}){
  return <form action={saveVoteCandidateAction.bind(null,eventId,candidateId)} className="mt-5 grid gap-4"><ImageUploadField name="imageUrl" scope="vote" ownerId={`${eventId}-${candidateId}`} initialUrl={candidate?.imageUrl} label="Billede" chooseLabel="Tilføj billede" helpText="Billedet vises på den offentlige stemmeside." variant="cover"/><select name="participantId" defaultValue={candidate?.participantId??""} className={field}><option value="">Ingen resultatkobling</option>{participants.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select><input name="sortOrder" type="number" defaultValue={candidate?.sortOrder??0} aria-label="Sortering" className={field}/><div className="flex flex-wrap gap-4"><label><input name="active" type="checkbox" defaultChecked={candidate?.active??true}/> Aktiv</label><label><input name="public" type="checkbox" defaultChecked={candidate?.public??true}/> Offentlig</label></div><button className="w-fit rounded-full bg-white px-5 py-3 font-black text-black">{candidate?"Gem ændringer":"Tilføj billede"}</button></form>;
}
