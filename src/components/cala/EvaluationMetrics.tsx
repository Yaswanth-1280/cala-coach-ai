import { Target, TrendingUp, Flame, Repeat } from "lucide-react";
import type { UserAnalysis } from "@/lib/codeforces";

interface Props {
  analysis: UserAnalysis;
}

const EvaluationMetrics = ({ analysis }: Props) => {
  const attemptsPerProblem = (analysis.totalAttempted / (analysis.totalSolved || 1)).toFixed(1);

  const metrics = [
    {
      icon: Target,
      label: "Accuracy",
      value: `${analysis.accuracy}%`,
      sub: `${analysis.totalSolved}/${analysis.totalAttempted} problems`,
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Avg Solved Rating",
      value: analysis.averageRating.toString(),
      sub: "Average difficulty",
      color: "text-cyan-glow",
    },
    {
      icon: Flame,
      label: "Consistency",
      value: `${analysis.consistencyScore}%`,
      sub: "Active days (30d)",
      color: analysis.consistencyScore > 50 ? "text-success" : "text-warning",
    },
    {
      icon: Repeat,
      label: "Attempts/Problem",
      value: attemptsPerProblem,
      sub: "Efficiency ratio",
      color: "text-accent",
    },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Evaluation Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationMetrics;
