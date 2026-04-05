import { Bot, Zap, TrendingUp } from "lucide-react";

interface CompetitorData {
  level: string;
  rating: number;
  accuracy: number;
  aheadPercent: number;
  message: string;
}

interface Props {
  competitor: CompetitorData;
  userHandle: string;
}

const AICompetitor = ({ competitor, userHandle }: Props) => {
  return (
    <div className="rounded-xl border border-accent/30 p-6 h-full glow-competitor relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-competitor flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Competitor</h3>
            <p className="text-xs text-muted-foreground">Adaptive rival for {userHandle}</p>
          </div>
        </div>

        {/* Competitor stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <Zap className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{competitor.rating}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <TrendingUp className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{competitor.accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <span className="text-accent text-lg">⚡</span>
            <div className="text-lg font-bold text-foreground">{competitor.level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        {/* Status badge */}
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs font-medium text-accent">{competitor.aheadPercent}% ahead of you</span>
          </div>
          <p className="text-sm text-foreground/80 italic">"{competitor.message}"</p>
        </div>
      </div>
    </div>
  );
};

export default AICompetitor;
