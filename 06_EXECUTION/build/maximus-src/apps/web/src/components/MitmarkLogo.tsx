const MITMARK_LOGO = "/branding/mitmark/logo.svg";

/** Restrained MITMARK Intelligence mark for admin chrome and powered-by footers. */
export function MitmarkLogo({
  className = "h-5 w-auto opacity-75",
  alt = "MITMARK Intelligence",
}: {
  className?: string;
  alt?: string;
}) {
  return <img src={MITMARK_LOGO} alt={alt} className={className} />;
}
