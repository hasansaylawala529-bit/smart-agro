# Smart Agro AI — Intelligent Agriculture Decision Support Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=flat-square&logo=vercel)](https://smart-agro-ashy-one.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

An intelligent precision agriculture decision-support platform engineered specifically for Indian farmers across all **36 districts of Maharashtra** with complete trilingual support (**English**, **हिंदी**, **मराठी**).

---

## 🎯 Official Problem Statement
> **"Build a platform that provides farmers with localized weather forecasts and crop recommendations."**

Smart Agro AI fulfills this mission by creating a direct, reactive link between **farm location**, **live weather conditions**, **soil chemistry**, and a **transparent, deterministic crop suitability engine**.

---

## 📐 System Architecture

```
Farmer Farm Location (Browser GPS / 36 Maharashtra Districts)
        ↓
Reverse Geocoding (OpenStreetMap Nominatim with caching)
        ↓
Local Weather API (Open-Meteo 7-Day Forecast & Live Readings)
        ↓
Agricultural Weather Intelligence (Irrigation Delays, Fungal Risk, Heat Stress)
        ↓
Deterministic Crop Recommendation Engine (Transparent 0–100 Weighted Scoring)
        ↓
Explainable Farmer Advisory (Why This Crop? • Cultivation Timeline • Requirements)
```

---

## ⚖️ Transparent Crop Suitability Scoring Engine

Crop recommendations are **never randomly generated or hallucinated by an LLM**. Instead, they are computed deterministically using an agronomically verified weighted formula:

$$\text{Final Suitability Score} = 0.25 \times \text{Climate} + 0.20 \times \text{Rainfall} + 0.15 \times \text{Temperature} + 0.15 \times \text{Soil} + 0.10 \times \text{Season} + 0.10 \times \text{Water} + 0.05 \times \text{Humidity}$$

### Suitability Categories:
- **Highly Suitable (80 – 100%)**: Optimal fit for current weather, soil, and season.
- **Suitable (60 – 79%)**: Well-adapted with standard agronomic management.
- **Moderately Suitable (40 – 59%)**: Minor limitations (e.g. requires supplemental irrigation or fertilizer).
- **Low Suitability (< 40%)**: Agronomically or seasonally unsuited.

Every recommendation provides full **Explainability**:
- **Positive Factors (✓)**: e.g., *"Current temperature (26°C) is within optimal range (22–30°C)"*, *"Legume crop restores soil nitrogen"*.
- **Cautionary Warnings (⚠)**: e.g., *"Expected rainfall is slightly below preferred range"*, *"Acidic soil (pH < 5.0) requires agricultural lime application"*.

---

## 🌟 Core Features

### 1. 📍 Robust Location System
- **Option A — Browser GPS**: Auto-detects farm coordinates with high accuracy.
- **Option B — Manual District Selection**: Complete coverage for all **36 Maharashtra districts** and talukas.
- **Reverse Geocoding**: Displays human-readable locations (*"Khed, Pune, Maharashtra, India"*) with local caching to eliminate redundant API requests.

### 2. 🌦️ Localized Weather & 7-Day Forecast
- Real-time weather via **Open-Meteo API** (temperature, humidity, rain chance, wind speed, UV index, cloud cover).
- 7-day daily forecast strip with maximum/minimum temperatures and precipitation likelihood.
- Cached using `@tanstack/react-query` (5-minute fresh cache, zero duplicate calls on re-renders).

### 3. 🧠 Agricultural Weather Intelligence
- 🌧 **Rain Advisory**: Automatically alerts if rain is expected tomorrow and advises delaying irrigation.
- 🌡 **High Temperature / Heat Stress**: Flags days above 36°C with soil evapotranspiration reminders.
- 💧 **High Humidity / Fungal Risk**: Identifies humidity thresholds (>75-80%) conducive to blast and leaf blight.
- ⚠️ **Heavy Rainfall Drainage**: Advises clearing drainage furrows before heavy cloudbursts.
- ☀️ **Dry Spell Planning**: Forecasts dry intervals so farmers can plan drip cycles.

### 4. 🧪 Soil Analysis & Data Integrity Modes
- **Mode 1 — Manual Input**: Farmers enter verified lab test results (N, P, K, pH).
- **Mode 2 — Demo Sensor Telemetry**: Clearly labeled with a prominent **"Demo / Simulated Sensor Data"** banner to maintain strict data integrity.
- Real-time dynamic soil health interpretations for acidic, alkaline, and nutrient-deficient soils.

### 5. 🌾 Crop Planner & Detail Modal
- Unified recommendation workflow in `/crop` featuring ranked crops (Soybean, Cotton, Rice, Wheat, Tur, Chana, Maize, Sugarcane, Jowar, Bajra, Groundnut, Onion, Tomato, Potato, Moong, Urad).
- Interactive modals displaying component score bars, agronomic requirements, cultivation timelines, and farming tips.
- Preserved secondary tools: **Intercropping Pairs** and **Fertilizer Schedules**.
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

---

## 🔑 Environment Variables
The application works completely out of the box with zero required API keys (Open-Meteo and OpenStreetMap are free public APIs).

To optionally activate live Gemini AI voice features via environment file:
1. Copy `.env.example` to `.env`:
   ```sh
   cp .env.example .env
   ```
2. Add your key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Alternatively, farmers can paste their key directly into the in-app Settings page without touching code).*

---

## 🧪 Testing
Run the automated unit test suite covering the deterministic scoring engine, weather intelligence advisories, and edge cases:
```sh
npm test
```

---

## ⚠️ Agronomic Limitations & Disclaimers
1. **Advisory Signals, Not Guarantees**: Crop recommendations, suitability scores, and timelines are advisory decision-support tools derived from agro-climatic standards (ICAR / MPKV Rahuri). They do not constitute financial or legal yield guarantees.
2. **Meteorological API Accuracy**: Local weather forecasts are sourced in real time from Open-Meteo. Actual micro-climate rainfall in localized farm pockets may vary.
3. **Data Quality Dependence**: The reliability of crop recommendations depends on the accuracy of user-provided soil tests (N, P, K, pH) and seasonal inputs.
4. **Simulated Sensor Telemetry**: The IoT sensor simulation in Soil Analysis is provided for interface testing and demonstration; simulated values are explicitly flagged and must not be treated as physical in-situ sensor data.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
