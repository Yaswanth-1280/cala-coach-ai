import { User, TrendingUp, Target, Clock } from "lucide-react";
import type { UserAnalysis } from "@/lib/codeforces";

const levelColors: Record<string, string> = {
  Beginner: "text-success",
  Intermediate: "text-warning",
  Advanced: "text-primary",
};

interface Props {
  analysis: UserAnalysis;
}

const UserOverview = ({ analysis }: Props) => {
  const stats = [
    { icon: TrendingUp, label: "Avg Rating", value: analysis.averageRating },
    { icon: Target, label: "Accuracy", value: `${analysis.accuracy}%` },
    { icon: Clock, label: "Last Active", value: analysis.lastActiveDays === 0 ? "Today" : `${analysis.lastActiveDays}d ago` },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-mono">{analysis.handle}</h2>
            <p className={`text-sm font-semibold ${levelColors[analysis.skillLevel]}`}>
              {analysis.skillLevel} · {analysis.totalSolved} solved
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="text-lg font-bold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
