# Todo

## Refactor: 將內嵌 JS 抽離成獨立檔案

**目標**：`index.html` 內嵌的 `<script>` 內容抽到獨立 `.js` 檔，HTML 只保留結構（HTML / CSS / JS 分離）。

### 步驟
- [x] 1. 建立 `calculator.js`（純計算邏輯）與 `app.js`（UI / 事件 / 初始化）
- [x] 2. `index.html` 將內嵌 `<script>` 區塊改為 `<script src="calculator.js">` + `<script src="app.js">`，維持在 `</body>` 前
- [x] 3. 將 inline `onclick` 改為 `addEventListener`；4 個按鈕加 id，動態移除鈕改 event delegation
- [x] 4. 驗證：JS 語法檢查通過、lint 無錯、calculator.js 計算邏輯 4 案例全 PASS
- [ ] 5. commit + push 到同一個 PR 分支 `feat/plain-formula-and-pages-deploy`（待你確認）

### 決策（已確認）
- 採 SRP 拆兩檔：`calculator.js`（純計算邏輯，不碰 DOM）＋ `app.js`（UI / 事件 / 初始化）
- inline `onclick` 全部改成 `addEventListener`，HTML 完全不含 JS
- 動態「移除被斷」按鈕改用 event delegation（DRY）
- 用傳統 `<script src>`（非 ES module），確保 `file://` 本機直接開啟可用
- 用 IIFE + 單一命名空間 `TftCalculator` 避免污染全域
- CSS 不動（未被要求修改）

### 備註
- GitHub Pages workflow 部署整個 root（`path: .`），新增 `.js` 檔會一併部署，無須改 workflow
