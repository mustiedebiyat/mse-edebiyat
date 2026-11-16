import React from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type {
  DifficultyLevel,
  DifficultySelection,
  TestAttemptRecord,
  Topic,
} from '../types/quiz';
import { DIFFICULTY_LABELS } from '../types/quiz';
import { DIFFICULTY_LEVELS } from '../data/topics';
import {
  computeOverallStats,
  getTopicProgress,
} from '../utils/storage';
import type { CatalogFilter } from './Header';
import { MseEmblem } from './MseEmblem';

interface TopicCatalogProps {
  topics: Topic[];
  filter: CatalogFilter;
  attempts: TestAttemptRecord[];
  onFilterChange: (filter: CatalogFilter) => void;
  onSelectTopicTest: (topic: Topic, initialDifficulty?: DifficultySelection) => void;
  onOpenProfile: () => void;
}

const CALM_CARD_THEMES = [
  'bg-[#F2F6FA] border-[#DCE6F0] hover:bg-[#EAF1F8]',
  'bg-[#F2F7F4] border-[#DCE8E0] hover:bg-[#EAF2ED]',
  'bg-[#F8F5EF] border-[#EAE2D6] hover:bg-[#F3EEE5]',
  'bg-[#F4F3F9] border-[#E1DFEE] hover:bg-[#ECEAF5]',
  'bg-[#F0F7F7] border-[#D8E8E8] hover:bg-[#E7F2F2]',
  'bg-[#FAF4F3] border-[#ECE0DE] hover:bg-[#F5ECEA]',
];

export const TopicCatalog: React.FC<TopicCatalogProps> = ({
  topics,
  filter,
  attempts,
  onFilterChange,
  onSelectTopicTest,
  onOpenProfile,
}) => {
  const stats = computeOverallStats(topics, attempts);

  const visibleTopics =
    filter === 'ALL' ? topics : topics.filter((t) => t.exam === filter);

  const tytCount = topics.filter((t) => t.exam === 'TYT').length;
  const aytCount = topics.filter((t) => t.exam === 'AYT').length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Minimalist Hero + Quiet Progress Strip */}
      <section className="flex flex-col md:flex-row md:items-stretch justify-between gap-5 pb-6 border-b border-slate-200/80">
        <div className="flex-1 bg-gradient-to-r from-[#F4EEF9] via-[#F7F2F7] to-[#FCF3EB] border border-[#E4D8EC] rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
          <MseEmblem />

          <div className="space-y-1 min-w-0">
            <p className="text-xs font-mono tracking-wide">
              <span className="font-semibold text-[#C2591D]">MSE</span>
              <span className="text-[#785996]"> · Hazırlayan: Mustafa Şahin</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#462963] leading-tight">
              Mustafa Şahin Edebiyat
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#C2591D]">
              (Edebiyat ve Türkçe)
            </p>
            <p className="text-xs sm:text-sm text-slate-600 pt-1">
              Bir konu seçin; kolay, orta veya zor seviyede testinizi hemen başlatın.
            </p>
          </div>
        </div>

        <div className="bg-[#EEF3F8] border border-[#DAE4EE] rounded-2xl px-5 py-4 md:w-[310px] shrink-0 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-600">
              Genel İlerleme
            </span>
            <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
              %{stats.overallPercentage}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1 tabular-nums">
                <span>TYT</span>
                <span>%{stats.tytPercentage}</span>
              </div>
              <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B6491] rounded-full transition-all duration-300"
                  style={{ width: `${stats.tytPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-600 mb-1 tabular-nums">
                <span>AYT</span>
                <span>%{stats.aytPercentage}</span>
              </div>
              <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A7C68] rounded-full transition-all duration-300"
                  style={{ width: `${stats.aytPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 tabular-nums">
              {stats.totalTestsSolved} test · {stats.totalQuestionsSolved} soru
            </span>
            <button
              type="button"
              onClick={onOpenProfile}
              className="font-semibold text-[#2C4A70] hover:text-[#1D3554] underline underline-offset-4 whitespace-nowrap"
            >
              Profilim
            </button>
          </div>
        </div>
      </section>

      {/* Filter Bar + Clean Colored Topic Boxes */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Konular
          </h2>

          <div
            role="tablist"
            aria-label="Ders filtresi"
            className="inline-flex items-center gap-1 p-1 bg-[#EDEFF3] rounded-lg self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'ALL'}
              onClick={() => onFilterChange('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({topics.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'TYT'}
              onClick={() => onFilterChange('TYT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter === 'TYT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TYT Türkçe ({tytCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'AYT'}
              onClick={() => onFilterChange('AYT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter === 'AYT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AYT Edebiyat ({aytCount})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTopics.map((topic, index) => {
            const progress = getTopicProgress(topic.id, attempts);
            const examLabel = topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat';
            const cardTheme = CALM_CARD_THEMES[index % CALM_CARD_THEMES.length];

            return (
              <article
                key={topic.id}
                className={`border rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors ${cardTheme}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {String(topic.order).padStart(2, '0')} · {examLabel}
                    </span>
                    <span
                      className={`font-mono tabular-nums ${
                        progress.completedCount === progress.totalLevels
                          ? 'text-emerald-800 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {progress.completedCount}/{progress.totalLevels}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTopicTest(topic, 'orta')}
                    className="text-left block w-full group focus-visible:outline-none"
                  >
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#2C4A70] transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {topic.description}
                    </p>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-900/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {DIFFICULTY_LEVELS.map((level: DifficultyLevel) => {
                      const done = progress.completedLevels[level];
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => onSelectTopicTest(topic, level)}
                          className={`inline-flex items-center gap-1 text-xs transition-colors whitespace-nowrap ${
                            done
                              ? 'font-semibold text-emerald-800 hover:text-emerald-950'
                              : 'font-medium text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                          {DIFFICULTY_LABELS[level]}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTopicTest(topic, 'orta')}
                    aria-label={`${topic.title} testini başlat`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2C4A70] hover:text-[#1D3554] whitespace-nowrap shrink-0"
                  >
                    Başla
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};
