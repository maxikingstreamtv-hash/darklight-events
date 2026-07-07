import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: "sm" | "md" | "lg" | "none";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const padding = {
  none: "",
  sm: "p-5",
  md: "p-7",
  lg: "p-8",
};

export default function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
  padded = "md",
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`rounded-[2rem] border border-white/10 bg-white/[0.04] ${padding[padded]} text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 ${
        interactive ? "hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07] hover:shadow-[0_30px_90px_rgba(255,255,255,0.08)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
