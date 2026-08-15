# 🧩 dsh-claude-code-templates

[中文](#中文) | [English](#english)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/GongYuanCaiJi/dsh-claude-code-templates.svg?style=social&label=Star)](https://github.com/GongYuanCaiJi/dsh-claude-code-templates)
[![Upstream](https://img.shields.io/badge/upstream-claude--code--templates-181717?logo=github)](https://github.com/davila7/claude-code-templates)

## 中文

**897 个 Claude Code 技能模板整包移植到 DeepSeek Harness（dsh）——不挑不筛全部打包，装完即用。**

这是 [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates)（MIT，30k+ stars）的 dsh 移植
（port）。上游的 897 个 `SKILL.md` 与全部附属资源（references/、examples/、assets/ 等 4770 个文件）**逐字节原样复制**，
技能内容一律未翻译、未改写，只加了一层最小的 dsh 载入外壳。

### ✨ 功能特性

- **897 个技能全部打包**：dsh 的 skill catalog 展示 867 个唯一技能（25 个名称跨类别重复、共 30 个文件，其中 14 组内容完全相同、11 组内容不同；catalog 以名称为键只展示一份，全部文件都保留在 repo）
- **29 个分类**：ai-research、development、business-marketing、creative-design、scientific、security、web-development、workflow-automation 等，含 Anthropic 官方技能（授权说明见上游 `ANTHROPIC_ATTRIBUTION.md`，原样保留）
- **零改动保真**：`THIRD_PARTY_NOTICES.sha256` 钉住 5667 个文件的 SHA-256，`npm prepare` / `npm prepack` 自动校验，漂移即报错
- **含 Claude 官方插件技能**：`.claude-plugin/skills/owasp-security`（OWASP 六标准安全参考，含 examples/）
- **模型可用**：技能经 dsh 标准 `skill` 工具加载，无需额外配置

### 📸 效果

安装后 headless 会话的 skill catalog（真实运行输出，节选）：

```
- `2d-games`: 2D game development principles. Sprites, tilemaps, physics, camera.
- `3d-games`: 3D game development principles. Rendering, shaders, physics, cameras.
- `ab-test-setup`: When the user wants to plan, design, or implement an A/B test or experiment...
- `accessibility`: Audit and improve web accessibility following WCAG 2.1 guidelines...
- `git-commit-helper`: Generate descriptive commit messages by analyzing git diffs...
```

模型可以直接加载技能并执行其指令：

```
$ dsh --profile <P> "Load the skill named git-commit-helper and quote its first heading."
# Git Commit Helper
```

### 📦 安装

repo 当前为 private（开源与否待人工复核），可本地路径安装；公开后可用 GitHub 安装：

```bash
# 方式一：本地路径（当前 repo 未发布到 npm，也未开源）
dsh plugin --profile <P> add /path/to/dsh-claude-code-templates

# 方式二：GitHub（开源后可用；首次安装需允许构建脚本，见 dsh plugin 提示）
dsh plugin --profile <P> add github:GongYuanCaiJi/dsh-claude-code-templates
```

注意：新 profile 需先加入 headless 模式包（`dsh plugin --profile <P> add @deepseek-ai/dsh-headless`，
并在 profile 的 `package.json` 的 `dsh.profile.bundles` 中追加 `@deepseek-ai/dsh-headless`），否则 `dsh --profile <P> "任务"` 不会启动可回答的 agent。

### 🚀 使用

```bash
dsh --profile <P> "用 skill 工具加载 pdf 技能，把这份文档转成 PDF"
```

模型会在需要时自行从 catalog 加载对应技能；也可以指名让模型加载某个技能。全部技能内容见 `skills/` 目录（与上游目录结构一致）。

### ❓ FAQ

- **为什么是 897 个 SKILL.md 而不是 896？** 上游实际有 897 个技能文件（其中 `postgres-schema-design/SKILL.MD` 副档名大写，
  逐字节内容相同；为在大小写敏感文件系统上可解析，改名 `SKILL.md`）。
- **技能为什么是英文？** 上游即英文；「100% 原样复制」规则禁止翻译技能内容，本 README 才是中文门面。
- **重名技能怎么处理？** 25 个技能名跨类别重复（30 个文件，14 组内容完全相同、11 组不同），dsh catalog 以名称为键只展示一份（类别字母序最前者），所有文件都在 repo 里；被遮蔽的内容可由文件路径取用。
- **「逐字保留」怎么自验？** `node scripts/verify-fidelity.mjs`，或对照 `THIRD_PARTY_NOTICES.md` 里的 diff 命令。

### 🔧 移植改动（完整清单见 THIRD_PARTY_NOTICES.md）

1. `SKILL.MD` → `SKILL.md`（大小写敏感文件系统可解析，内容不变）
2. `torch_geometric` 注册名用其 frontmatter 自声明的 `torch-geometric`（registry 要求 kebab-case）
3. 递归收集嵌套技能（如 `game-development/2d-games`，上游本身如此组织）
4. 新增 dsh 载入外壳（`lib/` + `package.json` + `cordis.patch.yml`），采用与 dsh-lens 相同的 provider 写法

### 📜 License

本 repo 的 [MIT](LICENSE) 只涵盖**本移植自己的代码**：载入外壳（`lib/`）、打包（`package.json`、`cordis.patch.yml`）、测试（`test/`、`scripts/`）。双版权：上游 `Copyright (c) 2025 Daniel (San) Ávila (claude-code-templates)` + `Copyright (c) 2026 GongYuanCaiJi (dsh port)`。`package.json` 的 `license: "MIT"` 指的就是这一部分。

`skills/` 与 `.claude-plugin/` 底下的**上游内容不是统一 MIT**，而是**混合授权**，以各目录自己的 `LICENSE` 为准：69 份目录级 LICENSE = 44 份 Apache-2.0 + 12 份 MIT（版权归各作者）+ 13 份 Anthropic source-available（`© 2025 Anthropic, PBC. All rights reserved`，仅作参考、不可再分发）。逐目录明细见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；Anthropic 那批的完整说明见 [ANTHROPIC_ATTRIBUTION.md](skills/ANTHROPIC_ATTRIBUTION.md)（上游原样保留，也见[上游 LICENSE](https://github.com/davila7/claude-code-templates/blob/main/LICENSE)）。

**如果你喜欢这套技能，请也给上游 [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) 一个 star ⭐**

---

## English

**All 897 Claude Code skill templates, ported wholesale to DeepSeek Harness (dsh) — nothing filtered, everything shipped.**

A dsh port of [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) (MIT, 30k+ stars).
The upstream 897 `SKILL.md` files and all 4770 companion files (references/, examples/, assets/, …) are copied
**byte-for-byte**; skill content is untranslated and unmodified, wrapped in a minimal dsh loading shell.

### ✨ Features

- **All 897 skills shipped**: the dsh skill catalog shows 867 unique skills (25 names repeat across categories, 30 files total; 14 pairs byte-identical, 11 differ; the catalog keys by name and shows one winner — all files remain in the repo)
- **29 categories**: ai-research, development, business-marketing, creative-design, scientific, security, web-development, workflow-automation, and more — including Anthropic's official skills (attribution preserved upstream, kept verbatim)
- **Verifiable fidelity**: `THIRD_PARTY_NOTICES.sha256` pins SHA-256 of all 5667 files; `npm prepare` / `npm prepack` fail on drift
- **Includes the official Claude plugin skill** `.claude-plugin/skills/owasp-security` (OWASP six-standard security reference with examples/)
- **Model-invocable** through dsh's standard `skill` tool, zero extra configuration

### 📸 Demo

Skill catalog in a headless session (real output, excerpt):

```
- `2d-games`: 2D game development principles. Sprites, tilemaps, physics, camera.
- `ab-test-setup`: When the user wants to plan, design, or implement an A/B test or experiment...
- `git-commit-helper`: Generate descriptive commit messages by analyzing git diffs...
```

The model loads skills through the `skill` tool and follows them:

```
$ dsh --profile <P> "Load the skill named git-commit-helper and quote its first heading."
# Git Commit Helper
```

### 📦 Install

The repo is private pending human review; use a local path, or GitHub once public:

```bash
# Local path (not yet published to npm or open-sourced)
dsh plugin --profile <P> add /path/to/dsh-claude-code-templates

# GitHub (after open-sourcing; allow build scripts when prompted)
dsh plugin --profile <P> add github:GongYuanCaiJi/dsh-claude-code-templates
```

Note: a fresh profile needs the headless mode bundle — `dsh plugin --profile <P> add @deepseek-ai/dsh-headless`
and append `@deepseek-ai/dsh-headless` to `dsh.profile.bundles` in the profile's `package.json` —
otherwise `dsh --profile <P> "task"` will not boot an answering agent.

### 🚀 Usage

```bash
dsh --profile <P> "Use the skill tool to load the pdf skill and convert this document to PDF"
```

The model loads the matching skill from the catalog on demand. All skill content lives under `skills/`,
mirroring the upstream directory structure.

### ❓ FAQ

- **897 SKILL.md, not 896?** Upstream actually ships 897 skill files; one (`postgres-schema-design/SKILL.MD`)
  has an uppercase extension (identical bytes) — renamed to `SKILL.md` so case-sensitive filesystems can resolve it.
- **Why are the skills in English?** The upstream is English; the "100% verbatim copy" rule forbids translating
  skill content. This README is the Chinese-facing surface.
- **Duplicate names?** 25 names repeat across categories (30 files; 14 pairs identical, 11 differ). The dsh catalog keys by name and shows one winner (first alphabetically). All files remain in the repo; shadowed content is reachable by file path.
- **How do I verify fidelity?** `node scripts/verify-fidelity.mjs`, or the diff commands in `THIRD_PARTY_NOTICES.md`.

### 🔧 Port changes (full list in THIRD_PARTY_NOTICES.md)

1. `SKILL.MD` → `SKILL.md` (case-sensitive FS resolvability; bytes unchanged)
2. `torch_geometric` registered under its frontmatter-declared `torch-geometric` (registry requires kebab-case)
3. Recursive collection of nested skills (e.g. `game-development/2d-games`, as upstream organizes them)
4. Added the dsh loading shell (`lib/` + `package.json` + `cordis.patch.yml`), using the same provider pattern as dsh-lens

### 📜 License

This repo's [MIT](LICENSE) covers **only this port's own code**: the loading shell (`lib/`), packaging (`package.json`, `cordis.patch.yml`), tests (`test/`, `scripts/`). Dual copyright: upstream `Copyright (c) 2025 Daniel (San) Ávila (claude-code-templates)` + `Copyright (c) 2026 GongYuanCaiJi (dsh port)`. The `license: "MIT"` field in `package.json` refers to that part only.

The upstream content under `skills/` and `.claude-plugin/` is **not uniformly MIT** — it is **mixed-licensed**, and each directory's own `LICENSE` governs: 69 directory-level LICENSE files = 44 Apache-2.0 + 12 MIT (copyright to their respective authors) + 13 Anthropic source-available (`© 2025 Anthropic, PBC. All rights reserved`, reference only, not redistributable). Per-directory breakdown in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); the Anthropic batch is documented in [ANTHROPIC_ATTRIBUTION.md](skills/ANTHROPIC_ATTRIBUTION.md) (preserved verbatim from upstream; see also the upstream [LICENSE](https://github.com/davila7/claude-code-templates/blob/main/LICENSE)).

**If you like these skills, please also star upstream [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) ⭐**
