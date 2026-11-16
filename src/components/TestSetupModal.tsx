import React, { useState } from 'react';
import { Clock, Play, X } from 'lucide-react';
import type {
  ActiveQuizConfig,
  DifficultySelection,
  Topic,
} from '../types/quiz';
import { DIFFICULTY_LABELS } from '../types/quiz';
import {
  QUESTION_COUNT_OPTIONS,
  getRecommendedDurationSeconds,
} from '../data/topics';
import { formatDuration } from '../utils/storage';

interface TestSetupModalProps {
  topic: Topic;
  initialDifficulty?: DifficultySelection;
  onClose: () => void;
  onStart: (config: ActiveQuizConfig) => void;
}

const DIFFICULTIES: DifficultySelection[] = ['kolay', 'orta', 'zor', 'karma'];

export const TestSetupModal: React.FC<TestSetupModalProps> = ({
  topic,
  initialDifficulty = 'orta',
  onClose,
  onStart,
}) => {
  const [difficulty, setDifficulty] =
    useState<DifficultySelection>(initialDifficulty);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(false);

  const recommendedSeconds = getRecommendedDurationSeconds(questionCount);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      topicId: topic.id,
      difficulty,
      questionCount,
      timerEnabled,
      totalDurationSeconds: recommendedSeconds,
      instantFeedback,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
    >
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat'} · Test Ayarları
            </p>
            <h2
              id="setup-modal-title"
              className="mt-1 font-display text-xl font-bold text-slate-900"
            >
              {topic.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStart} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Zorluk Seviyesi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((level) => {
                const active = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#2C4A70] text-white border-[#2C4A70]'
                        : 'bg-[#F4F6F9] text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {level === 'karma' ? 'Karma' : DIFFICULTY_LABELS[level]}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Her konuda Kolay, Orta ve Zor seviyelerinde 10’ar özgün soru havuzu bulunur.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Soru Sayısı
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNT_OPTIONS.map((count) => {
                const active = questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors tabular-nums whitespace-nowrap ${
                      active
                        ? 'bg-[#2C4A70] text-white border-[#2C4A70]'
                        : 'bg-[#F4F6F9] text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {count} Soru
                  </button>
                );
              })}
            </div>
            {questionCount > 10 && difficulty !== 'karma' && (
              <p className="mt-2 text-xs text-amber-700">
                Seçtiğiniz zorluk seviyesindeki 10 soruya ek olarak aynı konunun yakın seviyelerinden soru eklenecektir.
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Zamanlayıcı ({formatDuration(recommendedSeconds)})
                  </p>
                  <p className="text-xs text-slate-500">
                    10 soru için 15 dakika kuralına göre otomatik hesaplanır.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={timerEnabled}
                onClick={() => setTimerEnabled((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  timerEnabled
                    ? 'bg-[#2C4A70] text-white border-[#2C4A70]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {timerEnabled ? 'Açık' : 'Devre Dışı'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Anında Çözüm Gösterimi
                </p>
                <p className="text-xs text-slate-500">
                  İşaretlediğiniz sorunun doğru cevabını ve açıklamasını hemen görün.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={instantFeedback}
                onClick={() => setInstantFeedback((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  instantFeedback
                    ? 'bg-[#2C4A70] text-white border-[#2C4A70]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {instantFeedback ? 'Açık' : 'Sınav Modu'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2C4A70] rounded-lg hover:bg-[#223B5B] transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              Testi Başlat ({questionCount} Soru)
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Kaynak: edebiyatdersi.com</span>
            <span>Hazırlayan: Mustafa Şahin</span>
          </div>
        </form>
      </div>
    </div>
  );
};
