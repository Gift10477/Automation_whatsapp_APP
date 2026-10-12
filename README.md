# STCU WhatsApp Member Dispatcher 🚀

Automated, personalized WhatsApp notification and membership renewal dispatch tool designed for **STCU**. Built with React, Vite, Tailwind CSS, TypeScript, and intelligent anti-spam variation algorithms.

🌐 **Live Demo (GitHub Pages):** [https://gift10477.github.io/Automation_whatsapp_APP/](https://gift10477.github.io/Automation_whatsapp_APP/)

---

## ✨ Features

- **Automated Anti-Spam Message Engine:** Deterministically permutes greetings, sentence structures, and sign-offs while preserving the member's name, sender's identity, and the exact form URL.
- **Safe Randomized Dispatch Delays:** Configurable delays (e.g. 8–18 seconds) between dispatches to respect WhatsApp rate limits and avoid spam flagging.
- **WhatsApp Web & Desktop Protocol:** Direct `wa.me` links with URL-encoded messages and tab reuse for seamless single-click or semi-automated dispatches.
- **Batch Import & Phone Sanitizer:** Paste member lists in various formats (TSV, CSV, raw text) and automatically sanitize international phone formats (e.g. `+254...`).
- **Real-time Metrics:** Live tracking of sent, pending, and skipped dispatches with auditory alerts and confetti celebration upon completion.
- **GitHub Pages Ready:** Automated CI/CD pipeline using GitHub Actions to deploy on every push to `main`.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React, Canvas Confetti
- **Build Tool:** Vite 8
- **Deployment:** GitHub Pages via GitHub Actions

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gift10477/Automation_whatsapp_APP.git
   cd Automation_whatsapp_APP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 🚀 GitHub Pages Deployment

This repository uses automated deployment via GitHub Actions:

1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Every commit pushed to the `main` branch automatically triggers the `.github/workflows/deploy.yml` workflow and updates the live site.
