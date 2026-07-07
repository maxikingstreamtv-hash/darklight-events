export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-zinc-400/10 blur-[120px]" />
      <div className="absolute left-0 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
    </div>
  );
}