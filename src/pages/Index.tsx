import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Brain, Target, Bot } from "lucide-react";

const Index = () => {
  const [handle, setHandle] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      navigate(`/dashboard?handle=${encodeURIComponent(handle.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md space-y-8"
      >
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4"
          >
            <Zap className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            CALA
          </h1>
          <p className="text-muted-foreground text-sm">
            Competitive Adaptive Learning Agent
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Brain, label: "Skill Analysis" },
            { icon: Target, label: "Smart Roadmap" },
            { icon: Bot, label: "AI Guidance" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="relative">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter your Codeforces handle"
              className="w-full px-4 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!handle.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        <p className="text-center text-xs text-muted-foreground/60">
          No account needed — just your Codeforces handle
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
