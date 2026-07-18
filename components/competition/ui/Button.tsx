import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "border-white bg-white text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] hover:-translate-y-0.5 hover:bg-zinc-300",
  secondary: "border-white/15 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:border-white/40 hover:bg-white hover:text-black",
  danger: "border-red-500/30 bg-red-500/10 text-red-300 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white",
  ghost: "border-white/10 bg-black text-zinc-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.08] hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function Button(props: ButtonProps | LinkProps) {
  const { children, className = "", variant = "secondary", size = "md" } = props;
  const classes = `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border font-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        target={props.target}
        rel={props.rel}
        aria-label={props["aria-label"]}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;

  return (
    <button
      className={classes}
      type={buttonProps.type}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      aria-label={buttonProps["aria-label"]}
    >
      {children}
    </button>
  );
}
