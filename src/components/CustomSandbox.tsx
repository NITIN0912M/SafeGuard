import React, { useState } from 'react';
import { 
  Sliders, 
  Send, 
  QrCode, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { TransactionScenario, TransactionDirection } from '../types';

interface CustomSandboxProps {
  onApplyCustomScenario: (scenario: TransactionScenario) => void;
  isLoading: boolean;
}

export const CustomSandbox: React.FC<CustomSandboxProps> = ({
  onApplyCustomScenario,
  isLoading,
}) => {
  const [payeeName, setPayeeName] = useState('Electricity Disconnection Helpline');
  const [vpa, setVpa] = useState('urgent.bill.pay99@okaxis');
  const [amount, setAmount] = useState('2450');
  const [direction, setDirection] = useState<TransactionDirection>('COLLECT');
  const [urgencyNote, setUrgencyNote] = useState('Final notice: Electricity power cutoff in 15 mins. Clear arrears immediately.');
  const [smsContext, setSmsContext] = useState('Dear Consumer, your electricity will be disconnected tonight. Pay via UPI immediately.');
  const [rawQrString, setRawQrString] = useState('');

  const handleParseQr = () => {
    if (!rawQrString) return;
    try {
      // Parse upi://pay?pa=...&pn=...&am=...
      const url = new URL(rawQrString.startsWith('upi://') ? rawQrString.replace('upi://', 'https://dummy.com/') : `https://dummy.com/?${rawQrString}`);
      const pa = url.searchParams.get('pa');
      const pn = url.searchParams.get('pn');
      const am = url.searchParams.get('am');
      const tn = url.searchParams.get('tn');

      if (pa) setVpa(pa);
      if (pn) setPayeeName(decodeURIComponent(pn));
      if (am) setAmount(am);
      if (tn) setUrgencyNote(decodeURIComponent(tn));
    } catch {
      alert('Could not parse UPI string. Format should be upi://pay?pa=...&pn=...&am=...');
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 100;
    
    const customScenario: TransactionScenario = {
      id: `custom_${Date.now()}`,
      title: `Custom Test: ${payeeName}`,
      badge: 'Custom Sandbox',
      category: 'User Custom Simulation',
      vpa,
      payeeName,
      legalName: 'Dynamic Account Holder',
      amount: parsedAmount,
      direction,
      urgencyNote,
      smsContext,
      type: 'Custom User Test Case',
      typicalVictimLoss: `₹${parsedAmount.toLocaleString('en-IN')}`,
    };

    onApplyCustomScenario(customScenario);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Custom Attack Simulator & QR Sandbox
            </h3>
            <p className="text-xs text-slate-500">
              Create an ad-hoc suspicious request or test edge-case lures in real-time
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
          AI Testing Sandbox
        </span>
      </div>

      {/* Quick QR deep link input */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-blue-600" />
          <span>Paste UPI Deep-Link or QR URL (Optional):</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={rawQrString}
            onChange={(e) => setRawQrString(e.target.value)}
            placeholder="upi://pay?pa=scam.desk@okaxis&pn=Electricity&am=1500"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 shadow-xs"
          />
          <button
            type="button"
            onClick={handleParseQr}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
          >
            Extract
          </button>
        </div>
      </div>

      {/* Custom Form */}
      <form onSubmit={handleSimulate} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Display Name */}
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Display Payee Name</label>
            <input
              type="text"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              placeholder="e.g. Amazon Customer Support / MSEDCL"
              required
            />
          </div>

          {/* VPA */}
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Virtual Payment Address (VPA)</label>
            <input
              type="text"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
              placeholder="e.g. support.desk@okhdfcbank"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Amount */}
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500"
              placeholder="1000"
              min="1"
              required
            />
          </div>

          {/* Direction */}
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Transaction Direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('COLLECT')}
                className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  direction === 'COLLECT'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>COLLECT (Debit)</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('PAY')}
                className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  direction === 'PAY'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>PAY (Push)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Urgency Note */}
        <div>
          <label className="text-slate-600 block mb-1 font-semibold">UPI Note / Attached Message</label>
          <input
            type="text"
            value={urgencyNote}
            onChange={(e) => setUrgencyNote(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
            placeholder="e.g. Enter PIN to accept ₹25,000 refund"
          />
        </div>

        {/* SMS Context */}
        <div>
          <label className="text-slate-600 block mb-1 font-semibold">Accompanying Chat / External SMS Text</label>
          <textarea
            rows={2}
            value={smsContext}
            onChange={(e) => setSmsContext(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
            placeholder="e.g. Power disconnection notice tonight 9:30 PM..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Real-Time Intercept Analysis</span>
        </button>
      </form>
    </div>
  );
};
