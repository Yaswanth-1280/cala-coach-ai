import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  distribution: { range: string; count: number }[];
}

const COLORS = ["#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];

const DifficultyChart = ({ distribution }: Props) => {
  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Difficulty Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={{ top: 5 }}>
            <XAxis dataKey="range" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(222 25% 10%)", border: "1px solid hsl(222 20% 16%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 20% 92%)" }}
            />
            <Bar dataKey="count" name="Problems" radius={[4, 4, 0, 0]}>
              {distribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DifficultyChart;
