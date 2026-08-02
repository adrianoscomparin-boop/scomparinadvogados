"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "#7a4510",
  Suspenso: "#b8860b",
  Arquivado: "#94a3b8",
  Encerrado: "#1e7a3d",
  Extinto: "#cbd5e1",
};

export function ProcessosStatusChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return <p className="flex h-56 items-center justify-center text-sm text-neutral-400">Sem processos cadastrados.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 12 }} />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ReceitaDespesaChart({ data }: { data: { mes: string; receita: number; despesa: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="receita" name="Receitas" fill="#1e7a3d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesa" name="Despesas" fill="#b3261e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
