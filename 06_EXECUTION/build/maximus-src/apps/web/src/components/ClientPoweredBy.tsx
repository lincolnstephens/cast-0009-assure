import { DEFAULT_BRANDING } from "@maximus/shared";
import { MitmarkLogo } from "./MitmarkLogo";

/**
 * v1.8 (FRAGO 08 3.3). The footer on every client page: "Delivered by MITMARK
 * Intelligence" beside the MITMARK mark. The text is the portal's own text
 * colour, so it clears 4.5:1 on the page whatever lies behind it.
 */
export function ClientPoweredBy() {
  return (
    <footer
      data-testid="client-footer"
      className="mt-10 flex items-center justify-center gap-2 border-t border-client-line pt-4"
    >
      <MitmarkLogo className="h-4 w-auto" alt="" />
      <p className="text-center text-[12px] tracking-wide text-client-text">{DEFAULT_BRANDING.poweredByText}</p>
    </footer>
  );
}

/**
 * v1.8 (FRAGO 08 3.3). The MITMARK mark as a watermark, about 6 per cent,
 * fixed at the bottom right of the content area. It sits in a gutter the
 * content never enters (ClientLayout pads main to clear it), beneath the
 * content layer, so it never lies under text. Hidden below 640px; shown on
 * the printed Statement (index.css). Never rendered by the admin layout.
 */
export function MitmarkWatermark() {
  return (
    <div
      aria-hidden
      data-testid="mitmark-watermark"
      className="mm-watermark pointer-events-none fixed bottom-4 right-3 z-0 hidden select-none sm:block md:bottom-6 md:right-5"
    >
      <MitmarkLogo className="h-auto w-14 opacity-[0.06] md:w-20" alt="" />
    </div>
  );
}
