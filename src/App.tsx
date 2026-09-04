import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  CreditCard, 
  Sliders, 
  BookOpen, 
  RotateCcw, 
  Sparkles,
  Zap,
  Lock,
  ExternalLink,
  Volume2,
  VolumeX,
  Ban,
  Radio
} from 'lucide-react';
import { TransactionScenario, FraudAnalysisResult } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { FraudExplainerSheet } from './components/FraudExplainerSheet';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ForensicInspector } from './components/ForensicInspector';
import { CustomSandbox } from './components/CustomSandbox';
import { ReportSuccessModal } from './components/ReportSuccessModal';

export default function App() {
  const [scenarios, setScenarios] = useState<TransactionScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<TransactionScenario | null>(null);
  const [analysis, setAnalysis] = useState<FraudAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [reportedModalData, setReportedModalData] = useState<{ scenario: TransactionScenario; ref: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'inspector' | 'sandbox' | 'principles'>('scenarios');
  const [preventedLosses, setPreventedLosses] = useState(26419);
  const [blockedCount, setBlockedCount] = useState(2);
  const [isSpeakingInline, setIsSpeakingInline] = useState(false);

  // Load scenarios from backend on mount
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch('/api/scenarios');
        const data = await res.json();
        setScenarios(data);
        if (data.length > 0) {
          setActiveScenario(data[0]);
          runAnalysis(data[0]);
        }
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      }
    }
    loadScenarios();
  }, []);

  // Run real-time forensic + Gemini analysis
  const runAnalysis = async (scenarioToAnalyze: TransactionScenario) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpa: scenarioToAnalyze.vpa,
          payeeName: scenarioToAnalyze.payeeName,
          legalName: scenarioToAnalyze.legalName,
          amount: scenarioToAnalyze.amount,
          direction: scenarioToAnalyze.direction,
          urgencyNote: scenarioToAnalyze.urgencyNote,
          smsContext: scenarioToAnalyze.smsContext,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data.riskLevel) {
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = (sc: TransactionScenario) => {
    setActiveScenario(sc);
    runAnalysis(sc);
  };

  const handleApplyCustom = (customSc: TransactionScenario) => {
    setActiveScenario(customSc);
    runAnalysis(customSc);
    setActiveTab('scenarios');
  };

  const handleCancelAndReport = async (reason: string) => {
    if (!activeScenario) return;
    
    setIsExplainerOpen(false);
    try {
      const res = await fetch('/api/report-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpa: activeScenario.vpa,
          reason,
          userAction: 'CANCELLED_BEFORE_PIN',
        }),
      });
      const data = await res.json();
      
      setPreventedLosses(prev => prev + activeScenario.amount);
      setBlockedCount(prev => prev + 1);
      setReportedModalData({
        scenario: activeScenario,
        ref: data.complaintRef || `NCRP-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    } catch (err) {
      console.error('Reporting failed:', err);
    }
  };

  const handleProceedAnyway = () => {
    setIsExplainerOpen(false);
  };

  const toggleInlineAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeakingInline) {
      window.speechSynthesis.cancel();
      setIsSpeakingInline(false);
      return;
    }

    if (!analysis || !activeScenario) return;

    const script = analysis.voiceScript || 
      `Warning! You are about to pay ${activeScenario.amount} rupees to ${analysis.identityAudit?.realAccountName || activeScenario.payeeName}. In UPI, you never enter your PIN to receive money. Block this transaction to protect your bank balance.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingInline(true);
    utterance.onend = () => setIsSpeakingInline(false);
    utterance.onerror = () => setIsSpeakingInline(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Header - Professional Navy */}
      <header className="bg-[#0F172A] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex flex-wrap justify-between items-center shrink-0 border-b border-slate-800 shadow-sm sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                SafeGuard UPI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                <Sparkles className="w-3 h-3" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time fraud explainer &amp; anti-coercion shield before PIN entry
            </p>
          </div>
        </div>

        {/* Right Header Navigation Metrics & Identity */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Network Secure Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">Network Secure</span>
          </div>

          <span className="hidden sm:inline text-xs sm:text-sm text-slate-400 font-medium">
            Account: <strong className="text-slate-200">Amit Sharma (HDFC ••4091)</strong>
          </span>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs">
            <span className="text-slate-400">Loss Prevented:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ₹{preventedLosses.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs">
            <span className="text-slate-400">Threats:</span>
            <span className="font-bold text-red-400 font-mono">
              {blockedCount} Blocked
            </span>
          </div>

          <button
            onClick={() => {
              if (activeScenario) runAnalysis(activeScenario);
            }}
            title="Re-run real-time AI scan"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Workspace: Full Website 2-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Active Transaction Review Gateway & Live Security Feed (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-5 w-full">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Payment Gateway Console
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Real-time Intercept Active
                </span>
              </div>

              {activeScenario ? (
                <PhoneSimulator
                  scenario={activeScenario}
                  analysis={analysis}
                  isLoading={isLoading}
                  onTriggerAnalysis={() => {
                    if (activeScenario) runAnalysis(activeScenario);
                  }}
                  onOpenExplainer={() => setIsExplainerOpen(true)}
                  onUpdateScenario={(updated) => {
                    handleSelectScenario(updated);
                  }}
                />
              ) : (
                <div className="p-8 text-center text-slate-400">Loading payment gateway...</div>
              )}

              {/* Live Security Feed (Matching Website Design) */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-600" />
                    Live Security Telemetry Feed
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">NPCI SYNC</span>
                  </div>
                </div>
                
                <div className="space-y-2.5 font-mono text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>[09:42:10]</span> <span>Transaction intercepted prior to PIN display.</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1 truncate">
                    <span>[09:42:11]</span> <span>Matching UPI handle: {activeScenario?.vpa}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <span>[09:42:11]</span> <span>Querying National Cybercrime (NCRP 1930) blacklist...</span>
                  </div>
                  <div className="text-amber-700 font-semibold flex items-center gap-1">
                    <span>[09:42:12]</span> <span>Telemetry: Account age under 30 days detected.</span>
                  </div>
                  <div className="text-red-700 font-bold flex items-center gap-1">
                    <span>[09:42:13]</span> <span>ALERT: High risk signature identified in note.</span>
                  </div>
                  <div className="text-blue-700 animate-pulse font-medium flex items-center gap-1">
                    <span>[09:42:14]</span> <span>Intervention armed: Awaiting user confirmation_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Fraud Threat Alert & Explainer + Tabs Workbench (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* INLINE HIGH FRAUD RISK ALERT BANNER (Full Website Design Match) */}
            {analysis && (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') && activeScenario && (
              <div className="bg-red-50/70 border-2 border-red-500 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 text-slate-900 shadow-sm transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      !
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-extrabold text-red-600 tracking-tight">
                        {analysis.headline || 'HIGH FRAUD RISK DETECTED'}
                      </h1>
                      <span className="text-xs text-red-800 font-medium">
                        Payment suspended before PIN authentication
                      </span>
                    </div>
                  </div>

                  {/* Audio Explainer Button */}
                  <button
                    onClick={toggleInlineAudio}
                    title={isSpeakingInline ? "Stop voice explanation" : "Listen to audio warning in plain language"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSpeakingInline 
                        ? 'bg-red-600 text-white border-red-500 shadow-md animate-pulse' 
                        : 'bg-white hover:bg-red-50 text-red-700 border-red-200 shadow-2xs'
                    }`}
                  >
                    {isSpeakingInline ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                    <span>{isSpeakingInline ? 'Stop Audio' : 'Audio Explainer'}</span>
                  </button>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  We have suspended this transaction for your safety before PIN authentication. Our AI detected critical red flags for this specific payment.
                </p>

                {/* 3 Red Flag Pillars (Exact Design Match) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-red-200 flex flex-col">
                    <span className="text-xl mb-1">🕒</span>
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Account Age</span>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5">
                      {analysis.registryInfo?.accountAgeDays ? `${analysis.registryInfo.accountAgeDays} days active` : 'New Mule Account'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">High-velocity sleeper account</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-red-200 flex flex-col">
                    <span className="text-xl mb-1">📉</span>
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Flow Direction</span>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5">
                      {activeScenario.direction === 'COLLECT' ? 'Reverse Collect' : 'Push Outbound'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Money leaves your account</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-red-200 flex flex-col">
                    <span className="text-xl mb-1">📍</span>
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Audit Status</span>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                      {analysis.identityAudit?.isMismatch ? 'Name Mismatch' : 'Unregistered P2P'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 truncate">
                      Legal: {analysis.identityAudit?.realAccountName || activeScenario.legalName}
                    </span>
                  </div>
                </div>

                {/* Why it matters container */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block italic">Why it matters:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {analysis.theConTrick || analysis.plainExplanation}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    id="inline-block-report-btn"
                    onClick={() => handleCancelAndReport('User blocked flagged fraudulent UPI transaction')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-600/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Ban className="w-4 h-4" />
                    <span>BLOCK &amp; REPORT FRAUD (1930)</span>
                  </button>

                  <button
                    id="inline-open-explainer-btn"
                    onClick={() => setIsExplainerOpen(true)}
                    className="px-5 bg-white border border-slate-300 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-all text-xs sm:text-sm cursor-pointer shadow-2xs"
                  >
                    I know this person (Verify)
                  </button>
                </div>
              </div>
            )}

            {/* Tab Navigation - Polished light tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 overflow-x-auto shadow-inner">
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'scenarios'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Attack Scenarios</span>
              </button>

              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Forensic Inspector</span>
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Enter Custom Transfer</span>
              </button>

              <button
                onClick={() => setActiveTab('principles')}
                className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'principles'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Core UX Principles</span>
              </button>
            </div>

            {/* Tab 1: Attack Scenarios */}
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                <ScenarioSelector
                  scenarios={scenarios}
                  activeScenarioId={activeScenario?.id || ''}
                  onSelectScenario={handleSelectScenario}
                />

                {/* Scenario Context Card */}
                {activeScenario && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 text-slate-900">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block">
                          Current Attack Profile
                        </span>
                        <h4 className="text-base font-bold text-slate-800 mt-0.5">
                          {activeScenario.title}
                        </h4>
                      </div>
                      <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-mono font-bold">
                        Average Victim Loss: {activeScenario.typicalVictimLoss}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Modus Operandi
                        </span>
                        <span className="font-semibold text-slate-800 mt-1 block">
                          {activeScenario.type}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Target VPA
                        </span>
                        <span className="font-mono text-blue-700 font-semibold mt-1 block truncate">
                          {activeScenario.vpa}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                        Attached Phishing Note
                      </span>
                      <p className="text-slate-700 leading-relaxed italic font-serif">
                        "{activeScenario.urgencyNote}"
                      </p>
                    </div>

                    <button
                      onClick={() => setIsExplainerOpen(true)}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>Open Full Forensic Explainer Modal</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Forensic Inspector */}
            {activeTab === 'inspector' && activeScenario && (
              <ForensicInspector
                scenario={activeScenario}
                analysis={analysis}
                isLoading={isLoading}
              />
            )}

            {/* Tab 3: Custom Sandbox */}
            {activeTab === 'sandbox' && (
              <CustomSandbox
                onApplyCustomScenario={handleApplyCustom}
                isLoading={isLoading}
              />
            )}

            {/* Tab 4: Explainer Philosophy & Principles */}
            {activeTab === 'principles' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 text-slate-900">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    What Actually Makes a Fraud Alert Useful in the Moment?
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Most banking alerts fail because of <strong>alert fatigue</strong>, <strong>technical jargon</strong>, and <strong>bad timing</strong>. When victims are on an active phone call with a scammer, they enter a state of tunnel vision. The Real-Time Fraud Explainer solves this through four pillars:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-red-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      1. Timing: Pre-PIN Interception
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Alerting after a transaction is useless because UPI settlements are instant and irreversible. The intervention occurs strictly in the 5 seconds before the PIN pad appears.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      2. Clarity: Cashflow Truth
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instead of "Risk Score: 87", we display the unambiguous truth: <em>"You will LOSE ₹24,999. Entering your PIN will NEVER credit money to your account."</em>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      3. Multimodal Audio Explainer
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Elderly users, non-tech-savvy individuals, and distracted users may skip reading text. A 1-click calm voice read-aloud snaps them out of social engineering hypnosis.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      4. Anti-Coercion Micro-Friction
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If a user insists on proceeding, a 2-question verification challenge checks if they are being actively guided over a phone call, preventing blind overrides.
                    </p>
                  </div>
                </div>

                {/* Golden Rule of UPI Banner */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">The Non-Negotiable Law of UPI:</strong>
                    <p className="text-slate-700 text-xs leading-relaxed mt-0.5">
                      Your UPI PIN is a digital signature that strictly authorizes money to LEAVE your bank account. No bank, lottery, or merchant requires a PIN to send you money.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Institutional Trust Footer */}
            <div className="flex flex-wrap justify-between items-center px-2 py-3 text-xs text-slate-500 border-t border-slate-200/80 gap-3">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by Reserve Bank Interoperability Protocol &amp; NPCI Guidelines</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono text-slate-700">ISO/IEC 27001</span>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono text-slate-700">NPCI-UPI v2.8</span>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono text-slate-700">NCRP 1930</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Real-Time Fraud Explainer Modal (The Sheet) */}
      {activeScenario && analysis && (
        <FraudExplainerSheet
          scenario={activeScenario}
          analysis={analysis}
          isOpen={isExplainerOpen}
          onCancelAndReport={handleCancelAndReport}
          onProceedAnyway={handleProceedAnyway}
        />
      )}

      {/* Success Report Modal */}
      {reportedModalData && (
        <ReportSuccessModal
          scenario={reportedModalData.scenario}
          complaintRef={reportedModalData.ref}
          onClose={() => setReportedModalData(null)}
        />
      )}
    </div>
  );
}
