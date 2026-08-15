# Third-Party Notices

`dsh-claude-code-templates` 是 [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates)
（MIT，30k+ stars）的 dsh 移植。本文件记录上游来源、逐字保留证明与所有偏离。

## 上游来源（已钉死）

| 项目 | 值 |
|---|---|
| 上游 repo | [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) |
| 上游 LICENSE | MIT，`Copyright (c) 2025 Daniel (San) Ávila` |
| 钉死 ref | `main` @ commit `589b24a78f7c94a77fe896fd49bae864a5052973`（2026-08-14，「chore: Update components and trending data」） |
| npm 对照 | `claude-code-templates@1.29.4`（2026-07-14）—— **tarball 内含 0 个 SKILL.md**；技能只存在于 git repo，故钉 git ref 而非 npm 版本 |

## 逐字保留证明

移植的两棵技能树与上游**逐字节相同**（本机验证 `diff -r` 全绿），并以
[`THIRD_PARTY_NOTICES.sha256`](./THIRD_PARTY_NOTICES.sha256)（5667 个文件的 SHA-256）钉住，任何人可自验：

```bash
# 方式一：本 repo 内自验（`npm prepare` / `npm prepack` 也会自动跑）
node scripts/verify-fidelity.mjs

# 方式二：对照上游 pinned commit 直接 diff
git clone https://github.com/davila7/claude-code-templates.git /tmp/upstream
git -C /tmp/upstream checkout 589b24a78f7c94a77fe896fd49bae864a5052973
diff -r skills /tmp/upstream/cli-tool/components/skills
diff -r .claude-plugin/skills /tmp/upstream/.claude-plugin/skills
```

文件对应：

| 本 repo | 上游 |
|---|---|
| `skills/` | `cli-tool/components/skills/`（896 个 SKILL.md + 附属资源 + `ANTHROPIC_ATTRIBUTION.md`） |
| `.claude-plugin/skills/` | `.claude-plugin/skills/`（owasp-security，含 examples/） |

## 偏离清单（每一处都有「为什么非改不可」）

| # | 位置 | 改动 | 原因 |
|---|---|---|---|
| 1 | `skills/database/postgres-schema-design/SKILL.MD` | 文件名改为 `SKILL.md`（内容逐字节不变） | 上游该文件扩展名为大写。dsh 技能系统依 `SKILL.md` 路径惯例解析；macOS 大小写不敏感文件系统会遮蔽此问题，但在 Linux 等大小写敏感环境该技能会直接不存在。不改则移植在陌生环境坏掉 |
| 2 | `scientific/torch_geometric` | 目录名保持原样；候选名改用其 frontmatter 声明的 `torch-geometric` | dsh skill registry 只接受 kebab-case 名称，且**任一名称非法会让整个 catalog 读取抛错**（fail-fast）。上游自己的 frontmatter 就是 `name: torch-geometric`，此改动只是让注册名与上游自我声明一致 |
| 3 | 嵌套技能（如 `creative-design/game-development/2d-games`、`business-marketing/app-builder/templates`） | provider 递归收集所有含 `SKILL.md` 的目录 | 上游把部分技能嵌在技能／类别目录底下（`game-development` 同时是技能也是 11 个平台子技能的容器）。单层扫描会漏掉 11 个技能 |
| 4 | 整个 plugin 转接层（`lib/`、`package.json`、`cordis.patch.yml`） | 新增 | 上游是 Claude Code 生态套件，dsh 无法直接加载。这是「100% 原样复制技能内容」之上的最小加载外壳，采用与 `dsh-lens` 相同的 provider 写法。技能文件本身零改动 |

除此之外：技能内容、目录结构、附属资源（references/、examples/、templates/ 等 4770 个文件）全部原样。

## 重复名称说明

上游有 25 个技能名跨类别重复（共 30 个文件；14 组内容逐字节相同、11 组内容不同）。dsh registry 以名称为键，
同一 provider 内重复名称依 rank → provider order → local order 取胜；本 plugin 的 local order 按路径排序，
因此重复名称的胜者是「字母序最前的类别」的那份（例：`skills/ai-research/brainstorming` 胜过
`skills/development/brainstorming`）。所有文件都完整保留在 repo 内，catalog 只展示一份。

内容不同的 11 组（被遮蔽者仍可从文件路径取用）：

| 名称 | 胜出者 | 被遮蔽者 |
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

此为 dsh 平台语义（名称即键），与上游 Claude Code 的 name-keyed 技能解析行为一致。

## 技能树授权明细（按目录）

`skills/` 与 `.claude-plugin/` 不是统一授权，**以各目录自己的 `LICENSE` 文件为准**。全树 69 份目录级
`LICENSE` 文件分三类（均已原样保留，未改动）：

### Apache-2.0（44 份）

以下目录自带 Apache-2.0 LICENSE（首行多为空白、标题在第二行）：

`ai-research/openai-docs`、`business-marketing/brand-guidelines-anthropic`、`business-marketing/brand-guidelines-community`、`creative-design/algorithmic-art`、`creative-design/canvas-design`、`creative-design/develop-web-game`、`creative-design/figma`、`creative-design/figma-implement-design`、`creative-design/frontend-design`、`creative-design/imagegen`、`creative-design/slack-gif-creator`、`creative-design/theme-factory`、`database/postgres-schema-design`、`design-to-code`、`development/artifacts-builder`、`development/claude-api`、`development/cloudflare-deploy`、`development/jupyter-notebook`、`development/mcp-builder`、`development/netlify-deploy`、`development/playwright`、`development/render-deploy`、`development/skill-creation-guide`、`development/skill-creator`、`development/web-artifacts-builder`、`development/webapp-testing`、`document-processing/doc`、`document-processing/spreadsheet`、`enterprise-communication/brand-guidelines`、`enterprise-communication/internal-comms`、`enterprise-communication/internal-comms-anthropic`、`enterprise-communication/internal-comms-community`、`enterprise-communication/slack-gif-creator`、`media/screenshot`、`media/speech`、`media/transcribe`、`productivity/skill-creator`、`security/security-best-practices`、`security/security-ownership-map`、`security/security-threat-model`、`security/webapp-testing`、`utilities/web-artifacts-builder`、`video/sora`、`workflow-automation/yeet`

### Anthropic source-available（13 份，`© 2025 Anthropic, PBC. All rights reserved`）

以下目录自带 Anthropic 版权声明，LICENSE 明文禁止 Reproduce / Distribute / sublicense，
**仅作参考、不可再分发**（完整说明见 `skills/ANTHROPIC_ATTRIBUTION.md`，上游原样保留）：

`document-processing/docx`、`document-processing/docx-official`、`document-processing/pdf`、`document-processing/pdf-anthropic`、`document-processing/pdf-official`、`document-processing/pptx`、`document-processing/pptx-official`、`document-processing/xlsx`、`document-processing/xlsx-official`、`scientific/document-skills/docx`、`scientific/document-skills/pdf`、`scientific/document-skills/pptx`、`scientific/document-skills/xlsx`

### MIT（12 份，版权归各作者）

| 目录 | 版权行 |
|---|---|
| `career/workorai` | Copyright (c) 2026 WorkorAI |
| `ai-research/loki-mode` | Copyright (c) 2025 Loki Mode Contributors |
| `development/vercel-deploy` | Copyright (c) 2026 Vercel |
| `development/zapier-workflows` | Copyright (c) 2025 Zapier Workflows Skill Contributors |
| `workflow-automation/n8n` | Copyright (c) 2025 Romuald Członkowski |
| `business-marketing/product-decision-agent` | Copyright (c) 2026 xuxing |
| `productivity/avoid-ai-writing` | Copyright (c) 2026 Conor Bronsdon |
| `productivity/think-tank` | Copyright (c) 2026 Danny |
| `productivity/notebooklm` | Copyright (c) 2025 Please Prompto! |
| `productivity/doc-chaser-lite` | Copyright (c) 2026 Moai Loops |
| `scientific/markitdown` | Copyright (c) Microsoft Corporation. |
| `scientific/neuropixels-analysis` | Copyright (c) 2025 Shen Lab |

### 其他第三方组件

- **字体**：`creative-design/canvas-design/canvas-fonts/` 54 个 TTF，各配 `OFL.txt`（SIL Open Font License v1.1）
- **owasp-security**：`.claude-plugin/skills/owasp-security/` 的 `skill.json` 自述 MIT，来源 [mfkocalar/OWASP-Security-Skills](https://github.com/mfkocalar/OWASP-Security-Skills)（目录内无独立 LICENSE 文件）

## 其他

- 上游技能含 Anthropic 官方技能（`cli-tool/components/skills/ANTHROPIC_ATTRIBUTION.md` 有完整授权说明），
  原样保留，未删除。技能树整体为混合授权，逐目录明细见上方「技能树授权明细（按目录）」。
- 技能文字为英文（上游即英文）。依「100% 原样复制」规则不翻译技能内容。
