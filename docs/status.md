# Project Status & Roadmap

> **更新日期**: 2026-01-04
> **当前版本**: v0.1.0 (Alpha)
> **状态**: 核心功能闭环，进入体验优化阶段

## 1. Executive Summary (执行摘要)

**Context Bridge** 旨在成为连接 Web 信息碎片与 AI 认知的"第二大脑"桥梁。目前，我们已经完成了从 0 到 1 的核心链路建设，实现了"抓取-存储-合成"的最小可行性产品 (MVP)。

下一阶段的战略重点将从**"功能实现"**转向**"用户体验 (UX)"**与**"生态扩展 (Adapters)"**。我们需要降低用户的使用门槛，并扩大可抓取的高价值信息源。

## 2. Current Progress (当前进展 v0.1.0)

### ✅ 已完成 (Completed)
| 模块 | 功能点 | 说明 |
| :--- | :--- | :--- |
| **Infrastructure** | MV3 架构 | 采用 Vite + Rolldown 双构建流程，Shadow DOM 隔离 |
| **Capture** | 通用抓取 | 基于 Readability 解析网页正文 |
| **Capture** | ChatGPT Adapter | 针对 ChatGPT 动态注入抓取按钮 |
| **Storage** | 数据同步 | 基于 Storage Events 的多端状态管理 |
| **UI** | Sidepanel | 拖拽排序 (DnD)、分栏布局、暗色模式基础 |
| **AI** | 合成引擎 | 支持 OpenAI 接口，自定义 Prompt 模板 |

### ⚠️ 已知问题 (Known Issues)
- **交互粗糙**: 成功/失败反馈依赖原生 `alert()`，缺乏专业感。
- **引导缺失**: 新用户安装后不知道如何开始。
- **源覆盖少**: 仅深度适配了 ChatGPT，缺少 Claude、GitHub 等开发者高频场景。
- **安全隐患**: API Key 明文存储（MVP 阶段可接受，需排期改进）。

---

## 3. Product Roadmap (产品路线图)

### Phase 1: Polish & Experience (v0.2.0) - *本周重点*
> **目标**: 让产品"好用"，不仅仅是"能用"。

- [ ] **UX 升级**: 引入 Toast 通知系统 (Sonner/Hot-toast)，移除所有 `alert()`。
- [ ] **空状态设计**: Sidepanel 各个区域在无数据时提供引导文案和插画。
- [ ] **Claude.ai 适配**: 增加对 Claude 的深度支持（复用 Adapter 模式）。
- [ ] **视觉优化**: 统一 Capture Overlay 的样式，使其更符合原生 OS 质感。

### Phase 2: Power User Features (v0.3.0)
> **目标**: 覆盖开发者核心工作流。

- [ ] **GitHub Adapter**: 一键抓取代码片段、Issue 讨论、PR 描述。
- [ ] **Local LLM Support**: 显式支持 Ollama/LM Studio (无需手动配 Base URL)。
- [ ] **快捷键支持**: `Alt+C` 快速捕获选区，`Alt+S` 打开侧边栏。
- [ ] **导出增强**: 支持一键导出为 Markdown 文件或复制到剪贴板（兼容 Obsidian/Notion 格式）。

### Phase 3: Ecosystem (v1.0.0)
> **目标**: 正式发布版本。

- [ ] **Tag 系统**: 对 Clip 进行分类管理。
- [ ] **历史归档搜索**: 本地全文检索。
- [ ] **Onboarding Tour**: 首次安装的交互式教程。

---

## 4. Technical Debt (技术债)

- **测试覆盖率**: 核心 Utility (Parsing, Tokenizer) 缺少单元测试。
- **类型复用**: `ClipItem` 等类型定义在多处可能有冗余，需统一维护。
- **错误处理**: AI 请求超时或网络中断时的重试机制。

## 5. Next Actions (立即执行)

1. **UX**: 实现 Toast 组件，替换现有 `alert`。
2. **Feat**: 开发 `ClaudeAdapter`。
3. **Docs**: 完善 `README.md` 的安装指南。
