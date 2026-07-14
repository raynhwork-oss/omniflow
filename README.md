# OmniFlow — 統一生產力工作空間

> **行事曆管時間、待辦管行動、專案管結構、備忘錄管知識**  
> Local-First + Firebase 雲端同步 · 部署於 Netlify

---

## 🎯 專案概述

OmniFlow 是一個基於「降低認知負荷」核心理念的全功能生產力工作空間。四大模組底層資料完全打通，任何物件可以同時是任務、筆記，也可以被指派到行事曆。

### ✅ 已完成功能

| 模組 | 功能 |
|------|------|
| **全域收件夾** | 快速捕捉 + 自然語言解析（NLP）|
| **待辦管理** | 今天/高優先/過期篩選、排序 |
| **專案看板** | 四欄 Kanban + 滑鼠拖曳（DnD Kit）|
| **Markdown 筆記** | 完整 MD 編輯器 + 即時預覽 |
| **雙向連結** | [[ 觸發選單 + Linked References |
| **時間區塊行事曆** | 日/週/月視角 + 拖曳排程 |
| **右側詳細面板** | 完整欄位編輯 + 子任務進度條 |
| **本地優先** | Dexie.js (IndexedDB) 完全離線運作 |
| **雲端同步** | Firebase Auth + Firestore 雙向同步 |

---

## 🛠 技術棧

- **前端**: React 18 + TypeScript + Vite
- **樣式**: Tailwind CSS v3
- **圖示**: Lucide React
- **本地 DB**: Dexie.js (IndexedDB 封裝)
- **雲端**: Firebase (Auth + Firestore)
- **拖曳**: @dnd-kit/core + @dnd-kit/sortable
- **部署**: Netlify (含 `netlify.toml`)

---

## 🚀 快速開始

### 本地開發
```bash
git clone <repo-url>
cd omniflow
npm install
npm run dev
```

### 環境變數設定（Firebase）
```bash
cp .env.example .env.local
# 填入您的 Firebase 專案設定值
```

**需要的 Firebase 環境變數：**
```
const firebaseConfig = {
  apiKey: "AIzaSyB15mRTijj07r2JgOP8UPbMCIf5vFUxOhQ",
  authDomain: "omniflow-44109.firebaseapp.com",
  projectId: "omniflow-44109",
  storageBucket: "omniflow-44109.firebasestorage.app",
  messagingSenderId: "238278734023",
  appId: "1:238278734023:web:9dc2b721e9731005be8ee2",
  measurementId: "G-W65SXB233Z"
};
```

> ⚠️ 若不設定 Firebase，應用程式仍可在「本地模式」完整運行，資料儲存於瀏覽器 IndexedDB。

---

## 📦 Netlify 部署

1. 將專案 push 到 GitHub
2. 在 Netlify Dashboard 連接 Repository
3. 設定 Build 指令：`npm run build`，發布目錄：`dist`
4. 在 **Site Settings > Environment Variables** 填入 Firebase 設定
5. 點選 Deploy

`netlify.toml` 已包含：
- SPA 路由重定向（`/*` → `index.html`）
- 安全 Headers
- 靜態資源快取策略

---

## 📊 資料模型

所有物件共用同一個 `items` 集合：

| 欄位 | 說明 |
|------|------|
| `id` | UUID |
| `user_id` | Firebase UID（未登入用 `anonymous`）|
| `type` | `Inbox / Task / Project / Note` |
| `status` | `Backlog / Todo / In Progress / Done / Archived` |
| `priority` | `High / Medium / Low / None` |
| `due_date` | ISO DateTime（行事曆/待辦截止）|
| `start_date` | ISO DateTime（行事曆開始時間）|
| `tags` | `string[]` |
| `backlinks` | `string[]`（關聯物件 ID）|
| `subtasks` | `SubTask[]`（子任務清單）|
| `updated_at` | 同步邏輯核心（較新者獲勝）|

---

## 🔄 同步邏輯

```
登入後 → 比對 updated_at
  雲端較新 → 下載覆蓋本地
  本地較新 → 上傳更新雲端
  同時新增 → 各自保留（Append）
```

Firestore `enableIndexedDbPersistence()` 提供原生離線快取。

---

## 💡 NLP 快速捕捉範例

| 輸入 | 解析結果 |
|------|---------|
| `明天下午3點開會 #工作` | 截止：明天 15:00，標籤：工作 |
| `後天整理報告 !高` | 截止：後天 09:00，優先：High |
| `今天晚上8點打電話 #個人 #家庭` | 截止：今天 20:00，標籤：個人、家庭 |
| `3月15日提交提案` | 截止：3月15日 09:00 |

---

## 📋 待實作功能

- [ ] 甘特圖視角（Project 時間線）
- [ ] 多人協作（Firestore 共享集合）
- [ ] 行動裝置 PWA 支援
- [ ] 鍵盤快捷鍵系統
- [ ] 資料匯入/匯出（JSON/CSV）
- [ ] 深色模式

---

**最後更新：** 2026-07-13  
**版本：** 1.0.0
