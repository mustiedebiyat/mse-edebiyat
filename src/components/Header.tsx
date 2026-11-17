import React from 'react';

export type ActiveView = 'home' | 'topics' | 'quiz' | 'profile' | 'install';
export type CatalogFilter = 'ALL' | 'TYT' | 'AYT';

interface HeaderProps {
  activeView: ActiveView;
  catalogFilter: CatalogFilter;
  hasActiveQuiz: boolean;
  onNavigateHome: () => void;
  onNavigateTopics: (filter: CatalogFilter) => void;
  onNavigateProfile: () => void;
  onPrimaryAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  catalogFilter,
  hasActiveQuiz,
  onNavigateHome,
  onNavigateTopics,
  onNavigateProfile,
  onPrimaryAction,
}) => {
  const isHomeActive = activeView === 'home';
  const isTytActive = activeView === 'topics' && catalogFilter === 'TYT';
  const isAytActive = activeView === 'topics' && catalogFilter === 'AYT';
  const isProfileActive = activeView === 'profile';

  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
      active
        ? 'text-[#4B2E6B] border-[#4B2E6B]'
        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-[#FAFBFD]/95 backdrop-blur-sm border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={onNavigateHome}
          title="Mustafa Şahin Edebiyat (Edebiyat ve Türkçe)"
          className="font-display text-xl font-bold tracking-tight text-[#462963] whitespace-nowrap shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B2E6B] rounded"
        >
          MSE
        </button>

        <nav
          aria-label="Ana gezinme"
          className="hidden md:flex items-center gap-6"
        >
          <button
            type="button"
            onClick={onNavigateHome}
            className={linkClass(isHomeActive)}
          >
            Ana Sayfa
          </button>
          <button
            type="button"
            onClick={() => onNavigateTopics('TYT')}
            className={linkClass(isTytActive)}
          >
            TYT Türkçe
          </button>
          <button
            type="button"
            onClick={() => onNavigateTopics('AYT')}
            className={linkClass(isAytActive)}
          >
            AYT Edebiyat
          </button>
          <button
            type="button"
            onClick={onNavigateProfile}
            className={linkClass(isProfileActive)}
          >
            Profilim
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateProfile}
            className="md:hidden px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Profilim
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#4B2E6B] rounded-lg hover:bg-[#3A2254] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B2E6B] focus-visible:ring-offset-2"
          >
            {hasActiveQuiz && activeView !== 'quiz' ? 'Teste Dön' : 'Rastgele Test'}
          </button>
        </div>
      </div>
    </header>
  );
};
