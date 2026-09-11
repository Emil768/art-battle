import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 19,
  height: 19,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const BrushIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9.5 12.5 18 4a1.7 1.7 0 0 1 2.4 2.4l-8.5 8.5" />
    <path d="M9.5 12.5c-1-1-2.6-1-3.6 0l-1 1c.3 1 0 2-.9 2.6-.6.4-1.3.6-2 .7 1 1.7 3 2.6 5 2.3 2-.3 3.6-1.9 4-3.9.1-.9-.1-1.9-.5-2.7Z" />
  </svg>
);

export const PenIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 20l3.3-.9L18.4 8a2.1 2.1 0 0 0-3-3L4.4 16.2 4 20Z" />
    <path d="M14.5 6.2l3.3 3.3" />
  </svg>
);

export const EraserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M18.5 13.5 12 20H7l-4-4a2 2 0 0 1 0-2.8l8.7-8.7a2 2 0 0 1 2.8 0l4 4a2 2 0 0 1 0 2.8Z" />
    <path d="M7 20h13" />
  </svg>
);

export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9.5 7V4.5h5V7" />
    <path d="M6.5 7l.9 12.5a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7" />
  </svg>
);

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 12.5l5 5L20 6" />
  </svg>
);

export const TrophyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5.5H5.2A2.8 2.8 0 0 0 8 9" />
    <path d="M16 5.5h2.8A2.8 2.8 0 0 1 16 9" />
    <path d="M12 13v3.2" />
    <path d="M9 20h6" />
    <path d="M10 16.2h4V20h-4Z" />
  </svg>
);

export const ArrowUpIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 19V5" />
    <path d="M6.2 10.8 12 5l5.8 5.8" />
  </svg>
);

export const PaletteIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2H17a3 3 0 0 0 3-3c0-4.4-3.6-8.4-8-8.4Z" />
    <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M5 3.8v16.4L19 12 5 3.8Z" />
  </svg>
);

export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.1-4 4-6.2 7.5-6.2s6.4 2.2 7.5 6.2" />
  </svg>
);

export const SendIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 12l16-7-6.5 16-2.7-6.8L4 12Z" />
  </svg>
);
