import { BookOpen, CheckCircle2 } from "lucide-react";

interface Recommendation {
  topic: string;
  difficulty: string;
  count: number;
}

interface Props {
  recommendations: Recommendation[];
}

const RecommendedPlan = ({ recommendations }: Props) => {
  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recommended Plan</h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg bg-muted/40 p-3"
          >
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">
                Solve <span className="font-semibold text-primary">{rec.count}</span>{" "}
                <span className="capitalize">{rec.topic}</span> problem{rec.count > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Difficulty: {rec.difficulty}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Focus on weak topics with manageable difficulty to build confidence.
      </p>
    </div>
  );
};

export default RecommendedPlan;
