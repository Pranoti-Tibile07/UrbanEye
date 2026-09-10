# CivicPulse Frontend

A modern landing page for **CivicPulse** — a civic engagement platform that connects citizens with local government.

Built with React, TypeScript, Vite, and Tailwind CSS v4.

## Prerequisites

Install [Node.js LTS](https://nodejs.org/) (includes npm). Verify with:

```bash
node --version
npm --version
```

If `npm` is not recognized, restart your terminal after installing Node.js.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx       # Fixed navigation header
│   ├── Hero.tsx         # Hero section with dashboard preview
│   ├── Features.tsx     # Feature cards grid
│   ├── HowItWorks.tsx   # Three-step process
│   ├── Stats.tsx        # Impact statistics
│   ├── CTA.tsx          # Email signup call-to-action
│   └── Footer.tsx       # Site footer
├── App.tsx              # Page layout
├── main.tsx             # React entry point
└── index.css            # Tailwind theme & base styles
```
