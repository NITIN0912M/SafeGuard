import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Mock NPCI / Bank registry database for known scam signatures & verification
interface RegistryRecord {
  vpa: string;
  legalName: string;
  displayName: string;
  accountAgeDays: number;
  ncrpReportCount: number;
  mcc: string;
  mccDescription: string;
  isVerifiedMerchant: boolean;
  trustScore: number; // 0 to 100
  riskCategory?: string;
}

const REGISTRY_DB: Record<string, RegistryRecord> = {
  "electricity.bill.desk91@okaxis": {
    vpa: "electricity.bill.desk91@okaxis",
    legalName: "Rameshwar Prasad Sahu",
    displayName: "Electricity Bill Desk / MSEDCL",
    accountAgeDays: 4,
    ncrpReportCount: 47,
    mcc: "0000",
    mccDescription: "Personal / Uncategorized P2P",
    isVerifiedMerchant: false,
    trustScore: 4,
    riskCategory: "Impersonation of Public Utility",
  },
  "army.canteen.advance@paytm": {
    vpa: "army.canteen.advance@paytm",
    legalName: "Dinesh Kumar Yadav",
    displayName: "Subedar R.K. Sharma (Army Canteen)",
    accountAgeDays: 9,
    ncrpReportCount: 82,
    mcc: "0000",
    mccDescription: "Personal Account",
    isVerifiedMerchant: false,
    trustScore: 8,
    riskCategory: "Marketplace Advance / Army Officer Scam",
  },
  "lottery.reward.kbc2025@ybl": {
    vpa: "lottery.reward.kbc2025@ybl",
    legalName: "Gulab Telecom Services",
    displayName: "KBC 25 Lakh Lucky Draw Refund",
    accountAgeDays: 2,
    ncrpReportCount: 114,
    mcc: "7995",
    mccDescription: "Gambling & Wagering (Prohibited)",
    isVerifiedMerchant: false,
    trustScore: 2,
    riskCategory: "Reverse Collect / Fake Refund Trap",
  },
  "quickcash.speedyloan@ibl": {
    vpa: "quickcash.speedyloan@ibl",
    legalName: "FastCredit Finserv Pvt Ltd (Unregistered)",
    displayName: "Instant Rupee Loan Recovery",
    accountAgeDays: 18,
    ncrpReportCount: 31,
    mcc: "6012",
    mccDescription: "High-risk Financial Services",
    isVerifiedMerchant: false,
    trustScore: 19,
    riskCategory: "Scam Instant Loan App Harassment",
  },
  "telegram.task.payout@icici": {
    vpa: "telegram.task.payout@icici",
    legalName: "Sunil Kumar Varma",
    displayName: "YouTube VIP Tasks Merchant",
    accountAgeDays: 6,
    ncrpReportCount: 63,
    mcc: "0000",
    mccDescription: "Personal Account",
    isVerifiedMerchant: false,
    trustScore: 12,
    riskCategory: "Part-Time Job / Task Investment Fraud",
  },
  "swiggy.pay@icici": {
    vpa: "swiggy.pay@icici",
    legalName: "Bundl Technologies Private Limited",
    displayName: "Swiggy Orders",
    accountAgeDays: 2190,
    ncrpReportCount: 0,
    mcc: "5812",
    mccDescription: "Verified Food & Delivery Merchant",
    isVerifiedMerchant: true,
    trustScore: 99,
  },
  "zepto.online@hdfcbank": {
    vpa: "zepto.online@hdfcbank",
    legalName: "Kiranakart Technologies Private Limited",
    displayName: "Zepto Quick Commerce",
    accountAgeDays: 1460,
    ncrpReportCount: 0,
    mcc: "5411",
    mccDescription: "Verified Grocery Merchant",
    isVerifiedMerchant: true,
    trustScore: 98,
  },
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// API: Get pre-built simulation scenarios
app.get("/api/scenarios", (req, res) => {
  const scenarios = [
    {
      id: "electricity_scam",
      title: "Electricity Disconnection Scam",
      badge: "High Urgency Threat",
      category: "Utility Impersonation",
      vpa: "electricity.bill.desk91@okaxis",
      payeeName: "Electricity Bill Desk / MSEDCL",
      legalName: "Rameshwar Prasad Sahu",
      amount: 1420,
      direction: "COLLECT",
      urgencyNote: "URGENT: Power disconnection notice tonight 9:30 PM. Pay bill ₹1420 now to avoid cutoff.",
      smsContext: "Dear Consumer, your electricity power will be disconnected at 9:30 tonight from the power office because your previous month bill was not updated. Please immediately contact our officer and pay via UPI.",
      type: "SMS Phishing + Collect Request",
      typicalVictimLoss: "₹1,420 to ₹50,000",
    },
    {
      id: "reverse_collect_lottery",
      title: "Reverse Collect / Cashback Refund Trap",
      badge: "Inverse Money Flow",
      category: "Reverse Charge Scam",
      vpa: "lottery.reward.kbc2025@ybl",
      payeeName: "KBC 25 Lakh Lucky Draw Refund",
      legalName: "Gulab Telecom Services",
      amount: 24999,
      direction: "COLLECT",
      urgencyNote: "Pay ₹24,999 to authenticate your bank account and release ₹25,00,000 cash prize. Enter UPI PIN to receive.",
      smsContext: "Congratulations! You won ₹25,00,000 in PhonePe Lucky Draw. Accept collect request and enter UPI PIN to receive direct credit to account.",
      type: "Reverse Collect Request Deception",
      typicalVictimLoss: "₹24,999",
    },
    {
      id: "olx_army_qr",
      title: "OLX 'Army Officer' Advance QR Scam",
      badge: "QR Parameter Spoof",
      category: "Marketplace Fraud",
      vpa: "army.canteen.advance@paytm",
      payeeName: "Subedar R.K. Sharma (Army Canteen)",
      legalName: "Dinesh Kumar Yadav",
      amount: 12500,
      direction: "PAY",
      urgencyNote: "Army cantonment token advance. Scan QR and approve transfer to confirm sofa purchase.",
      smsContext: "Sir, I am posted in Army base. I cannot visit in person. I am sending an Army merchant QR to deposit ₹12,500 advance into your bank account. Scan and enter PIN.",
      type: "Fake QR Payment disguised as Receive",
      typicalVictimLoss: "₹12,500",
    },
    {
      id: "predatory_loan_mandate",
      title: "Scam Instant Loan Extortion Autopay",
      badge: "Recurring Autopay Trap",
      category: "Predatory Lending",
      vpa: "quickcash.speedyloan@ibl",
      payeeName: "Instant Rupee Loan Recovery",
      legalName: "FastCredit Finserv Pvt Ltd (Unregistered)",
      amount: 8500,
      direction: "COLLECT",
      urgencyNote: "Overdue loan fee settlement. Failure to pay within 5 mins will trigger contact list distribution.",
      smsContext: "Final Legal Warning: Pay processing fee ₹8,500 right now or we will send your PAN & selfie to all your phonebook contacts.",
      type: "Blackmail & Unauthorized Mandate",
      typicalVictimLoss: "₹8,500 recurring",
    },
    {
      id: "telegram_task_investment",
      title: "Part-Time Task / Telegram Job Scam",
      badge: "Advance Fee Scam",
      category: "Job & Investment Trap",
      vpa: "telegram.task.payout@icici",
      payeeName: "YouTube VIP Tasks Merchant",
      legalName: "Sunil Kumar Varma",
      amount: 5000,
      direction: "PAY",
      urgencyNote: "Pre-paid task #4 deposit. Complete this payment to unlock your ₹18,400 earned salary withdrawal.",
      smsContext: "Dear Candidate, you have completed 3 tasks. To withdraw your ₹18,400 balance, you must recharge task wallet with ₹5,000 security pledge immediately.",
      type: "Sunk-Cost Task Investment",
      typicalVictimLoss: "₹5,000 to ₹2,00,000",
    },
    {
      id: "legit_swiggy_order",
      title: "Legitimate Merchant: Swiggy Food Delivery",
      badge: "Verified Merchant",
      category: "Normal Commerce",
      vpa: "swiggy.pay@icici",
      payeeName: "Swiggy Orders",
      legalName: "Bundl Technologies Private Limited",
      amount: 489,
      direction: "PAY",
      urgencyNote: "Payment for Order #SW91823791 at Biryani By The Kilo",
      smsContext: "Order confirmation pending. Pay ₹489 to finalize your delivery.",
      type: "Genuine Verified E-Commerce",
      typicalVictimLoss: "₹0 (Legitimate)",
    },
  ];
  res.json(scenarios);
});

// API: Lookup VPA in simulated registry
app.get("/api/vpa-lookup", (req, res) => {
  const vpa = String(req.query.vpa || "").toLowerCase().trim();
  if (!vpa) {
    res.status(400).json({ error: "VPA required" });
    return;
  }

  const existing = REGISTRY_DB[vpa];
  if (existing) {
    res.json(existing);
    return;
  }

  // Generate synthetic analysis for ad-hoc custom VPA
  const isPersonalHandle = vpa.includes("@okhdfcbank") || vpa.includes("@oksbi") || vpa.includes("@paytm") || vpa.includes("@ybl") || vpa.includes("@ibl");
  const hasSuspiciousWords = /(refund|reward|lottery|prize|canteen|officer|desk|msedcl|bescom|support|care|helpline|cashback)/i.test(vpa);
  
  res.json({
    vpa,
    legalName: hasSuspiciousWords ? "Unknown Individual (Unregistered Name)" : "Simulated P2P User",
    displayName: vpa.split("@")[0].replace(/\./g, " ").toUpperCase(),
    accountAgeDays: hasSuspiciousWords ? 5 : 450,
    ncrpReportCount: hasSuspiciousWords ? 18 : 0,
    mcc: hasSuspiciousWords ? "0000" : "0000",
    mccDescription: "Personal P2P Account",
    isVerifiedMerchant: false,
    trustScore: hasSuspiciousWords ? 24 : 75,
    riskCategory: hasSuspiciousWords ? "Suspected Ad-hoc Impersonation" : "Normal Personal Account",
  });
});

// Helper for local fallback heuristic analysis if Gemini API is absent or unavailable
function generateHeuristicExplanation(params: {
  vpa: string;
  payeeName: string;
  legalName?: string;
  amount: number;
  direction: "COLLECT" | "PAY";
  urgencyNote?: string;
  smsContext?: string;
  registryInfo?: RegistryRecord;
}) {
  const { vpa, payeeName, legalName, amount, direction, urgencyNote = "", smsContext = "", registryInfo } = params;
  
  const textCorpus = `${vpa} ${payeeName} ${urgencyNote} ${smsContext}`.toLowerCase();
  
  const isCollect = direction === "COLLECT";
  const hasUrgency = /(urgent|disconnect|cut off|immediate|tonight|legal action|police|fir|block|freeze|within 5 min|within 10 min)/i.test(textCorpus);
  const mentionsRefundOrPrize = /(refund|lottery|cashback|reward|kbc|congratulations|crorepati|won|prize|canteen)/i.test(textCorpus);
  const mentionsUtility = /(electricity|bill|msedcl|bescom|power|meter|tneb|water|challan)/i.test(textCorpus);
  const mentionsJobOrTask = /(task|telegram|prepaid|vip|deposit|recharge wallet|youtube like)/i.test(textCorpus);
  const mentionsLoan = /(loan|nbfc|overdue|emi|contact list|harass|recovery|cibil)/i.test(textCorpus);

  // Check name discrepancy
  const resolvedLegal = legalName || registryInfo?.legalName || "";
  const nameMismatch = resolvedLegal && payeeName && !resolvedLegal.toLowerCase().includes(payeeName.toLowerCase().split(" ")[0]);

  const flags: Array<{ id: string; title: string; severity: "HIGH" | "CRITICAL" | "MEDIUM" | "INFO"; description: string }> = [];
  let riskScore = 0; // 0 to 100

  // Check 1: Collect Request Deception
  if (isCollect) {
    if (mentionsRefundOrPrize) {
      flags.push({
        id: "reverse_collect_trap",
        title: "CRITICAL: Reverse Collect Deception",
        severity: "CRITICAL",
        description: `This transaction is a COLLECT REQUEST for ₹${amount.toLocaleString('en-IN')}. The requester claims you will RECEIVE money, but entering your UPI PIN will immediately DEDUCT ₹${amount.toLocaleString('en-IN')} from your account. You NEVER need to enter a PIN to receive money.`,
      });
      riskScore += 50;
    } else {
      flags.push({
        id: "collect_request_debit",
        title: "Collect Request Alert",
        severity: "HIGH",
        description: `Someone is requesting you to pay ₹${amount.toLocaleString('en-IN')}. Entering your PIN authorizes a debit. Only enter your PIN if you deliberately intended to send this payment.`,
      });
      riskScore += 25;
    }
  }

  // Check 2: Name Mismatch & Impersonation
  if (nameMismatch) {
    flags.push({
      id: "name_mismatch",
      title: "Identity Mismatch Detected",
      severity: "CRITICAL",
      description: `The display name is '${payeeName}', but the bank-registered legal account holder is '${resolvedLegal}'. Scammers frequently alter display names to imitate companies or officers.`,
    });
    riskScore += 30;
  }

  // Check 3: Public Utility or Government Impersonation
  if (mentionsUtility && (!registryInfo?.isVerifiedMerchant || registryInfo?.mcc === "0000")) {
    flags.push({
      id: "fake_utility",
      title: "Unverified Personal Account Posing as Utility",
      severity: "CRITICAL",
      description: `Official electricity boards and utilities never collect bill payments via personal UPI accounts (MCC 0000). They use verified BBPS or corporate merchant handles.`,
    });
    riskScore += 35;
  }

  // Check 4: High Pressure / Panic Tactics
  if (hasUrgency) {
    flags.push({
      id: "urgency_panic",
      title: "Artificial Panic & Rush Tactic",
      severity: "HIGH",
      description: `Messages threatening immediate disconnection, legal notices, or strict short deadlines are designed to bypass your rational judgment before you can double check.`,
    });
    riskScore += 20;
  }

  // Check 5: Task / Prepaid Investment Trap
  if (mentionsJobOrTask) {
    flags.push({
      id: "task_investment_trap",
      title: "Classic Task / Prepaid Refund Pyramid",
      severity: "HIGH",
      description: `Legitimate employers never demand an upfront 'recharge deposit' to release earned earnings or commission. This is a common cyber-crime pipeline.`,
    });
    riskScore += 30;
  }

  // Check 6: Registry complaints
  if (registryInfo && registryInfo.ncrpReportCount > 5) {
    flags.push({
      id: "ncrp_complaints",
      title: `${registryInfo.ncrpReportCount} Cybercrime Complaints on Record`,
      severity: "CRITICAL",
      description: `This specific UPI ID has been repeatedly reported to the National Cyber Crime Reporting Portal (NCRP) by victims of unauthorized debit frauds.`,
    });
    riskScore += 35;
  }

  // Check 7: Account age
  if (registryInfo && registryInfo.accountAgeDays < 15 && !registryInfo.isVerifiedMerchant) {
    flags.push({
      id: "fresh_account",
      title: `Recently Activated Account (${registryInfo.accountAgeDays} days old)`,
      severity: "MEDIUM",
      description: `Fraud networks constantly discard and spin up temporary mule bank accounts. This account was activated very recently.`,
    });
    riskScore += 15;
  }

  // Normalize score
  riskScore = Math.min(100, Math.max(0, riskScore));
  let riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE" = "SAFE";
  let recommendedIntervention: "BLOCK" | "CHALLENGE" | "PROCEED" = "PROCEED";

  if (registryInfo?.isVerifiedMerchant && riskScore < 20) {
    riskLevel = "SAFE";
    recommendedIntervention = "PROCEED";
  } else if (riskScore >= 60 || flags.some(f => f.severity === "CRITICAL")) {
    riskLevel = "CRITICAL";
    recommendedIntervention = "BLOCK";
  } else if (riskScore >= 30) {
    riskLevel = "HIGH";
    recommendedIntervention = "CHALLENGE";
  } else if (riskScore > 10) {
    riskLevel = "MEDIUM";
    recommendedIntervention = "CHALLENGE";
  }

  const plainExplanation = isCollect && mentionsRefundOrPrize
    ? `STOP: You are about to send ₹${amount.toLocaleString('en-IN')} to a stranger, NOT receive money. The scammer sent a Collect Request disguised as a prize. Entering your 4 or 6-digit PIN will permanently deduct this sum from your bank account.`
    : mentionsUtility && nameMismatch
    ? `DANGER: The display says '${payeeName}', but your money is going directly into a personal account registered to '${resolvedLegal}'. Real electricity boards do not take payments into personal UPI handles.`
    : riskLevel === "SAFE"
    ? `Verified Merchant: This transaction is directed to ${payeeName} (${resolvedLegal}), an authenticated business with no fraud reports.`
    : `Suspicious Payment Request: Our forensic checks detected ${flags.length} red flags including ${flags[0]?.title || "unverified account signals"}. Proceed with extreme caution.`;

  const voiceScript = isCollect && mentionsRefundOrPrize
    ? `Warning! Please stop! You are about to pay ${amount} rupees, not receive it. Never enter your UPI PIN to claim a lottery, reward, or refund. Press Cancel now.`
    : mentionsUtility
    ? `Alert! This electricity bill request is fake. Your money will go to a personal account belonging to ${resolvedLegal}, not the official power company. Do not pay.`
    : riskLevel === "SAFE"
    ? `This merchant is verified and safe. You may proceed with your payment.`
    : `Caution. This transaction has suspicious signs. Please verify the recipient before entering your PIN.`;

  return {
    riskScore,
    riskLevel,
    recommendedIntervention,
    plainExplanation,
    voiceScript,
    flags,
    theConTrick: isCollect
      ? "The 'Reverse Collect' Trick: Making victims believe typing their PIN is an authentication code to claim winnings, when in UPI protocol it exclusively signs an outbound money transfer."
      : mentionsUtility
      ? "The 'Impending Cutoff' Panic: Exploiting fear of losing home electricity at night so victims rush to transfer money to a private scammer's bank account."
      : mentionsJobOrTask
      ? "The 'Advance Fee' Trap: Fabricating high virtual earnings on a screen that can only be unlocked by depositing real personal cash."
      : "Unverified P2P Transfer: Transferring funds to an individual account without merchant purchase protection or verified credentials.",
    verificationQuestions: [
      "Did someone on a phone call or chat tell you to enter your PIN to 'receive' money?",
      "Are you 100% sure this payment is going to the legal entity, not a private individual?",
      "Was this transaction requested with high urgency or threats of disconnection?",
    ],
  };
}

// API: Real-time fraud analysis endpoint (powered by Gemini + Forensics)
app.post("/api/analyze-transaction", async (req, res) => {
  try {
    const {
      vpa,
      payeeName,
      legalName,
      amount,
      direction = "PAY",
      urgencyNote = "",
      smsContext = "",
      qrPayload = "",
    } = req.body;

    if (!vpa || !payeeName || typeof amount !== "number") {
      res.status(400).json({ error: "Missing required fields: vpa, payeeName, amount" });
      return;
    }

    // Lookup known registry record or construct baseline
    const normalizedVpa = vpa.toLowerCase().trim();
    const registryInfo = REGISTRY_DB[normalizedVpa] || {
      vpa: normalizedVpa,
      legalName: legalName || "Unknown Account Holder",
      displayName: payeeName,
      accountAgeDays: 14,
      ncrpReportCount: 0,
      mcc: "0000",
      mccDescription: "Uncategorized P2P Account",
      isVerifiedMerchant: false,
      trustScore: 50,
    };

    // Calculate deterministic base
    const baseAnalysis = generateHeuristicExplanation({
      vpa: normalizedVpa,
      payeeName,
      legalName: legalName || registryInfo.legalName,
      amount,
      direction,
      urgencyNote,
      smsContext,
      registryInfo,
    });

    // Try Gemini AI enhancement with resilient multi-model failover (handles 503 spikes gracefully)
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are a real-time UPI Fraud Explainer engine protecting Indian digital payment users in the 5 seconds before they enter their UPI PIN.
Analyze this incoming transaction and deliver a crystal-clear, transparent, empathetic, jargon-free explanation that an everyday user, senior citizen, or student can immediately understand and trust.

TRANSACTION CONTEXT:
- Requested Amount: ₹${amount}
- UPI Direction: ${direction} (${direction === "COLLECT" ? "Reversing flow: The other party is REQUESTING a debit from the user" : "User is initiating outbound transfer"})
- Recipient VPA / Virtual Address: ${vpa}
- Display Payee Name: "${payeeName}"
- Bank Registered Legal Name: "${registryInfo.legalName}"
- Merchant Category Code (MCC): ${registryInfo.mcc} (${registryInfo.mccDescription})
- Is Verified Merchant: ${registryInfo.isVerifiedMerchant}
- Account Age: ${registryInfo.accountAgeDays} days
- National Cyber Crime Reporting Portal (NCRP) scam complaints: ${registryInfo.ncrpReportCount}
- Accompanying Note / Message: "${urgencyNote}"
- SMS / Chat Context: "${smsContext}"
- QR Deep Link Payload: "${qrPayload}"

CRITICAL UPI FACTS TO REINFORCE:
1. Entering a UPI PIN ALWAYS deducts money from your account. You NEVER need to enter a PIN to receive money, refunds, lottery, or rewards.
2. Official utilities and merchants (Tata Power, MSEDCL, Amazon, Swiggy) use verified merchant accounts with corporate names, not personal accounts (like Rameshwar Sahu).

TASK:
Provide your evaluation in strict JSON with the following structure:
{
  "riskScore": <integer 0 to 100>,
  "riskLevel": "<CRITICAL | HIGH | MEDIUM | SAFE>",
  "recommendedIntervention": "<BLOCK | CHALLENGE | PROCEED>",
  "headline": "<punchy 4-8 word alert headline>",
  "plainExplanation": "<1-2 clear, compassionate, direct sentences explaining EXACTLY what will happen if they enter their PIN>",
  "theConTrick": "<Plain English explanation of the psychological manipulation trick being used>",
  "identityAudit": {
    "displayName": "${payeeName}",
    "realAccountName": "${registryInfo.legalName}",
    "isMismatch": <true if display differs suspiciously from legal name>,
    "mismatchExplanation": "<Explanation of why the name difference is dangerous or benign>"
  },
  "flags": [
    {
      "id": "<flag_slug>",
      "title": "<Concise flag title>",
      "severity": "<CRITICAL | HIGH | MEDIUM | INFO>",
      "description": "<Clear explanation of why this is a red flag>"
    }
  ],
  "whatToDoNow": [
    "<Immediate action step 1>",
    "<Immediate action step 2>"
  ],
  "voiceScript": "<Natural, calm, authoritative 15-word spoken voice warning suitable for Text-To-Speech>"
}
`;

      // Candidate models ordered for optimal reliability and fast response during traffic spikes
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
      let aiAnalysisResult: any = null;
      let usedModelName = "";

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const parsed = JSON.parse(response.text || "{}");
          if (parsed && parsed.riskLevel && parsed.plainExplanation) {
            aiAnalysisResult = parsed;
            usedModelName = modelName;
            break; // Successfully generated, break out of failover loop
          }
        } catch (err: any) {
          // If a model is experiencing high demand (503 / 429), gracefully try the next model without crashing
          const status = err?.status || err?.code || "";
          console.info(`[Gemini Engine] Model ${modelName} returned status ${status}. Failover to next candidate.`);
          // Brief pause before trying next candidate
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (aiAnalysisResult) {
        res.json({
          ...baseAnalysis,
          ...aiAnalysisResult,
          registryInfo,
          engine: `${usedModelName} + Forensic Registry`,
        });
        return;
      }
    }

    // Fallback heuristic response
    res.json({
      ...baseAnalysis,
      headline: baseAnalysis.riskLevel === "CRITICAL"
        ? "Dangerous Transaction Detected"
        : baseAnalysis.riskLevel === "SAFE"
        ? "Verified Safe Merchant"
        : "Suspicious Payment Alert",
      identityAudit: {
        displayName: payeeName,
        realAccountName: registryInfo.legalName,
        isMismatch: registryInfo.legalName.toLowerCase() !== payeeName.toLowerCase() && !registryInfo.isVerifiedMerchant,
        mismatchExplanation: registryInfo.isVerifiedMerchant
          ? "Merchant registered name matches verified corporate entity."
          : `The display name is '${payeeName}', but money will be deposited into '${registryInfo.legalName}'.`,
      },
      whatToDoNow: baseAnalysis.riskLevel === "CRITICAL"
        ? [
            "Do NOT enter your 4 or 6-digit UPI PIN.",
            "Tap 'Cancel & Block' to protect your account.",
            "If someone is on the phone asking you to pay, hang up immediately.",
          ]
        : [
            "Confirm the payee identity directly before paying.",
            "Verify official portal or application rather than WhatsApp/SMS links.",
          ],
      registryInfo,
      engine: "Deterministic Forensic Rule Engine",
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze transaction" });
  }
});

// API: Record a user feedback / report event
app.post("/api/report-fraud", (req, res) => {
  const { vpa, reason, userAction } = req.body;
  console.log(`[FRAUD_REPORT] VPA: ${vpa} | Reason: ${reason} | Action: ${userAction}`);
  res.json({
    success: true,
    message: "Report logged with National Fraud Telemetry Network (Simulated)",
    complaintRef: "NCRP-" + Math.floor(100000 + Math.random() * 900000),
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Real-Time Fraud Explainer server running on http://localhost:${PORT}`);
  });
}

startServer();
