export type TransactionDirection = 'PAY' | 'COLLECT';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';

export type InterventionType = 'BLOCK' | 'CHALLENGE' | 'PROCEED';

export interface RegistryRecord {
  vpa: string;
  legalName: string;
  displayName: string;
  accountAgeDays: number;
  ncrpReportCount: number;
  mcc: string;
  mccDescription: string;
  isVerifiedMerchant: boolean;
  trustScore: number;
  riskCategory?: string;
}

export interface FraudFlag {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  description: string;
}

export interface IdentityAudit {
  displayName: string;
  realAccountName: string;
  isMismatch: boolean;
  mismatchExplanation: string;
}

export interface FraudAnalysisResult {
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  recommendedIntervention: InterventionType;
  headline?: string;
  plainExplanation: string;
  theConTrick?: string;
  voiceScript?: string;
  identityAudit?: IdentityAudit;
  flags: FraudFlag[];
  whatToDoNow?: string[];
  verificationQuestions?: string[];
  registryInfo?: RegistryRecord;
  engine?: string;
}

export interface TransactionScenario {
  id: string;
  title: string;
  badge: string;
  category: string;
  vpa: string;
  payeeName: string;
  legalName: string;
  amount: number;
  direction: TransactionDirection;
  urgencyNote: string;
  smsContext: string;
  type: string;
  typicalVictimLoss: string;
}
