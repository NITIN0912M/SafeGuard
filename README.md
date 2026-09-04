# SafeGuard: Real-Time UPI Fraud Explainer & Anti-Coercion Shield

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Empowering Indian digital payment users in the critical 5 seconds before PIN entry with real-time, plain-language fraud explanations and anti-coercion shields.**

---

## 📌 Problem Statement

Unified Payments Interface (UPI) processes billions of transactions every month across India. However, fraudsters increasingly exploit social engineering rather than technical vulnerabilities:
- **Reverse Collect Exploits**: Trick victims into entering their UPI PIN under the false pretext of *"receiving"* money or a refund.
- **Identity Impersonation**: Faking utility boards (MSEDCL/electricity), banks, or defense personnel while the real money transfers to sleeper mule accounts.
- **Psychological Coercion**: High-urgency threats (e.g. *"power cutoff in 15 minutes"*) that bypass rational critical thinking.

Current banking applications only show cryptic alphanumeric VPA strings or generic red banners that users dismiss. **SafeGuard** intercepts suspicious transactions right before the PIN screen, converting forensic telemetry into **plain-language, transparent, empathetic explanations** that everyday users, students, and senior citizens can understand.

---

## ✨ Key Features

### 1. Pre-PIN Interception & Payment Gateway Console
- Simulates real-world payment flows (push payments and collect requests).
- Evaluates transactions in real time prior to triggering the UPI PIN authorization pad.
- Displays clear monetary impact, transaction direction, paying bank details, and beneficiary credentials.

### 2. Enter Custom Amount & People Details
- **Interactive Beneficiary Editor**: Input custom recipient names, UPI IDs / VPAs (`@okaxis`, `@okhdfcbank`, `@paytm`, `@icici`, `@upi`), and transaction notes.
- **Amount Customization**: Numeric input with instant quick-add chips (₹500, ₹1,000, ₹2,500, ₹5,000, ₹25,000, ₹50,000).
- **Flow Direction Toggle**: Test both **COLLECT Requests** (debit demands) and **Direct Outbound PAY**.
- **Real-Time Forensic Audit**: Cross-references input against simulated NPCI Central Directories, account maturity records, and National Cybercrime Reporting Portal (NCRP 1930) complaints.

### 3. Gemini-Powered Plain-Language Fraud Explainer
- Breaks down complex cybercrime patterns into clear, empathetic natural language.
- Explains **The Con Trick** (why the user is being targeted and what will actually happen).
- Generates localized **Audio Voice Warnings** via Speech Synthesis for non-literate or visually impaired users.
- Features multi-model resilient failover (`gemini-3.1-flash-lite`, `gemini-3.8-flash`, `gemini-flash-latest`) to maintain zero downtime during peak traffic spikes.

### 4. The Three Red Flag Pillars
- **🕒 Account Age**: Identifies newly created high-velocity sleeper accounts (< 30 days active).
- **📉 Flow Direction**: Detects reverse-collect frauds where victims are told they are *"receiving"* money.
- **📍 Audit Status**: Audits legal bank KYC registered names against claimed display names to expose identity spoofing.

### 5. Live Security Telemetry Feed
- Real-time event log mimicking NPCI central directories, risk scoring engines, and NCRP 1930 blacklist checks.

### 6. Interactive Anti-Coercion PIN Challenge
- Full 4-digit PIN authorization simulator.
- Anti-coercion reminder ensuring users realize money is permanently leaving their account.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, Motion |
| **Backend** | Node.js, Express, ESBuild, `tsx` |
| **AI / LLM** | `@google/genai` SDK (Google Gemini 3.8 Flash & 3.1 Flash-Lite) |
| **Rule Engine** | Deterministic NPCI Heuristic Engine + Forensic Merchant Registry |
| **Speech** | Web Speech Synthesis API (Audio Voice Explainer) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/safeguard-upi-fraud-explainer.git
cd safeguard-upi-fraud-explainer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
PORT=3000
```

*(Optional: If no API key is provided, the application gracefully operates using its deterministic NPCI heuristic rule engine.)*

### 4. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Architecture

```text
├── src/
│   ├── components/
│   │   ├── PhoneSimulator.tsx      # Payment Gateway Console & Custom Details Editor
│   │   ├── FraudExplainerModal.tsx # Full-screen Forensic Investigation Dialog
│   │   ├── RiskInspector.tsx       # Telemetry risk scoring & verification rules
│   │   ├── CustomSandbox.tsx       # Attack simulator & QR deep-link parser
│   │   ├── ScenarioList.tsx        # Realistic attack scenario selector
│   │   └── EducationalPrinciples.tsx # NPCI/RBI security guidelines & design principles
│   ├── types.ts                    # Global TypeScript interfaces & schemas
│   ├── App.tsx                     # Primary dashboard layout & orchestration
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Tailwind CSS v4 styling
├── server.ts                       # Express backend, Gemini client & NPCI heuristics
├── metadata.json                   # Application metadata & frame permissions
├── package.json                    # Dependencies & build scripts
└── vite.config.ts                  # Vite build configuration
```

---

## 📡 API Reference

### `POST /api/analyze-transaction`
Performs real-time risk assessment and plain-language explanation generation.

**Request Body:**
```json
{
  "vpa": "electricity.msedcl@okaxis",
  "payeeName": "Electricity Board Support",
  "amount": 1420,
  "direction": "COLLECT",
  "urgencyNote": "Pay immediately or power disconnected",
  "smsContext": "Your electricity will be disconnected tonight. Pay ₹1,420 update fee."
}
```

**Response Body:**
```json
{
  "riskScore": 98,
  "riskLevel": "CRITICAL",
  "recommendedIntervention": "BLOCK",
  "headline": "HIGH FRAUD RISK DETECTED",
  "plainExplanation": "Entering your UPI PIN will immediately deduct ₹1,420 from your bank account and send it to an individual, not your electricity board.",
  "theConTrick": "Scammers pose as power officials to induce panic, asking victims to approve a collect request.",
  "voiceScript": "Warning! You are about to pay 1,420 rupees to a personal account...",
  "identityAudit": {
    "displayName": "Electricity Board Support",
    "realAccountName": "Rameshwar Prasad Sahu",
    "isMismatch": true,
    "mismatchExplanation": "The display name claims to be a utility provider, but the receiving bank account belongs to an unregistered individual."
  }
}
```

---

## 🛡️ Regulatory Alignment & Guidelines

This system is engineered in accordance with:
- **Reserve Bank of India (RBI)**: Master Direction on Digital Payment Security Controls.
- **National Payments Corporation of India (NPCI)**: UPI Procedural Guidelines and Circulars on Fraud Mitigation.
- **NCRP (1930 Helpline)**: Ministry of Home Affairs Cyber Crime Coordination Centre (I4C).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
