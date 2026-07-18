type ReportItem = {
  label: string;
  value: string;
};

type InspectionReportPreviewProps = {
  title: string;
  subtitle: string;
  items: ReportItem[];
};

export default function InspectionReportPreview({ title, subtitle, items }: InspectionReportPreviewProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">PDF-klar rapport</p>
          <h2 className="mt-3 text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
          Klar til fremtidig PDF
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item: ReportItem) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">{item.label}</p>
            <p className="mt-2 text-sm font-black text-zinc-200">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
