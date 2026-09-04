import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  UserCheck, 
  Clock, 
  Layers,
  AlertTriangle,
  Flame,
  Binary
} from 'lucide-react';
import { FraudAnalysisResult, TransactionScenario } from '../types';

interface ForensicInspectorProps {
  scenario: TransactionScenario;
  analysis: FraudAnalysisResult | null;
  isLoading: boolean;
}

export const ForensicInspector: React.FC<ForensicInspectorProps> = ({
  scenario,
  analysis,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin">
          <Activity className="w-5 h-5" />
        </div>
        <div className="text-sm font-bold text-slate-900">Running Multi-Layer Forensic Telemetry</div>
        <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
          Querying NPCI Directory • Checking NCRP Cybercrime Portal • Synthesizing with Gemini 3.8 Flash...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center text-slate-500 text-xs">
        Select a scenario or trigger analysis to inspect real-time fraud telemetry.
      </div>
    );
  }

  const score = analysis.riskScore;
  const isCritical = analysis.riskLevel === 'CRITICAL';
  const isHigh = analysis.riskLevel === 'HIGH';
  const isSafe = analysis.riskLevel === 'SAFE';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Behind the Shield: Real-Time Forensic Pipeline
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Engine: {analysis.engine || 'Gemini 3.8 Flash + Forensic Telemetry'}
            </p>
          </div>
        </div>

        {/* Risk Score Meter */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
              Calculated Risk Score
            </div>
            <div className={`text-base font-black font-mono ${
              isCritical ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {score} / 100
            </div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${
            isCritical ? 'bg-red-500 animate-ping' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
        </div>
      </div>

      {/* 4-Layer Detection Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Layer 1: Protocol & Cashflow */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-blue-600" />
              L1: Protocol Direction Integrity
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
              scenario.direction === 'COLLECT' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {scenario.direction}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {scenario.direction === 'COLLECT'
              ? 'Flagged: Reverse collect requests initiate an immediate outbound debit authorization upon PIN submission.'
              : 'Standard outbound push payment protocol.'}
          </p>
        </div>

        {/* Layer 2: NPCI Core Directory & Account Age */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              L2: NPCI Central Directory Age
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {analysis.registryInfo?.accountAgeDays || 0} days active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {(analysis.registryInfo?.accountAgeDays || 0) < 15
              ? 'High risk: Sleeper or recently spun mule account with no historic transacting reputation.'
              : 'Matured account history.'}
          </p>
        </div>

        {/* Layer 3: Merchant Category Code (MCC) Verification */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              L3: Merchant Category Code (MCC)
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              MCC {analysis.registryInfo?.mcc || '0000'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {analysis.registryInfo?.isVerifiedMerchant
              ? `Authenticated Corporate Entity: ${analysis.registryInfo.mccDescription}`
              : `Unverified Personal Account (MCC 0000): Claiming commercial or utility status without merchant underwriting.`}
          </p>
        </div>

        {/* Layer 4: National Cybercrime Portal (NCRP) Telemetry */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              L4: National Cybercrime Database (NCRP)
            </span>
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
              (analysis.registryInfo?.ncrpReportCount || 0) > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {analysis.registryInfo?.ncrpReportCount || 0} Reports
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {(analysis.registryInfo?.ncrpReportCount || 0) > 0
              ? 'Blacklist match: This VPA or linked IFSC has been reported by multiple previous victims across India.'
              : 'Clean record: No active fraud complaints filed in the 1930 Cyber Helpline database.'}
          </p>
        </div>
      </div>

      {/* Identity Discrepancy Matrix */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            Identity Verification Matrix
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            NPCI Core Banking Mirror
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px]">
                <th className="pb-2 font-semibold">Field</th>
                <th className="pb-2 font-semibold">Sender's Claim</th>
                <th className="pb-2 font-semibold">Bank Verified Record</th>
                <th className="pb-2 font-semibold">Match Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 text-slate-500 font-sans font-medium">Account Name</td>
                <td className="py-2.5 text-slate-800">{scenario.payeeName}</td>
                <td className="py-2.5 text-amber-700 font-bold">{analysis.identityAudit?.realAccountName || scenario.legalName}</td>
                <td className="py-2.5">
                  {analysis.identityAudit?.isMismatch ? (
                    <span className="text-red-600 font-bold px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-[10px]">
                      MISMATCH
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
                      MATCHED
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-500 font-sans font-medium">VPA Handle</td>
                <td className="py-2.5 text-slate-700">{scenario.vpa}</td>
                <td className="py-2.5 text-slate-700">{analysis.registryInfo?.vpa || scenario.vpa}</td>
                <td className="py-2.5 text-slate-500">RESOLVED</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-500 font-sans font-medium">Entity Type</td>
                <td className="py-2.5 text-slate-700">{scenario.category}</td>
                <td className="py-2.5 text-slate-700">{analysis.registryInfo?.mccDescription}</td>
                <td className="py-2.5">
                  {analysis.registryInfo?.isVerifiedMerchant ? (
                    <span className="text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
                      VERIFIED BIZ
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px]">
                      P2P SAVINGS
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Plain-Language Explainability Matters in Real-Time */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1.5 shadow-xs">
        <div className="font-bold text-blue-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Why This Alert Works in the Moment:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          Traditional security models fail because they display generic warning codes that victims dismiss under pressure. The <strong>Real-Time Fraud Explainer</strong> breaks psychological momentum by explicitly stating <em>financial direction</em> ("You will pay ₹X, not receive it"), showing <em>who actually owns the account</em>, and requiring <em>anti-coercion micro-friction</em> before PIN entry.
        </p>
      </div>
    </div>
  );
};
