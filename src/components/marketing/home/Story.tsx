import Image from "next/image";
import { cn } from "@/lib/utils";
import { Display, Eyebrow } from "../Type";

type StoryContent = {
  eyebrow: string;
  title: string;
  text: string;
  images: { src: string; alt: string }[];
};

/** A photo at its own proportions: full width of its column, height follows the image. */
function Photo({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className?: string }) {
  return <Image src={src} alt={alt} width={0} height={0} sizes={sizes} className={cn("h-auto w-full rounded-2xl", className)} />;
}

/**
 * Story spotlight (reference "Story A/B"): copy on one side, two photos side
 * by side on the other — never overlapping or cropped, each at its own
 * proportions, the second set a little lower. `flip` mirrors it.
 */
export default function Story({ story, id, flip = false }: { story: StoryContent; id?: string; flip?: boolean }) {
  const [main, detail] = story.images;
  return (
    <section id={id} className="relative scroll-mt-24 mk-section">
      <div className={cn("mk-container grid items-start gap-16 tab:gap-10", flip ? "tab:grid-cols-[7fr_5fr]" : "tab:grid-cols-[5fr_7fr]")}>
        <div className={cn("flex flex-col gap-6 tab:pt-10", flip ? "mk-from-right tab:order-2 tab:pl-[8%]" : "mk-from-left")}>
          <Eyebrow className="mk-reveal">{story.eyebrow}</Eyebrow>
          <Display className="mk-reveal max-w-[560px]">{story.title}</Display>
          <p className="mk-reveal max-w-[460px] t-body text-ink-600">{story.text}</p>
        </div>

        <div className={cn("mx-auto grid w-full max-w-[420px] grid-cols-2 items-start gap-4 tab:max-w-[88%] tab:gap-5 desk:max-w-[78%]", flip && "tab:order-1")}>
          <Photo src={main.src} alt={main.alt} sizes="(min-width: 810px) 30vw, 45vw" className="mk-reveal" />
          <Photo src={detail.src} alt={detail.alt} sizes="(min-width: 810px) 30vw, 45vw" className="mk-reveal mk-from-zoom mt-10 tab:mt-20" />
        </div>
      </div>
    </section>
  );
}
