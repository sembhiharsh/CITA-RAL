import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, CheckCircle2, User, CreditCard, ShieldCheck } from 'lucide-react';
import QRCodeLib from 'qrcode';

const COMPANY_NAME = 'AUTO TALLERS ROMO S.A';
const BANK_NAME = 'CaixaBank';
const IBAN_DISPLAY = 'ES22 2100 3223 7322 0008 3544';
const IBAN_RAW = 'ES2221003223732200083544';
const BIC_SWIFT = 'CAIXESBBXXX';

function App() {
  const [copied, setCopied] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toast, setToast] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://romoautohub.es/pago';

  useEffect(() => {
    QRCodeLib.toDataURL(currentUrl, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0f1d', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [currentUrl]);

  const handleCopy = async (text, label, msg) => {
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
        navigator.vibrate(40);
      }
      setCopied(true);
      setCopiedLabel(label);
      setToast(msg || '¡Copiado al portapapeles!');
      setTimeout(() => {
        setCopied(false);
        setCopiedLabel('');
        setToast('');
      }, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans overflow-hidden select-none relative">
      
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none border border-slate-700/50 ${
          toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast}</span>
      </div>

      {/* Premium Fintech Card (No Scroll) */}
      <div className="relative z-10 w-full max-w-[365px] bg-white rounded-[26px] p-5 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 flex flex-col items-center text-center">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/70 text-slate-700 text-[10px] font-black tracking-wider uppercase mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>{COMPANY_NAME}</span>
        </div>

        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
          Transferencia Bancaria
        </h1>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          Escanea o copia la cuenta oficial para pagar
        </p>

        {/* Viewfinder QR Code */}
        <div className="my-2.5 relative p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-inner group">
          {/* Scanner corner markers */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-600 rounded-tl-sm" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-600 rounded-tr-sm" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-600 rounded-bl-sm" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-600 rounded-br-sm" />

          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Pago"
                className="w-36 h-36 mx-auto block rounded-lg"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Embossed Obsidian IBAN Card */}
        <div
          onClick={() => handleCopy(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
          className="w-full bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#1e293b] text-white rounded-2xl p-3 mb-2.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-cyan-500/30 active:scale-[0.98] text-left border border-slate-800 relative group overflow-hidden"
          title="Toca para copiar"
        >
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-slate-300 font-extrabold">{BANK_NAME}</span>
            </div>
            <span className="text-cyan-400 font-semibold normal-case flex items-center gap-1 group-hover:text-cyan-300">
              <Copy className="w-3 h-3" /> Toca para copiar
            </span>
          </div>
          <div className="font-mono font-bold text-base sm:text-lg text-white tracking-[0.05em] group-hover:text-cyan-200 transition-colors">
            {IBAN_DISPLAY}
          </div>
        </div>

        {/* Primary Emerald Gradient Action Button */}
        <button
          type="button"
          onClick={() => handleCopy(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98] ${
            copied && copiedLabel === 'iban'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.45)]'
          }`}
        >
          {copied && copiedLabel === 'iban' ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡IBAN COPIADO!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2.5]" />
              <span>COPIAR CUENTA / IBAN</span>
            </>
          )}
        </button>

        {/* Compact Glass Secondary Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
          <button
            type="button"
            onClick={() => handleCopy(COMPANY_NAME, 'name', '¡Titular copiado!')}
            className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer text-[11px] truncate ${
              copied && copiedLabel === 'name'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs'
            }`}
          >
            {copied && copiedLabel === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copiar Titular</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(IBAN_RAW, 'raw', '¡IBAN sin espacios copiado!')}
            className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer text-[11px] truncate ${
              copied && copiedLabel === 'raw'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs'
            }`}
          >
            {copied && copiedLabel === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
            <span>Sin espacios</span>
          </button>
        </div>

        {/* Verified Footer */}
        <div className="text-[10px] text-slate-400 font-bold mt-2.5 flex items-center justify-center gap-1.5 tracking-wide">
          <span>CaixaBank</span>
          <span>•</span>
          <span>Sucursal 3223</span>
          <span>•</span>
          <span>BIC: {BIC_SWIFT}</span>
        </div>

      </div>
    </div>
  );
}

export default App;
