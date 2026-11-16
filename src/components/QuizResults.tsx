import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MinusCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  ActiveQuizConfig,
  DifficultyLevel,
  EvaluatedBadge,
  Question,
  TestAttemptRecord,
  Topic,
  WrongQuestionRecord,
} from '../types/quiz';
import { DIFFICULTY_LABELS, OPTION_LETTERS } from '../types/quiz';
import { DIFFICULTY_LEVELS, findQuestionById } from '../data/topics';
import { formatDuration } from '../utils/storage';

type AnalysisTab = 'current-wrong' | 'history-wrong' | 'all-questions';
type HistoryScope = 'all' | 'topic';

interface QuizResultsProps {
  topic: Topic;
  config: ActiveQuizConfig;
  questions: Question[];
  answers: Record<string, number>;
  record: TestAttemptRecord;
  newlyUnlockedBadges: EvaluatedBadge[];
  wrongQuestionsHistory: WrongQuestionRecord[];
  onRemoveWrongQuestion: (questionId: string) => void;
  onRetrySame: () => void;
  onSwitchDifficulty: (level: DifficultyLevel) => void;
  onBackToCatalog: () => void;
  onOpenProfile: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  topic,
  config,
  questions,
  answers,
  record,
  newlyUnlockedBadges,
  wrongQuestionsHistory,
  onRemoveWrongQuestion,
  onRetrySame,
  onSwitchDifficulty,
  onBackToCatalog,
  onOpenProfile,
}) => {
  const currentWrongAndBlank = useMemo(
    () =>
      questions
        .map((q, index) => ({
          q,
          index,
          userAns: answers[q.id],
        }))
        .filter((item) => item.userAns !== item.q.correctIndex),
    [questions, answers]
  );

  const historyItems = useMemo(() => {
    return wrongQuestionsHistory
      .map((item) => {
        const resolved = findQuestionById(item.questionId);
        if (!resolved) return null;
        return {
          record: item,
          topic: resolved.topic,
          question: resolved.question,
        };
      })
      .filter(
        (
          entry
        ): entry is {
          record: WrongQuestionRecord;
          topic: Topic;
          question: Question;
        } => entry !== null
      );
  }, [wrongQuestionsHistory]);

  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>(() =>
    currentWrongAndBlank.length > 0
      ? 'current-wrong'
      : historyItems.length > 0
        ? 'history-wrong'
        : 'all-questions'
  );
  const [historyScope, setHistoryScope] = useState<HistoryScope>('all');

  const filteredHistoryItems = useMemo(
    () =>
      historyScope === 'topic'
        ? historyItems.filter((item) => item.topic.id === topic.id)
        : historyItems,
    [historyItems, historyScope, topic.id]
  );

  const accuracyPct =
    record.questionCount > 0
      ? Math.round((record.correctCount / record.questionCount) * 100)
      : 0;

  const renderQuestionCard = (
    q: Question,
    userAns: number | undefined,
    metaLeft: string,
    options?: {
      wrongRecord?: WrongQuestionRecord;
      allowRemove?: boolean;
    }
  ) => {
    const isBlank = userAns === undefined;
    const isCorrect = userAns === q.correctIndex;

    return (
      <article
        key={options?.wrongRecord ? `hist-${q.id}` : q.id}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
            {metaLeft}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {options?.wrongRecord && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {options.wrongRecord.wrongCount} kez yanlış yapıldı
              </span>
            )}

            {isCorrect ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Doğru
              </span>
            ) : isBlank ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <MinusCircle className="w-4 h-4" />
                Boş Bırakıldı
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <XCircle className="w-4 h-4" />
                Yanlış
              </span>
            )}
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-slate-900 font-medium max-w-[70ch]">
          {q.stem}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, oIdx) => {
            const letter = OPTION_LETTERS[oIdx];
            const isCorrectOpt = oIdx === q.correctIndex;
            const isUserOpt = oIdx === userAns;

            let rowClass = 'bg-white border-slate-200 text-slate-700';
            if (isCorrectOpt) {
              rowClass =
                'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
            } else if (isUserOpt && !isCorrectOpt) {
              rowClass = 'bg-red-50 border-red-300 text-red-950';
            }

            return (
              <div
                key={letter}
                className={`px-3.5 py-2.5 rounded-lg border text-sm flex items-start justify-between gap-3 ${rowClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-semibold text-xs pt-0.5">
                    {letter})
                  </span>
                  <span>{opt}</span>
                </div>
                {isCorrectOpt && (
                  <span className="text-xs font-semibold text-emerald-800 shrink-0">
                    Doğru Cevap
                  </span>
                )}
                {isUserOpt && !isCorrectOpt && (
                  <span className="text-xs font-semibold text-red-800 shrink-0">
                    Sizin Seçiminiz
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Çözüm: </span>
          {q.explanation}
        </div>

        {options?.allowRemove && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onRemoveWrongQuestion(q.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Öğrendim, Listeden Kaldır
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Kaynak: edebiyatdersi.com</span>
          <span>Hazırlayan: Mustafa Şahin</span>
        </div>
      </article>
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {record.timedOut && (
        <div
          role="alert"
          className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-950"
        >
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">
              Süre Doldu — Test Otomatik Tamamlandı
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Belirlenen {formatDuration(config.totalDurationSeconds)} sınav süresi sona erdiği için o ana kadar işaretlediğiniz cevaplar değerlendirildi.
            </p>
          </div>
        </div>
      )}

      {/* Result Summary Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat'} ·{' '}
              {DIFFICULTY_LABELS[config.difficulty]} · {record.questionCount} Soru
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {topic.title} — Sınav Sonucu
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shrink-0">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-mono tabular-nums">
              Süre: {formatDuration(record.elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-[#EFF4F9] border border-[#D8E3EE] rounded-xl">
            <p className="text-xs font-medium text-slate-600">Net (4Y=1D)</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#2C4A70] tabular-nums">
              {record.netScore}
            </p>
          </div>
          <div className="p-4 bg-[#EEF6F1] border border-[#D3E6DA] rounded-xl">
            <p className="text-xs font-medium text-emerald-800">Doğru</p>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-800 tabular-nums">
              {record.correctCount}
            </p>
          </div>
          <div className="p-4 bg-[#FAF1F1] border border-[#EBD5D5] rounded-xl">
            <p className="text-xs font-medium text-rose-800">Yanlış</p>
            <p className="mt-1 font-mono text-2xl font-bold text-rose-800 tabular-nums">
              {record.wrongCount}
            </p>
          </div>
          <div className="p-4 bg-[#F6F4EF] border border-[#E8E2D7] rounded-xl">
            <p className="text-xs font-medium text-slate-600">Boş</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-700 tabular-nums">
              {record.blankCount}
            </p>
          </div>
          <div className="p-4 bg-[#F4F2F8] border border-[#DFDBEB] rounded-xl col-span-2 sm:col-span-1">
            <p className="text-xs font-medium text-slate-600">Başarı</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              %{accuracyPct}
            </p>
          </div>
        </div>

        {/* Newly Unlocked Badges Callout */}
        {newlyUnlockedBadges.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Yeni Başarı Rozeti Kazandınız!
                </p>
                <p className="text-xs text-slate-700 mt-0.5">
                  {newlyUnlockedBadges.map((b) => b.title).join(' · ')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-3.5 py-2 text-xs font-semibold text-blue-900 bg-white border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Rozetleri Profilde Gör
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetrySame}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2C4A70] hover:bg-[#223B5B] rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Aynı Ayarlarla Tekrar Çöz
          </button>

          {DIFFICULTY_LEVELS.filter((lvl) => lvl !== config.difficulty).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSwitchDifficulty(lvl)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {DIFFICULTY_LABELS[lvl]} Seviyeye Geç
            </button>
          ))}

          <button
            type="button"
            onClick={onBackToCatalog}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors ml-auto"
          >
            Tüm Konulara Dön
          </button>
        </div>

        {/* Mandatory end-of-test attribution */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-600">
          <span>Kaynak: edebiyatdersi.com</span>
          <span>Hazırlayan: Mustafa Şahin</span>
        </div>
      </section>

      {/* Soru Analizi Paneli */}
      <section
        aria-labelledby="soru-analizi-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="w-5 h-5 text-blue-900 shrink-0 mt-1" />
            <div>
              <h2
                id="soru-analizi-heading"
                className="font-display text-xl font-bold text-slate-900"
              >
                Soru Analizi
              </h2>
              <p className="text-xs text-slate-600 mt-1 tabular-nums">
                Bu testte {record.wrongCount} yanlış, {record.blankCount} boş · Hata Defterinde toplam {historyItems.length} yanlış soru kayıtlı
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAnalysisOpen((s) => !s)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 self-start sm:self-auto whitespace-nowrap"
          >
            {analysisOpen ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Paneli Gizle
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Paneli Göster
              </>
            )}
          </button>
        </div>

        {analysisOpen && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Soru analizi sekmeleri"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={analysisTab === 'current-wrong'}
                  onClick={() => setAnalysisTab('current-wrong')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                    analysisTab === 'current-wrong'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bu Testteki Yanlış/Boş ({currentWrongAndBlank.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={analysisTab === 'history-wrong'}
                  onClick={() => setAnalysisTab('history-wrong')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                    analysisTab === 'history-wrong'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yanlış Sorular Arşivi ({historyItems.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={analysisTab === 'all-questions'}
                  onClick={() => setAnalysisTab('all-questions')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                    analysisTab === 'all-questions'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tüm Test Soruları ({questions.length})
                </button>
              </div>

              {analysisTab === 'history-wrong' && historyItems.length > 0 && (
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setHistoryScope('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      historyScope === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tüm Konular
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryScope('topic')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      historyScope === 'topic'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sadece {topic.title}
                  </button>
                </div>
              )}
            </div>

            {analysisTab === 'current-wrong' && (
              <div className="space-y-4">
                {currentWrongAndBlank.length === 0 ? (
                  <div className="p-8 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center space-y-1.5">
                    <p className="text-sm font-semibold text-emerald-900">
                      Tebrikler, bu testte yanlış veya boş bıraktığınız soru yok!
                    </p>
                    <p className="text-xs text-emerald-800">
                      Tüm soruları ve çözüm açıklamalarını görmek için &ldquo;Tüm Test Soruları&rdquo; sekmesine geçebilirsiniz.
                    </p>
                  </div>
                ) : (
                  currentWrongAndBlank.map(({ q, index, userAns }) =>
                    renderQuestionCard(
                      q,
                      userAns,
                      `Soru ${String(index + 1).padStart(2, '0')} · Seviye: ${DIFFICULTY_LABELS[q.difficulty]}`
                    )
                  )
                )}
              </div>
            )}

            {analysisTab === 'history-wrong' && (
              <div className="space-y-4">
                {filteredHistoryItems.length === 0 ? (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5">
                    <p className="text-sm font-semibold text-slate-800">
                      {historyScope === 'topic'
                        ? `${topic.title} konusunda kayıtlı yanlış soru bulunmuyor.`
                        : 'Henüz yanlış yaptığınız kayıtlı bir soru bulunmuyor.'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Testlerde yanlış yanıtladığınız sorular burada toplanır; doğrularını ve çözümlerini inceleyip öğrendiklerinizi listeden çıkarabilirsiniz.
                    </p>
                  </div>
                ) : (
                  filteredHistoryItems.map(({ record: wrongRec, topic: t, question }) =>
                    renderQuestionCard(
                      question,
                      wrongRec.lastSelectedIndex,
                      `${t.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat'} · ${t.title} · Seviye: ${DIFFICULTY_LABELS[question.difficulty]}`,
                      {
                        wrongRecord: wrongRec,
                        allowRemove: true,
                      }
                    )
                  )
                )}
              </div>
            )}

            {analysisTab === 'all-questions' && (
              <div className="space-y-4">
                {questions.map((q, index) =>
                  renderQuestionCard(
                    q,
                    answers[q.id],
                    `Soru ${String(index + 1).padStart(2, '0')} · Seviye: ${DIFFICULTY_LABELS[q.difficulty]}`
                  )
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
