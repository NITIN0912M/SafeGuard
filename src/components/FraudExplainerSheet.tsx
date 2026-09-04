import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  UserX, 
  CheckCircle2, 
  HelpCircle, 
  FileWarning, 
  Lock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Ban,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FraudAnalysisResult, TransactionScenario } from '../types';

interface FraudExplainerSheetProps {
  scenario: TransactionScenario;
  analysis: FraudAnalysisResult;
  isOpen: boolean;
  onCancelAndReport: (reason: string) => void;
  onProceedAnyway: () => void;
}

export const FraudExplainerSheet: React.FC<FraudExplainerSheetProps> = ({
  scenario,
  analysis,
  isOpen,
  onCancelAndReport,
  onProceedAnyway,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIdentityDetails, setShowIdentityDetails] = useState(true);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, boolean>>({});

  const isCritical = analysis.riskLevel === 'CRITICAL';
  const isHigh = analysis.riskLevel === 'HIGH';
  const isSafe = analysis.riskLevel === 'SAFE';

  // Text-To-Speech engine using browser Web Speech API
  const handleVoiceExplanation = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const script = analysis.voiceScript || 
      `Warning! Stop! You are about to pay ${scenario.amount} rupees to ${analysis.identityAudit?.realAccountName || scenario.payeeName}. In UPI, you never enter your PIN to receive money. Press Cancel to protect your account.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Pick an English or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India')) || 
                           voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white border-2 border-red-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Top Control Bar with Audio Explainer and Close / Risk Badge */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono">
              {analysis.riskLevel} FRAUD RISK ALERT
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Pre-PIN Intercept
            </span>
          </div>

          {/* Voice explainer button */}
          <button
            onClick={handleVoiceExplanation}
            title={isSpeaking ? "Stop voice explanation" : "Listen to audio warning in plain language"}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSpeaking 
                ? 'bg-red-600 text-white border-red-500 shadow-md animate-pulse' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Audio Explainer'}</span>
          </button>
        </div>

        {/* Scrollable Explainer Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          
          {/* Main Threat Icon & Headline (Matching Design HTML) */}
          <div className="text-center pt-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-sm">
                !
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {analysis.headline || 'High Fraud Risk Detected'}
            </h1>
            <p className="text-slate-600 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              We have suspended this transaction for your safety before PIN authentication. Our AI detected critical red flags for this specific payment.
            </p>
          </div>

          {/* 3-Column Red Flag Grid (Exact Match from Design HTML) */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center">
              <span className="text-2xl mb-1">🕒</span>
              <span className="text-[11px] font-bold text-red-700 uppercase">Account Age</span>
              <p className="text-xs text-red-600/90 mt-1 font-semibold">
                {analysis.registryInfo?.accountAgeDays ? `${analysis.registryInfo.accountAgeDays} days active` : 'New Mule A/C'}
              </p>
            </div>
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center">
              <span className="text-2xl mb-1">📉</span>
              <span className="text-[11px] font-bold text-red-700 uppercase">Flow Direction</span>
              <p className="text-xs text-red-600/90 mt-1 font-semibold">
                {scenario.direction === 'COLLECT' ? 'Reverse Collect' : 'Push Outbound'}
              </p>
            </div>
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center">
              <span className="text-2xl mb-1">📍</span>
              <span className="text-[11px] font-bold text-red-700 uppercase">Audit Status</span>
              <p className="text-xs text-red-600/90 mt-1 font-semibold truncate max-w-[110px]">
                {analysis.identityAudit?.isMismatch ? 'Name Mismatch' : 'Unregistered P2P'}
              </p>
            </div>
          </div>

          {/* "Why it matters" Container (Exact Match from Design HTML) */}
          <div className="w-full p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2 italic">
              Why it matters
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.theConTrick || analysis.plainExplanation}
            </p>
          </div>

          {/* Core Reality Distortion Breaker: Cashflow Visual Diagram */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Financial Impact Truth
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                Direction: {scenario.direction === 'COLLECT' ? 'YOU ARE DEBITED' : 'OUTBOUND TRANSFER'}
              </span>
            </div>

            {/* Visual Money Flow Diagram */}
            <div className="flex items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Your Bank Account</div>
                <div className="text-base font-extrabold text-red-600 mt-0.5">
                  - ₹{scenario.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-red-700 font-bold uppercase">Debited Immediately</div>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <ArrowRight className="w-5 h-5 text-red-500" />
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">FLOW</span>
              </div>

              <div className="flex-1 text-center">
                <div className="text-[11px] text-slate-500 truncate max-w-[140px] mx-auto font-medium">
                  {analysis.identityAudit?.realAccountName || scenario.legalName || 'Stranger Account'}
                </div>
                <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                  + ₹{scenario.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Credited To Sender</div>
              </div>
            </div>

            {/* Critical Golden Rule Callout */}
            {scenario.direction === 'COLLECT' && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-900 leading-snug">
                  <strong className="font-bold">Golden Rule of UPI:</strong> Entering your 4 or 6-digit UPI PIN is <span className="underline decoration-red-600 font-bold">ALWAYS for paying money out</span>. You NEVER need to enter your PIN to receive money, refunds, or lottery prizes!
                </p>
              </div>
            )}
          </div>

          {/* Identity Forensic Audit: Display Name vs Real Bank Account Name */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <button
              onClick={() => setShowIdentityDetails(!showIdentityDetails)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-amber-600" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-700">
                  Forensic Identity Check
                </span>
                {analysis.identityAudit?.isMismatch && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    MISMATCH DETECTED
                  </span>
                )}
              </div>
              {showIdentityDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showIdentityDetails && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">What is Displayed to You</span>
                    <span className="text-sm font-semibold text-slate-800 block truncate mt-0.5">
                      "{analysis.identityAudit?.displayName || scenario.payeeName}"
                    </span>
                    <span className="text-[10px] text-slate-500">Can be set to any custom text by sender</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-800 uppercase block font-mono font-bold">Bank-Registered Legal Owner</span>
                    <span className="text-sm font-bold text-amber-950 block truncate mt-0.5">
                      "{analysis.identityAudit?.realAccountName || scenario.legalName}"
                    </span>
                    <span className="text-[10px] text-amber-800/80">Verified from NPCI Core Banking Registry</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                    VPA: <strong className="text-slate-800">{scenario.vpa}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                    Category: <strong className="text-slate-800">{analysis.registryInfo?.mccDescription || 'Personal Account'}</strong>
                  </span>
                  {analysis.registryInfo?.ncrpReportCount ? (
                    <span className="px-2.5 py-1 rounded bg-red-100 border border-red-300 text-red-800 font-bold">
                      ⚠️ {analysis.registryInfo.ncrpReportCount} NCRP Cybercrime Complaints
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Audited Evidence Checklist */}
          {analysis.flags && analysis.flags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Detected Red Flags ({analysis.flags.length})
              </span>
              <div className="space-y-2">
                {analysis.flags.map((flag, idx) => (
                  <div
                    key={flag.id || idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      flag.severity === 'CRITICAL'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : flag.severity === 'HIGH'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileWarning className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <div className="font-bold text-slate-900">{flag.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                        {flag.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Interventions Footer (Matching Design HTML Buttons) */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          {/* Primary Action Button: BLOCK & REPORT FRAUD */}
          <button
            id="cancel-and-report-btn"
            onClick={() => onCancelAndReport('User blocked flagged fraudulent UPI transaction')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 sm:py-4.5 rounded-2xl shadow-lg shadow-red-600/20 transition-all text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Ban className="w-5 h-5" />
            <span>BLOCK & REPORT FRAUD</span>
          </button>

          {/* Secondary Action Button: I know this person */}
          <button
            id="proceed-challenge-btn"
            onClick={() => setShowChallengeModal(true)}
            className="px-6 sm:px-8 bg-white border border-slate-300 text-slate-600 font-semibold py-4 sm:py-4.5 rounded-2xl hover:bg-slate-100 transition-all text-sm sm:text-base cursor-pointer shrink-0"
          >
            I know this person
          </button>
        </div>
      </motion.div>

      {/* Safety Verification Challenge Modal (Prevents Coerced Override) */}
      <AnimatePresence>
        {showChallengeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border-2 border-red-200 rounded-3xl p-6 shadow-2xl text-slate-900"
            >
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-lg text-slate-900">Hold On — Verify Safety</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Fraudsters often keep victims on an active phone call instructing them to ignore safety warnings. Answer these 2 quick questions to confirm you are safe:
              </p>

              <div className="space-y-3 text-xs mb-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-2">
                    1. Did someone on WhatsApp, Telegram, or a phone call instruct you to approve this transaction?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChallengeAnswers({ ...challengeAnswers, 1: true })}
                      className={`flex-1 py-2 rounded-lg font-semibold border text-xs transition-all ${
                        challengeAnswers[1] === true ? 'bg-red-100 border-red-400 text-red-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Yes, instructed
                    </button>
                    <button
                      onClick={() => setChallengeAnswers({ ...challengeAnswers, 1: false })}
                      className={`flex-1 py-2 rounded-lg font-semibold border text-xs transition-all ${
                        challengeAnswers[1] === false ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      No, self-initiated
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-2">
                    2. Do you understand that ₹{scenario.amount.toLocaleString('en-IN')} will leave your bank account permanently and CANNOT be recovered?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChallengeAnswers({ ...challengeAnswers, 2: true })}
                      className={`flex-1 py-2 rounded-lg font-semibold border text-xs transition-all ${
                        challengeAnswers[2] === true ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      I understand
                    </button>
                    <button
                      onClick={() => setChallengeAnswers({ ...challengeAnswers, 2: false })}
                      className={`flex-1 py-2 rounded-lg font-semibold border text-xs transition-all ${
                        challengeAnswers[2] === false ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      I expected refund
                    </button>
                  </div>
                </div>
              </div>

              {challengeAnswers[1] === true && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 mb-4">
                  🚨 <strong>Stop immediately!</strong> If an unknown caller instructed you to approve this, you are experiencing active social engineering. Hang up the call!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Back to Safety
                </button>
                <button
                  disabled={challengeAnswers[1] === true || challengeAnswers[2] !== true}
                  onClick={() => {
                    setShowChallengeModal(false);
                    onProceedAnyway();
                  }}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    challengeAnswers[1] === false && challengeAnswers[2] === true
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  Authorize PIN Screen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
