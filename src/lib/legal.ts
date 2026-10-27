// Facts the privacy notice, terms and legal notice are built from.
// Keep these in line with what the backend actually does: if retention or processors change, update here and bump lastUpdated.

export const LEGAL = {
  operatorName: "Tanguy Geraedts",
  country: "Belgium",
  contactEmail: "privacy@geraedts.dev",
  lastUpdated: "27 October 2026",
  minimumAccountAge: 13,
  accessLogRetentionDays: 14,
  // Nightly database backups on the server (backend deploy/vps/backup.sh): deleted data lingers this long in them.
  backupRetentionDays: 7,
  // Lobby rooms (nicknames before a game starts) expire after this many hours.
  lobbyRetentionHours: 4,
  // The backend must delete finished games (players, teams, scores) after this many days.
  gameRetentionDays: 30,
  hosting: {
    name: "Hetzner Online GmbH",
    address: "Industriestr. 25, 91710 Gunzenhausen, Germany",
    locations: "Germany and Finland",
  },
  auth: {
    name: "Clerk, Inc.",
    location: "the United States",
    privacyUrl: "https://clerk.com/legal/privacy",
  },
  authority: {
    name: "Belgian Data Protection Authority (Gegevensbeschermingsautoriteit / Autorité de protection des données)",
    address: "Drukpersstraat 35, 1000 Brussels",
    url: "https://www.dataprotectionauthority.be",
  },
} as const;

export const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/legal", label: "Legal notice" },
] as const;

export type LegalHref = (typeof LEGAL_PAGES)[number]["href"];
