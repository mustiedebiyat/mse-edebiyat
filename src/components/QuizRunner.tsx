import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eraser,
  Flag,
  Pause,
  Play,
  XCircle,
} from 'lucide-react';
import type {
  ActiveQuizConfig,
  Question,
  Topic,
} from '../types/quiz';
import { DIFFICULTY_LABELS, OPTION_LETTERS } from '../types/quiz';
import { formatDuration } from '../utils/storage';

interface QuizRunnerProps {
  topic: Topic;
  config: ActiveQuizConfig;
  questions: Question[];
  onFinish: (
    answers: Record<string, number>,
    elapsedSeconds: number,
    timedOut: boolean,
    timerStillEnabled: boolean
  ) => void;
  onExit: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  topic,
  config,
  questions,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [timerEnabled, setTimerEnabled] = useState(config.timerEnabled);
  const [timerPaused, setTimerPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.totalDurationSeconds
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  const elapsedRef = useRef(elapsedSeconds);
  const timerEnabledRef = useRef(timerEnabled);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    timerEnabledRef.current = timerEnabled;
  }, [timerEnabled]);

  const triggerFinish = useCallback(
    (timedOut: boolean) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onFinish(
        answersRef.current,
        elapsedRef.current,
        timedOut,
        timerEnabledRef.current
      );
    },
    [onFinish]
  );

  // Elapsed & countdown interval
  useEffect(() => {
    const id = window.setInterval(() => {
      if (submittedRef.current) return;
      if (timerEnabled && timerPaused) return;

      setElapsedSeconds((prev) => prev + 1);

      if (timerEnabled) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            window.clearInterval(id);
            triggerFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerEnabled, timerPaused, triggerFinish]);

  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  const blankCount = questions.length - answeredCount;
  const isInstantRevealed =
    config.instantFeedback && selectedOption !== undefined;

  const handleSelectOption = useCallback(
    (optionIdx: number) => {
      if (isInstantRevealed) return;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionIdx,
      }));
    },
    [currentQuestion.id, isInstantRevealed]
  );

  const handleClearOption = () => {
    if (isInstantRevealed) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const toggleFlag = () => {
    setFlaggedIds((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Keyboard navigation: 1-5 / A-E and Left/Right arrows
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        handleSelectOption(Number(e.key) - 1);
      } else if (['a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'].includes(e.key)) {
        const idx = e.key.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < 5) handleSelectOption(idx);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [questions.length, handleSelectOption]);

  const timerProgressPct =
    config.totalDurationSeconds > 0
      ? Math.round((remainingSeconds / config.totalDurationSeconds) * 100)
      : 0;
  const isLowTime = timerEnabled && remainingSeconds <= 120;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat'} ·{' '}
            {DIFFICULTY_LABELS[config.difficulty]} · {questions.length} Soru
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            {topic.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!confirmExitOpen ? (
            <button
              type="button"
              onClick={() => setConfirmExitOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Konulara Dön
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-700">Testten çıkılsın mı?</span>
              <button
                type="button"
                onClick={onExit}
                className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Çık
              </button>
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Question Stage */}
        <section
          aria-label="Soru Alanı"
          className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                Soru {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(questions.length).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span>Seviye: {DIFFICULTY_LABELS[currentQuestion.difficulty]}</span>
            </div>

            <button
              type="button"
              onClick={toggleFlag}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                flaggedIds[currentQuestion.id]
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {flaggedIds[currentQuestion.id] ? 'İşaretlendi' : 'Sonra Bak'}
            </button>
          </div>

          <div className="py-6">
            <p className="text-base sm:text-[17px] leading-[1.75] text-slate-900 max-w-[68ch] font-medium">
              {currentQuestion.stem}
            </p>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label="Cevap Seçenekleri">
            {currentQuestion.options.map((optionText, idx) => {
              const letter = OPTION_LETTERS[idx];
              const isSelected = selectedOption === idx;
              const isCorrectOption = currentQuestion.correctIndex === idx;

              let containerStyle =
                'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
              let letterStyle =
                'bg-slate-100 text-slate-700 border-slate-200';
              let stateLabel: string | null = null;

              if (isInstantRevealed) {
                if (isCorrectOption) {
                  containerStyle =
                    'bg-emerald-50 border-emerald-500 text-emerald-950';
                  letterStyle =
                    'bg-emerald-700 text-white border-emerald-700';
                  stateLabel = isSelected ? 'Doğru Seçim' : 'Doğru Cevap';
                } else if (isSelected && !isCorrectOption) {
                  containerStyle = 'bg-red-50 border-red-400 text-red-950';
                  letterStyle = 'bg-red-700 text-white border-red-700';
                  stateLabel = 'Yanlış Seçim';
                }
              } else if (isSelected) {
                containerStyle = 'bg-[#EEF4FA] border-[#4A6FA5] text-slate-900';
                letterStyle = 'bg-[#2C4A70] text-white border-[#2C4A70]';
                stateLabel = 'Seçiminiz';
              }

              return (
                <button
                  key={letter}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isInstantRevealed}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl border text-left transition-colors flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${containerStyle}`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-md border text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5 ${letterStyle}`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-[15px] leading-relaxed pt-0.5">
                      {optionText}
                    </span>
                  </div>

                  {stateLabel && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 pt-1">
                      {isInstantRevealed && isCorrectOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      )}
                      {isInstantRevealed && isSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 text-red-700" />
                      )}
                      {stateLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isInstantRevealed && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <p className="text-xs font-semibold text-slate-900">
                Çözüm Açıklaması (Doğru Cevap: {OPTION_LETTERS[currentQuestion.correctIndex]})
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Mandatory attribution directly under every question */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Kaynak: edebiyatdersi.com</span>
            <span>Hazırlayan: Mustafa Şahin</span>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Önceki
              </button>

              {selectedOption !== undefined && !isInstantRevealed && (
                <button
                  type="button"
                  onClick={handleClearOption}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Eraser className="w-4 h-4" />
                  Temizle
                </button>
              )}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-[#2C4A70] rounded-lg hover:bg-[#223B5B] transition-colors"
              >
                Sonraki Soru
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (blankCount === 0) {
                    triggerFinish(false);
                  } else {
                    setConfirmFinishOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Testi Bitir
              </button>
            )}
          </div>
        </section>

        {/* Right Zone: Timer & Optical Form */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Timer Card */}
          <div className="bg-[#F2F6FA] border border-[#DCE5EF] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-4 h-4 ${
                    isLowTime ? 'text-red-600' : 'text-slate-600'
                  }`}
                />
                <span className="text-sm font-semibold text-slate-900">
                  {timerEnabled ? 'Kalan Süre' : 'Süresiz Mod'}
                </span>
              </div>
              {isLowTime && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Son 2 Dakika
                </span>
              )}
            </div>

            {timerEnabled ? (
              <>
                <div className="flex items-baseline justify-between">
                  <p
                    className={`font-mono text-3xl font-bold tabular-nums ${
                      isLowTime ? 'text-red-700' : 'text-slate-900'
                    }`}
                  >
                    {formatDuration(remainingSeconds)}
                  </p>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Toplam {formatDuration(config.totalDurationSeconds)}
                  </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLowTime ? 'bg-red-600' : 'bg-blue-800'
                    }`}
                    style={{ width: `${timerProgressPct}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTimerPaused((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {timerPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Devam Et
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Duraklat
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerEnabled(false);
                      setTimerPaused(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Zamanlayıcıyı Devre Dışı Bırak
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {formatDuration(elapsedSeconds)}
                  </p>
                  <span className="text-xs text-slate-500">Geçen Süre</span>
                </div>
                <p className="text-xs text-slate-500">
                  Zamanlayıcı kapalı. Testi dilediğiniz zaman tamamlayabilirsiniz.
                </p>
                {remainingSeconds > 0 && (
                  <button
                    type="button"
                    onClick={() => setTimerEnabled(true)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Zamanlayıcıyı Tekrar Aç ({formatDuration(remainingSeconds)})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Optical Answer Sheet */}
          <div className="bg-[#F5F7F9] border border-[#E2E7ED] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Optik Cevap Formu
              </h2>
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                {answeredCount}/{questions.length} İşaretli
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedIds[q.id];

                let cellClass =
                  'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
                if (isCurrent) {
                  cellClass =
                    'bg-[#2C4A70] text-white border-[#2C4A70]';
                } else if (ans !== undefined) {
                  cellClass =
                    'bg-[#E6EEF6] text-[#1E3A5F] border-[#B6CBE2] font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Soru ${idx + 1}${ans !== undefined ? `, işaretli ${OPTION_LETTERS[ans]}` : ', boş'}`}
                    className={`relative h-10 rounded-lg border text-xs font-mono tabular-nums transition-colors flex items-center justify-center ${cellClass}`}
                  >
                    <span>
                      {idx + 1}
                      {ans !== undefined ? `·${OPTION_LETTERS[ans]}` : ''}
                    </span>
                    {isFlagged && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between tabular-nums">
              <span>İşaretli: {answeredCount}</span>
              <span>Boş: {blankCount}</span>
            </div>

            {!confirmFinishOpen ? (
              <button
                type="button"
                onClick={() => {
                  if (blankCount === 0) {
                    triggerFinish(false);
                  } else {
                    setConfirmFinishOpen(true);
                  }
                }}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                Testi Bitir ve Değerlendir
              </button>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                  Henüz yanıtlanmamış{' '}
                  <strong className="font-semibold tabular-nums">{blankCount}</strong>{' '}
                  sorunuz var. Testi yine de bitirmek istiyor musunuz?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerFinish(false)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                  >
                    Evet, Bitir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmFinishOpen(false)}
                    className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                  >
                    Sorulara Dön
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};
