import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./Button";

/** A next/link that looks like a <Button>, for actions that navigate. */
export function LinkButton({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...props} className={buttonStyles({ variant, size, className })} />;
}
