export type ExamCategory = 'TYT' | 'AYT';

export type DifficultyLevel = 'kolay' | 'orta' | 'zor';

export type DifficultySelection = DifficultyLevel | 'karma';

export type OptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export const OPTION_LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D', 'E'];

export const DIFFICULTY_LABELS: Record<DifficultySelection, string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
  karma: 'Karma (Tüm Seviyeler)',
};

export interface Question {
  id: string;
  difficulty: DifficultyLevel;
  stem: string;
  options: [string, string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3 | 4;
  explanation: string;
}

export interface Topic {
  id: string;
  exam: ExamCategory;
  order: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface ActiveQuizConfig {
  topicId: string;
  difficulty: DifficultySelection;
  questionCount: number;
  timerEnabled: boolean;
  totalDurationSeconds: number;
  instantFeedback: boolean;
}

export interface TestAttemptRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  exam: ExamCategory;
  difficulty: DifficultySelection;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  netScore: number;
  elapsedSeconds: number;
  timedOut: boolean;
  timerEnabled: boolean;
  completedAt: string;
}

export interface UserProfile {
  fullName: string;
  targetGoal: string;
  createdAt: string;
}

export type BadgeCategory = 'milestone' | 'performance' | 'mastery';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  criteriaText: string;
  category: BadgeCategory;
  icon:
    | 'award'
    | 'book'
    | 'flame'
    | 'target'
    | 'trophy'
    | 'zap'
    | 'shield'
    | 'clock'
    | 'compass'
    | 'star';
}

export interface EvaluatedBadge extends BadgeDefinition {
  earned: boolean;
  earnedAt?: string;
}

export interface WrongQuestionRecord {
  questionId: string;
  topicId: string;
  topicTitle: string;
  exam: ExamCategory;
  lastSelectedIndex: number;
  wrongCount: number;
  lastWrongAt: string;
}


