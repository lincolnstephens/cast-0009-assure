import { MitmarkLogo } from "./MitmarkLogo";

export function ClientPoweredBy({ text }: { text: string }) {
  return (
    <footer className="mt-10 flex flex-col items-center gap-2 border-t border-client-line pt-4">
      <MitmarkLogo className="h-4 w-auto opacity-60" alt="" />
      <p className="text-center text-[11px] tracking-wide text-client-muted">{text}</p>
    </footer>
  );
}
