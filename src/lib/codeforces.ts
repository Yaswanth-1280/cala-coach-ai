import { supabase } from "@/integrations/supabase/client";

// ============ Types ============

export interface Submission {
  id: number;
  problem: {
    name: string;
    rating: number;
    tags: string[];
  };
  verdict: string;
  creationTimeSeconds: number;
}

export interface UserAnalysis {
  handle: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  averageRating: number;
  accuracy: number;
  lastActiveDays: number;
  totalSolved: number;
  totalAttempted: number;
  topicStats: Record<string, { solved: number; attempted: number; avgRating: number }>;
  strongTopics: string[];
  weakTopics: string[];
  ratingDistribution: { range: string; count: number }[];
  recentActivity: { date: string; count: number }[];
  consistencyScore: number;
  submissions: Submission[];
  isRealData: boolean;
}

// ============ Fetch real data via edge function ============

export async function fetchRealUserData(handle: string): Promise<UserAnalysis> {
  const { data, error } = await supabase.functions.invoke("codeforces", {
    body: { handle },
  });

  if (error) throw new Error(error.message || "Failed to fetch data");
  if (data?.error) throw new Error(data.error);

  const rawSubmissions: any[] = data.submissions || [];

  // Normalize submissions
  const submissions: Submission[] = rawSubmissions
    .filter((s: any) => s.problem)
    .map((s: any) => ({
      id: s.id,
      problem: {
        name: s.problem.name || "Unknown",
        rating: s.problem.rating || 0,
        tags: s.problem.tags || [],
      },
      verdict: s.verdict || "UNKNOWN",
      creationTimeSeconds: s.creationTimeSeconds,
    }));

  return analyzeSubmissions(handle, submissions, true);
}

// ============ Analysis engine (shared by real & mock) ============

function analyzeSubmissions(handle: string, submissions: Submission[], isRealData: boolean): UserAnalysis {
  const now = Date.now() / 1000;

  // Build topic stats
  const topicStats: Record<string, { solved: number; attempted: number; totalRating: number; avgRating: number }> = {};

  // Deduplicate: count unique problems, not every submission
  const seenProblems = new Map<string, { solved: boolean; rating: number; tags: string[] }>();

  for (const s of submissions) {
    const key = s.problem.name;
    const existing = seenProblems.get(key);
    if (!existing) {
      seenProblems.set(key, { solved: s.verdict === "OK", rating: s.problem.rating, tags: s.problem.tags });
    } else if (s.verdict === "OK" && !existing.solved) {
      existing.solved = true;
    }
  }

  for (const [, prob] of seenProblems) {
    for (const tag of prob.tags) {
      if (!topicStats[tag]) {
        topicStats[tag] = { solved: 0, attempted: 0, totalRating: 0, avgRating: 0 };
      }
      topicStats[tag].attempted++;
      if (prob.solved) {
        topicStats[tag].solved++;
        if (prob.rating > 0) topicStats[tag].totalRating += prob.rating;
      }
    }
  }

  // Compute avg ratings
  for (const t of Object.values(topicStats)) {
    t.avgRating = t.solved > 0 ? Math.round(t.totalRating / t.solved) : 0;
  }

  const totalProblems = seenProblems.size;
  const solvedProblems = [...seenProblems.values()].filter(p => p.solved);
  const totalSolved = solvedProblems.length;
  const accuracy = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const ratedSolved = solvedProblems.filter(p => p.rating > 0);
  const avgRating = ratedSolved.length > 0
    ? Math.round(ratedSolved.reduce((a, p) => a + p.rating, 0) / ratedSolved.length)
    : 0;

  const skillLevel = avgRating < 1100 ? "Beginner" : avgRating < 1500 ? "Intermediate" : "Advanced";

  // Last active
  const latestSub = submissions.length > 0 ? Math.max(...submissions.map(s => s.creationTimeSeconds)) : now;
  const lastActiveDays = Math.max(0, Math.round((now - latestSub) / 86400));

  // Strong/weak topics
  const topicEntries = Object.entries(topicStats)
    .filter(([, v]) => v.attempted >= 3)
    .map(([k, v]) => ({ topic: k, rate: v.attempted > 0 ? v.solved / v.attempted : 0, ...v }))
    .sort((a, b) => b.rate - a.rate);

  const strongTopics = topicEntries.slice(0, 4).map(t => t.topic);
  const weakTopics = topicEntries.slice(-4).map(t => t.topic);

  // Rating distribution
  const ranges = ["800-1000", "1000-1200", "1200-1400", "1400-1600", "1600-1800", "1800+"];
  const ratingDistribution = ranges.map(range => {
    const [min, max] = range.includes("+") ? [1800, 9999] : range.split("-").map(Number);
    return {
      range,
      count: ratedSolved.filter(p => p.rating >= min && p.rating < max).length,
    };
  });

  // Recent activity (last 30 days)
  const recentActivity: { date: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const dayStart = now - d * 86400;
    const dayEnd = dayStart + 86400;
    const count = submissions.filter(s => s.creationTimeSeconds >= dayStart && s.creationTimeSeconds < dayEnd).length;
    const date = new Date(dayStart * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    recentActivity.push({ date, count });
  }

  const activeDays = recentActivity.filter(d => d.count > 0).length;
  const consistencyScore = Math.round((activeDays / 30) * 100);

  // Clean topicStats
  const cleanTopicStats: Record<string, { solved: number; attempted: number; avgRating: number }> = {};
  for (const [k, v] of Object.entries(topicStats)) {
    cleanTopicStats[k] = { solved: v.solved, attempted: v.attempted, avgRating: v.avgRating };
  }

  return {
    handle,
    skillLevel,
    averageRating: avgRating,
    accuracy,
    lastActiveDays,
    totalSolved,
    totalAttempted: totalProblems,
    topicStats: cleanTopicStats,
    strongTopics,
    weakTopics,
    ratingDistribution,
    recentActivity,
    consistencyScore,
    submissions,
    isRealData,
  };
}

// ============ Mock data fallback ============

const TOPICS = [
  "implementation", "math", "greedy", "dp", "data structures",
  "brute force", "constructive algorithms", "graphs", "sortings",
  "binary search", "strings", "number theory", "geometry", "trees",
  "two pointers", "dfs and similar", "bitmasks"
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 12345) % 2147483647;
    return s / 2147483647;
  };
}

export function generateMockUserData(handle: string): UserAnalysis {
  const seed = hashCode(handle);
  const rand = seededRandom(seed);
  const totalSubmissions = Math.floor(rand() * 300) + 100;
  const now = Date.now() / 1000;
  const submissions: Submission[] = [];

  const strongIndices = [Math.floor(rand() * 5), 5 + Math.floor(rand() * 5)];
  const weakIndices = [10 + Math.floor(rand() * 4), 14 + Math.floor(rand() * 3)];

  for (let i = 0; i < totalSubmissions; i++) {
    const topicIdx = Math.floor(rand() * TOPICS.length);
    const topic = TOPICS[topicIdx];
    const isStrong = strongIndices.includes(topicIdx);
    const isWeak = weakIndices.includes(topicIdx);
    const rating = Math.min(2400, Math.max(800, 800 + Math.floor(rand() * 1200)));
    let solveProb = 0.55;
    if (isStrong) solveProb = 0.8;
    if (isWeak) solveProb = 0.3;
    if (rating > 1600) solveProb -= 0.2;

    const verdict = rand() < solveProb ? "OK" :
      rand() < 0.6 ? "WRONG_ANSWER" :
        rand() < 0.8 ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR";

    const daysAgo = Math.floor(rand() * 180);
    submissions.push({
      id: i + 1,
      problem: {
        name: `Problem_${String.fromCharCode(65 + Math.floor(rand() * 6))}${Math.floor(rand() * 999) + 1}`,
        rating,
        tags: [topic, ...(rand() > 0.6 ? [TOPICS[Math.floor(rand() * TOPICS.length)]] : [])],
      },
      verdict,
      creationTimeSeconds: now - daysAgo * 86400 - Math.floor(rand() * 86400),
    });
  }

  return analyzeSubmissions(handle, submissions, false);
}

// ============ Competitor & Recommendations ============

export function generateCompetitorData(userAnalysis: UserAnalysis) {
  const aheadPercent = Math.floor(Math.random() * 5) + 2;
  const competitorRating = Math.round(userAnalysis.averageRating * (1 + aheadPercent / 100));
  const competitorAccuracy = Math.min(99, userAnalysis.accuracy + Math.floor(Math.random() * 5) + 1);
  const competitorLevel = competitorRating < 1100 ? "Beginner" : competitorRating < 1500 ? "Intermediate" : "Advanced";

  let message: string;
  if (userAnalysis.lastActiveDays > 2) {
    message = `You missed ${userAnalysis.lastActiveDays} days. I'm ahead now. Time to catch up!`;
  } else if (userAnalysis.consistencyScore > 60) {
    message = "You're catching up. Keep going — consistency wins!";
  } else {
    message = `I'm ${aheadPercent}% ahead. Push harder to close the gap!`;
  }

  return { level: competitorLevel, rating: competitorRating, accuracy: competitorAccuracy, aheadPercent, message };
}

export function generateRecommendations(analysis: UserAnalysis) {
  const recommendations: { topic: string; difficulty: string; count: number }[] = [];

  analysis.weakTopics.slice(0, 3).forEach(topic => {
    const stats = analysis.topicStats[topic];
    const targetRating = stats?.avgRating > 0 ? stats.avgRating : analysis.averageRating - 100;
    const low = Math.max(800, Math.round(targetRating / 100) * 100);
    recommendations.push({ topic, difficulty: `${low}–${low + 200}`, count: Math.floor(Math.random() * 2) + 2 });
  });

  if (recommendations.length < 4) {
    analysis.strongTopics.slice(0, 1).forEach(topic => {
      const stats = analysis.topicStats[topic];
      const low = Math.round((stats?.avgRating || analysis.averageRating) + 200);
      recommendations.push({ topic, difficulty: `${Math.round(low / 100) * 100}–${Math.round(low / 100) * 100 + 200}`, count: 1 });
    });
  }

  return recommendations;
}
