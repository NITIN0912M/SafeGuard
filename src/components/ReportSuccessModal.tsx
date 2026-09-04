import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  FileCheck, 
  Share2, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { TransactionScenario } from '../types';

interface ReportSuccessModalProps {
  scenario: TransactionScenario;
  complaintRef: string;
  onClose: () => void;
}

export const ReportSuccessModal: React.FC<ReportSuccessModalProps> = ({
  scenario,
  complaintRef,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 relative overflow-hidden"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center space-y-1 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            Transaction Aborted • Account Safe
          </span>
          <h3 className="text-xl font-bold text-slate-900 pt-1.5">
            Loss Prevented: ₹{scenario.amount.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-600">
            You successfully stopped the transaction before PIN authentication. No money left your bank account.
          </p>
        </div>

        {/* Action Taken Summary */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5">
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Fraudster Blocked: </strong>
              <span>'{scenario.vpa}' added to local blacklist.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">NCRP Telemetry Logged: </strong>
              <span className="font-mono text-blue-700 font-bold">{complaintRef}</span>
              <span className="text-slate-500 block text-[10px] mt-0.5">
                Forwarded to NPCI National Fraud Exchange (Simulated).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-700">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Account Safety Intact: </strong>
              <span>Never share your 4 or 6-digit PIN with anyone over phone call or SMS.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-sm transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
