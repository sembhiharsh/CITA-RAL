import React, { useState, useEffect } from 'react';
import { Wrench, User, Phone, Calendar, Send, CheckCircle2, AlertTriangle, Settings, QrCode, Copy, Check, X, ExternalLink, CreditCard } from 'lucide-react';
import QRCodeLib from 'qrcode';

const COMPANY_NAME = 'AUTO TALLERS ROMO S.A';
const BANK_NAME = 'CaixaBank, S.A.';
const IBAN_DISPLAY = 'ES22 2100 3223 7322 0008 3544';

// 100% self-hosted on our own site - zero third-party dependencies
const getPayPageUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/pago`;
  }
  return 'https://romoautohub.es/pago';
};

const getBackendUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }
  return window.location.origin;
};
const API_BASE = getBackendUrl();

function App() {
  // Settings state (only needed for WhatsApp number and shop name)
  const [settings, setSettings] = useState({
    shop_name: 'Auto Talleres Romo',
    whatsapp_number: ''
  });

  // Booking form state
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    car_model: '',
    license_plate: '',
    service: '',
    datetime: ''
  });
  const [clientFormSubmitted, setClientFormSubmitted] = useState(null);
  const [clientFormLoading, setClientFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState(null);

  // Payment QR modal state & copy feedback
  const payUrl = getPayPageUrl();
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [showPayment, setShowPayment] = useState(() => {
    return typeof window !== 'undefined' && (
      window.location.pathname.includes('/pago') || 
      window.location.pathname.includes('/pay') || 
      window.location.search.includes('pay') ||
      window.location.hash.includes('pago')
    );
  });
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    QRCodeLib.toDataURL(payUrl, {
      width: 450,
      margin: 2,
      errorCorrectionLevel: 'Q',
      color: { dark: '#0a0f1d', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [payUrl]);

  const handleCopy = async (text, fieldName) => {
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
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleApplySuggestedDate = () => {
    if (!suggestedDate || !clientForm.datetime) return;
    const timePart = clientForm.datetime.split('T')[1] || '10:00';
    setClientForm(prev => ({
      ...prev,
      datetime: `${suggestedDate}T${timePart}`
    }));
    setErrorMessage(null);
    setSuggestedDate(null);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setClientFormLoading(true);
    setErrorMessage(null);
    setSuggestedDate(null);
    try {
      if (!clientForm.name || !clientForm.phone || !clientForm.car_model || !clientForm.license_plate || !clientForm.service || !clientForm.datetime) {
        alert('Por favor, rellene todos los campos.');
        setClientFormLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientForm, status: 'pending' })
      });

      if (!res.ok) {
        if (res.status === 409) {
          const data = await res.json();
          const detail = data.detail || 'Este día ya está completo.';
          setErrorMessage(detail);
          const dateMatch = detail.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            setSuggestedDate(dateMatch[1]);
          }
          return;
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Error al registrar la cita.');
        }
      }

      const data = await res.json();
      const appt = data.appointment;
      const isAutoApproved = appt && appt.status === 'confirmed';

      let messageText = "";
      if (isAutoApproved) {
        messageText = `¡Hola! Acabo de registrar una cita y ha sido CONFIRMADA AUTOMÁTICAMENTE:\n👤 *Nombre*: ${clientForm.name}\n📞 *Teléfono*: ${clientForm.phone}\n🚗 *Coche*: ${clientForm.car_model}\n🔢 *Matrícula*: ${clientForm.license_plate}\n🛠️ *Servicio*: ${clientForm.service}\n📅 *Fecha/Hora*: ${clientForm.datetime.replace('T', ' ')}`;
      } else {
        messageText = `Hola, me gustaría solicitar una cita:\n👤 *Nombre*: ${clientForm.name}\n📞 *Teléfono*: ${clientForm.phone}\n🚗 *Coche*: ${clientForm.car_model}\n🔢 *Matrícula*: ${clientForm.license_plate}\n🛠️ *Servicio*: ${clientForm.service}\n📅 *Fecha/Hora propuesta*: ${clientForm.datetime.replace('T', ' ')}`;
      }

      // Prepare WhatsApp number with fallback to default if settings not provided
      const rawNumber = settings.whatsapp_number ? settings.whatsapp_number.replace(/\D/g, '') : '';
      const cleanPhone = rawNumber
        ? (rawNumber.startsWith('34') || rawNumber.length > 9 ? rawNumber : `34${rawNumber}`)
        : '34934620254';

      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      setClientFormSubmitted({ isAutoApproved, whatsappUrl });
    } catch (err) {
      console.error('Error submitting appointment:', err);
      setErrorMessage(err.message || 'Error al registrar la cita en el sistema. Inténtelo de nuevo.');
    } finally {
      setClientFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col relative font-sans">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/THE MAIN.png')" }}></div>
        <div className="absolute inset-0 bg-transparent"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-300/50">
        <a href="https://romoautohub.es" className="text-xl sm:text-2xl font-bold tracking-widest text-slate-900 decoration-none">AUTO TALLERES ROMO</a>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPayment(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-bold text-xs sm:text-sm rounded-xl border border-emerald-500/30 transition shadow-sm cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Pagar con QR</span>
          </button>
          <a href="https://romoautohub.es" className="text-sm font-semibold hover:text-cyan-600 transition text-slate-600">Volver a Inicio</a>
        </div>
      </nav>

      {/* Form Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-2xl relative animate-fade-in">
          <div className="text-center">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 text-cyan-600 mb-3">
            <Wrench className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {settings.shop_name || 'Auto Talleres Romo'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">Solicitud de Cita previa</p>
        </div>
        {clientFormSubmitted ? (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {clientFormSubmitted.isAutoApproved ? '¡Cita Confirmada!' : '¡Solicitud Recibida!'}
            </h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
              {clientFormSubmitted.isAutoApproved
                ? 'Su cita ha sido aprobada al instante.'
                : 'Usted recibirá un mensaje de WhatsApp o SMS con la confirmación de la hora y el día de su cita.'}
            </p>
            <div className="pt-4 border-t border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pago por Transferencia</p>
              <button
                type="button"
                onClick={() => setShowPayment(true)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                <span>Ver Código QR y Datos de Pago</span>
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5 text-left" onSubmit={handleClientSubmit}>
            {errorMessage && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm space-y-3 animate-fade-in">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                  <p>{errorMessage}</p>
                </div>
                {suggestedDate && (
                  <button
                    type="button"
                    onClick={handleApplySuggestedDate}
                    className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-xl text-xs transition-colors border border-amber-500/40"
                  >
                    Actualizar a la fecha sugerida ({suggestedDate})
                  </button>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" /> Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={clientForm.name}
                onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-600" /> Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Ej. juan@correo.com"
                value={clientForm.email}
                onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-600" /> Número de Teléfono
              </label>
              <input
                type="tel"
                required
                placeholder="Ej. +34 600 000 000"
                value={clientForm.phone}
                onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-600" /> Modelo del Coche
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Seat Ibiza 2018"
                  value={clientForm.car_model}
                  onChange={(e) => setClientForm(prev => ({ ...prev, car_model: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-600" /> Matrícula
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1234ABC"
                  value={clientForm.license_plate}
                  onChange={(e) => setClientForm(prev => ({ ...prev, license_plate: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-600" /> Servicio / Avería
              </label>
              <textarea
                required
                rows="3"
                placeholder="Explique brevemente qué le ocurre al coche o qué servicio necesita..."
                value={clientForm.service}
                onChange={(e) => setClientForm(prev => ({ ...prev, service: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Fecha y Hora sugerida
              </label>
              <input
                type="datetime-local"
                required
                value={clientForm.datetime}
                onChange={(e) => setClientForm(prev => ({ ...prev, datetime: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={clientFormLoading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <Send className="w-4 h-4" />
              <span>{clientFormLoading ? 'Procesando...' : 'Solicitar Cita'}</span>
            </button>
          </form>
        )}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Auto Talleres Romo — Sant Adrià de Besòs, Barcelona
        </div>
      </div>
      </div>

      {/* Payment QR Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-left max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600 mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pago por Transferencia</h3>
              <p className="text-xs text-slate-500 mt-1">Escanee el código QR con su móvil o copie los datos bancarios.</p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mb-5">
              <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-slate-200">
                <img
                  src={qrDataUrl || "/qr_payment.png"}
                  alt="QR Pago Auto Talleres Romo"
                  className="w-44 h-44 mx-auto block"
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-2">
                Apunta la cámara del móvil al QR para abrir nuestra página de pago
              </p>
              <a
                href={payUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 mt-1.5 break-all text-center"
              >
                <span>{payUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            {/* Copyable Details */}
            <div className="space-y-3">
              {/* IBAN */}
              <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">IBAN (Cuenta Bancaria)</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-slate-900">{IBAN_DISPLAY}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(IBAN_DISPLAY, 'iban')}
                    className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedField === 'iban' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'iban' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Titular */}
              <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Titular / Empresa</span>
                    <span className="font-semibold text-sm text-slate-900">{COMPANY_NAME}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_NAME, 'name')}
                    className="shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'name' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Extra Bank Info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Banco</span>
                  <span className="font-semibold">{BANK_NAME}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">BIC / SWIFT</span>
                  <span className="font-semibold font-mono">CAIXESBBXXX</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
