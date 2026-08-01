/* eslint-disable @next/next/no-img-element */
import Footer from "@/components/layout/Footer";
import ImageUploadField from "@/components/images/ImageUploadField";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { publicTeamSections, visibleTeamMembers } from "@/lib/team/team-members";
import { deleteTeamMemberAction, deleteTeamSectionAction, saveTeamMemberAction, saveTeamSectionAction } from "./actions";

export const dynamic = "force-dynamic";
const field = "w-full min-w-0 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white";

type TeamMemberData = {
  id: string;
  name: string;
  roleTitle: string;
  secondaryTitle: string | null;
  quote: string | null;
  bio: string | null;
  imageUrl: string | null;
  skills: string[];
  active: boolean;
  sortOrder: number;
  sectionId: string | null;
};

type TeamSectionOption = { id: string; name: string; sortOrder: number };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [sections, unsectionedMembers, actor, params] = await Promise.all([
    prisma.teamSection.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { members: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }, _count: { select: { members: true } } },
    }),
    prisma.teamMember.findMany({ where: { sectionId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    getCurrentUser(),
    searchParams,
  ]);
  const canManage = actor?.role === "SUPER_ADMIN";
  const publicSections = publicTeamSections(sections);
  const publicUnsectioned = visibleTeamMembers(unsectionedMembers);
  const hasPublicMembers = publicSections.length > 0 || publicUnsectioned.length > 0;
  const sectionOptions = sections.map(({ id, name, sortOrder }) => ({ id, name, sortOrder }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <section className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <header className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight Team</p>
            <h1 className="mt-4 text-5xl font-black md:text-7xl">Mød teamet</h1>
            <p className="mx-auto mt-6 max-w-3xl text-zinc-400">Menneskene bag DarkLight Events – direkte fra vores teamdatabase.</p>
          </header>

          {params.ok ? <p className="mx-auto mt-8 max-w-4xl rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200">{params.ok}</p> : null}
          {params.error ? <p className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">{params.error}</p> : null}

          {hasPublicMembers ? (
            <div className="mt-20 space-y-28">
              {publicSections.map((section) => <PublicTeamSection key={section.id} name={section.name} description={section.description} members={section.members} />)}
              {publicUnsectioned.length > 0 ? <PublicTeamSection name="Team" description={null} members={publicUnsectioned} /> : null}
            </div>
          ) : (
            <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
              <h2 className="text-3xl font-black">Teamet er ikke offentliggjort endnu</h2>
              <p className="mt-3 text-zinc-500">Kom snart tilbage og mød holdet.</p>
            </div>
          )}

          {canManage ? (
            <section id="team-admin" className="mt-28 space-y-10 border-t border-white/10 pt-16">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Administration</p>
                <h2 className="mt-3 text-4xl font-black">Team Management</h2>
              </div>
              <TeamSectionAdmin sections={sections} />
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <h2 className="text-3xl font-black">Tilføj teammedlem</h2>
                <TeamForm sections={sectionOptions} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {[...sections.flatMap((section) => section.members), ...unsectionedMembers].map((member) => (
                  <article key={member.id} className="min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
                    <div className="px-6 pt-6"><p className="font-black">{member.name}</p><p className="text-sm text-zinc-500">{member.sectionId ? sections.find((section) => section.id === member.sectionId)?.name : "Ingen sektion"}</p></div>
                    <TeamForm member={member} sections={sectionOptions} />
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function PublicTeamSection({ name, description, members }: { name: string; description: string | null; members: TeamMemberData[] }) {
  return (
    <section aria-labelledby={`team-${name.toLocaleLowerCase("da").replace(/[^a-z0-9]+/g, "-")}`}>
      <header className="text-center">
        <div className="mx-auto h-px w-16 bg-emerald-300/60" />
        <h2 id={`team-${name.toLocaleLowerCase("da").replace(/[^a-z0-9]+/g, "-")}`} className="mt-6 text-[clamp(2rem,5vw,4rem)] font-black uppercase tracking-[0.1em] text-zinc-100">{name}</h2>
        {description ? <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-zinc-400 md:text-lg">{description}</p> : null}
      </header>
      <div className="mt-10 flex flex-wrap justify-center gap-6">
        {members.map((member) => <TeamCard key={member.id} member={member} />)}
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMemberData }) {
  return (
    <article className="w-full min-w-0 max-w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
      <div className="aspect-[4/5] overflow-hidden bg-zinc-950">{member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl font-black text-zinc-700">{member.name.slice(0, 2).toUpperCase()}</div>}</div>
      <div className="p-7 text-center"><h3 className="text-3xl font-black">{member.name}</h3><p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{member.roleTitle}</p>{member.secondaryTitle ? <p className="mt-2 text-zinc-400">{member.secondaryTitle}</p> : null}{member.quote ? <p className="mt-5 italic text-zinc-300">“{member.quote}”</p> : null}{member.bio ? <p className="mt-5 leading-7 text-zinc-400">{member.bio}</p> : null}<div className="mt-5 flex flex-wrap justify-center gap-2">{member.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">{skill}</span>)}</div></div>
    </article>
  );
}

function TeamSectionAdmin({ sections }: { sections: Array<TeamSectionOption & { description: string | null; isPublic: boolean; _count: { members: number } }> }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <div><h2 className="text-3xl font-black">Teamsektioner</h2><p className="mt-2 text-sm text-zinc-400">Sektioner uden offentlige medlemmer skjules automatisk på den offentlige side.</p></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.id} className="min-w-0 rounded-2xl border border-white/10 bg-black/50 p-5">
            <TeamSectionForm section={section} />
            <form action={deleteTeamSectionAction.bind(null, section.id)} className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 text-xs text-red-100"><input name="confirmDelete" type="checkbox" /> Bekræft sletning</label>
              <button className="text-sm font-black text-red-300">Slet sektion</button>
              <span className="text-xs text-zinc-500">Medlemmer bevares uden sektion.</span>
            </form>
          </div>
        ))}
        <div className="min-w-0 rounded-2xl border border-dashed border-white/15 bg-black/30 p-5"><h3 className="font-black">Ny sektion</h3><TeamSectionForm /></div>
      </div>
    </div>
  );
}

function TeamSectionForm({ section }: { section?: TeamSectionOption & { description: string | null; isPublic: boolean; _count: { members: number } } }) {
  return (
    <form action={saveTeamSectionAction} className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={section?.id ?? ""} />
      <label className="grid min-w-0 gap-2 text-sm font-bold">Navn<input className={field} name="name" required defaultValue={section?.name ?? ""} /></label>
      <label className="grid min-w-0 gap-2 text-sm font-bold">Sortering<input className={field} name="sortOrder" type="number" step="1" defaultValue={section?.sortOrder ?? 0} /></label>
      <label className="grid min-w-0 gap-2 text-sm font-bold sm:col-span-2">Beskrivelse<textarea className={field} name="description" defaultValue={section?.description ?? ""} /></label>
      <label className="flex items-center gap-3"><input name="isPublic" type="checkbox" defaultChecked={section?.isPublic ?? true} /> Offentlig</label>
      {section ? <p className="self-center text-sm text-zinc-500">{section._count.members} medlem{section._count.members === 1 ? "" : "mer"}</p> : null}
      <button className="rounded-full bg-white px-6 py-3 font-black text-black sm:col-span-2">{section ? "Gem sektion" : "Opret sektion"}</button>
    </form>
  );
}

function TeamForm({ member, sections }: { member?: TeamMemberData; sections: TeamSectionOption[] }) {
  return (
    <div className="border-t border-white/10 p-6">
      <form action={saveTeamMemberAction} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={member?.id ?? ""} />
        <input name="name" defaultValue={member?.name} required placeholder="Navn" className={field} />
        <input name="roleTitle" defaultValue={member?.roleTitle} required placeholder="Rolle / titel" className={field} />
        <input name="secondaryTitle" defaultValue={member?.secondaryTitle ?? ""} placeholder="Sekundær titel" className={field} />
        <select name="sectionId" defaultValue={member?.sectionId ?? ""} className={field}><option value="">Ingen sektion</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>
        <input name="skills" defaultValue={member?.skills.join(", ")} placeholder="Tags, adskilt med komma" className={field} />
        <textarea name="quote" defaultValue={member?.quote ?? ""} placeholder="Citat" className={field} />
        <textarea name="bio" defaultValue={member?.bio ?? ""} placeholder="Kort bio" className={`${field} sm:col-span-2`} />
        <div className="sm:col-span-2"><ImageUploadField name="imageUrl" scope="team" ownerId={member?.id ?? "draft"} initialUrl={member?.imageUrl ?? ""} label="Portræt" chooseLabel="Vælg teambillede" helpText="Anbefalet: portrætformat, mindst 800 × 1000 px." variant="cover" allowExternalUrl /></div>
        <input name="sortOrder" type="number" step="1" defaultValue={member?.sortOrder ?? 0} className={field} />
        <label className="flex items-center gap-3"><input name="active" type="checkbox" defaultChecked={member?.active ?? true} /> Offentlig</label>
        <button className="rounded-full bg-white px-6 py-3 font-black text-black sm:col-span-2">{member ? "Gem ændringer" : "Opret teammedlem"}</button>
      </form>
      {member ? <form action={deleteTeamMemberAction.bind(null, member.id)} className="mt-3"><button className="text-sm font-black text-red-300">Slet teammedlem</button></form> : null}
    </div>
  );
}
