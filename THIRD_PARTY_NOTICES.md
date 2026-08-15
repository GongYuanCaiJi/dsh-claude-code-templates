# Third-Party Notices

`dsh-claude-code-templates` 是 [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates)
（MIT，30k+ stars）的 dsh 移植。本檔記錄上游來源、逐字保留證明與所有偏離。

## 上游來源（已釘死）

| 項目 | 值 |
|---|---|
| 上游 repo | [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) |
| 上游 LICENSE | MIT，`Copyright (c) 2025 Daniel (San) Ávila` |
| 釘死 ref | `main` @ commit `589b24a78f7c94a77fe896fd49bae864a5052973`（2026-08-14，「chore: Update components and trending data」） |
| npm 對照 | `claude-code-templates@1.29.4`（2026-07-14）—— **tarball 內含 0 個 SKILL.md**；技能只存在於 git repo，故釘 git ref 而非 npm 版本 |

## 逐字保留證明

移植的兩棵技能樹與上游**逐位元組相同**（本機驗證 `diff -r` 全綠），並以
[`THIRD_PARTY_NOTICES.sha256`](./THIRD_PARTY_NOTICES.sha256)（5667 個檔案的 SHA-256）釘住，任何人可自驗：

```bash
# 方式一：本 repo 內自驗（`npm prepare` / `npm prepack` 也會自動跑）
node scripts/verify-fidelity.mjs

# 方式二：對照上游 pinned commit 直接 diff
git clone https://github.com/davila7/claude-code-templates.git /tmp/upstream
git -C /tmp/upstream checkout 589b24a78f7c94a77fe896fd49bae864a5052973
diff -r skills /tmp/upstream/cli-tool/components/skills
diff -r .claude-plugin/skills /tmp/upstream/.claude-plugin/skills
```

檔案對應：

| 本 repo | 上游 |
|---|---|
| `skills/` | `cli-tool/components/skills/`（896 個 SKILL.md + 附屬資源 + `ANTHROPIC_ATTRIBUTION.md`） |
| `.claude-plugin/skills/` | `.claude-plugin/skills/`（owasp-security，含 examples/） |

## 偏離清單（每一處都有「為什麼非改不可」）

| # | 位置 | 改動 | 原因 |
|---|---|---|---|
| 1 | `skills/database/postgres-schema-design/SKILL.MD` | 檔名改為 `SKILL.md`（內容逐位元組不變） | 上游該檔副檔名大寫。dsh 技能系統依 `SKILL.md` 路徑慣例解析；macOS 大小寫不敏感檔系統會遮蔽此問題，但在 Linux 等大小寫敏感環境該技能會直接不存在。不改則移植在陌生環境壞掉 |
| 2 | `scientific/torch_geometric` | 目錄名保持原樣；候選名改用其 frontmatter 宣告的 `torch-geometric` | dsh skill registry 只接受 kebab-case 名稱，且**任一名稱非法會讓整個 catalog 讀取拋錯**（fail-fast）。上游自己的 frontmatter 就是 `name: torch-geometric`，此改動只是讓註冊名與上游自我宣告一致 |
| 3 | 巢狀技能（如 `creative-design/game-development/2d-games`、`business-marketing/app-builder/templates`） | provider 遞迴收集所有含 `SKILL.md` 的目錄 | 上游把部分技能嵌在技能／類別目錄底下（`game-development` 同時是技能也是 11 個平台子技能的容器）。單層掃描會漏掉 11 個技能 |
| 4 | 整個 plugin 轉接層（`lib/`、`package.json`、`cordis.patch.yml`） | 新增 | 上游是 Claude Code 生態套件，dsh 無法直接載入。這是「100% 原樣複製技能內容」之上的最小載入外殼，採用與 `dsh-lens` 相同的 provider 寫法。技能檔案本身零改動 |

除此之外：技能內容、目錄結構、附屬資源（references/、examples/、templates/ 等 4770 個檔案）全部原樣。

## 重複名稱說明

上游有 25 個技能名跨類別重複（共 30 個檔案；14 組內容逐位元組相同、11 組內容不同）。dsh registry 以名稱為鍵，
同一 provider 內重複名稱依 rank → provider order → local order 取勝；本 plugin 的 local order 按路徑排序，
因此重複名稱的勝者是「字母序最前的類別」的那份（例：`skills/ai-research/brainstorming` 勝過
`skills/development/brainstorming`）。所有檔案都完整保留在 repo 內，catalog 只展示一份。

內容不同的 11 組（被遮蔽者仍可從檔案路徑取用）：

| 名稱 | 勝出者 | 被遮蔽者 |
|---|---|---|
| `pytorch-lightning` | `ai-research/distributed-training-pytorch-lightning` | `scientific/pytorch-lightning` |
| `x-twitter-scraper` | `business-marketing/x-twitter-scraper` | `marketing/x-twitter-scraper` |
| `telegram-bot-builder` | `development/telegram-bot-builder` | `enterprise-communication/telegram-bot-builder` |
| `using-superpowers` | `development/using-superpowers` | `utilities/using-superpowers` |
| `writing-skills` | `development/writing-skills` | `productivity/writing-skills` |
| `docx` | `document-processing/docx` | `scientific/document-skills/docx` |
| `pdf` | `document-processing/pdf-anthropic` | `document-processing/pdf`、`document-processing/pdf-processing`、`scientific/document-skills/pdf` |
| `pptx` | `document-processing/pptx` | `scientific/document-skills/pptx` |
| `xlsx` | `document-processing/xlsx` | `scientific/document-skills/xlsx` |
| `planning-with-files` | `productivity/planning-with-files` | `workflow-automation/planning-with-files` |
| `n8n-workflow-patterns` | `workflow-automation/n8n-workflow-patterns` | `workflow-automation/n8n/n8n-workflow-patterns` |

此為 dsh 平台語義（名稱即鍵），與上游 Claude Code 的 name-keyed 技能解析行為一致。

## 其他

- 上游技能含 Anthropic 官方技能（`cli-tool/components/skills/ANTHROPIC_ATTRIBUTION.md` 有完整授權說明），
  原樣保留，未刪除。
- 技能文字為英文（上游即英文）。依「100% 原樣複製」規則不翻譯技能內容。
