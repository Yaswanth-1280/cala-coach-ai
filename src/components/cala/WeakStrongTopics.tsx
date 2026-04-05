import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  strong: string[];
  weak: string[];
  topicStats: Record<string, { solved: number; attempted: number; avgRating: number }>;
}

const WeakStrongTopics = ({ strong, weak, topicStats }: Props) => {
  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Topic Strengths & Weaknesses</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">Strong Topics</span>
          </div>
          <div className="space-y-1.5">
            {strong.map(topic => {
              const stats = topicStats[topic];
              const rate = stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0;
              return (
                <div key={topic} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-sm text-foreground capitalize">{topic}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{stats.solved} solved</span>
                    <span className="text-success font-medium">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Weak Topics</span>
          </div>
          <div className="space-y-1.5">
            {weak.map(topic => {
              const stats = topicStats[topic];
              const rate = stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0;
              return (
                <div key={topic} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-sm text-foreground capitalize">{topic}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{stats.solved} solved</span>
                    <span className="text-destructive font-medium">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeakStrongTopics;
