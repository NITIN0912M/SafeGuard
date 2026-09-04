import React from 'react';
import { 
  Zap, 
  Gift, 
  ShieldCheck, 
  BadgeAlert, 
  Banknote, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { TransactionScenario } from '../types';

interface ScenarioSelectorProps {
  scenarios: TransactionScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenario: TransactionScenario) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'electricity_scam':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'reverse_collect_lottery':
        return <Gift className="w-4 h-4 text-rose-400" />;
      case 'olx_army_qr':
        return <BadgeAlert className="w-4 h-4 text-purple-400" />;
      case 'predatory_loan_mandate':
        return <Banknote className="w-4 h-4 text-orange-400" />;
      case 'telegram_task_investment':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'legit_swiggy_order':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <BadgeAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Preset Real-World UPI Attack Scenarios
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          Click any to simulate live
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {scenarios.map((sc) => {
          const isActive = sc.id === activeScenarioId;
          const isSafe = sc.id === 'legit_swiggy_order';

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200/80">
                    {getIcon(sc.id)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSafe
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {sc.badge}
                  </span>
                </div>
                
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                )}
              </div>

              <div className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight line-clamp-1">
                {sc.title}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100 font-mono">
                <span className="font-bold text-slate-900">₹{sc.amount.toLocaleString('en-IN')}</span>
                <span className="text-slate-500 text-[10px]">{sc.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
