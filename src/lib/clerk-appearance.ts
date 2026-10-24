import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/**
 * Clerk's sign-in, sign-up, modal and account menu: calm Jeopardy navy, gold only on the main button and links.
 * `variables` set the palette for every Clerk component; `elements` add Tailwind classes to specific parts
 * (names: https://clerk.com/docs/customization/overview, or inspect an element: classes start with "cl-").
 */

// The palette, in one place. The page behind the card is #050a3a (globals.css --color-background).
const NAVY_CARD = "#0d1650"; // a step lighter than the page, so the card stands out without shouting
const NAVY_DEEP = "#081041"; // inputs and the card footer: a step darker than the card
const GOLD = "#ffcc00"; // jeopardy-gold: only the Continue button and links

export const jeopardyClerkAppearance: Appearance = {
  // Clerk's CSS goes in this layer, which globals.css puts before Tailwind's utilities: our classes below win.
  cssLayerName: "clerk",
  variables: {
    colorPrimary: GOLD, // primary button, links, "Last used" badge
    colorPrimaryForeground: NAVY_DEEP, // text on the gold button
    colorBackground: NAVY_CARD,
    colorForeground: "#ffffff",
    colorMuted: NAVY_DEEP,
    colorMutedForeground: "rgba(255, 255, 255, 0.6)",
    colorInput: NAVY_DEEP,
    colorInputForeground: "#ffffff",
    colorBorder: "rgba(255, 255, 255, 0.12)", // Clerk's own thin edges (card outline, dividers): faint, no colour
    colorRing: "rgba(255, 255, 255, 0.35)", // focus outline: neutral, not gold
    colorNeutral: "#ffffff",
    colorDanger: "#f87171",
    colorShadow: "#000000",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    // The card: no border, a soft shadow.
    cardBox: "border-0 shadow-2xl shadow-black/40",
    headerTitle: "text-white text-xl font-semibold",
    headerSubtitle: "text-white/60",
    formFieldLabel: "text-white/80 font-medium",
    formFieldInput:
      "border border-white/10 placeholder:text-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/10",
    otpCodeFieldInput: "border border-white/10 focus:border-white/40",
    formFieldAction: "text-jeopardy-gold hover:text-jeopardy-gold/80",
    formButtonPrimary: "font-semibold shadow-none hover:brightness-110 active:scale-[0.98]",
    // Secondary buttons (Google, Discord, other methods): quiet outlines that brighten on hover.
    socialButtonsBlockButton: "bg-transparent text-white border border-white/15 hover:bg-white/5 hover:border-white/30",
    socialButtonsIconButton: "bg-transparent border border-white/15 hover:bg-white/5 hover:border-white/30",
    alternativeMethodsBlockButton: "bg-transparent text-white border border-white/15 hover:bg-white/5 hover:border-white/30",
    dividerLine: "bg-white/10",
    dividerText: "text-white/40",
    identityPreview: "border border-white/10",
    footer: "[background-image:none]",
    footerActionLink: "text-jeopardy-gold font-medium hover:text-jeopardy-gold/80",
    // Account menu (UserButton) and its popover.
    userButtonAvatarBox: "ring-0",
    userButtonPopoverCard: "border-0 shadow-2xl shadow-black/40",
    userButtonPopoverActionButton: "text-white hover:bg-white/5",
    modalContent: "rounded-xl",
  },
};
