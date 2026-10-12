import type { ReactNode } from "react";

/**
 * Button label with the landing page's text roll: when the parent `.btn`,
 * `.btn-primary`, `.btn-outline` or `.btn-ghost` is hovered (mouse/trackpad) or
 * focused, the label slides up and fades while an identical copy rises into its
 * place (globals.css "Text roll for app buttons"). Wrap only the text; icons
 * stay outside it. The copy is hidden from assistive tech.
 */
export default function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="roll">
      <span className="roll__a">{children}</span>
      <span className="roll__b" aria-hidden>{children}</span>
    </span>
  );
}
