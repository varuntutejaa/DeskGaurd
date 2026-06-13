import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/** Public base URL the phone will open. Auto-detects in dev; override for deploy. */
const PUBLIC_BASE =
  (import.meta.env.VITE_PUBLIC_URL as string | undefined) ??
  (typeof window !== "undefined" ? window.location.origin : "");

export function SeatQR({ seatId }: { seatId: string }) {
  const url = `${PUBLIC_BASE}/checkin/${encodeURIComponent(seatId)}`;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Desk Check-In Tag
      </p>

      {/* Printable desk placard — this is the sticker that lives on the desk. */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-xs">
        {/* header strip */}
        <div className="flex items-center justify-between bg-primary px-3.5 py-2.5 text-primary-foreground">
          <Logo className="[&_span:last-child]:text-white [&>span:first-child]:bg-white/15" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            {seatId}
          </span>
        </div>

        {/* qr */}
        <div className="flex flex-col items-center gap-3 px-4 pb-4 pt-5">
          <QRCodeSVG
            value={url}
            size={150}
            level="M"
            marginSize={0}
            fgColor="#0f2e22"
            bgColor="#ffffff"
          />
          <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-foreground">
            <Smartphone className="size-4 text-primary" />
            Scan with your phone to check in
          </div>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Point your phone camera at this code to claim{" "}
            <span className="font-mono font-medium text-foreground">{seatId}</span>.
            Scanning confirms you're physically at the desk. Sign-in with your{" "}
            <span className="font-medium text-foreground">@muj.manipal.edu</span>{" "}
            account is required.
          </p>
        </div>

        {/* footer note — reinforces it's a physical placard */}
        <div className="border-t border-border bg-muted/40 px-3.5 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Placed on Desk {seatId} · Main Library
        </div>

        {/* demo disclaimer */}
        <div className="border-t border-amber-200 bg-amber-50 px-3.5 py-2 text-center text-[10px] leading-snug text-amber-700">
          ⚠️ <span className="font-semibold">Demo only.</span> In production, this QR tag is physically placed on the desk. Students scan it with their phone to check in.
        </div>
      </div>

      {/* demo-only fallback for presenting without a phone */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-[11px] text-muted-foreground/70 underline-offset-2 hover:text-primary hover:underline"
      >
        Demo: open the check-in page on this device
      </a>
    </div>
  );
}
