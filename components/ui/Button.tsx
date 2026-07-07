type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  href = "#",
  variant = "primary",
}: ButtonProps) {
  const classes =
    variant === "primary"
      ? "rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
      : "rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white hover:text-black";

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}
