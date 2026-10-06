import Image from "next/image";
import { cn } from "@/lib/utils";

/** Organic photo shapes (8-value border-radius) and their offset outlines. */
const BLOBS = [
  { shape: "58% 42% 47% 53% / 52% 46% 54% 48%", outline: "46% 54% 61% 39% / 44% 58% 42% 56%", rotate: "-8deg" },
  { shape: "44% 56% 38% 62% / 60% 50% 50% 40%", outline: "57% 43% 52% 48% / 48% 60% 40% 52%", rotate: "10deg" },
  { shape: "63% 37% 55% 45% / 46% 56% 44% 54%", outline: "41% 59% 46% 54% / 57% 41% 59% 43%", rotate: "-4deg" },
];

/**
 * A photo in an organic blob shape with a faint, rotated outline around it
 * (reference "Journal" / "Team" cards). `index` picks one of three shapes so
 * neighbours differ. Inside a `.group`, the photo eases in slightly on hover.
 *
 * Depth (MotionRoot `data-depth`): the photo drifts `drift` px as a far layer
 * inside the blob while the outline drifts the other way, so the outline seems
 * to slide around the shape as the page scrolls. The photo's wrapper is
 * `drift` px taller above and below (tablet/desktop only — `.mk-blob-drift`)
 * so no edge ever shows.
 */
export default function BlobPhoto({ src, alt = "", index, sizes, position, frame = "aspect-[1.12] max-w-[420px]", outline = true, drift = 24, priority, className }: {
  src: string;
  alt?: string;
  index: number;
  sizes: string;
  /** object-position for the photo, e.g. "50% 30%" to keep a face in frame. */
  position?: string;
  /** Aspect ratio + max width of the frame. */
  frame?: string;
  /** The faint rotated outline (off: the photo fills the frame). */
  outline?: boolean;
  /** Depth drift of the photo in px (the outline moves ~60% of it the other way); 0 = still. */
  drift?: number;
  priority?: boolean;
  className?: string;
}) {
  const b = BLOBS[index % BLOBS.length];
  return (
    <div className={cn("relative w-full", frame, className)}>
      {outline && (
        <span
          aria-hidden
          data-depth={drift ? Math.round(drift * 0.6) : undefined}
          className="mk-blob-outline absolute inset-0"
          style={{ borderRadius: b.outline, transform: `rotate(${b.rotate})` }}
        />
      )}
      <div className={cn("absolute overflow-hidden", outline ? "inset-[7%]" : "inset-0")} style={{ borderRadius: b.shape }}>
        <div data-depth={drift ? -drift : undefined} className="mk-blob-drift" style={{ ["--drift" as string]: `${drift}px` }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[1200ms] ease-spring group-hover:scale-[1.06]"
            style={position ? { objectPosition: position } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
