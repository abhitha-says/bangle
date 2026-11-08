import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 12h17M14 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M21 12H4M10 6l-6 6 6 6" />
  </svg>
);

export const ArrowUp = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 20V4M6 10l6-6 6 6" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PauseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 6v12M15 6v12" />
  </svg>
);

export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
);

export const FilterIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
);

export const ExpandIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path
      d="M12 20.3s-7.6-4.6-7.6-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 2.6c0 5.5-7.6 10.1-7.6 10.1Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const CameraIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10H4z" />
    <circle cx="12" cy="13.2" r="3.3" />
  </svg>
);
