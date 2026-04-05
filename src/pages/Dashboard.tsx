import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Loader2, AlertTriangle } from "lucide-react";
import { fetchRealUserData, generateMockUserData, generateCompetitorData, generateRecommendations, type UserAnalysis } from "@/lib/codeforces";
import UserOverview from "@/components/cala/UserOverview";
import TopicChart from "@/components/cala/TopicChart";
import DifficultyChart from "@/components/cala/DifficultyChart";
import EvaluationMetrics from "@/components/cala/EvaluationMetrics";
import WeakStrongTopics from "@/components/cala/WeakStrongTopics";
import AICompetitor from "@/components/cala/AICompetitor";
import RecommendedPlan from "@/components/cala/RecommendedPlan";
import Chatbot from "@/components/cala/Chatbot";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handle = searchParams.get("handle") || "tourist";

  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRealUserData(handle)
      .then(data => {
        if (!cancelled) { setAnalysis(data); setLoading(false); }
      })
      .catch(err => {
        console.warn("Codeforces API failed, using mock data:", err);
        if (!cancelled) {
          setAnalysis(generateMockUserData(handle));
          setError("Could not fetch live data — showing simulated results");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [handle]);

  const competitor = useMemo(() => analysis ? generateCompetitorData(analysis) : null, [analysis]);
  const recommendations = useMemo(() => analysis ? generateRecommendations(analysis) : [], [analysis]);

  if (loading || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Fetching data for <span className="font-mono text-foreground">{handle}</span>...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">CALA</span>
            {analysis.isRealData && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">LIVE</span>
            )}
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Switch User
          </button>
        </div>
      </header>

      {/* Warning banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <motion.main variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <motion.div variants={item}><UserOverview analysis={analysis} /></motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}><TopicChart topicStats={analysis.topicStats} /></motion.div>
          <motion.div variants={item}><DifficultyChart distribution={analysis.ratingDistribution} /></motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}><EvaluationMetrics analysis={analysis} /></motion.div>
          <motion.div variants={item}><WeakStrongTopics strong={analysis.strongTopics} weak={analysis.weakTopics} topicStats={analysis.topicStats} /></motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitor && <motion.div variants={item}><AICompetitor competitor={competitor} userHandle={handle} /></motion.div>}
          <motion.div variants={item}><RecommendedPlan recommendations={recommendations} /></motion.div>
        </div>
      </motion.main>

      <Chatbot analysis={analysis} />
    </div>
  );
};

export default Dashboard;
