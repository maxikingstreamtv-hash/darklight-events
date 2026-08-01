/* eslint-disable @next/next/no-img-element */
import Footer from "@/components/layout/Footer";
import ImageUploadField from "@/components/images/ImageUploadField";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteTeamMemberAction, saveTeamMemberAction } from "./actions";

export const dynamic = "force-dynamic";
const field = "w-full min-w-0 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [members, actor, params] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    getCurrentUser(),
    searchParams,
  ]);
  const canManage = actor?.role === "SUPER_ADMIN";
  const visible = canManage ? members : members.filter((member) => member.active);
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-28"><div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight Team</p>
        <h1 className="mt-4 text-5xl font-black md:text-7xl">Mød teamet</h1>
        <p className="mt-6 max-w-3xl text-zinc-400">Menneskene bag DarkLight Events – direkte fra vores teamdatabase.</p>
        {params.ok ? <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200">{params.ok}</p> : null}
        {params.error ? <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">{params.error}</p> : null}
        {visible.length ? <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{visible.map((member) => (
          <article key={member.id} className="min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
            <div className="aspect-[4/5] overflow-hidden bg-zinc-950">{member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl font-black text-zinc-700">{member.name.slice(0, 2).toUpperCase()}</div>}</div>
            <div className="p-7"><h2 className="text-3xl font-black">{member.name}</h2><p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{member.roleTitle}</p>{member.secondaryTitle ? <p className="mt-2 text-zinc-400">{member.secondaryTitle}</p> : null}{member.quote ? <p className="mt-5 italic text-zinc-300">“{member.quote}”</p> : null}{member.bio ? <p className="mt-5 leading-7 text-zinc-400">{member.bio}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{member.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">{skill}</span>)}</div></div>
            {canManage ? <TeamForm member={member} /> : null}
          </article>
        ))}</div> : <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center"><h2 className="text-3xl font-black">Teamet er ikke offentliggjort endnu</h2><p className="mt-3 text-zinc-500">Kom snart tilbage og mød holdet.</p></div>}
        {canManage ? <section id="team-admin" className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8"><h2 className="text-3xl font-black">Tilføj teammedlem</h2><TeamForm /></section> : null}
      </div></section><Footer />
    </main>
  );
}

function TeamForm({ member }: { member?: { id: string; name: string; roleTitle: string; secondaryTitle: string | null; quote: string | null; bio: string | null; imageUrl: string | null; skills: string[]; active: boolean; sortOrder: number } }) {
  return <div className="border-t border-white/10 p-6"><form action={saveTeamMemberAction} className="grid min-w-0 gap-4 sm:grid-cols-2"><input type="hidden" name="id" value={member?.id ?? ""} /><input name="name" defaultValue={member?.name} required placeholder="Navn" className={field} /><input name="roleTitle" defaultValue={member?.roleTitle} required placeholder="Rolle / titel" className={field} /><input name="secondaryTitle" defaultValue={member?.secondaryTitle ?? ""} placeholder="Sekundær titel" className={field} /><input name="skills" defaultValue={member?.skills.join(", ")} placeholder="Tags, adskilt med komma" className={field} /><textarea name="quote" defaultValue={member?.quote ?? ""} placeholder="Citat" className={`${field} sm:col-span-2`} /><textarea name="bio" defaultValue={member?.bio ?? ""} placeholder="Kort bio" className={`${field} sm:col-span-2`} /><div className="sm:col-span-2"><ImageUploadField name="imageUrl" scope="team" ownerId={member?.id ?? "draft"} initialUrl={member?.imageUrl ?? ""} label="Portræt" chooseLabel="Vælg teambillede" helpText="Anbefalet: portrætformat, mindst 800 × 1000 px." variant="cover" allowExternalUrl /></div><input name="sortOrder" type="number" defaultValue={member?.sortOrder ?? 0} className={field} /><label className="flex items-center gap-3"><input name="active" type="checkbox" defaultChecked={member?.active ?? true} /> Offentlig</label><button className="rounded-full bg-white px-6 py-3 font-black text-black">{member ? "Gem ændringer" : "Opret teammedlem"}</button></form>{member ? <form action={deleteTeamMemberAction.bind(null, member.id)} className="mt-3"><button className="text-sm font-black text-red-300">Slet teammedlem</button></form> : null}</div>;
}
