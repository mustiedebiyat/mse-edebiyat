import type { DifficultyLevel, DifficultySelection, Question, Topic } from '../types/quiz';
import { TYT_TOPICS_1_2 } from './tytTopic1_2';
import { TYT_TOPICS_3_4 } from './tytTopic3_4';
import { TYT_TOPICS_5_6 } from './tytTopic5_6';
import { AYT_TOPICS_1_2 } from './aytTopic1_2';
import { AYT_TOPICS_3_4 } from './aytTopic3_4';
import { AYT_TOPICS_5_6 } from './aytTopic5_6';
import { AYT_TOPIC_7_HALK } from './aytTopic7_halk';
import { AYT_TOPIC_9_AKIMLAR } from './aytTopic9_akimlar';

export const ALL_TOPICS: Topic[] = [
  ...TYT_TOPICS_1_2,
  ...TYT_TOPICS_3_4,
  ...TYT_TOPICS_5_6,
  ...AYT_TOPICS_1_2,
  ...AYT_TOPICS_3_4,
  ...AYT_TOPICS_5_6,
  ...AYT_TOPIC_7_HALK,
  AYT_TOPIC_9_AKIMLAR,
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['kolay', 'orta', 'zor'];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;

export function getTopicById(topicId: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === topicId);
}

export function findQuestionById(
  questionId: string
): { topic: Topic; question: Question } | undefined {
  for (const topic of ALL_TOPICS) {
    const question = topic.questions.find((q) => q.id === questionId);
    if (question) {
      return { topic, question };
    }
  }
  return undefined;
}

/**
 * 10 soru için 15 dakika (soru başı 90 saniye).
 */
export function getRecommendedDurationSeconds(questionCount: number): number {
  return Math.round(questionCount * 90);
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Seçilen konu, zorluk seviyesi ve soru sayısına göre test sorularını hazırlar.
 * Kolay/Orta/Zor seçiminde öncelikle ilgili seviyedeki soruları alır;
 * soru sayısı 10'dan büyük seçilirse (ör. 15 veya 20) kalan soruları aynı konunun
 * yakın zorluk seviyesinden tamamlar.
 */
export function buildQuizQuestions(
  topic: Topic,
  difficulty: DifficultySelection,
  count: number
): Question[] {
  const safeCount = Math.max(1, Math.min(count, topic.questions.length));

  if (difficulty === 'karma') {
    const kolay = shuffleArray(topic.questions.filter((q) => q.difficulty === 'kolay'));
    const orta = shuffleArray(topic.questions.filter((q) => q.difficulty === 'orta'));
    const zor = shuffleArray(topic.questions.filter((q) => q.difficulty === 'zor'));
    const interleaved: Question[] = [];
    const maxLen = Math.max(kolay.length, orta.length, zor.length);
    for (let i = 0; i < maxLen; i += 1) {
      if (kolay[i]) interleaved.push(kolay[i]);
      if (orta[i]) interleaved.push(orta[i]);
      if (zor[i]) interleaved.push(zor[i]);
    }
    return interleaved.slice(0, safeCount);
  }

  const primary = shuffleArray(topic.questions.filter((q) => q.difficulty === difficulty));
  if (primary.length >= safeCount) {
    return primary.slice(0, safeCount);
  }

  const fallbackOrder: Record<DifficultyLevel, DifficultyLevel[]> = {
    kolay: ['orta', 'zor'],
    orta: ['kolay', 'zor'],
    zor: ['orta', 'kolay'],
  };

  const secondary: Question[] = [];
  for (const level of fallbackOrder[difficulty]) {
    secondary.push(...shuffleArray(topic.questions.filter((q) => q.difficulty === level)));
  }

  return [...primary, ...secondary].slice(0, safeCount);
}
