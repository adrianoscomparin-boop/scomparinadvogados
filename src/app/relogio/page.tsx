import type { Metadata } from "next";
import SchipholClock from "@/components/schiphol-clock";

export const metadata: Metadata = {
  title: "Relógio",
  description: "Relógio de parede para monitor, inspirado no relógio do aeroporto de Amsterdam (Schiphol).",
};

export default function RelogioPage() {
  return <SchipholClock />;
}
