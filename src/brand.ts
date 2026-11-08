export const BRAND = {
  name: 'Portage',
  tagline: 'Your experience counts.',
  description:
    'Portage finds the skills you already have, tests them on real job tasks, and points to the one gap worth closing next.',
  promise: "People changing careers shouldn't have to start from zero.",
  event: 'Built for Hack the Change 2026 · Calgary',
} as const;

export const LOGO = {
  full: './brand/portage-logo.png', // full lockup with wordmark + tagline (hero, evidence card print)
  mark: './brand/portage-mark.png', // square P mark only (navbar, evidence card header)
} as const;
