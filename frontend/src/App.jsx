import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, CheckCircle2 } from 'lucide-react';
import QRCodeLib from 'qrcode';

const COMPANY_NAME = 'AUTO TALLERS ROMO S.A';
const BANK_NAME = 'CaixaBank';
const IBAN_DISPLAY = 'ES22 2100 3223 7322 0008 3544';
const IBAN_RAW = 'ES2221003223732200083544';
const BIC_SWIFT = 'CAIXESBBXXX';

function App() {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toast, setToast] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://romoautohub.es/pago';

  useEffect(() => {
    QRCodeLib.toDataURL(currentUrl, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [currentUrl]);

  const handleCopy = async (text, msg) => {
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setCopied(true);
      setToast(msg || '¡IBAN copiado al portapapeles!');
      setTimeout(() => {
        setCopied(false);
        setToast('');
      }, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-3 font-sans overflow-hidden select-none">
      
      {/* Floating Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast}</span>
      </div>

      {/* Compact All-in-One Card (No Scroll) */}
      <div className="bg-white w-full max-w-[360px] rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col items-center text-center">
        
        {/* Header */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
          {COMPANY_NAME}
        </span>
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
          Pago por Transferencia
        </h1>

        {/* Compact Scannable QR */}
        <div className="my-2.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Pago"
              className="w-36 h-36 sm:w-40 sm:h-40 mx-auto block rounded-lg"
            />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-slate-400">
              <QrCode className="w-8 h-8 animate-pulse" />
            </div>
          )}
        </div>

        {/* IBAN Display Box */}
        <div
          onClick={() => handleCopy(IBAN_DISPLAY, '¡IBAN copiado al portapapeles!')}
          className="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl py-2 px-3 mb-2.5 cursor-pointer transition active:scale-98"
          title="Toca para copiar"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            IBAN CaixaBank
          </div>
          <div className="font-mono font-extrabold text-sm sm:text-base text-slate-900 tracking-wide mt-0.5">
            {IBAN_DISPLAY}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => handleCopy(IBAN_DISPLAY, '¡IBAN copiado al portapapeles!')}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-98'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>¡IBAN COPIADO!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPIAR CUENTA / IBAN</span>
            </>
          )}
        </button>

        {/* Quick Secondary Actions */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
          <button
            type="button"
            onClick={() => handleCopy(COMPANY_NAME, '¡Titular copiado!')}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 font-semibold truncate cursor-pointer active:scale-98"
            title="Copiar Titular"
          >
            Copiar Titular
          </button>
          <button
            type="button"
            onClick={() => handleCopy(IBAN_RAW, '¡IBAN sin espacios copiado!')}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 font-semibold truncate cursor-pointer active:scale-98"
            title="Copiar sin espacios"
          >
            Sin espacios
          </button>
        </div>

        {/* Minimal Bank Info */}
        <div className="text-[10px] text-slate-400 mt-2 font-medium">
          CaixaBank • Sucursal 3223 • BIC: {BIC_SWIFT}
        </div>

      </div>
    </div>
  );
}

export default App;
