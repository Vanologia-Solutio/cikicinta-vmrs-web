import { PROJECT_NAME } from "@/shared/constants/common";
import { SunIcon, TreePalmIcon, WavesIcon } from "@phosphor-icons/react";

export function FullscreenLoader({
  message = "Initializing...",
}: {
  message?: string;
}) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f4dfb5] text-[#164b5b]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,#fff8dc_0%,transparent_30%),linear-gradient(180deg,#78cbd5_0%,#a9e0dc_43%,#f4dfb5_80%)]" />
      <div className="absolute -bottom-20 left-1/2 h-52 w-[130%] -translate-x-1/2 rounded-[50%] bg-[#dcb879]/75 blur-[2px]" />
      <div className="absolute bottom-10 left-1/2 h-20 w-[115%] -translate-x-1/2 rounded-[50%] border-t-4 border-[#fff8dc]/80 opacity-80" />
      <div className="absolute right-[12%] top-[14%] text-[#f2ae43] opacity-90">
        <SunIcon
          aria-hidden="true"
          className="size-16 animate-[spin_18s_linear_infinite]"
          strokeWidth={1.25}
        />
      </div>
      <div className="absolute bottom-8 left-[10%] text-[#277384]/35">
        <TreePalmIcon
          aria-hidden="true"
          className="size-28 -rotate-6"
          strokeWidth={1.25}
        />
      </div>

      <section
        className="relative z-10 flex animate-in flex-col items-center px-6 text-center duration-700 fade-in zoom-in-95"
        aria-live="polite"
      >
        <div className="relative mb-9 flex size-28 items-center justify-center rounded-full border border-white/70 bg-white/25 shadow-[0_12px_45px_rgba(23,79,97,0.12)] backdrop-blur-sm">
          <div className="absolute inset-2 animate-[spin_9s_linear_infinite] rounded-full border-2 border-dashed border-[#f4b94f]/70" />
          <WavesIcon
            aria-hidden="true"
            className="size-12 text-[#176b7b]"
            strokeWidth={1.5}
          />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#176b7b]/70">
          Voucher Management System
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[#174f61] sm:text-5xl">
          {PROJECT_NAME}
        </h1>
        <p className="mt-4 text-sm font-medium text-[#174f61]/65">{message}</p>
        <div className="mt-8 h-1.5 w-52 overflow-hidden rounded-full bg-white/60 shadow-inner">
          <div className="h-full w-1/3 animate-[loader_1.8s_ease-in-out_infinite] rounded-full bg-[#f4b94f]" />
        </div>
      </section>

      <style>{`@keyframes loader { 0% { transform: translateX(-150%); } 50% { transform: translateX(100%); } 100% { transform: translateX(300%); } }`}</style>
    </main>
  );
}
