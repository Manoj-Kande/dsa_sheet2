// ============================================
// Static dataset access — typed, server + client safe
// Problems/Topics/Companies/Sheets never change per-user,
// so they stay as a bundled JSON import rather than DB rows.
// ============================================
import rawDataset from "@/data/dataset.json";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Frequency = "Very High" | "High" | "Medium" | "Low";

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  estimated_time_minutes: number | null;
  tags: string[];
  companies: string[];
  frequency: Frequency | null;
  sheets: string[];
  prerequisites: string[];
  similar_problems: string[];
  links: {
    leetcode: string | null;
    geeksforgeeks: string | null;
    codingninjas: string | null;
    hackerrank: string | null;
  };
  topic: string;
  topic_slug: string;
  subtopic: string;
  subtopic_slug: string;
}

export interface TopicSummary {
  topic: string;
  slug: string;
  subtopic_count: number;
  problem_count: number;
  difficulty_breakdown: Record<Difficulty, number>;
  subtopics: { name: string; slug: string; problem_count: number }[];
}

export interface CompanySummary {
  name: string;
  slug: string;
  problem_count: number;
  difficulty_breakdown: Record<Difficulty, number>;
  frequency_breakdown: Record<string, number>;
}

export interface SheetSummary {
  name: string;
  slug: string;
  problem_count: number;
  difficulty_breakdown: Record<Difficulty, number>;
}

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

export interface Dataset {
  problems: Problem[];
  topics: TopicSummary[];
  companies: CompanySummary[];
  sheets: SheetSummary[];
  tags: TagSummary[];
  stats: {
    total_topics: number;
    total_subtopics: number;
    total_problems: number;
    difficulty: Record<Difficulty, number>;
    total_companies: number;
    total_sheets: number;
    total_tags: number;
  };
}

export const DATASET = rawDataset as unknown as Dataset;

// ---------- Helpers ----------

/** Unique problems by slug — collapses cross-topic listings for global views. */
export function getUniqueProblems(): Problem[] {
  const seen = new Set<string>();
  const result: Problem[] = [];
  for (const p of DATASET.problems) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      result.push(p);
    }
  }
  return result;
}

export function getProblemById(id: string): Problem | undefined {
  return DATASET.problems.find((p) => p.id === id);
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return DATASET.problems.find((p) => p.slug === slug);
}

export function getTopicBySlug(slug: string): TopicSummary | undefined {
  return DATASET.topics.find((t) => t.slug === slug);
}

export function getCompanyBySlug(slug: string): CompanySummary | undefined {
  return DATASET.companies.find((c) => c.slug === slug);
}

export function getSheetBySlug(slug: string): SheetSummary | undefined {
  return DATASET.sheets.find((s) => s.slug === slug);
}

export function getProblemsByTopic(topicSlug: string): Problem[] {
  return DATASET.problems.filter((p) => p.topic_slug === topicSlug);
}

export function getProblemsByCompany(companyName: string): Problem[] {
  const seen = new Set<string>();
  return DATASET.problems.filter((p) => {
    if (!p.companies.includes(companyName)) return false;
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

export function getProblemsBySheet(sheetName: string): Problem[] {
  const seen = new Set<string>();
  return DATASET.problems.filter((p) => {
    if (!p.sheets.includes(sheetName)) return false;
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}
