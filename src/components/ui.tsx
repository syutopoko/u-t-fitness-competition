import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-sport-green text-white shadow-soft hover:bg-sport-dark",
    secondary: "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50",
    danger: "bg-sport-coral text-white hover:bg-red-600",
    ghost: "bg-transparent text-sport-dark hover:bg-sport-light"
  };

  return (
    <button
      className={`min-h-12 rounded-lg px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  className = "",
  variant = "primary",
  ...props
}: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" }) {
  const variants = {
    primary: "bg-sport-green text-white shadow-soft hover:bg-sport-dark",
    secondary: "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50"
  };

  return (
    <Link
      className={`flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-center text-sm font-bold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({
  className = "",
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-field px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-sport-green focus:ring-4 focus:ring-sport-mint";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export function StatusPill({
  tone = "neutral",
  children
}: {
  tone?: "neutral" | "good" | "warn" | "bad";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    good: "bg-sport-mint text-sport-dark",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-red-100 text-red-700"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-normal text-ink">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function BackHomeButton({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      className="inline-flex min-h-12 w-fit items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-black text-sport-dark shadow-sm ring-1 ring-sport-light transition hover:bg-sport-light"
      href={href}
    >
      {label}
    </Link>
  );
}
