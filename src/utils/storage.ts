import type {
  DifficultyLevel,
  ExamCategory,
  Question,
  TestAttemptRecord,
  Topic,
  UserProfile,
  WrongQuestionRecord,
} from '../types/quiz';
import { DIFFICULTY_LEVELS } from '../data/topics';

const PROFILE_KEY = 'edebiyatdersi_user_profile_v1';
const ATTEMPTS_KEY = 'edebiyatdersi_test_attempts_v1';
const WRONG_QUESTIONS_KEY = 'edebiyatdersi_wrong_questions_v1';

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Öğrenci',
  targetGoal: 'YKS — TYT Türkçe & AYT Edebiyat',
  createdAt: new Date().toISOString(),
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      fullName: parsed.fullName?.trim() || DEFAULT_PROFILE.fullName,
      targetGoal: parsed.targetGoal?.trim() || DEFAULT_PROFILE.targetGoal,
      createdAt: parsed.createdAt || DEFAULT_PROFILE.createdAt,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage quota issues
  }
}

export function loadAttempts(): TestAttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TestAttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(record: TestAttemptRecord): TestAttemptRecord[] {
  const existing = loadAttempts();
  const updated = [record, ...existing].slice(0, 200);
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota issues
  }
  return updated;
}

export function clearAllProgress(): void {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(WRONG_QUESTIONS_KEY);
  } catch {
    // ignore
  }
}

export function loadWrongQuestions(): WrongQuestionRecord[] {
  try {
    const raw = localStorage.getItem(WRONG_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WrongQuestionRecord[]) : [];
  } catch {
    return [];
  }
}

export function updateWrongQuestions(
  topic: Topic,
  questions: Question[],
  answers: Record<string, number>
): WrongQuestionRecord[] {
  const existing = loadWrongQuestions();
  const map = new Map<string, WrongQuestionRecord>();
  for (const item of existing) {
    map.set(item.questionId, item);
  }

  const now = new Date().toISOString();
  for (const q of questions) {
    const userAns = answers[q.id];
    if (userAns !== undefined && userAns !== q.correctIndex) {
      const prev = map.get(q.id);
      map.set(q.id, {
        questionId: q.id,
        topicId: topic.id,
        topicTitle: topic.title,
        exam: topic.exam,
        lastSelectedIndex: userAns,
        wrongCount: prev ? prev.wrongCount + 1 : 1,
        lastWrongAt: now,
      });
    }
  }

  const updated = Array.from(map.values()).sort(
    (a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime()
  );

  try {
    localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota issues
  }

  return updated;
}

export function removeWrongQuestion(questionId: string): WrongQuestionRecord[] {
  const existing = loadWrongQuestions();
  const updated = existing.filter((item) => item.questionId !== questionId);
  try {
    localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export interface TopicProgressSummary {
  completedLevels: Record<DifficultyLevel, boolean>;
  bestAttemptByLevel: Partial<Record<DifficultyLevel, TestAttemptRecord>>;
  completedCount: number;
  totalLevels: number;
  percentage: number;
}

export function getTopicProgress(
  topicId: string,
  attempts: TestAttemptRecord[]
): TopicProgressSummary {
  const completedLevels: Record<DifficultyLevel, boolean> = {
    kolay: false,
    orta: false,
    zor: false,
  };
  const bestAttemptByLevel: Partial<Record<DifficultyLevel, TestAttemptRecord>> = {};

  for (const attempt of attempts) {
    if (attempt.topicId !== topicId) continue;
    if (attempt.difficulty === 'kolay' || attempt.difficulty === 'orta' || attempt.difficulty === 'zor') {
      const lvl = attempt.difficulty;
      completedLevels[lvl] = true;
      const prev = bestAttemptByLevel[lvl];
      if (!prev || attempt.netScore > prev.netScore) {
        bestAttemptByLevel[lvl] = attempt;
      }
    }
  }

  const completedCount = DIFFICULTY_LEVELS.filter((lvl) => completedLevels[lvl]).length;
  const totalLevels = DIFFICULTY_LEVELS.length;

  return {
    completedLevels,
    bestAttemptByLevel,
    completedCount,
    totalLevels,
    percentage: Math.round((completedCount / totalLevels) * 100),
  };
}

export interface OverallProgressStats {
  totalModules: number;
  completedModules: number;
  overallPercentage: number;
  tytModulesTotal: number;
  tytModulesCompleted: number;
  tytPercentage: number;
  aytModulesTotal: number;
  aytModulesCompleted: number;
  aytPercentage: number;
  totalTestsSolved: number;
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalWrong: number;
  averageNet: number;
}

export function computeOverallStats(
  topics: Topic[],
  attempts: TestAttemptRecord[]
): OverallProgressStats {
  const computeExam = (exam?: ExamCategory) => {
    const filtered = exam ? topics.filter((t) => t.exam === exam) : topics;
    let completed = 0;
    const total = filtered.length * DIFFICULTY_LEVELS.length;
    for (const topic of filtered) {
      completed += getTopicProgress(topic.id, attempts).completedCount;
    }
    return {
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const all = computeExam();
  const tyt = computeExam('TYT');
  const ayt = computeExam('AYT');

  const totalTestsSolved = attempts.length;
  const totalQuestionsSolved = attempts.reduce((sum, a) => sum + a.questionCount, 0);
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correctCount, 0);
  const totalWrong = attempts.reduce((sum, a) => sum + a.wrongCount, 0);
  const averageNet =
    totalTestsSolved > 0
      ? Number(
          (attempts.reduce((sum, a) => sum + a.netScore, 0) / totalTestsSolved).toFixed(2)
        )
      : 0;

  return {
    totalModules: all.total,
    completedModules: all.completed,
    overallPercentage: all.pct,
    tytModulesTotal: tyt.total,
    tytModulesCompleted: tyt.completed,
    tytPercentage: tyt.pct,
    aytModulesTotal: ayt.total,
    aytModulesCompleted: ayt.completed,
    aytPercentage: ayt.pct,
    totalTestsSolved,
    totalQuestionsSolved,
    totalCorrect,
    totalWrong,
    averageNet,
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
