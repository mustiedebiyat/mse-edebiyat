import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenInstallPage?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenInstallPage,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    if (onOpenInstallPage) {
      onOpenInstallPage();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
      >
        {isInstallable ? (
          <Download className="w-3.5 h-3.5" />
        ) : (
          <Smartphone className="w-3.5 h-3.5" />
        )}
        {isInstallable
          ? 'Android / Cihaza Yükle'
          : isIOS
            ? 'iPhone / iPad’e Ekle'
            : 'Telefona Uygulama Olarak Kur'}
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Mobil Uygulama Kurulumu
                </p>
                <h3
                  id="pwa-guide-title"
                  className="font-display text-lg font-bold text-slate-900 mt-0.5"
                >
                  {isIOS
                    ? 'iPhone / iPad Ana Ekrana Ekleme'
                    : 'Android Telefona Uygulama Gibi Kurulum'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Kapat"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
                <li>
                  Safari tarayıcısının alt veya üst araç çubuğundaki{' '}
                  <strong className="text-slate-900">Paylaş</strong> simgesine dokunun.
                </li>
                <li>
                  Açılan menüde aşağı kaydırıp{' '}
                  <strong className="text-slate-900">Ana Ekrana Ekle</strong> seçeneğine dokunun.
                </li>
                <li>
                  Sağ üstteki <strong className="text-slate-900">Ekle</strong> butonuna basarak uygulamayı kurun.
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
                <li>
                  Uygulamayı Android telefonunuzda <strong className="text-slate-900">Google Chrome</strong> ile doğrudan bağlantısından açın.
                </li>
                <li>
                  Sağ üstteki üç nokta (<strong className="text-slate-900">⋮</strong>) menüsüne dokunun.
                </li>
                <li>
                  <strong className="text-slate-900">Ana ekrana ekle</strong> veya{' '}
                  <strong className="text-slate-900">Uygulamayı yükle</strong> seçeneğini onaylayın.
                </li>
                <li>
                  Kurulum sonrasında uygulama tam ekran Android uygulaması gibi açılır ve internetsiz (çevrimdışı) çalışır.
                </li>
              </ol>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Çevrimdışı Mod — Önbellekteki sorularla devam ediliyor</span>
    </div>
  );
};
