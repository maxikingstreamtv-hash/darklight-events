"use client";
import { castVoteAction, changeVoteAction, withdrawVoteAction } from "@/app/competition/judging/actions";

export default function VoteButtons({eventId,candidateId,selected,hasVote,open,allowChange,loggedIn}:{eventId:string;candidateId:string;selected:boolean;hasVote:boolean;open:boolean;allowChange:boolean;loggedIn:boolean}){
  if(!loggedIn)return <div className="grid grid-cols-2 gap-3"><a href={`/login?callbackUrl=/events/${eventId}/vote`} className="rounded-full bg-white px-5 py-3 text-center font-black text-black">Stem</a><button disabled className="rounded-full border border-white/15 px-5 py-3 font-black opacity-40">Fortryd</button></div>;
  const voteAction=hasVote&&!selected?changeVoteAction.bind(null,eventId,candidateId):castVoteAction.bind(null,eventId,candidateId);
  return <div className="grid grid-cols-2 gap-3"><form action={voteAction} onSubmit={(event)=>{if(hasVote&&!selected&&!window.confirm("Vil du ændre din stemme til dette billede?"))event.preventDefault();}}><input type="hidden" name="confirm" value="change"/><button disabled={!open||selected||(hasVote&&!allowChange)} className="w-full rounded-full bg-white px-5 py-3 font-black text-black disabled:opacity-40">{selected?"Stemt":"Stem"}</button></form><form action={withdrawVoteAction.bind(null,eventId)}><button disabled={!open||!selected} className="w-full rounded-full border border-white/15 px-5 py-3 font-black disabled:opacity-40">Fortryd</button></form></div>;
}
