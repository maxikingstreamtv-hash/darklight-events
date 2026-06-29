export default function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center">
      <div className="mx-auto mb-3 h-10 w-6 rounded-full border border-white/30 p-1">
        <div className="mx-auto h-2 w-2 animate-bounce rounded-full bg-white" />
      </div>

      <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
        Scroll
      </p>
    </div>
  );
}