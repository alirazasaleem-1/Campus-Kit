# CGPA Pro — UAF Student GPA & CGPA Calculator

A lightweight, modern, offline-first web application built specifically for university students (primarily **University of Agriculture Faisalabad, UAF**).

🌐 **Live URL:** [https://alirazasaleem-1.github.io/Campus-Kit/](https://alirazasaleem-1.github.io/Campus-Kit/)

---

## 🚀 Features

1. **AG Registration Profile Key**
   - Strictly validates standard UAF AG format (`/^\d{4}-ag-\d{1,5}$/i`, e.g. `2024-ag-1234` or `2021-ag-567`).
   - Normalizes all entries to lowercase.
   - **100% Offline & Private:** No backend, no accounts, and no passwords. All profiles and semester records are preserved exclusively in the browser's `localStorage`.
   - Supports remembering recent AG profiles, instant profile switching, and secure profile deletion.

2. **Real-Time GPA & CGPA Calculations**
   - **Semester GPA:** $\text{Semester GPA} = \frac{\sum (\text{Grade Points} \times \text{Credit Hours})}{\sum \text{Credit Hours}}$.
   - **Cumulative CGPA:** Weighted average across all semesters based on earned quality points and credit hours.
   - **UAF Credit Hour Parser:** Accepts both standard plain numbers (`3`, `4`, `1.5`) and UAF theory-practical notation (`3(2-1)`, `4(3-1)`, `2(0-2)`). Total credit hours are parsed from the leading number.
   - **Repeated Course Policy Toggle:**
     - **Latest Attempt (UAF Standard):** If a student repeats an improved course code (e.g. `CS-301`), only the latest attempt counts toward CGPA and total credit hours. Earlier attempts are flagged and excluded from CGPA.
     - **Best Attempt:** Allows counting the attempt with the highest grade points.
   - Safe division logic: 0 credits, missing marks, or empty states gracefully yield `0.00` GPA without NaN or runtime exceptions.

3. **Editable Grading Scale (Settings)**
   - Default baseline is a standard 4.0 scale (A: 80–100 [4.0], B: 65–79 [3.0], C: 50–64 [2.0], D: 40–49 [1.0], F: 0–39 [0.0]).
   - **User Customization:** Students can edit minimum marks, letter grades, and grade points for each tier or add new custom tiers.
   - Prominently labeled: *"Verify this against your official UAF grading policy"*.
   - Instant recalculation across all past and future semesters upon updating.

4. **Target CGPA Planner ("What Do I Need?")**
   - Computes the exact semester GPA required in an upcoming semester to reach a target CGPA.
   - Detects mathematically impossible targets ($> 4.00$) and reports the theoretical maximum possible CGPA.
   - Provides instant projections for alternative GPA scenarios ($4.00$, $3.50$, $3.00$, $2.50$).

5. **Visual Progress Analytics & Reporting**
   - **GPA Trend Chart:** Interactive trend visualization built with Recharts with reference lines for 1st Division ($3.00$).
   - **Official Print / PDF Transcript:** Dedicated printer-friendly view with institutional styling for generating PDF copies of student academic records (`Ctrl + P` / Save as PDF).
   - **JSON Backup & Restore:** Complete profile export and import for transferring records between devices.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Dark Mode supported via class strategy)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Unit Testing:** Vitest (17 passing tests covering all edge cases)
- **Storage:** Browser `localStorage` (Zero external network calls)

---

## 📐 Assumptions & Design Decisions

1. **AG Registration Format:** Format follows the official UAF pattern `YYYY-ag-XXXXX` (e.g. `2024-ag-1234`). Year must be 4 digits, followed by `-ag-` (case-insensitive), and 1 to 5 numeric registration digits.
2. **Theory-Practical Credit Hours:** In UAF courses represented as `3(2-1)`, the total credit hours awarded are equal to the first number (`3`). The numbers inside parentheses denote `Theory - Practical` lab hours breakdown.
3. **Repeated Courses:** In semester breakdown cards, the semester GPA displays the GPA earned during that particular term. When calculating the cumulative CGPA, earlier attempts of identical course codes are excluded and only the latest (or best, depending on user toggle) contributes to total credit hours and quality points.
4. **Grading Policy Disclaimer:** Because specific faculties or graduate degree programs at UAF may adopt tailored fractional grading formulas, users are given an editable scale with a reminder to confirm against their department's syllabus.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Clone repository
```bash
git clone https://github.com/alirazasaleem-1/Campus-Kit.git
cd Campus-Kit
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run unit tests
```bash
npm run test
```

### 5. Build for production
```bash
npm run build
```
The compiled, optimized static bundle is generated in the `dist/` directory.

---

## 🌐 Deployment Instructions

### Deploy to GitHub Pages (Automatic via GitHub Actions)
1. Push your changes to the `main` branch.
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The `.github/workflows/deploy.yml` workflow will automatically test, build, and deploy the app to `https://<username>.github.io/<repo-name>/`.

### Deploy to Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Click **Deploy**.

### Deploy to Netlify
1. Import the repository in [Netlify](https://netlify.com).
2. Build Command: `npm run build`.
3. Publish Directory: `dist`.
4. Click **Deploy Site**.
