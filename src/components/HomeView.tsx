import React from 'react';
import {
  AlignLeft,
  ArrowRight,
  Award,
  BookOpen,
  BookOpenText,
  Drama,
  Feather,
  MessageSquareQuote,
  Puzzle,
  ScrollText,
  SpellCheck,
  User,
} from 'lucide-react';
import type { TestAttemptRecord, Topic, UserProfile } from '../types/quiz';
import { computeOverallStats } from '../utils/storage';
import { evaluateBadges } from '../utils/badges';
import { MseEmblem } from './MseEmblem';

interface HomeViewProps {
  topics: Topic[];
  profile: UserProfile;
  attempts: TestAttemptRecord[];
  onSelectExam: (exam: 'TYT' | 'AYT') => void;
  onOpenProfile: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  topics,
  profile,
  attempts,
  onSelectExam,
  onOpenProfile,
}) => {
  const stats = computeOverallStats(topics, attempts);
  const badges = evaluateBadges(topics, attempts);
  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  const tytTopics = topics.filter((t) => t.exam === 'TYT');
  const aytTopics = topics.filter((t) => t.exam === 'AYT');
  const tytTopicCount = tytTopics.length;
  const aytTopicCount = aytTopics.length;
  const tytQuestionCount = tytTopics.reduce((sum, t) => sum + t.questions.length, 0);
  const aytQuestionCount = aytTopics.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Sade Başlık, Amblem, Hazırlayan ve Kaynak */}
      <section className="bg-gradient-to-r from-[#F4EEF9] via-[#F7F2F7] to-[#FCF3EB] border border-[#E4D8EC] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <MseEmblem className="w-20 h-20" />

        <div className="space-y-1.5 min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#462963] leading-tight">
            Mustafa Şahin Edebiyat
          </h1>
          <p className="text-base sm:text-lg font-semibold text-[#C2591D]">
            (Edebiyat ve Türkçe)
          </p>
          <p className="text-xs sm:text-sm text-slate-600 pt-1">
            Hazırlayan: <span className="font-medium text-[#462963]">Mustafa Şahin</span>
            <span className="mx-2 text-slate-400" aria-hidden="true">·</span>
            Kaynak: <span className="font-medium text-[#B8571E]">edebiyatdersi.com</span>
          </p>
        </div>
      </section>

      {/* 2. Bir Konu Seç: Mor TYT & Turuncu AYT */}
      <section aria-labelledby="konu-sec-heading" className="space-y-4">
        <h2
          id="konu-sec-heading"
          className="font-display text-xl font-bold text-slate-900"
        >
          Bir Konu Seç
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Mor TYT Kutusu */}
          <button
            type="button"
            onClick={() => onSelectExam('TYT')}
            className="group relative overflow-hidden text-left rounded-2xl p-6 bg-[#EDE3F7] hover:bg-[#E4D5F3] border border-[#CFBBE7] transition-colors flex flex-col justify-between gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3A7A]"
          >
            {/* Belirgin dekoratif arka plan motifi */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              className="pointer-events-none absolute -right-3 -top-3 w-32 h-32 text-[#462963] opacity-[0.14] transition-transform duration-300 group-hover:scale-105"
              fill="none"
            >
              <path
                d="M22 30c14-6 28-4 38 4 10-8 24-10 38-4v56c-14-6-28-4-38 4-10-8-24-10-38-4V30z"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path d="M60 34v56" stroke="currentColor" strokeWidth="4" />
              <path
                d="M32 48h16M32 60h14M72 48h16M72 60h14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative space-y-4">
              <div>
                <p className="text-xs font-mono font-semibold text-[#6A488C]">
                  {tytTopicCount} Konu · {tytQuestionCount} Soru · %{stats.tytPercentage} İlerleme
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#3F235C] mt-1">
                  TYT Türkçe
                </h3>
              </div>

              {/* Başlık altı belirgin ve yüksek kontrastlı simgeler */}
              <div className="grid grid-cols-4 gap-2.5 py-1" aria-hidden="true">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#4B2E6B] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5">
                    <MessageSquareQuote className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#3F235C] leading-tight">
                    Anlam
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#4B2E6B] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-50 group-hover:-translate-y-0.5">
                    <AlignLeft className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#3F235C] leading-tight">
                    Paragraf
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#4B2E6B] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-75 group-hover:-translate-y-0.5">
                    <SpellCheck className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#3F235C] leading-tight">
                    Yazım
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#4B2E6B] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-100 group-hover:-translate-y-0.5">
                    <Puzzle className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#3F235C] leading-tight">
                    Dil Bilgisi
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#4F366A] leading-relaxed">
                Anlam bilgisi, paragraf, ses, yazım, noktalama ve dil bilgisi testleri.
              </p>
            </div>

            <div className="relative flex items-center justify-between pt-3 border-t border-[#462963]/12 text-sm font-semibold text-[#462963]">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                TYT Konularını Aç
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Turuncu AYT Kutusu */}
          <button
            type="button"
            onClick={() => onSelectExam('AYT')}
            className="group relative overflow-hidden text-left rounded-2xl p-6 bg-[#FCEBD9] hover:bg-[#F8DFC6] border border-[#ECC49D] transition-colors flex flex-col justify-between gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2591D]"
          >
            {/* Belirgin dekoratif arka plan motifi */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              className="pointer-events-none absolute -right-3 -top-3 w-32 h-32 text-[#8C3D12] opacity-[0.14] transition-transform duration-300 group-hover:scale-105"
              fill="none"
            >
              <path
                d="M88 22c-22 4-42 22-50 48l-8 26 26-8c26-8 44-28 48-50-5-5-11-11-16-16z"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path
                d="M30 96L76 50"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative space-y-4">
              <div>
                <p className="text-xs font-mono font-semibold text-[#9E4918]">
                  {aytTopicCount} Konu · {aytQuestionCount} Soru · %{stats.aytPercentage} İlerleme
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#7A350E] mt-1">
                  AYT Edebiyat
                </h3>
              </div>

              {/* Başlık altı belirgin ve yüksek kontrastlı simgeler */}
              <div className="grid grid-cols-4 gap-2.5 py-1" aria-hidden="true">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#C2591D] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Feather className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#7A350E] leading-tight">
                    Şiir
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#C2591D] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-50 group-hover:-translate-y-0.5">
                    <ScrollText className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#7A350E] leading-tight">
                    Halk &amp; Divan
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#C2591D] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-75 group-hover:-translate-y-0.5">
                    <BookOpenText className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#7A350E] leading-tight">
                    Dönemler
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[#C2591D] text-white shadow-sm ring-2 ring-white/80 flex items-center justify-center transition-transform duration-200 delay-100 group-hover:-translate-y-0.5">
                    <Drama className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <span className="text-xs font-bold text-[#7A350E] leading-tight">
                    Akımlar
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#6E3B1D] leading-relaxed">
                Şiir bilgisi, halk, divan, tanzimat, servetifünun, millî, cumhuriyet ve edebi akımlar.
              </p>
            </div>

            <div className="relative flex items-center justify-between pt-3 border-t border-[#7A350E]/12 text-sm font-semibold text-[#8C3D12]">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                AYT Konularını Aç
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </section>

      {/* 3. Kısa Profil Özeti */}
      <section
        aria-label="Kısa Profil Özeti"
        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4EEF9] border border-[#E2D4EF] flex items-center justify-center text-[#4B2E6B] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {profile.fullName}
              </p>
              <p className="text-xs text-slate-500">
                {profile.targetGoal}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B2E6B] hover:text-[#351D4F] underline underline-offset-4 whitespace-nowrap self-start sm:self-auto"
          >
            Profili ve Rozetleri Gör
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs text-slate-500">Çözülen Soru</p>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {stats.totalQuestionsSolved}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Doğru / Yanlış</p>
            <p className="font-mono text-lg font-bold tabular-nums mt-0.5">
              <span className="text-emerald-700">{stats.totalCorrect}D</span>
              <span className="text-slate-300 mx-1">/</span>
              <span className="text-rose-700">{stats.totalWrong}Y</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ortalama Net</p>
            <p className="font-mono text-lg font-bold text-[#B8571E] tabular-nums mt-0.5">
              {stats.averageNet}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Çözülen Test</p>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {stats.totalTestsSolved}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Genel İlerleme</p>
            <p className="font-mono text-lg font-bold text-[#462963] tabular-nums mt-0.5">
              %{stats.overallPercentage}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Rozetler</p>
            <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5 inline-flex items-center gap-1.5 justify-center sm:justify-start">
              <Award className="w-4 h-4 text-[#C2591D]" />
              {earnedBadgesCount}/{badges.length}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
