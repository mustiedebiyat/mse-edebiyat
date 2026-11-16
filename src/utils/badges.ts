import type {
  BadgeDefinition,
  EvaluatedBadge,
  TestAttemptRecord,
  Topic,
} from '../types/quiz';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-step',
    title: 'İlk Adım',
    description: 'Portalda ilk online testinizi başarıyla tamamladınız.',
    criteriaText: 'En az 1 test tamamla',
    category: 'milestone',
    icon: 'award',
  },
  {
    id: 'steady-learner',
    title: 'Azimli Çalışan',
    description: 'Düzenli pratik yaparak 5 farklı test oturumunu tamamladınız.',
    criteriaText: 'Toplam 5 test tamamla',
    category: 'milestone',
    icon: 'flame',
  },
  {
    id: 'marathon-runner',
    title: 'Sınav Maratoncusu',
    description: '15 test barajını aşarak güçlü bir sınav disiplini oluşturdunuz.',
    criteriaText: 'Toplam 15 test tamamla',
    category: 'milestone',
    icon: 'compass',
  },
  {
    id: 'question-hunter',
    title: 'Soru Avcısı',
    description: 'Toplamda 100 veya daha fazla soru çözerek soru pratiğinizi artırdınız.',
    criteriaText: 'Toplam 100 soru çöz',
    category: 'milestone',
    icon: 'book',
  },
  {
    id: 'high-net',
    title: 'Yüksek Net Ustası',
    description: 'En az 10 soruluk bir testte %85 ve üzeri net başarısı gösterdiniz.',
    criteriaText: 'En az 10 soruda ≥ %85 net',
    category: 'performance',
    icon: 'target',
  },
  {
    id: 'perfect-score',
    title: 'Tam İsabet',
    description: 'En az 10 soruluk bir testi sıfır hata ve sıfır boşla tamamladınız.',
    criteriaText: 'En az 10 soruda %100 doğru',
    category: 'performance',
    icon: 'trophy',
  },
  {
    id: 'hard-conqueror',
    title: 'Zor Seviye Fatihi',
    description: 'Zor seviye bir testte yüksek net çıkararak üst düzey hakimiyet kanıtladınız.',
    criteriaText: 'Zor testte (≥10 soru) ≥ 7.50 net',
    category: 'performance',
    icon: 'shield',
  },
  {
    id: 'speed-master',
    title: 'Zamanla Yarışan',
    description: 'Zamanlayıcı açıkken süreyi aşmadan %80 üzeri başarı elde ettiniz.',
    criteriaText: 'Süreli testte (≥10 soru) ≥ %80 net',
    category: 'performance',
    icon: 'clock',
  },
  {
    id: 'tyt-explorer',
    title: 'TYT Türkçe Yetkinliği',
    description: 'Tüm TYT Türkçe konularında en az bir zorluk seviyesini tamamladınız.',
    criteriaText: '6/6 TYT Türkçe konusunda test çöz',
    category: 'mastery',
    icon: 'zap',
  },
  {
    id: 'ayt-scholar',
    title: 'AYT Edebiyat Yetkinliği',
    description: 'Tüm AYT Edebiyat konularında en az bir zorluk seviyesini tamamladınız.',
    criteriaText: '6/6 AYT Edebiyat konusunda test çöz',
    category: 'mastery',
    icon: 'star',
  },
];

function findFirstMatchDate(
  attemptsAsc: TestAttemptRecord[],
  predicate: (a: TestAttemptRecord) => boolean
): string | undefined {
  const match = attemptsAsc.find(predicate);
  return match?.completedAt;
}

export function evaluateBadges(
  topics: Topic[],
  attempts: TestAttemptRecord[]
): EvaluatedBadge[] {
  // Sort ascending chronologically so earnedAt captures the first time the badge was unlocked
  const asc = [...attempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const tytTopicIds = topics.filter((t) => t.exam === 'TYT').map((t) => t.id);
  const aytTopicIds = topics.filter((t) => t.exam === 'AYT').map((t) => t.id);

  // Cumulative trackers
  let runningQuestions = 0;
  let questionHunterDate: string | undefined;
  const seenTyt = new Set<string>();
  const seenAyt = new Set<string>();
  let tytExplorerDate: string | undefined;
  let aytScholarDate: string | undefined;

  for (const att of asc) {
    runningQuestions += att.questionCount;
    if (!questionHunterDate && runningQuestions >= 100) {
      questionHunterDate = att.completedAt;
    }

    if (att.exam === 'TYT') {
      seenTyt.add(att.topicId);
      if (
        !tytExplorerDate &&
        tytTopicIds.length > 0 &&
        tytTopicIds.every((id) => seenTyt.has(id))
      ) {
        tytExplorerDate = att.completedAt;
      }
    }

    if (att.exam === 'AYT') {
      seenAyt.add(att.topicId);
      if (
        !aytScholarDate &&
        aytTopicIds.length > 0 &&
        aytTopicIds.every((id) => seenAyt.has(id))
      ) {
        aytScholarDate = att.completedAt;
      }
    }
  }

  return BADGE_DEFINITIONS.map((def) => {
    let earnedAt: string | undefined;

    switch (def.id) {
      case 'first-step':
        earnedAt = asc[0]?.completedAt;
        break;
      case 'steady-learner':
        earnedAt = asc[4]?.completedAt;
        break;
      case 'marathon-runner':
        earnedAt = asc[14]?.completedAt;
        break;
      case 'question-hunter':
        earnedAt = questionHunterDate;
        break;
      case 'high-net':
        earnedAt = findFirstMatchDate(
          asc,
          (a) => a.questionCount >= 10 && a.netScore / a.questionCount >= 0.85
        );
        break;
      case 'perfect-score':
        earnedAt = findFirstMatchDate(
          asc,
          (a) => a.questionCount >= 10 && a.correctCount === a.questionCount
        );
        break;
      case 'hard-conqueror':
        earnedAt = findFirstMatchDate(
          asc,
          (a) =>
            a.difficulty === 'zor' &&
            a.questionCount >= 10 &&
            a.netScore >= 7.5
        );
        break;
      case 'speed-master':
        earnedAt = findFirstMatchDate(
          asc,
          (a) =>
            a.timerEnabled &&
            !a.timedOut &&
            a.questionCount >= 10 &&
            a.netScore / a.questionCount >= 0.8
        );
        break;
      case 'tyt-explorer':
        earnedAt = tytExplorerDate;
        break;
      case 'ayt-scholar':
        earnedAt = aytScholarDate;
        break;
    }

    return {
      ...def,
      earned: Boolean(earnedAt),
      earnedAt,
    };
  });
}

export function getNewlyUnlockedBadges(
  topics: Topic[],
  previousAttempts: TestAttemptRecord[],
  updatedAttempts: TestAttemptRecord[]
): EvaluatedBadge[] {
  const before = evaluateBadges(topics, previousAttempts);
  const after = evaluateBadges(topics, updatedAttempts);
  const beforeEarnedIds = new Set(before.filter((b) => b.earned).map((b) => b.id));
  return after.filter((b) => b.earned && !beforeEarnedIds.has(b.id));
}
