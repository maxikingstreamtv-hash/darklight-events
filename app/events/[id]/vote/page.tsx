/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { votingIsOpen } from "@/lib/events/judging";
import VoteButtons from "@/components/events/VoteButtons";

export const dynamic="force-dynamic";
export default async function VotePage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{ok?:string;error?:string}>}){
  const {id}=await params;const query=await searchParams;const user=await getCurrentUser();
  const event=await prisma.event.findUnique({where:{id},select:{id:true,title:true,active:true,public:true,resultMethod:true,votingOpenAt:true,votingCloseAt:true,resultsPublishedAt:true,allowVoteChange:true,voteCandidates:{where:{active:true,public:true},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}],select:{id:true,imageUrl:true}}}});
  if(!event||!event.active||!event.public||!["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE"].includes(event.resultMethod))notFound();
  const ownVote=user?await prisma.publicVote.findUnique({where:{eventId_userId:{eventId:id,userId:user.id}},select:{candidateId:true}}):null;const open=votingIsOpen(event);
  return <main className="min-h-screen bg-black px-6 py-28 text-white"><div className="mx-auto max-w-7xl"><Link href={`/events/${id}`} className="text-sm text-zinc-400">← Tilbage til eventet</Link><h1 className="mt-6 text-5xl font-black">Publikumsafstemning</h1><p className="mt-4 text-zinc-400">{event.title} · {event.resultsPublishedAt?"Resultater offentliggjort":open?"Afstemning åben":event.votingOpenAt?"Afstemning lukket":"Afstemning ikke åbnet"}</p>
  {query.ok?<p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">{query.ok}</p>:null}{query.error?<p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">{query.error}</p>:null}
  {event.voteCandidates.length===0?<div className="mt-8 rounded-[2rem] border border-white/10 p-8 text-center"><h2 className="text-2xl font-black">Ingen billeder endnu</h2><p className="mt-2 text-zinc-400">Afstemningsbillederne bliver vist her, når arrangøren har offentliggjort dem.</p></div>:<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{event.voteCandidates.map(candidate=>{const selected=ownVote?.candidateId===candidate.id;return <article key={candidate.id} className={`overflow-hidden rounded-[2rem] border bg-white/[.04] ${selected?"border-violet-300":"border-white/10"}`}><div className="aspect-[4/3] bg-zinc-950"><img src={candidate.imageUrl} alt="Afstemningsbillede" className="h-full w-full object-cover"/></div><div className="p-5"><VoteButtons eventId={id} candidateId={candidate.id} selected={selected} hasVote={Boolean(ownVote)} open={open} allowChange={event.allowVoteChange} loggedIn={Boolean(user)}/></div></article>})}</div>}
  </div></main>;
}
