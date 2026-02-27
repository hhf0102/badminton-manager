# CLAUDE.md

此文件為 Claude Code (claude.ai/code) 在此儲存庫中進行開發時提供指引。

## 核心溝通原則 (Communication Principles)

* **極度精簡：** 回覆必須保持極度簡潔，專注於傳遞關鍵資訊。
* **拒絕廢話：** 嚴禁不必要的贅詞或修飾語。
* **代碼片段：** 除非必要，否則避免提供冗長的代碼片段。

## 常用指令 (Commands)

```bash
npm run dev          # 使用 Turbopack 啟動開發伺服器
npm run build        # 生產環境建置
npm run lint         # Biome 檢查 (不自動修復)
npm run lint:fix     # Biome 檢查並自動修復
npm run format       # Biome 格式化並自動修復
npx shadcn add <component>  # 新增 shadcn/ui 組件

```

目前未配置測試框架。

## 專案架構 (Architecture)

本專案是一個 **羽球臨打管理員 (Badminton Session Manager)** — 一個針對行動版優先設計的單頁應用程式 (SPA)。

### 狀態管理 (`src/store/badminton-store.ts`)

核心為持久化的 Zustand Store (`localStorage` 鍵名: `badminton-store-v2`)：

* `Member`: 包含 `id`, `name`, `emoji`, `playCount`, `status` (`"waiting" | "playing" | "resting"`), `paid`。
* `startMatch`: 自動選取 2–4 名低場次等待中成員上場。
* `finishMatch`: 結束比賽，結算場次並恢復狀態。
* `sessionFee` & `togglePaid`: 管理費用與繳費狀態。

### 組件 (Components)

* `badminton-app.tsx`: 主頁面組件（包含頁首、控制按鈕、狀態面板與繳費 Modal）。
* `badminton-court.tsx`: SVG 球場繪製 (720×400)，包含精確標線與 4 個球員位。

### 樣式規範 (Styling)

* Tailwind CSS v4 (`globals.css` 內聯配置)，無 `tailwind.config.js`。
* shadcn/ui (New-york/Neutral)，使用 `src/lib/utils.ts` 的 `cn()`。
* 全域深綠漸層背景 (`#0f4c29` → `#052210`)，無淺色模式。

### Biome 格式化規則

* 縮排: **Tabs**, 行寬: **100**, 引號: **Double**, 尾隨逗號: **es5**。
* 匯入語句自動排序。

---
