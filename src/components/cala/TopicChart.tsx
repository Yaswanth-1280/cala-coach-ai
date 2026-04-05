import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  topicStats: Record<string, { solved: number; attempted: number; avgRating: number }>;
}

const TopicChart = ({ topicStats }: Props) => {
  const data = Object.entries(topicStats)
    .filter(([, v]) => v.attempted > 0)
    .map(([topic, v]) => ({
      topic: topic.length > 12 ? topic.slice(0, 12) + "…" : topic,
      solved: v.solved,
      attempted: v.attempted,
      rate: v.attempted > 0 ? Math.round((v.solved / v.attempted) * 100) : 0,
    }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10);

  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Topic Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
            <XAxis type="number" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="topic" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip
              contentStyle={{ background: "hsl(222 25% 10%)", border: "1px solid hsl(222 20% 16%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 20% 92%)" }}
            />
            <Bar dataKey="solved" name="Solved" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`hsl(185, ${60 + i * 3}%, ${45 + i * 2}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopicChart;
