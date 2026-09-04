import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  MessageSquare, 
  Check, 
  Lock, 
  RefreshCw,
  AlertTriangle,
  Edit3,
  User,
  CreditCard,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { TransactionScenario, FraudAnalysisResult } from '../types';

interface PhoneSimulatorProps {
  scenario: TransactionScenario;
  analysis: FraudAnalysisResult | null;
  isLoading: boolean;
  onTriggerAnalysis: () => void;
  onOpenExplainer: () => void;
  onUpdateScenario?: (updated: TransactionScenario) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  scenario,
  analysis,
  isLoading,
  onTriggerAnalysis,
  onOpenExplainer,
  onUpdateScenario,
}) => {
  // Mode: 'review' (standard transaction review screen) or 'edit' (enter amount & people details)
  const [activeMode, setActiveMode] = useState<'review' | 'edit'>('review');

  // Form states for custom amount & people details
  const [payeeName, setPayeeName] = useState(scenario.payeeName);
  const [vpa, setVpa] = useState(scenario.vpa);
  const [amount, setAmount] = useState<string | number>(scenario.amount);
  const [direction, setDirection] = useState<'COLLECT' | 'PAY'>(scenario.direction);
  const [urgencyNote, setUrgencyNote] = useState(scenario.urgencyNote || '');
  const [smsContext, setSmsContext] = useState(scenario.smsContext || '');

  // PIN flow state
  const [pinInput, setPinInput] = useState('');
  const [pinCompleted, setPinCompleted] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);

  // Sync internal form when external scenario changes (e.g. from preset buttons)
  useEffect(() => {
    setPayeeName(scenario.payeeName);
    setVpa(scenario.vpa);
    setAmount(scenario.amount);
    setDirection(scenario.direction);
    setUrgencyNote(scenario.urgencyNote || '');
    setSmsContext(scenario.smsContext || '');
    setPinInput('');
    setPinCompleted(false);
    setShowPinScreen(false);
  }, [scenario.id, scenario.payeeName, scenario.vpa, scenario.amount, scenario.direction]);

  const isCollect = scenario.direction === 'COLLECT';
  const isSafe = analysis?.riskLevel === 'SAFE';
  const isCritical = analysis?.riskLevel === 'CRITICAL';
  const isHigh = analysis?.riskLevel === 'HIGH';

  const handlePayClick = () => {
    if (analysis && (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH')) {
      onOpenExplainer();
    } else if (analysis && analysis.riskLevel === 'SAFE') {
      setShowPinScreen(true);
    } else {
      onTriggerAnalysis();
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 4) {
        setPinCompleted(true);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setPinCompleted(false);
  };

  const resetPin = () => {
    setPinInput('');
    setPinCompleted(false);
    setShowPinScreen(false);
  };

  const handleSaveAndAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numericAmount = Math.max(1, Number(amount) || 100);

    const updated: TransactionScenario = {
      id: `custom_${Date.now()}`,
      title: `Custom Payment: ${payeeName.trim() || 'Beneficiary'}`,
      badge: 'Custom Entry',
      category: 'User Custom Transfer',
      payeeName: payeeName.trim() || 'Beneficiary Account',
      legalName: payeeName.trim() || 'Beneficiary Account',
      vpa: vpa.trim().toLowerCase() || 'recipient@okaxis',
      amount: numericAmount,
      direction: direction,
      urgencyNote: urgencyNote.trim() || '',
      smsContext: smsContext.trim() || '',
      type: 'Custom User Transfer',
      typicalVictimLoss: `₹${numericAmount.toLocaleString('en-IN')}`,
    };

    if (onUpdateScenario) {
      onUpdateScenario(updated);
    }
    setActiveMode('review');
    setShowPinScreen(false);
  };

  const setPresetQuick = (name: string, upi: string, amt: number, dir: 'COLLECT' | 'PAY', note: string, sms: string) => {
    setPayeeName(name);
    setVpa(upi);
    setAmount(amt);
    setDirection(dir);
    setUrgencyNote(note);
    setSmsContext(sms);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col gap-4 text-slate-900 w-full transition-all">
      {/* Header Bar with Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Payment Gateway Console
            </h2>
            <span className="text-[10px] font-mono text-slate-400">#UPI-409283</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeMode === 'review' ? 'Transaction Review & Pre-PIN Verification' : 'Enter Amount & Beneficiary Details'}
          </p>
        </div>

        {/* Tab switcher: Review vs Custom Details */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('review')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeMode === 'review'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Review Payment
          </button>
          <button
            type="button"
            id="enter-details-tab-btn"
            onClick={() => setActiveMode('edit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'edit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Enter Details</span>
          </button>
        </div>
      </div>

      {/* MODE 1: EDIT AMOUNT AND PEOPLE DETAILS */}
      {activeMode === 'edit' && (
        <form onSubmit={handleSaveAndAnalyze} className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Enter any recipient name, VPA (UPI ID), amount, or message. SafeGuard will simulate NPCI directory checks and analyze for coercion in real time.
            </span>
          </div>

          {/* Quick Fill Preset Templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Quick Fill Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPresetQuick('Electricity Board Support', 'electricity.msedcl@okaxis', 1420, 'COLLECT', 'Pay immediately or power disconnected', 'Your electricity will be disconnected tonight at 9:30 PM. Pay ₹1,420 update fee.')}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                ⚡ Power Disconnection
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick('Amit Singh (OLX Buyer)', 'amit.olx.army@icici', 25000, 'COLLECT', 'Scan QR or Enter PIN to claim payment', 'I am army officer. Sending you ₹25,000 for sofa. Accept collect request.')}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                🛋️ OLX Buyer Collect
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick('Rohit Verma (Friend)', 'rohit.verma@okhdfcbank', 500, 'PAY', 'Dinner split', '')}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                🤝 Safe Friend Transfer
              </button>
            </div>
          </div>

          {/* Amount Field with Quick Add Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Amount (₹) *
              </label>
              <span className="text-[10px] text-slate-400 font-mono">INR</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              <strong>Field Description:</strong> The exact rupee sum of the transaction. Large transfers, round sums, or unexpected charges will be audited against consumer risk patterns.
            </p>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                id="custom-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                min="1"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 text-base font-bold font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[500, 1000, 2500, 5000, 25000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    Number(amount) === val 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* People Details Section */}
          <div className="space-y-3 pt-1">
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Recipient / Beneficiary Details
              </span>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
                <strong>Field Description:</strong> Identity credentials of the person or entity requesting the payment. Used to verify authenticity against NPCI merchant registries.
              </p>

              <div className="space-y-3">
                {/* Payee Name */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Display Name / Person Name *
                  </label>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    The name presented on screen. Checked against official bank KYC account records for mismatches.
                  </span>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="custom-payee-name-input"
                      type="text"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      placeholder="e.g. Electricity Desk, Vikram Malhotra, Customer Helpdesk"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* VPA / UPI ID */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    UPI ID / VPA (Virtual Payment Address) *
                  </label>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    The recipient handle. Evaluated against NCRP cybercrime reports and mule sleeper heuristics.
                  </span>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="custom-vpa-input"
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="e.g. support@okaxis, john.doe@okhdfcbank"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                  {/* Quick VPA handle suggestions */}
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 flex-wrap">
                    <span>Quick Handles:</span>
                    {['@okaxis', '@okhdfcbank', '@paytm', '@icici', '@upi'].map(handle => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const base = vpa.includes('@') ? vpa.split('@')[0] : vpa || 'user';
                          setVpa(base + handle);
                        }}
                        className="font-mono text-blue-600 hover:underline px-1 py-0.5 rounded bg-slate-100 cursor-pointer"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Direction */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Transaction Direction / Settlement Flow
              </label>
              <span className="text-[10px] text-slate-400 block mb-1.5">
                Crucial rule: In UPI, you NEVER enter a PIN to receive money. Collect requests are debit demands.
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('COLLECT')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    direction === 'COLLECT'
                      ? 'bg-red-50 border-red-500 text-red-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className={`w-4 h-4 mt-0.5 ${direction === 'COLLECT' ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <strong className="text-xs block font-bold">COLLECT Request</strong>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      Payee asks you to approve debit
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('PAY')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    direction === 'PAY'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className={`w-4 h-4 mt-0.5 ${direction === 'PAY' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <strong className="text-xs block font-bold">Standard Direct PAY</strong>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      Direct outward transfer
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Transaction Note */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                UPI Note / Attached Message (Optional)
              </label>
              <span className="text-[10px] text-slate-400 block mb-1">
                Deceptive keywords (e.g. "Refund voucher", "Power disconnection", "Claim reward") trigger immediate flag.
              </span>
              <input
                type="text"
                value={urgencyNote}
                onChange={(e) => setUrgencyNote(e.target.value)}
                placeholder="e.g. Enter PIN to accept refund, Urgent bill clearance"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Accompanying SMS/Caller text */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Accompanying Phone Call / SMS Lure Text (Optional)
              </label>
              <span className="text-[10px] text-slate-400 block mb-1">
                The fraudulent social engineering pretext or urgency threat sent to the victim.
              </span>
              <textarea
                rows={2}
                value={smsContext}
                onChange={(e) => setSmsContext(e.target.value)}
                placeholder="e.g. Executive called claiming power will be cut in 10 minutes..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs resize-none"
              />
            </div>
          </div>

          {/* Forensic Guide Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              🛡️ How SafeGuard Analyzes This Input:
            </span>
            <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px] leading-relaxed">
              <li><strong>Cross-KYC Match:</strong> Verifies if claimed name matches legal bank account holder.</li>
              <li><strong>Flow Direction Audit:</strong> Flags reversed collect flows disguised as refunds or cashback.</li>
              <li><strong>NCRP 1930 Blacklist:</strong> Queries National Cybercrime Reporting Portal complaint history.</li>
              <li><strong>AI Plain-Language Explainer:</strong> Explains the exact trick to the user before PIN entry.</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              id="apply-scan-transaction-btn"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply &amp; Scan Transaction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('review')}
              className="py-3.5 px-4 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: TRANSACTION REVIEW & PIN AUTHORIZATION */}
      {activeMode === 'review' && !showPinScreen && (
        <div className="space-y-4">
          {/* External Lure / Trigger Banner if present */}
          {scenario.smsContext && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>External Scam Context (SMS / WhatsApp Lure):</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed italic font-serif">
                "{scenario.smsContext}"
              </p>
            </div>
          )}

          {/* Payee Profile Card with Quick Edit Button */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center text-lg font-bold text-slate-700 shrink-0 shadow-2xs">
                {scenario.payeeName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {scenario.payeeName}
                  </span>
                  {isSafe && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                  {scenario.vpa}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Category: {scenario.category}
                </div>
              </div>
            </div>

            {/* Quick Edit People Details */}
            <button
              type="button"
              onClick={() => setActiveMode('edit')}
              title="Edit Recipient Details"
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Amount & Financial Impact Box with Quick Edit */}
          <div className="py-4 px-5 bg-slate-50/60 rounded-xl border border-slate-200/80 text-center space-y-1 relative group">
            <button
              type="button"
              onClick={() => setActiveMode('edit')}
              className="absolute right-3 top-3 text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200"
            >
              <Edit3 className="w-3 h-3" />
              <span>Change Amount</span>
            </button>

            <div className="text-xs text-slate-500 font-medium">
              Total Transaction Amount
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{scenario.amount.toLocaleString('en-IN')}.00
            </div>
            <div className="text-xs font-semibold text-red-600 pt-1">
              {isCollect 
                ? '⚠️ You are DEBITING your account (Money leaves your bank)' 
                : 'Direct debit from linked bank account'}
            </div>
            {scenario.urgencyNote && (
              <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-200 mt-2 italic">
                Note: "{scenario.urgencyNote}"
              </div>
            )}
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Paying Bank</span>
              <span className="text-slate-800 font-semibold font-mono mt-0.5 block">HDFC Bank •••• 4091</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Settlement Type</span>
              <span className="text-slate-800 font-semibold mt-0.5 block">
                {isCollect ? 'Reverse Collect Flow' : 'Standard Push Pay'}
              </span>
            </div>
          </div>

          {/* Real-time Threat Intercept Card */}
          {analysis && (
            <div 
              onClick={onOpenExplainer}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isCritical 
                  ? 'bg-red-50 border-red-200 hover:bg-red-100/70' 
                  : isHigh 
                  ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70' 
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCritical ? (
                    <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse shrink-0" />
                  ) : isHigh ? (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isSafe ? 'NPCI Verified Safe Entity' : `${analysis.riskLevel} Fraud Risk Intercepted`}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {isSafe 
                        ? 'No previous complaints registered on national databases' 
                        : 'Critical red flags identified. Tap to view forensic explainer.'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700 bg-white px-3 py-1 rounded-lg border border-red-200 shadow-2xs shrink-0">
                  {isSafe ? 'Details' : 'Inspect Alert &gt;'}
                </span>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              id="upi-proceed-button"
              disabled={isLoading}
              onClick={handlePayClick}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99] ${
                isLoading 
                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                  : analysis && (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH')
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Forensic Telemetry...</span>
                </>
              ) : analysis && (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Review Threat Explanation &amp; Protect Account</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize ₹{Number(scenario.amount).toLocaleString('en-IN')} with UPI PIN</span>
                </>
              )}
            </button>

            {/* Test Direct PIN Pad button */}
            {analysis && (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') && (
              <button
                type="button"
                onClick={() => setShowPinScreen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Test Direct PIN Screen (Simulate Overriding)</span>
              </button>
            )}

            <p className="text-[10px] text-center text-slate-400 font-mono">
              Protected by SafeGuard Real-Time Fraud Explainer • NPCI Pre-PIN Shield
            </p>
          </div>
        </div>
      )}

      {/* PIN AUTHORIZATION VIEW */}
      {activeMode === 'review' && showPinScreen && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Enter 4-Digit UPI PIN
            </h3>
            <p className="text-xs text-slate-600">
              Authorizing immediate debit of <strong className="text-slate-900">₹{Number(scenario.amount).toLocaleString('en-IN')}</strong> from HDFC A/C ••4091 to <strong className="text-slate-900">{scenario.payeeName}</strong>
            </p>
          </div>

          {/* PIN Dots Display */}
          <div className="flex justify-center gap-3 my-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pinInput.length > i 
                    ? 'bg-blue-600 border-blue-600 scale-110' 
                    : 'border-slate-300 bg-white'
                }`}
              />
            ))}
          </div>

          {/* Critical Warning Callout */}
          {isCollect && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Reminder:</strong> Entering this PIN will debit your account. Money cannot be retrieved once authorized.
              </span>
            </div>
          )}

          {pinCompleted && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Payment Authorization Submitted</span>
              </div>
              <button 
                onClick={resetPin}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                onClick={() => handlePinDigit(digit)}
                className="py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-base font-bold shadow-2xs active:scale-95 transition-all border border-slate-200 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={resetPin}
              className="py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              className="py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-base font-bold shadow-2xs active:scale-95 transition-all border border-slate-200 cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handlePinBackspace}
              className="py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold active:scale-95 transition-all border border-slate-200 cursor-pointer"
            >
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
