import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import QRCodeLib from 'qrcode';

const COMPANY_NAME = 'AUTO TALLERS ROMO S.A';
const BANK_NAME = 'CaixaBank, S.A.';
const IBAN_DISPLAY = 'ES22 2100 3223 7322 0008 3544';
const IBAN_RAW = 'ES2221003223732200083544';
const BIC_SWIFT = 'CAIXESBBXXX';

function App() {
  const [copiedField, setCopiedField] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Dynamically points to the current site/page (100% self-hosted)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://romoautohub.es/pago';

  useEffect(() => {
    QRCodeLib.toDataURL(currentUrl, {
      width: 450,
      margin: 2,
      errorCorrectionLevel: 'Q',
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [currentUrl]);

  const showFeedback = (field, msg) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
    setCopiedField(field);
    setToastMessage(msg);
    setTimeout(() => {
      setCopiedField(null);
      setToastMessage('');
    }, 2800);
  };

  const copyToClipboard = async (text, fieldName, msg) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showFeedback(fieldName, msg || '¡Copiado al portapapeles!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Attempt auto-copy on first interaction
  useEffect(() => {
    const handleFirstTap = () => {
      copyToClipboard(IBAN_DISPLAY, 'iban', '¡IBAN copiado automáticamente!');
      document.removeEventListener('click', handleFirstTap);
      document.removeEventListener('touchstart', handleFirstTap);
    };

    navigator.clipboard?.writeText(IBAN_DISPLAY).then(() => {
      showFeedback('iban', '¡IBAN copiado automáticamente!');
    }).catch(() => {
      document.addEventListener('click', handleFirstTap, { once: true });
      document.addEventListener('touchstart', handleFirstTap, { once: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 flex flex-col justify-between font-sans py-8 px-4 sm:px-6 antialiased">
      
      {/* Toast Notification */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>

      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Transferencia Bancaria Oficial</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {COMPANY_NAME}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Escanee el código QR o copie los datos bancarios para realizar el pago desde su app bancaria.
          </p>

          {/* QR Code Card */}
          <div className="mt-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-center">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-sm border border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Código QR de Pago AUTO TALLERS ROMO S.A"
                  className="w-48 h-48 sm:w-52 sm:h-52 mx-auto block rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-3">
              Apunta con la cámara de tu móvil para abrir esta pantalla
            </p>
          </div>
        </div>

        {/* Bank Account Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
          
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Datos para la Transferencia</h2>
          </div>

          {/* IBAN Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>IBAN (Cuenta Bancaria)</span>
              <span className="text-blue-600">CaixaBank</span>
            </div>
            
            <div
              onClick={() => copyToClipboard(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
              className="bg-slate-50 hover:bg-slate-100/80 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition-all duration-200 group"
            >
              <div className="font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wide text-center group-hover:text-blue-700 transition">
                {IBAN_DISPLAY}
              </div>
            </div>

            {/* Main Action Copy Button */}
            <button
              type="button"
              onClick={() => copyToClipboard(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
              className={`w-full py-4 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md cursor-pointer ${
                copiedField === 'iban'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-[1.01]'
              }`}
            >
              {copiedField === 'iban' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡IBAN COPIADO CON ÉXITO!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>COPIAR CUENTA / IBAN</span>
                </>
              )}
            </button>

            {/* Secondary: Copy without spaces */}
            <button
              type="button"
              onClick={() => copyToClipboard(IBAN_RAW, 'iban_raw', '¡IBAN sin espacios copiado!')}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition text-center cursor-pointer"
            >
              {copiedField === 'iban_raw' ? '✓ Copiado sin espacios' : 'Copiar sin espacios (ES222100...)'}
            </button>
          </div>

          {/* Company Name Box */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Titular / Beneficiario
            </span>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 gap-2">
              <span className="font-bold text-sm text-slate-900 truncate">
                {COMPANY_NAME}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(COMPANY_NAME, 'name', '¡Nombre del titular copiado!')}
                className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  copiedField === 'name'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copiedField === 'name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'name' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Bank Metadata */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banco</span>
              <span className="text-xs font-bold text-slate-800">{BANK_NAME}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BIC / SWIFT</span>
              <span className="text-xs font-mono font-bold text-slate-800">{BIC_SWIFT}</span>
            </div>
          </div>

        </div>

        {/* Simple 3-Step Guide */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-left space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ¿Cómo realizar el pago?
          </h3>
          
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
              <p>Pulsa el botón verde <strong className="text-slate-900">Copiar Cuenta</strong>.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
              <p>Abre la <strong className="text-slate-900">app de tu banco</strong> y selecciona <strong>Nueva Transferencia</strong>.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
              <p>Pega el IBAN, introduce el importe acordado y confirma el envío.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 max-w-md mx-auto">
        <p className="font-semibold text-slate-500">{COMPANY_NAME}</p>
        <p className="mt-0.5">Sant Adrià de Besòs, Barcelona</p>
      </footer>

    </div>
  );
}

export default App;
