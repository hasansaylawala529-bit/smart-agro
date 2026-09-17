# Smart Agro AI — Intelligent Agriculture Decision Support Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=flat-square&logo=vercel)](https://smart-agro-ashy-one.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8e75ff?style=flat-square&logo=google)](https://ai.google.dev/)

An intelligent, cloud-enabled precision agriculture advisory platform engineered specifically for Indian farmers, featuring localized intelligence across all **36 districts of Maharashtra** with complete trilingual support (**English**, **हिंदी**, **मराठी**).

🌐 **Live Application:** [https://smart-agro-ashy-one.vercel.app/](https://smart-agro-ashy-one.vercel.app/)

---

## 🌟 Key Features

### 1. 🌦️ Hyper-Local Weather Intelligence
- Real-time weather monitoring powered by the **Open-Meteo API** (no API key required).
- Accurate 7-day agricultural forecasts, humidity, wind velocity, precipitation likelihood, UV index, and WMO meteorological condition codes.
- Automatic farm geolocation detection via browser GPS & OpenStreetMap reverse geocoding.

### 2. 🧪 Real-Time Soil Health & NPK Telemetry
- Live simulated IoT sensor telemetry measuring Nitrogen (N), Phosphorus (P), Potassium (K), and soil pH levels.
- Interactive SVG radial gauges with real-time calibration indicators.
- Actionable agronomic recommendations (e.g., lime application for acidic soil, legume rotation for nitrogen balance).

### 3. 🌱 AI Crop Planning & Intercropping Strategy
- Crop suitability scoring matrix for Kharif and Rabi seasons tailored to local soil parameters.
- Companion planting pairs (e.g., Soybean + Pigeon Pea, Cotton + Black Gram) with symbiotic soil benefit timelines.
- 4-stage fertilizer management timeline (Sowing, Vegetative, Flowering, and Pod Formation).

### 4. 🔬 Crop Disease Diagnostics & Safety Protocols
- Leaf scan analysis interface identifying common crop ailments (e.g., *Cercospora Leaf Blight*).
- Real-time weather-risk correlation (humidity and ambient temperature thresholds).
- Prescriptive chemical and organic treatment regimens with safety guidelines.

### 5. 📈 Yield Forecasting & Scenario Simulation
- Multi-scenario yield projections based on Good, Average, and Poor rainfall conditions.
- Lifecycle yield progression charts comparing expected harvest with historical district averages.

### 6. 🏪 Live APMC Mandi Market Advisor
- Direct market price intelligence across Maharashtra mandis (powered by Data.gov.in with intelligent fallback).
- Commodity price spreads (Min, Modal, and Max rates in ₹/Quintal).
- Price movement trend lines and predictive recommendations (Buy / Hold / Sell signals).

### 7. 🏛️ Government Subsidies & Schemes Portal
- Centralized repository of central and state agricultural schemes (PM-KISAN, PMFBY, KCC, SMAM machinery subsidies, Solar pumps).
- Detailed eligibility criteria, direct application links, and subsidy breakdowns.

### 8. 📄 Automated PDF Advisory Reports
- Client-side PDF generation using `jsPDF` and `jspdf-autotable`.
- Generates downloadable, printable Soil Health Cards, Crop Plans, Yield Projections, and Mandi Intelligence dossiers with farmer metadata and timestamps.

### 9. 🎙️ Multilingual AI Voice Assistant (Gemini 2.0 Flash)
- Hands-free voice bot with Speech-to-Text (`SpeechRecognition`) and Text-to-Speech (`SpeechSynthesis`) in Indian accents (`en-IN`, `hi-IN`, `mr-IN`).
- Context-injected LLM prompt engineering tailored to the farmer's specific district and agricultural season.

### 10. 👤 Digital Farmer Profile (AgriStack & DigiLocker)
- Integrated land records (Khasra & Khata numbers, soil type, parcel acreage, irrigation source).
- Masked privacy protection for Aadhaar and contact credentials.
- Verification badges for synced Satbara (7/12 extract) and Soil Health certificates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18.3, TypeScript 5.8, Vite 5.4 (SWC compiler) |
| **Styling & Design System**| Tailwind CSS 3.4, Radix UI Primitives, shadcn/ui, Lucide Icons |
| **Typography** | Poppins, Roboto, Inter (Google Fonts) |
| **State Management** | @tanstack/react-query 5.83, React Context API, LocalStorage |
| **Data Visualizations** | Recharts 2.15 (Responsive line charts), Custom SVG radial gauges |
| **PDF Generation** | jsPDF 4.2, jspdf-autotable 5.0 |
| **AI Integration** | Google Generative AI SDK (`@google/generative-ai`) — Gemini 2.0 Flash |
| **Speech Engine** | Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`) |
| **External APIs** | Open-Meteo API, OpenStreetMap Nominatim, Data.gov.in APMC API |

---

## 📂 Project Structure

```text
smart-agro/
├── public/                 # Static public assets (robots.txt, SVGs)
├── src/
│   ├── assets/             # Thematic background artwork & imagery
│   ├── components/         # Reusable UI components & layouts
│   │   ├── layout/         # Header, Sidebar, MainLayout
│   │   └── ui/             # 49 shadcn/ui Radix components
│   ├── contexts/           # FarmLocationContext (36 Maharashtra districts)
│   ├── data/               # Regional agricultural mock datasets
│   ├── hooks/              # Custom React hooks (useWeather, useMandiPrices, useGemini)
│   ├── i18n/               # Trilingual localization system (English, Hindi, Marathi)
│   ├── lib/                # Utility helpers (clsx, tailwind-merge)
│   ├── pages/              # Domain pages
│   │   ├── Dashboard.tsx       # Live farm overview & weather
│   │   ├── SoilAnalysis.tsx    # NPK live telemetry gauges
│   │   ├── CropPlanner.tsx     # Crop matrix & intercropping
│   │   ├── DiseaseDetection.tsx# Diagnostics & treatments
│   │   ├── YieldForecast.tsx   # Scenario projections
│   │   ├── MarketAdvisor.tsx   # APMC mandi trends & signals
│   │   ├── GovSchemes.tsx      # Policy & subsidy portal
│   │   ├── Profile.tsx         # AgriStack & land records
│   │   ├── Reports.tsx         # PDF export generator
│   │   └── Settings.tsx        # District, language & API keys
│   ├── App.tsx             # Root router & context providers
│   ├── index.css           # Global theme tokens & agricultural color variables
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and npm scripts
├── tailwind.config.ts      # Tailwind configuration & typography
└── vite.config.ts          # Vite build setup with SWC & path aliases
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/hasansaylawala529-bit/smart-agro.git
   cd smart-agro
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```
   The application will start on `http://localhost:8080`.

4. **Build for production:**
   ```sh
   npm run build
   ```

---

## 🔑 Optional: Gemini API Key Setup
The application works out of the box with built-in agricultural knowledge and fallbacks. To activate live Gemini 2.0 Flash AI voice responses:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Navigate to **Settings** (`/settings`) in the application.
3. Paste your Gemini API key and click **Save**. The key is stored locally and securely in your browser's `localStorage`.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
