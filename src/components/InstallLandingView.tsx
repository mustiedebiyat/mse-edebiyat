import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Share,
  Smartphone,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MseEmblem } from './MseEmblem';

interface InstallLandingViewProps {
  onContinueToTests: () => void;
}

type PlatformTab = 'android' | 'apple';

export const InstallLandingView: React.FC<InstallLandingViewProps> = ({
  onContinueToTests,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInAppBrowser, install } =
    usePWAInstall();

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>(() =>
    isIOS ? 'apple' : 'android'
  );
  const [copiedType, setCopiedType] = useState<'page' | 'share' | null>(null);
  const [installAttempted, setInstallAttempted] = useState(false);

  useEffect(() => {
    if (isIOS) {
      setSelectedPlatform('apple');
    } else if (isAndroid) {
      setSelectedPlatform('android');
    }
  }, [isIOS, isAndroid]);

  const shareInstallUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?yukle=1`
      : '/?yukle=1';

  const handleCopy = async (type: 'page' | 'share') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareInstallUrl);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopiedType(type);
      window.setTimeout(() => setCopiedType(null), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareInstallUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedType(type);
        window.setTimeout(() => setCopiedType(null), 2500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleAndroidInstall = async () => {
    setInstallAttempted(true);
    await install();
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Brand Lockup */}
      <section className="bg-gradient-to-r from-[#F4EEF9] via-[#F7F2F7] to-[#FCF3EB] border border-[#E4D8EC] rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
        <MseEmblem />
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-mono tracking-wide">
            <span className="font-semibold text-[#C2591D]">MSE</span>
            <span className="text-[#785996]"> · Hazırlayan: Mustafa Şahin</span>
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#462963] leading-tight">
            Mustafa Şahin Edebiyat
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#C2591D]">
            (Edebiyat ve Türkçe)
          </p>
        </div>
      </section>

      {isInstalled ? (
        <section className="bg-[#EEF6F1] border border-[#CEE5D6] rounded-2xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Uygulama Cihazınızda Kurulu
            </h2>
            <p className="text-sm text-slate-700">
              MSE uygulamasını zaten tam ekran uygulama modunda kullanıyorsunuz.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinueToTests}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4B2E6B] hover:bg-[#3A2254] rounded-xl transition-colors"
          >
            Testlere Başla
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Ücretsiz Mobil Uygulama Kurulumu
              </p>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                Cihazınıza Tek Tıkla Yükleyin
              </h2>
            </div>

            {/* Platform Switcher */}
            <div
              role="tablist"
              aria-label="Cihaz türü seçimi"
              className="inline-flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-lg self-start sm:self-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedPlatform === 'android'}
                onClick={() => setSelectedPlatform('android')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedPlatform === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedPlatform === 'apple'}
                onClick={() => setSelectedPlatform('apple')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedPlatform === 'apple'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apple (iPhone / iPad)
              </button>
            </div>
          </div>

          {isInAppBrowser && (
            <div className="p-4 bg-[#FCF5EC] border border-[#ECCEA9] rounded-xl space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">
                Uygulama İçi Tarayıcı Algılandı (WhatsApp / Instagram)
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Otomatik yükleme butonunun çalışması için sağ üst veya alt menüden{' '}
                <strong>{selectedPlatform === 'apple' ? 'Safari’de Aç' : 'Chrome’da Aç'}</strong>{' '}
                seçeneğini kullanın ya da bağlantıyı kopyalayıp tarayıcıya yapıştırın.
              </p>
              <button
                type="button"
                onClick={() => handleCopy('page')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#9E4716] bg-white border border-[#E5BA8A] rounded-lg hover:bg-amber-50"
              >
                {copiedType === 'page' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Bağlantı Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Bağlantıyı Kopyala
                  </>
                )}
              </button>
            </div>
          )}

          {selectedPlatform === 'android' ? (
            <div className="space-y-5">
              {isInstallable ? (
                <div className="p-5 bg-[#F4EFF9] border border-[#DFD1EA] rounded-xl space-y-3 text-center">
                  <p className="text-sm text-slate-800 font-medium">
                    Android cihazınız otomatik kurulum için hazır.
                  </p>
                  <button
                    type="button"
                    onClick={handleAndroidInstall}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#4B2E6B] hover:bg-[#3A2254] rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Android’e Otomatik Yükle
                  </button>
                  {installAttempted && (
                    <p className="text-xs text-slate-600">
                      Açılan pencerede &ldquo;Yükle&rdquo; butonuna dokunmanız yeterlidir.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#F2F6FA] border border-[#DCE6F0] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Smartphone className="w-4 h-4 text-[#2C4A70]" />
                    <span>Android (Google Chrome) İle 3 Adımda Kurulum</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tarayıcınız otomatik yükleme penceresini henüz göstermediyse aşağıdaki adımlarla 5 saniyede ana ekranınıza kurabilirsiniz:
                  </p>
                </div>
              )}

              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4B2E6B] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Bu sayfayı Android telefonunuzda <strong className="text-slate-900">Google Chrome</strong> ile açın.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4B2E6B] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Sağ üst köşedeki üç nokta (<strong className="text-slate-900">⋮</strong>) menüsüne dokunun.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#D97736] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-900">Uygulamayı yükle</strong> veya{' '}
                    <strong className="text-slate-900">Ana ekrana ekle</strong> seçeneğine dokunup onaylayın.
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-[#FCF5EE] border border-[#EDD8C4] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Share className="w-4 h-4 text-[#C2591D]" />
                  <span>Apple (iPhone &amp; iPad) — Safari ile Kurulum</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apple cihazlarda güvenlik nedeniyle otomatik pencere açılmasına izin verilmez; Safari üzerinden aşağıdaki 3 dokunuşla MŞE simgesi ana ekranınıza uygulama olarak eklenir.
                </p>
              </div>

              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#C2591D] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Bağlantıyı iPhone veya iPad’inizde <strong className="text-slate-900">Safari</strong> tarayıcısı ile açın.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#C2591D] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Ekranın alt veya üst çubuğundaki <strong className="text-slate-900">Paylaş</strong> (yukarı oklu kare) simgesine dokunun.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4B2E6B] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Listede aşağı kaydırıp <strong className="text-slate-900">Ana Ekrana Ekle</strong> ve sağ üstten <strong className="text-slate-900">Ekle</strong> butonuna dokunun.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => handleCopy('page')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#462963] bg-[#F4EFF9] hover:bg-[#EAE0F3] border border-[#DFD1EA] rounded-lg transition-colors"
              >
                {copiedType === 'page' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Bağlantı Kopyalandı (Safari’ye Yapıştırın)
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Safari’de Açmak İçin Bağlantıyı Kopyala
                  </>
                )}
              </button>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-medium text-slate-600">
              Öğrencilerle Paylaşılacak Doğrudan Kurulum Bağlantısı
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareInstallUrl}
                onFocus={(e) => e.target.select()}
                aria-label="Kurulum bağlantısı"
                className="flex-1 px-3 py-2 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C4A70]"
              />
              <button
                type="button"
                onClick={() => handleCopy('share')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2C4A70] hover:bg-[#223B5B] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {copiedType === 'share' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Bağlantıyı Kopyala
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onContinueToTests}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#2C4A70] bg-[#EEF3F8] hover:bg-[#E1EAF3] border border-[#D4DFEC] rounded-xl transition-colors"
            >
              Kurulumu Geç, Testlere Başla
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </main>
  );
};
