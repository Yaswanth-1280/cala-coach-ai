// Mock data generator for Codeforces-style submissions
// Uses handle as seed for deterministic data

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

export interface Submission {
  id: number;
  problem: {
    name: string;
    rating: number;
    tags: string[];
  };
  verdict: "OK" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
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
}

export function generateUserData(handle: string): UserAnalysis {
  const seed = hashCode(handle);
  const rand = seededRandom(seed);

  const totalSubmissions = Math.floor(rand() * 300) + 100;
  const now = Date.now() / 1000;
  const submissions: Submission[] = [];

  const topicStats: Record<string, { solved: number; attempted: number; avgRating: number; totalRating: number }> = {};
  TOPICS.forEach(t => {
    topicStats[t] = { solved: 0, attempted: 0, avgRating: 0, totalRating: 0 };
  });

  // Generate skill bias - some topics the user is better at
  const strongIndices = [Math.floor(rand() * 5), 5 + Math.floor(rand() * 5)];
  const weakIndices = [10 + Math.floor(rand() * 4), 14 + Math.floor(rand() * 3)];

  for (let i = 0; i < totalSubmissions; i++) {
    const topicIdx = Math.floor(rand() * TOPICS.length);
    const topic = TOPICS[topicIdx];
    const isStrong = strongIndices.includes(topicIdx);
    const isWeak = weakIndices.includes(topicIdx);

    const baseRating = 800 + Math.floor(rand() * 1200);
    const rating = Math.min(2400, Math.max(800, baseRating));

    let solveProb = 0.55;
    if (isStrong) solveProb = 0.8;
    if (isWeak) solveProb = 0.3;
    if (rating > 1600) solveProb -= 0.2;

    const verdict = rand() < solveProb ? "OK" as const :
      rand() < 0.6 ? "WRONG_ANSWER" as const :
        rand() < 0.8 ? "TIME_LIMIT_EXCEEDED" as const : "RUNTIME_ERROR" as const;

    const daysAgo = Math.floor(rand() * 180);
    const creationTime = now - daysAgo * 86400 - Math.floor(rand() * 86400);

    submissions.push({
      id: i + 1,
      problem: {
        name: `Problem_${String.fromCharCode(65 + Math.floor(rand() * 6))}${Math.floor(rand() * 999) + 1}`,
        rating,
        tags: [topic, ...(rand() > 0.6 ? [TOPICS[Math.floor(rand() * TOPICS.length)]] : [])],
      },
      verdict,
      creationTimeSeconds: creationTime,
    });

    topicStats[topic].attempted++;
    if (verdict === "OK") {
      topicStats[topic].solved++;
      topicStats[topic].totalRating += rating;
    }
  }

  // Compute averages
  Object.keys(topicStats).forEach(t => {
    const s = topicStats[t];
    s.avgRating = s.solved > 0 ? Math.round(s.totalRating / s.solved) : 0;
  });

  const solved = submissions.filter(s => s.verdict === "OK");
  const accuracy = Math.round((solved.length / submissions.length) * 100);
  const avgRating = Math.round(solved.reduce((a, s) => a + s.problem.rating, 0) / (solved.length || 1));

  const skillLevel = avgRating < 1100 ? "Beginner" : avgRating < 1500 ? "Intermediate" : "Advanced";

  // Last active
  const latestSub = Math.max(...submissions.map(s => s.creationTimeSeconds));
  const lastActiveDays = Math.max(0, Math.round((now - latestSub) / 86400));

  // Strong/weak topics (by solve rate, min 3 attempts)
  const topicEntries = Object.entries(topicStats)
    .filter(([, v]) => v.attempted >= 3)
    .map(([k, v]) => ({ topic: k, rate: v.solved / v.attempted, ...v }))
    .sort((a, b) => b.rate - a.rate);

  const strongTopics = topicEntries.slice(0, 4).map(t => t.topic);
  const weakTopics = topicEntries.slice(-4).map(t => t.topic);

  // Rating distribution
  const ranges = ["800-1000", "1000-1200", "1200-1400", "1400-1600", "1600-1800", "1800+"];
  const ratingDistribution = ranges.map(range => {
    const [min, max] = range.includes("+")
      ? [1800, 9999]
      : range.split("-").map(Number);
    return {
      range,
      count: solved.filter(s => s.problem.rating >= min && s.problem.rating < max).length,
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

  // Consistency (active days in last 30)
  const activeDays = recentActivity.filter(d => d.count > 0).length;
  const consistencyScore = Math.round((activeDays / 30) * 100);

  // Clean topicStats for return
  const cleanTopicStats: Record<string, { solved: number; attempted: number; avgRating: number }> = {};
  Object.entries(topicStats).forEach(([k, v]) => {
    cleanTopicStats[k] = { solved: v.solved, attempted: v.attempted, avgRating: v.avgRating };
  });

  return {
    handle,
    skillLevel,
    averageRating: avgRating,
    accuracy,
    lastActiveDays,
    totalSolved: solved.length,
    totalAttempted: submissions.length,
    topicStats: cleanTopicStats,
    strongTopics,
    weakTopics,
    ratingDistribution,
    recentActivity,
    consistencyScore,
    submissions,
  };
}

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

  return {
    level: competitorLevel,
    rating: competitorRating,
    accuracy: competitorAccuracy,
    aheadPercent,
    message,
  };
}

export function generateRecommendations(analysis: UserAnalysis) {
  const recommendations: { topic: string; difficulty: string; count: number }[] = [];

  analysis.weakTopics.slice(0, 3).forEach(topic => {
    const stats = analysis.topicStats[topic];
    const targetRating = stats.avgRating > 0 ? stats.avgRating : analysis.averageRating - 100;
    const low = Math.max(800, Math.round(targetRating / 100) * 100);
    const high = low + 200;
    recommendations.push({
      topic,
      difficulty: `${low}–${high}`,
      count: Math.floor(Math.random() * 2) + 2,
    });
  });

  if (recommendations.length < 4) {
    analysis.strongTopics.slice(0, 1).forEach(topic => {
      const stats = analysis.topicStats[topic];
      const targetRating = stats.avgRating + 200;
      const low = Math.round(targetRating / 100) * 100;
      const high = low + 200;
      recommendations.push({
        topic,
        difficulty: `${low}–${high}`,
        count: 1,
      });
    });
  }

  return recommendations;
}
