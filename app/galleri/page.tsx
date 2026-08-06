/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import GalleryAdmin from "@/components/gallery/GalleryAdmin";
import AlbumDeleteControl from "@/components/gallery/AlbumDeleteControl";
import { getCurrentUser } from "@/lib/auth/session";
import { isGalleryManager } from "@/lib/gallery/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [actor, params, events] = await Promise.all([getCurrentUser(), searchParams, prisma.event.findMany({ orderBy: { startsAt: "desc" }, select: { id: true, title: true } })]);
  const canManage = Boolean(actor && isGalleryManager(actor.role));
  const albumWhere = canManage ? {} : { active: true, public: true };
  const itemWhere = canManage ? {} : { active: true, public: true };
  const [albums, unassigned] = await Promise.all([
    prisma.galleryAlbum.findMany({ where: albumWhere, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { event: { select: { title: true } }, items: { where: itemWhere, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { mediaType: true, imageUrl: true, thumbnailUrl: true, active: true, public: true } } } }),
    prisma.galleryImage.findMany({ where: { albumId: null, ...itemWhere }, select: { mediaType: true } }),
  ]);
  return <main className="min-h-screen bg-black text-white"><section className="px-5 py-28"><div className="mx-auto max-w-7xl">
    <p className="text-sm font-black uppercase tracking-[.4em] text-zinc-500">DarkLight mediecenter</p><h1 className="mt-4 text-5xl font-black md:text-7xl">Galleri</h1><p className="mt-5 max-w-3xl text-zinc-400">Events, billeder og kuraterede videolinks samlet i albums.</p>
    {params.ok ? <p className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">{params.ok}</p> : null}{params.error ? <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-red-200">{params.error}</p> : null}
    {canManage ? <GalleryAdmin albums={albums.map(({ id, title }) => ({ id, title }))} events={events}/> : null}
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {albums.map((album) => { const cover = album.coverImageUrl || album.items.find((item) => item.mediaType === "IMAGE" && item.imageUrl)?.imageUrl; const images = album.items.filter((item) => item.mediaType === "IMAGE").length; const videos = album.items.filter((item) => item.mediaType === "VIDEO").length; return <article key={album.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.04]">
        <Link href={`/galleri/${album.id}`} className="block"><div className="aspect-[16/10] bg-zinc-950">{cover ? <img src={cover} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-xl font-black text-zinc-700">DarkLight</div>}</div><div className="p-5"><p className="text-xs font-black uppercase tracking-wider text-zinc-500">{album.event?.title || "DarkLight Events"}</p><h2 className="mt-2 text-2xl font-black">{album.title}</h2>{album.description ? <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{album.description}</p> : null}<p className="mt-4 text-xs text-zinc-500">{images} billeder · {videos} videoer · {album.createdAt.toLocaleDateString("da-DK")}{canManage && (!album.active || !album.public) ? " · Skjult" : ""}</p></div></Link>
        {canManage ? <div className="flex flex-wrap gap-2 border-t border-white/10 p-4"><Link href={`/galleri/${album.id}#media-admin`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-black">Redigér</Link><AlbumDeleteControl albumId={album.id} title={album.title} imageCount={images} videoCount={videos}/></div> : null}
      </article>; })}
      {unassigned.length ? <Link href="/galleri/uden-album" className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.04] p-6"><p className="text-xs font-black uppercase tracking-wider text-zinc-500">Bevarede medier</p><h2 className="mt-3 text-2xl font-black">Uden album</h2><p className="mt-3 text-zinc-400">Eksisterende og ikke-tildelte medier.</p><p className="mt-4 text-xs text-zinc-500">{unassigned.filter((item) => item.mediaType === "IMAGE").length} billeder · {unassigned.filter((item) => item.mediaType === "VIDEO").length} videoer</p></Link> : null}
    </div>
    {!albums.length && !unassigned.length ? <div className="mt-10 rounded-[2rem] border border-white/10 p-10 text-center"><h2 className="text-3xl font-black">Galleriet er tomt</h2></div> : null}
  </div></section><Footer/></main>;
}
