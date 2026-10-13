/**
 * The landing page's looping thread motif as a quiet backdrop for the rest of
 * the site (login, onboarding and every page after login): two long threads
 * fixed behind the content that draw themselves in on load. Needs a parent with
 * `isolate` so the negative z-index stays inside it and above the page colour.
 * Reduced motion: drawn, still (globals.css `.site-threads`).
 */
export default function SiteThreads() {
  return (
    <div aria-hidden className="site-threads pointer-events-none fixed inset-0 -z-10">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g style={{ stroke: "rgb(var(--brand-600) / .22)" }} strokeWidth="1.2" strokeLinecap="round">
          <path pathLength={1} vectorEffect="non-scaling-stroke" d="M -60 560 C 120 640, 240 520, 300 380 C 360 240, 440 150, 540 170 C 660 194, 720 360, 690 500 C 664 622, 560 690, 520 630 C 480 570, 560 420, 700 360 C 860 292, 1000 330, 1050 430 C 1100 530, 1030 620, 960 600 C 890 580, 900 470, 1010 440 C 1160 398, 1330 470, 1440 540 C 1520 590, 1580 600, 1680 590" />
          <path pathLength={1} vectorEffect="non-scaling-stroke" opacity=".6" d="M -60 590 C 140 660, 270 540, 330 400 C 390 262, 470 186, 566 200 C 690 218, 744 390, 716 520 C 690 640, 590 712, 546 652 C 500 590, 586 446, 724 388 C 880 322, 1024 362, 1076 460 C 1126 556, 1052 650, 978 630 C 904 610, 918 498, 1032 468 C 1184 428, 1350 500, 1460 572 C 1540 622, 1600 632, 1680 624" />
        </g>
      </svg>
    </div>
  );
}
