import { useState } from 'react';
import {
  ALL_TOPICS,
  buildQuizQuestions,
  getRecommendedDurationSeconds,
  getTopicById,
} from './data/topics';
import type {
  ActiveQuizConfig,
  DifficultyLevel,
  DifficultySelection,
  EvaluatedBadge,
  Question,
  TestAttemptRecord,
  Topic,
  UserProfile,
  WrongQuestionRecord,
} from './types/quiz';
import {
  clearAllProgress,
  loadAttempts,
  loadUserProfile,
  loadWrongQuestions,
  removeWrongQuestion,
  saveAttempt,
  saveUserProfile,
  updateWrongQuestions,
} from './utils/storage';
import { getNewlyUnlockedBadges } from './utils/badges';
import { Header, type ActiveView, type CatalogFilter } from './components/Header';
import { TopicCatalog } from './components/TopicCatalog';
import { TestSetupModal } from './components/TestSetupModal';
import { QuizRunner } from './components/QuizRunner';
import { QuizResults } from './components/QuizResults';
import { UserProfileView } from './components/UserProfileView';
import {
  OfflineIndicator,
  PWAInstallButton,
} from './components/PWAInstallControls';
import { InstallLandingView } from './components/InstallLandingView';

interface ActiveSession {
  topic: Topic;
  config: ActiveQuizConfig;
  questions: Question[];
  result?: {
    answers: Record<string, number>;
    record: TestAttemptRecord;
    newlyUnlockedBadges: EvaluatedBadge[];
  };
}

function isInstallRouteRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('yukle') === '1' ||
    params.get('install') === '1' ||
    window.location.hash === '#yukle'
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    isInstallRouteRequested() ? 'install' : 'catalog'
  );
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('ALL');
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [attempts, setAttempts] = useState<TestAttemptRecord[]>(() =>
    loadAttempts()
  );
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestionRecord[]>(() =>
    loadWrongQuestions()
  );

  const [setupTarget, setSetupTarget] = useState<{
    topic: Topic;
    difficulty: DifficultySelection;
  } | null>(null);

  const [session, setSession] = useState<ActiveSession | null>(null);

  const startQuizWithConfig = (config: ActiveQuizConfig) => {
    const topic = getTopicById(config.topicId);
    if (!topic) return;
    const questions = buildQuizQuestions(
      topic,
      config.difficulty,
      config.questionCount
    );
    setSession({
      topic,
      config,
      questions,
    });
    setSetupTarget(null);
    setActiveView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (
    answers: Record<string, number>,
    elapsedSeconds: number,
    timedOut: boolean,
    timerStillEnabled: boolean
  ) => {
    if (!session) return;

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    for (const q of session.questions) {
      const userAns = answers[q.id];
      if (userAns === undefined) {
        blankCount += 1;
      } else if (userAns === q.correctIndex) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    }

    const netScore = Number((correctCount - wrongCount / 4).toFixed(2));

    const record: TestAttemptRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      topicId: session.topic.id,
      topicTitle: session.topic.title,
      exam: session.topic.exam,
      difficulty: session.config.difficulty,
      questionCount: session.questions.length,
      correctCount,
      wrongCount,
      blankCount,
      netScore,
      elapsedSeconds,
      timedOut,
      timerEnabled: timerStillEnabled,
      completedAt: new Date().toISOString(),
    };

    const updatedAttempts = saveAttempt(record);
    const updatedWrongQuestions = updateWrongQuestions(
      session.topic,
      session.questions,
      answers
    );
    const newlyUnlockedBadges = getNewlyUnlockedBadges(
      ALL_TOPICS,
      attempts,
      updatedAttempts
    );
    setAttempts(updatedAttempts);
    setWrongQuestions(updatedWrongQuestions);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            result: {
              answers,
              record,
              newlyUnlockedBadges,
            },
          }
        : null
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrimaryHeaderAction = () => {
    if (session && !session.result && activeView !== 'quiz') {
      setActiveView('quiz');
      return;
    }

    const pool =
      catalogFilter === 'ALL'
        ? ALL_TOPICS
        : ALL_TOPICS.filter((t) => t.exam === catalogFilter);
    const chosenTopic = pool[Math.floor(Math.random() * pool.length)] || ALL_TOPICS[0];

    startQuizWithConfig({
      topicId: chosenTopic.id,
      difficulty: 'orta',
      questionCount: 10,
      timerEnabled: true,
      totalDurationSeconds: getRecommendedDurationSeconds(10),
      instantFeedback: false,
    });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveUserProfile(updated);
    setProfile(updated);
  };

  const handleClearProgress = () => {
    clearAllProgress();
    setAttempts([]);
    setWrongQuestions([]);
  };

  const handleRemoveWrongQuestion = (questionId: string) => {
    const updated = removeWrongQuestion(questionId);
    setWrongQuestions(updated);
  };

  const hasOngoingQuiz = Boolean(session && !session.result);

  const clearInstallQueryParam = () => {
    if (typeof window !== 'undefined' && isInstallRouteRequested()) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-slate-900">
      <Header
        activeView={activeView}
        catalogFilter={catalogFilter}
        hasActiveQuiz={hasOngoingQuiz}
        onNavigateCatalog={(filter) => {
          clearInstallQueryParam();
          setCatalogFilter(filter);
          setActiveView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateProfile={() => {
          clearInstallQueryParam();
          setActiveView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onPrimaryAction={() => {
          clearInstallQueryParam();
          handlePrimaryHeaderAction();
        }}
      />

      <div className="flex-1">
        {activeView === 'catalog' && (
          <TopicCatalog
            topics={ALL_TOPICS}
            filter={catalogFilter}
            attempts={attempts}
            onFilterChange={setCatalogFilter}
            onSelectTopicTest={(topic, initialDifficulty = 'orta') =>
              setSetupTarget({ topic, difficulty: initialDifficulty })
            }
            onOpenProfile={() => {
              setActiveView('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'profile' && (
          <UserProfileView
            profile={profile}
            topics={ALL_TOPICS}
            attempts={attempts}
            onSaveProfile={handleSaveProfile}
            onClearProgress={handleClearProgress}
            onStartTopicTest={(topic, difficulty) =>
              setSetupTarget({ topic, difficulty })
            }
          />
        )}

        {activeView === 'quiz' && session && !session.result && (
          <QuizRunner
            key={`${session.topic.id}-${session.config.difficulty}-${session.questions[0]?.id}`}
            topic={session.topic}
            config={session.config}
            questions={session.questions}
            onFinish={handleFinishQuiz}
            onExit={() => {
              setSession(null);
              setActiveView('catalog');
            }}
          />
        )}

        {activeView === 'quiz' && session && session.result && (
          <QuizResults
            topic={session.topic}
            config={session.config}
            questions={session.questions}
            answers={session.result.answers}
            record={session.result.record}
            newlyUnlockedBadges={session.result.newlyUnlockedBadges}
            wrongQuestionsHistory={wrongQuestions}
            onRemoveWrongQuestion={handleRemoveWrongQuestion}
            onRetrySame={() => startQuizWithConfig(session.config)}
            onSwitchDifficulty={(level: DifficultyLevel) =>
              startQuizWithConfig({
                ...session.config,
                difficulty: level,
              })
            }
            onBackToCatalog={() => {
              setSession(null);
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProfile={() => {
              setSession(null);
              setActiveView('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeView === 'install' && (
          <InstallLandingView
            onContinueToTests={() => {
              clearInstallQueryParam();
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      <footer className="mt-12 bg-[#FAFBFD] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>MSE · Mustafa Şahin Edebiyat (Edebiyat ve Türkçe)</p>
            <PWAInstallButton
              onOpenInstallPage={() => {
                setActiveView('install');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 font-medium text-slate-600">
            <span>Kaynak: edebiyatdersi.com</span>
            <span aria-hidden="true">·</span>
            <span>Hazırlayan: Mustafa Şahin</span>
          </div>
        </div>
      </footer>

      <OfflineIndicator />

      {setupTarget && (
        <TestSetupModal
          topic={setupTarget.topic}
          initialDifficulty={setupTarget.difficulty}
          onClose={() => setSetupTarget(null)}
          onStart={startQuizWithConfig}
        />
      )}
    </div>
  );
}
