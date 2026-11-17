import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type {
  DifficultyLevel,
  DifficultySelection,
  TestAttemptRecord,
  Topic,
} from '../types/quiz';
import { DIFFICULTY_LABELS } from '../types/quiz';
import { DIFFICULTY_LEVELS } from '../data/topics';
import { getTopicProgress } from '../utils/storage';
import type { CatalogFilter } from './Header';

interface TopicCatalogProps {
  topics: Topic[];
  filter: CatalogFilter;
  attempts: TestAttemptRecord[];
  onFilterChange: (filter: CatalogFilter) => void;
  onSelectTopicTest: (topic: Topic, initialDifficulty?: DifficultySelection) => void;
  onBackHome: () => void;
}

interface TopicCardTheme {
  card: string;
  title: string;
  meta: string;
  action: string;
}

const COLORFUL_TOPIC_THEMES: TopicCardTheme[] = [
  {
    card: 'bg-[#EDE3F7] border-[#CFBBE7] hover:bg-[#E4D6F3]',
    title: 'text-[#3F235C]',
    meta: 'text-[#6A488C]',
    action: 'text-[#4B2E6B] hover:text-[#331B4D]',
  },
  {
    card: 'bg-[#FCEBD9] border-[#ECC49D] hover:bg-[#F9E0C8]',
    title: 'text-[#73320D]',
    meta: 'text-[#9A491B]',
    action: 'text-[#8F3E10] hover:text-[#662A08]',
  },
  {
    card: 'bg-[#DFEEF9] border-[#B2D0EA] hover:bg-[#D2E6F5]',
    title: 'text-[#1B3F63]',
    meta: 'text-[#36608A]',
    action: 'text-[#1E4A75] hover:text-[#123252]',
  },
  {
    card: 'bg-[#DFF1E6] border-[#AED7BE] hover:bg-[#D2EAD9]',
    title: 'text-[#184B32]',
    meta: 'text-[#2D6E4D]',
    action: 'text-[#1E5C3D] hover:text-[#113D27]',
  },
  {
    card: 'bg-[#FADEE3] border-[#E7B6C0] hover:bg-[#F5D1D8]',
    title: 'text-[#662030]',
    meta: 'text-[#8E394C]',
    action: 'text-[#7A2639] hover:text-[#571725]',
  },
  {
    card: 'bg-[#FBF0D4] border-[#E9CE93] hover:bg-[#F7E7BD]',
    title: 'text-[#5C400B]',
    meta: 'text-[#855F16]',
    action: 'text-[#6E4D0E] hover:text-[#4D3407]',
  },
  {
    card: 'bg-[#DCF1F2] border-[#ABD7D9] hover:bg-[#CFEAEB]',
    title: 'text-[#154A4E]',
    meta: 'text-[#2B6D72]',
    action: 'text-[#195B60] hover:text-[#0E3D41]',
  },
  {
    card: 'bg-[#E2E6FA] border-[#B7C0EE] hover:bg-[#D6DCF7]',
    title: 'text-[#252E6B]',
    meta: 'text-[#435094]',
    action: 'text-[#2D3982] hover:text-[#1C2559]',
  },
  {
    card: 'bg-[#FBE3DB] border-[#EAB8A7] hover:bg-[#F7D7CC]',
    title: 'text-[#6E2D1A]',
    meta: 'text-[#96452E]',
    action: 'text-[#823620] hover:text-[#592112]',
  },
  {
    card: 'bg-[#EAF1DA] border-[#C3D49E] hover:bg-[#E0EACA]',
    title: 'text-[#394A16]',
    meta: 'text-[#566D26]',
    action: 'text-[#455A1B] hover:text-[#2D3C0F]',
  },
  {
    card: 'bg-[#F6E1EE] border-[#DFB5CE] hover:bg-[#F0D5E6]',
    title: 'text-[#5C2248]',
    meta: 'text-[#853B6B]',
    action: 'text-[#6E2956] hover:text-[#4B193A]',
  },
  {
    card: 'bg-[#ECE7F4] border-[#C9BFE0] hover:bg-[#E2DCF0]',
    title: 'text-[#392E5C]',
    meta: 'text-[#5B4D87]',
    action: 'text-[#463970] hover:text-[#2D234D]',
  },
];

export const TopicCatalog: React.FC<TopicCatalogProps> = ({
  topics,
  filter,
  attempts,
  onFilterChange,
  onSelectTopicTest,
  onBackHome,
}) => {
  const visibleTopics =
    filter === 'ALL' ? topics : topics.filter((t) => t.exam === filter);

  const tytCount = topics.filter((t) => t.exam === 'TYT').length;
  const aytCount = topics.filter((t) => t.exam === 'AYT').length;

  const pageHeading =
    filter === 'TYT'
      ? 'TYT Türkçe Konuları'
      : filter === 'AYT'
        ? 'AYT Edebiyat Konuları'
        : 'Tüm Test Konuları';

  const headingColor =
    filter === 'TYT'
      ? 'text-[#462963]'
      : filter === 'AYT'
        ? 'text-[#A84814]'
        : 'text-slate-900';

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Ana Sayfaya Dön
          </button>
          <h1 className={`font-display text-2xl sm:text-3xl font-bold ${headingColor}`}>
            {pageHeading}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Çözmek istediğiniz konuyu veya zorluk seviyesini seçin.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Ders filtresi"
          className="inline-flex items-center gap-1 p-1 bg-[#EAECEF] rounded-lg self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'TYT'}
            onClick={() => onFilterChange('TYT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filter === 'TYT'
                ? 'bg-[#4B2E6B] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            TYT Türkçe ({tytCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'AYT'}
            onClick={() => onFilterChange('AYT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filter === 'AYT'
                ? 'bg-[#C2591D] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            AYT Edebiyat ({aytCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'ALL'}
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Tümü ({topics.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleTopics.map((topic, index) => {
          const progress = getTopicProgress(topic.id, attempts);
          const examLabel = topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat';
          const themeIndex =
            filter === 'ALL'
              ? index % COLORFUL_TOPIC_THEMES.length
              : (topic.order - 1) % COLORFUL_TOPIC_THEMES.length;
          const theme = COLORFUL_TOPIC_THEMES[themeIndex];

          return (
            <article
              key={topic.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors ${theme.card}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-medium ${theme.meta}`}>
                    {String(topic.order).padStart(2, '0')} · {examLabel}
                  </span>
                  <span
                    className={`font-mono tabular-nums ${
                      progress.completedCount === progress.totalLevels
                        ? 'text-emerald-900 font-bold'
                        : theme.meta
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
                  <h2 className={`font-display text-lg font-bold transition-opacity group-hover:opacity-80 ${theme.title}`}>
                    {topic.title}
                  </h2>
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
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
                            ? 'font-bold text-emerald-900'
                            : 'font-medium text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-500 shrink-0" />
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
                  className={`inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap shrink-0 ${theme.action}`}
                >
                  Başla
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};
