
import React, { useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentData, QrVersion } from './types';
import { generateNbuPaymentUrl } from './services/nbuQrService';
import { HryvniaIcon } from './components/HryvniaIcon';

const STORAGE_KEY = 'nbu_qr_generator_data';

const App: React.FC = () => {
  const [data, setData] = useState<PaymentData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    return {
      recipientName: '',
      iban: '',
      amount: undefined,
      currency: 'UAH',
      identificationCode: '',
      purpose: '',
      reference: '',
      display: ''
    };
  });

  const [copied, setCopied] = useState(false);

  // Deep Linking: Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newData: Partial<PaymentData> = {};
    
    if (params.has('name')) newData.recipientName = params.get('name') || '';
    if (params.has('iban')) newData.iban = params.get('iban') || '';
    if (params.has('edrpou')) newData.identificationCode = params.get('edrpou') || '';
    if (params.has('amount')) newData.amount = parseFloat(params.get('amount') || '0');
    if (params.has('purpose')) newData.purpose = params.get('purpose') || '';
    
    if (Object.keys(newData).length > 0) {
      setData(prev => ({ ...prev, ...newData }));
    }
  }, []);

  // Persist data to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const result = useMemo(() => {
    if (!data.recipientName || !data.iban) return null;
    return generateNbuPaymentUrl(data, QrVersion.V002);
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleClearForm = () => {
    if (window.confirm('Ви впевнені, що хочете очистити форму?')) {
      const resetData = {
        recipientName: '',
        iban: '',
        amount: undefined,
        currency: 'UAH',
        identificationCode: '',
        purpose: '',
        reference: '',
        display: ''
      };
      setData(resetData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx?.drawImage(img, 0, 0, 1000, 1000);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `ukrpay_${data.recipientName || 'qr'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const inputClasses = "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

  // SVG for center of QR Code with official Hryvnia symbol
  const qrLogoSvg = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><circle cx="12" cy="12" r="11" /></clipPath></defs>
      <g clip-path="url(#c)">
        <rect width="24" height="12" fill="#0057B7" />
        <rect y="12" width="24" height="12" fill="#FFD700" />
      </g>
      <circle cx="12" cy="12" r="11" stroke="white" stroke-width="1.5" />
      <path d="M16 8.5C14.5 5.5 8 5.5 8 12s6.5 6.5 8 3.5 M6.5 10.5h11 M6.5 13.5h11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-8 px-4">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full bg-white shadow-md">
             <HryvniaIcon size={44} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">UkrPay</h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Платити легко</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm">1</span>
              Реквізити платежу
            </h2>
            <button 
              onClick={handleClearForm}
              className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors uppercase tracking-tight"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Очистити
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Отримувач (ПІБ або Назва компанії) *</label>
              <input 
                type="text" name="recipientName" value={data.recipientName} onChange={handleInputChange}
                className={inputClasses}
                placeholder="Наприклад: Петренко Іван Іванович"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">IBAN *</label>
                <input 
                  type="text" name="iban" value={data.iban} onChange={handleInputChange}
                  className={`${inputClasses} uppercase font-mono text-sm`}
                  placeholder="UA000000..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ЄДРПОУ / ІПН *</label>
                <input 
                  type="text" name="identificationCode" value={data.identificationCode} onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="8 або 10 цифр"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Сума (грн, не обов'язково)</label>
              <input 
                type="number" name="amount" value={data.amount || ''} onChange={handleInputChange}
                className={inputClasses}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Призначення платежу *</label>
              <textarea 
                name="purpose" value={data.purpose} onChange={handleInputChange} rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="За що платимо? (напр. Оплата за послуги)"
              />
            </div>

            <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               Локальне збереження активовано
            </div>
          </div>
        </section>

        {/* Result Section */}
        <section className="bg-white rounded-2xl shadow-xl border-t-4 border-blue-600 p-6 sm:p-8 flex flex-col items-center text-center lg:sticky lg:top-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm">2</span>
            Ваш QR-код
          </h2>

          <div className="relative group">
            {result ? (
              <div className="p-5 bg-white rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center overflow-hidden">
                <QRCodeSVG 
                  id="qr-svg"
                  value={result.fullUrl} 
                  size={240} 
                  level="Q" 
                  imageSettings={{
                    src: 'data:image/svg+xml;base64,' + btoa(qrLogoSvg),
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium px-8 leading-relaxed">
                Заповніть реквізити ліворуч, щоб створити код
              </div>
            )}
            
            {result && (
              <button 
                onClick={downloadQR}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-tight"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12 a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3"></path></svg>
                Зберегти картинку
              </button>
            )}
          </div>

          <div className="mt-14 w-full space-y-5">
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 px-1 tracking-wider">Посилання на оплату</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={result?.fullUrl || ''} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-500 outline-none"
                  placeholder="https://bank.gov.ua/qr/..."
                />
                <button 
                  disabled={!result}
                  onClick={() => result && copyToClipboard(result.fullUrl)}
                  className={`p-2.5 rounded-xl border-2 transition-all ${copied ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500'}`}
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 text-left">
              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Надішліть цей QR клієнту. Після сканування у банківському додатку (Monobank, Приват24 тощо) всі дані підтягнуться автоматично.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 w-full max-w-4xl text-center space-y-4">
        <div className="flex items-center justify-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="h-px bg-gray-300 w-12"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Підтримується всіма банками України</span>
          <div className="h-px bg-gray-300 w-12"></div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">
          Дані обробляються виключно у вашому браузері. UkrPay — Слава Україні! 🇺🇦
        </p>
      </footer>
    </div>
  );
};

export default App;
