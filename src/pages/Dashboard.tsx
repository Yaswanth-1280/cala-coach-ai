import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { generateUserData, generateCompetitorData, generateRecommendations } from "@/lib/codeforces";
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handle = searchParams.get("handle") || "tourist";

  const analysis = useMemo(() => generateUserData(handle), [handle]);
  const competitor = useMemo(() => generateCompetitorData(analysis), [analysis]);
  const recommendations = useMemo(() => generateRecommendations(analysis), [analysis]);

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

      {/* Dashboard Content */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6"
      >
        <motion.div variants={item}>
          <UserOverview analysis={analysis} />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <TopicChart topicStats={analysis.topicStats} />
          </motion.div>
          <motion.div variants={item}>
            <DifficultyChart distribution={analysis.ratingDistribution} />
          </motion.div>
        </div>

        {/* Metrics + Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <EvaluationMetrics analysis={analysis} />
          </motion.div>
          <motion.div variants={item}>
            <WeakStrongTopics strong={analysis.strongTopics} weak={analysis.weakTopics} topicStats={analysis.topicStats} />
          </motion.div>
        </div>

        {/* Competitor + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <AICompetitor competitor={competitor} userHandle={handle} />
          </motion.div>
          <motion.div variants={item}>
            <RecommendedPlan recommendations={recommendations} />
          </motion.div>
        </div>
      </motion.main>

      {/* Chatbot */}
      <Chatbot analysis={analysis} />
    </div>
  );
};

export default Dashboard;
