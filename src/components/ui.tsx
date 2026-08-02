import Link from "next/link";
import clsx from "clsx";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
          {action.label}
        </Link>
      )}
    </div>
  );
}

const badgeColors: Record<string, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-[var(--danger)]",
  amber: "bg-amber-50 text-[var(--warning)]",
  blue: "bg-blue-50 text-blue-700",
  brand: "bg-[var(--brand)]/10 text-[var(--brand-dark)]",
};

export function Badge({ color = "neutral", children }: { color?: keyof typeof badgeColors; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeColors[color])}>
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}

export function StatCard({
  label,
  value,
  color = "neutral",
}: {
  label: string;
  value: string;
  color?: "neutral" | "green" | "red" | "amber" | "brand";
}) {
  const colorMap: Record<string, string> = {
    neutral: "text-[var(--foreground)]",
    green: "text-[var(--success)]",
    red: "text-[var(--danger)]",
    amber: "text-[var(--warning)]",
    brand: "text-[var(--brand)]",
  };
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={clsx("mt-1.5 text-2xl font-bold", colorMap[color])}>{value}</p>
    </div>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-[var(--foreground)]">
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]";
