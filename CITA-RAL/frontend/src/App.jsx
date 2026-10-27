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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center p-3 font-sans overflow-hidden select-none">
      
      {/* Toast Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none border border-slate-700/50 ${
          toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast}</span>
      </div>

      {/* Main Premium Card (Zero Scroll) */}
      <div className="bg-white w-full max-w-[370px] rounded-[28px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/80 flex flex-col items-center text-center relative">
        
        {/* Company Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-bold tracking-wide uppercase mb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{COMPANY_NAME}</span>
        </div>

        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Pago por Transferencia
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Escanee el código o copie la cuenta para pagar
        </p>

        {/* QR Code Container */}
        <div className="my-2.5 p-2 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200/80 shadow-inner">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
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
        </div>

        {/* High-Contrast IBAN Card */}
        <div
          onClick={() => handleCopy(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-3 mb-2.5 cursor-pointer transition-all active:scale-[0.98] text-left shadow-sm group border border-slate-800"
          title="Toca para copiar"
        >
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
            <span>CaixaBank • IBAN</span>
            <span className="text-cyan-400 flex items-center gap-1 font-semibold normal-case">
              <Copy className="w-3 h-3" /> Toca para copiar
            </span>
          </div>
          <div className="font-mono font-bold text-base sm:text-lg text-cyan-300 tracking-wide">
            {IBAN_DISPLAY}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => handleCopy(IBAN_DISPLAY, 'iban', '¡IBAN copiado al portapapeles!')}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
            copied && copiedLabel === 'iban'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 hover:shadow-lg'
          }`}
        >
          {copied && copiedLabel === 'iban' ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡IBAN COPIADO CON ÉXITO!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2.5]" />
              <span>COPIAR CUENTA / IBAN</span>
            </>
          )}
        </button>

        {/* Quick Secondary Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => handleCopy(COMPANY_NAME, 'name', '¡Titular copiado!')}
            className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer text-[11px] truncate ${
              copied && copiedLabel === 'name'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {copied && copiedLabel === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <User className="w-3.5 h-3.5 text-slate-500" />}
            <span>Copiar Titular</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(IBAN_RAW, 'raw', '¡IBAN sin espacios copiado!')}
            className={`py-2 px-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer text-[11px] truncate ${
              copied && copiedLabel === 'raw'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {copied && copiedLabel === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CreditCard className="w-3.5 h-3.5 text-slate-500" />}
            <span>Sin espacios</span>
          </button>
        </div>

        {/* Bank Sub-info */}
        <div className="text-[10px] text-slate-400 font-semibold mt-2.5 flex items-center justify-center gap-2">
          <span>CaixaBank (2100)</span>
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
