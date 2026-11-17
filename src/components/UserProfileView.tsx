import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Edit3,
  Flame,
  Lock,
  Save,
  Shield,
  Star,
  Target,
  Trash2,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import type {
  BadgeDefinition,
  DifficultyLevel,
  DifficultySelection,
  TestAttemptRecord,
  Topic,
  UserProfile,
} from '../types/quiz';
import { DIFFICULTY_LABELS } from '../types/quiz';
import { DIFFICULTY_LEVELS } from '../data/topics';
import {
  computeOverallStats,
  formatDuration,
  getTopicProgress,
} from '../utils/storage';
import { evaluateBadges } from '../utils/badges';
import { NetProgressionChart } from './NetProgressionChart';

interface UserProfileViewProps {
  profile: UserProfile;
  topics: Topic[];
  attempts: TestAttemptRecord[];
  onSaveProfile: (updated: UserProfile) => void;
  onClearProgress: () => void;
  onStartTopicTest: (topic: Topic, difficulty: DifficultySelection) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  topics,
  attempts,
  onSaveProfile,
  onClearProgress,
  onStartTopicTest,
}) => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal);
  const [confirmClear, setConfirmClear] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const stats = computeOverallStats(topics, attempts);
  const badges = evaluateBadges(topics, attempts);
  const earnedBadgesCount = badges.filter((b) => b.earned).length;
  const filteredBadges = badges.filter((b) => {
    if (badgeFilter === 'earned') return b.earned;
    if (badgeFilter === 'locked') return !b.earned;
    return true;
  });

  const renderBadgeIcon = (icon: BadgeDefinition['icon'], earned: boolean) => {
    const cls = `w-5 h-5 ${earned ? 'text-blue-900' : 'text-slate-400'}`;
    switch (icon) {
      case 'award':
        return <Award className={cls} />;
      case 'book':
        return <BookOpen className={cls} />;
      case 'flame':
        return <Flame className={cls} />;
      case 'target':
        return <Target className={cls} />;
      case 'trophy':
        return <Trophy className={cls} />;
      case 'zap':
        return <Zap className={cls} />;
      case 'shield':
        return <Shield className={cls} />;
      case 'clock':
        return <Clock className={cls} />;
      case 'compass':
        return <Compass className={cls} />;
      case 'star':
        return <Star className={cls} />;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      fullName: fullName.trim() || 'Öğrenci',
      targetGoal: targetGoal.trim() || 'YKS — TYT Türkçe & AYT Edebiyat',
    });
    setEditing(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Profile & Overall Progress Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-[#F4F6FA] border border-[#DEE5EE] rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#D4DFEC] flex items-center justify-center text-[#2C4A70] shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Öğrenci Profili
                </p>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {profile.fullName}
                </h1>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setFullName(profile.fullName);
                  setTargetGoal(profile.targetGoal);
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Düzenle
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hedef Sınav / Bölüm
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  maxLength={80}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Hedef</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">
                  {profile.targetGoal}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    disabled={attempts.length === 0}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-800 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Tüm İlerlemeyi Sıfırla
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    <span className="text-xs text-red-900">
                      Tüm kayıtlar silinsin mi?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearProgress();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 rounded hover:bg-red-800"
                    >
                      Sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-[#F3F7F5] border border-[#DCE7E1] rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-600">
                Genel Tamamlanma Yüzdesi
              </p>
              <p className="font-display text-3xl font-bold text-slate-900 tabular-nums mt-1">
                %{stats.overallPercentage}
              </p>
            </div>
            <p className="text-xs font-mono text-slate-600 tabular-nums">
              {stats.completedModules} / {stats.totalModules} Zorluk Seviyesi Tamamlandı
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">TYT Türkçe</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  {stats.tytModulesCompleted}/{stats.tytModulesTotal} Seviye (%{stats.tytPercentage})
                </span>
              </div>
              <div className="h-2.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B6491] rounded-full transition-all duration-300"
                  style={{ width: `${stats.tytPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">AYT Edebiyat</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  {stats.aytModulesCompleted}/{stats.aytModulesTotal} Seviye (%{stats.aytPercentage})
                </span>
              </div>
              <div className="h-2.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A7C68] rounded-full transition-all duration-300"
                  style={{ width: `${stats.aytPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                {stats.totalTestsSolved}
              </p>
              <p className="text-xs text-slate-500">Çözülen Test</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                {stats.totalQuestionsSolved}
              </p>
              <p className="text-xs text-slate-500">Çözülen Soru</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                {stats.totalCorrect}
              </p>
              <p className="text-xs text-slate-500">Toplam Doğru</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-blue-900 tabular-nums">
                {stats.averageNet}
              </p>
              <p className="text-xs text-slate-500">Ortalama Net</p>
            </div>
          </div>
        </div>
      </section>

      {/* Net Progression Line Chart (Last 10 Tests) */}
      <NetProgressionChart attempts={attempts} />

      {/* Achievement Badges Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500 tabular-nums">
              {earnedBadgesCount} / {badges.length} Rozet Kazanıldı
            </p>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              Başarı Rozetleri
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Rozet filtresi"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={badgeFilter === 'all'}
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                badgeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({badges.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={badgeFilter === 'earned'}
              onClick={() => setBadgeFilter('earned')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                badgeFilter === 'earned'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kazanılan ({earnedBadgesCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={badgeFilter === 'locked'}
              onClick={() => setBadgeFilter('locked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                badgeFilter === 'locked'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kilitli ({badges.length - earnedBadgesCount})
            </button>
          </div>
        </div>

        {filteredBadges.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            {badgeFilter === 'earned'
              ? 'Henüz kazanılmış rozetiniz bulunmuyor. Testleri tamamlayarak rozet kazanabilirsiniz.'
              : 'Tüm başarı rozetlerini kazandınız!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                  badge.earned
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                        badge.earned
                          ? 'bg-white border-blue-200'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon, badge.earned)}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          badge.earned ? 'text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        {badge.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">{badge.criteriaText}</span>
                  {badge.earned ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kazanıldı
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      Kilitli
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Topic-by-Topic Completion Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Konu Bazlı Test İlerleme Tablosu
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Her konu için Kolay, Orta ve Zor seviyelerindeki tamamlanma durumunuz.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-6">Ders / Konu</th>
                <th className="py-3.5 px-4">Kolay</th>
                <th className="py-3.5 px-4">Orta</th>
                <th className="py-3.5 px-4">Zor</th>
                <th className="py-3.5 px-6 text-right">Konu İlerlemesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topics.map((topic) => {
                const progress = getTopicProgress(topic.id, attempts);
                return (
                  <tr key={topic.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-500">
                        {topic.exam === 'TYT' ? 'TYT Türkçe' : 'AYT Edebiyat'}
                      </p>
                      <p className="font-semibold text-slate-900">{topic.title}</p>
                    </td>

                    {DIFFICULTY_LEVELS.map((lvl: DifficultyLevel) => {
                      const done = progress.completedLevels[lvl];
                      const best = progress.bestAttemptByLevel[lvl];
                      return (
                        <td key={lvl} className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => onStartTopicTest(topic, lvl)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                              done
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="tabular-nums">
                              {done && best
                                ? `Tamamlandı (${best.netScore} Net)`
                                : 'Çöz'}
                            </span>
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-4 px-6 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      %{progress.percentage}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Test Attempts */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Son Çözülen Testler
          </h2>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Henüz tamamlanmış bir test bulunmuyor. Konular sayfasından dilediğiniz testi çözerek ilerlemenizi kaydedebilirsiniz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">Konu</th>
                  <th className="py-3 px-4">Seviye</th>
                  <th className="py-3 px-4">Doğru / Yanlış / Boş</th>
                  <th className="py-3 px-4">Net</th>
                  <th className="py-3 px-4">Süre</th>
                  <th className="py-3 px-6 text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {attempts.slice(0, 20).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <span className="text-xs text-slate-500 mr-2">
                        {att.exam}
                      </span>
                      <span className="font-medium text-slate-900">
                        {att.topicTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {DIFFICULTY_LABELS[att.difficulty]}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                      {att.correctCount}D · {att.wrongCount}Y · {att.blankCount}B
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-900 tabular-nums">
                      {att.netScore}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {formatDuration(att.elapsedSeconds)}
                    </td>
                    <td className="py-3.5 px-6 text-right text-xs text-slate-500 tabular-nums">
                      {new Date(att.completedAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
