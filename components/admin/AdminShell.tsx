import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Brugere" },
  { href: "/admin/vehicles", label: "Køretøjer" },
];

type AdminLink = (typeof adminLinks)[number];

export default function AdminShell({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              {eyebrow ? <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">{eyebrow}</p> : null}
              <h1 className="text-5xl font-black md:text-7xl">{title}</h1>
            </div>
            {action}
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {adminLinks.map((link: AdminLink) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                {link.label}
              </Link>
            ))}
          </div>

          {children}
        </div>
      </section>
      <Footer />
    </main>
  );
}
