"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/processos", label: "Processos", icon: "⚖️" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
];

export function NavLinks({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  if (horizontal) {
    return (
      <div className="flex justify-around py-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium",
                active ? "text-[var(--brand)]" : "text-neutral-500",
              )}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--brand)]/10 text-[var(--brand-dark)]"
                : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
