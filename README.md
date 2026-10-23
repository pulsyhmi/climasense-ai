# ClimaSense AI - Township Climate Resilience Platform

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-AI%20Studio-blue?style=for-the-badge&logo=google)](https://climasense-ai.ai.studio/)
[![React](https://img.shields.io/badge/React%2019-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-4285F4?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Google%20Cloud-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**Live Prototype URL:** [https://climasense-ai.ai.studio/](https://climasense-ai.ai.studio/)

**ClimaSense AI** is a climate resilience and environmental intelligence platform developed as a hackathon prototype for sustainable townships in Malaysia, focused primarily on the **City of Elmina** (Shah Alam, Selangor) by Sime Darby Property, with extensible support for sister townships including **Bandar Bukit Raja** (Klang) and **Serenia City** (Sepang).

The platform bridges the gap between regional macroeconomic weather forecasts and hyper-local, actionable adaptation—equipping township residents, estate managers, and urban planners with real-time weather monitoring, natural language AI guidance, bioretention flood buffer tracking, scenario stress-testing, and community-driven green rewards.

---

## Architecture & Data Source Clarifications

To ensure transparency and scientific integrity, ClimaSense AI clearly distinguishes between real external data feeds, heuristic calculations, and illustrative simulated features:

| Component | Source / Methodology | Classification |
| :--- | :--- | :--- |
| **Current Weather Observations** | Live ambient temperature, relative humidity, apparent heat index, precipitation rate, and wind speed from **Open-Meteo API** (WMO meteorological models). | **Real External Observation** |
| **5-Day Weather Forecast** | Daily temperature ranges, rain probability, and WMO weather condition codes from **Open-Meteo Weather Forecast API**. | **Real External Forecast** |
| **Modelled Air Quality (AQI)** | Atmospheric PM2.5, PM10, and AQI forecasts sourced from the **Copernicus Atmosphere Monitoring Service (CAMS)** via Open-Meteo. | **Modelled Atmospheric Forecast** *(Not in-situ ground station)* |
| **AI Climate Assistant** | Direct server-side integration with **Google Gemini 3.5 Flash Lite** (Primary) with automated fallback to **Gemini 3.1 Flash Lite**. Prompts are grounded strictly in real-time township observations. | **Live AI Synthesis** *(Non-statutory advisory)* |
| **Scenario Simulator** | Mathematical proxy model simulating theoretical microclimate shifts (urban heat island offsets, AC energy demand deltas, bioretention retention buffer response). | **Illustrative Scenario Modeling** *(Educational demonstration, not civil engineering flood modeling)* |
| **IoT Sensor Fleet** | Simulated mesh telemetry demonstrating node health, soil moisture tenso-meters, and retention basin gauges. | **Simulated Prototype Telemetry** *(Illustrative mesh UX, not live physical hardware)* |
| **Green Rewards** | User eco-habit tracking (tree planting, active cycling, composting) persisted to **Google Cloud Firestore** with Zero-Trust security rules. | **Live Production Persistence** |

> **Statutory Emergency Disclaimer**: All risk ratings and AI guidance provided by ClimaSense AI are indicative local preparedness indicators. For certified civil flood alerts, severe storm warnings, and statutory air quality index numbers, residents must always consult official authorities: **METMalaysia** (Malaysian Meteorological Department), **DID** (Department of Irrigation and Drainage / JPS), and **DOE** (Department of Environment / APIMS).

---

## Core Platform Modules

The application consists of six integrated modules accessible via the navigation sidebar:

### 1. Resident Climate Dashboard
- Real-time weather cards displaying ambient temperature, apparent heat index, relative humidity, precipitation, and wind direction.
- Malaysian heat index categorisation (Low, Moderate, Elevated, Extreme).
- 5-day predictive forecast cards with WMO weather condition icons and precipitation probabilities.

### 2. AI Climate Assistant
- Natural language query interface powered by **Google Gemini 3.5 Flash Lite** (with bounded exponential backoff and fallback to **Gemini 3.1 Flash Lite**).
- Grounded prompt injection that supplies the model with real-time weather readings, CAMS air quality estimates, and City of Elmina geographical landmarks (300-acre Central Park bioretention lakes, permeable bioswales, Denai Alam cycling spine).
- Dynamic model verification badges displaying the exact model that served the response.
- One-click follow-up suggestion chips and automatic question preservation upon network interruption.

### 3. Township Management & Interventions
- Micro-zone breakdown for City of Elmina: *Elmina Central Park*, *Elmina East Commercial Hub*, *Denai Alam Cycling Spine*, *Elmina West / Rainforest Corridor*, and *Lakeside Promenade*.
- Actionable climate intervention register (permeable grass-crete retrofits, bioswale desiltation, automated tensiometer drip irrigation, urban canopy tree planting).
- Administrative township manager notes persisted to Firestore with role-based access control (RBAC).

### 4. Scenario Simulator (Illustrative Modeling)
- Interactive stress-test sliders for township resilience planning:
  - **Temperature Anomaly** (+0.0°C to +4.0°C)
  - **Monsoon Rainfall Surge** (+0% to +80%)
  - **Urban Tree Canopy / Green Coverage** (10% to 60%)
- Real-time computation of projected apparent heat index, estimated residential cooling power surge, and bioretention attenuation capacity.

### 5. IoT Sensor Fleet (Simulated Telemetry)
- Simulated LoRaWAN/mesh telemetry nodes tracking ambient micro-temperatures, soil moisture percentages, and bioretention stormwater levels.
- Interactive telemetry refresh trigger demonstrating battery monitoring, signal RSSI, and historical telemetry sparklines.

### 6. Green Rewards & Resident Eco-Points
- Resident carbon reduction tracking across six verified eco-habit categories: *Active Mobility / Cycling*, *Tree Planting*, *Composting & Food Waste*, *Energy Conservation*, *Water Harvesting*, and *Clean Recycling*.
- Real-time Firestore synchronization for user reward balances and activity logs.
- Reward catalog offering nursery sapling vouchers, eco-cafe discounts, and sustainable lifestyle items.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend / API**: Express 4 running on Node.js (via `tsx`), `@google/genai` TypeScript SDK.
- **Database & Identity**: Google Cloud Firestore (custom multi-tenant database `ai-studio-climasenseai-d573ea93-a2c5-4152-9976-3a151416d46e`), Firebase Authentication (Anonymous & Email/Password).
- **External Meteorological APIs**: Open-Meteo Weather Forecast API & Copernicus Atmosphere Monitoring Service (CAMS) Air Quality API.
- **Testing & Quality Assurance**: Native Node.js test runner (`node:test`), TypeScript strict checking (`tsc --noEmit`), Playwright E2E automation.

---

## Security & Architecture Highlights

1. **Server-Side Gemini API Proxy**:
   - The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly on the server side (`server.ts`).
   - The browser client never touches or receives raw Gemini API credentials. All chat requests flow through `POST /api/assistant/chat`.
   - Technical stack traces, Google RPC errors, and quota headers are logged exclusively on the server, while the user sees friendly, sanitised guidance.
2. **Zero-Trust Firestore Security Rules**:
   - Role-Based Access Control (RBAC) enforced in `firestore.rules` preventing unauthorised modification of township configs or manager notes.
   - User ownership verification (`request.auth.uid == resource.data.userId`) ensuring residents can only read and mutate their own green activities and reward balances.
   - Automated unit tests validate resistance against 12 malicious attack payloads (including spoofed user IDs, shadow field injections, oversized payloads, and path traversal).
3. **Resilient API Architecture**:
   - Bounded exponential backoff with randomized jitter handles transient 503/502/504 errors.
   - Immediate circuit-breaking on quota exhaustion prevents infinite retry loops.

---

## Project Structure

```text
├── .env.example                     # Template of required environment variable names
├── .gitignore                       # Git ignore rules for secrets, builds, and logs
├── bun.lock                         # Package lockfile
├── eslint.config.js                 # Linter configuration
├── firebase-applet-config.example.json # Template for Firebase Web client config
├── firebase-applet-config.json      # Working Firebase client configuration
├── firebase-blueprint.json          # Firestore schema collection blueprint
├── firestore.rules                  # Production Zero-Trust Firestore security rules
├── index.html                       # HTML entry point with fetch polyfill & meta tags
├── metadata.json                    # AI Studio project capabilities manifest
├── package.json                     # Project scripts and dependencies
├── security_spec.md                 # Security specification & attack payload documentation
├── server.ts                        # Server entry point, proxy routes & Vite middleware
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite build configuration with Tailwind CSS plugin
└── src/
    ├── App.tsx                      # Root component orchestrating all 6 modules
    ├── main.tsx                     # React client bootstrap
    ├── index.css                    # Tailwind CSS v4 styling
    ├── components/                  # Modular UI components
    │   ├── common/                  # Reusable UI (AuthModal, MethodologyModal, Header)
    │   └── modules/                 # Module components (AiAssistant, ResidentClimate,
    │                                # TownshipManagement, ScenarioSimulator, IoTSensors,
    │                                # GreenRewards)
    ├── config/                      # Township profiles, risk thresholds & Firebase config
    ├── data/                        # Sample data, interventions & mock sensor nodes
    ├── services/                    # Climate API service & Firebase client methods
    ├── types/                       # TypeScript interfaces & domain types
    └── utils/                       # Climate risk calculators, Gemini prompt formatting,
                                     # backoff/retry helpers, and unit tests
```

---

## Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm** (v10+) or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/climasense-ai.git
cd climasense-ai
```

### 2. Configure Environment Variables
Copy the sample environment file to `.env`:
```bash
cp .env.example .env
```

Open `.env` in your text editor and supply your Google Gemini API key:
```dotenv
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
PORT=3000
APP_URL="http://localhost:3000"
```

> **Note**: If you want to use a custom Firebase project, you can supply optional `VITE_FIREBASE_*` variables in `.env` or populate `firebase-applet-config.json` using `firebase-applet-config.example.json` as a reference.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### 5. Run the Automated Test Suite
Run the 27 automated unit tests covering risk algorithms, backoff/retry logic, prompt validation, and security invariants:
```bash
npm test
```

### 6. Type Check and Build for Production
```bash
npm run lint    # Runs tsc --noEmit
npm run build   # Produces production bundle in dist/
npm start       # Launches production Express server
```

---

## Environment Variables Reference

| Variable Name | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-Side Only | **Yes** | Google Gemini API key used by `server.ts` for AI Climate Assistant responses. |
| `PORT` | Server-Side Only | Optional | Port for the Node.js/Express server (default: `3000`). |
| `APP_URL` | Server-Side Only | Optional | Public base URL of the deployed application. |
| `VITE_FIREBASE_API_KEY` | Client-Side | Optional | Firebase Web API key override. |
| `VITE_FIREBASE_PROJECT_ID` | Client-Side | Optional | Firebase Project ID override. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client-Side | Optional | Firebase Auth domain override. |
| `VITE_FIREBASE_DATABASE_ID` | Client-Side | Optional | Custom Firestore Database ID (defaults to `(default)`). |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client-Side | Optional | Firebase Storage bucket override. |
| `VITE_FIREBASE_APP_ID` | Client-Side | Optional | Firebase Web App ID override. |

---

## License

This project is licensed under the MIT License. See [package.json](package.json) for details.
