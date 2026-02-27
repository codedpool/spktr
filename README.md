# Spktr 👁️

An AI assistant that continuously watches your screen. Trigger it with `Alt+Space` and it instantly appears, already knowing what's on your screen.

## Prerequisites
- [Ollama](https://ollama.ai) installed and running
- `ollama pull llama4:scout` (or any vision model)
- Node.js 18+, Rust 1.70+

## Setup
npm install
npm run dev # Next.js frontend
cd backend && node src/index.js # Backend
npm run tauri dev # Full app

## Stack
- Tauri v2 (desktop shell)
- Next.js + shadcn/ui (frontend)
- Node.js + Express (backend sidecar)
- Ollama / LM Studio / Groq (AI provider)
- Mem0 + SQLite + sqlite-vec (memory layer)
