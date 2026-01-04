# Project Status & Roadmap

> **更新日期**: 2026-01-04
> **当前版本**: v0.2.0 (Beta)
> **状态**: Phase 1 完成，UX 显著提升

## 1. Executive Summary (执行摘要)

**Context Bridge** 旨在成为连接 Web 信息碎片与 AI 认知的"第二大脑"桥梁。目前，我们已经完成了 v0.2.0 版本，重点优化了用户体验和扩展了对 Claude.ai 的支持。

下一阶段 (Phase 2) 将专注于**"Power User Features"**，为开发者提供更强大的工作流支持。

## 2. Current Progress (当前进展 v0.2.0)

### ✅ 已完成 (Completed)
| 模块 | 功能点 | 说明 |
| :--- | :--- | :--- |
| **UX** | Toast 通知 | 集成 Sonner，全面替换 alert()，支持 Shadow DOM |
| **UX** | Capture Overlay | 视觉重构，增加动画 (Framer Motion) 和磨砂玻璃效果 |
| **UX** | Empty States | Sidepanel 各区域增加插画引导和空状态提示 |
| **Adapter** | Claude.ai | 智能识别 Claude 聊天界面并注入采集按钮 |
| **Infrastructure** | MV3 架构 | 采用 Vite + Rolldown 双构建流程，Shadow DOM 隔离 |
| **Capture** | ChatGPT Adapter | 针对 ChatGPT 动态注入抓取按钮 |
| **UI** | Sidepanel | 拖拽排序 (DnD)、分栏布局 |

### ⚠️ 已知问题 (Known Issues)
- **CSS 隔离**: 虽然大部分样式已内联或 scoped，但在极少数复杂页面可能仍有冲突。
- **Claude Adapter**: 依赖 DOM 结构嗅探，Claude 界面更新可能导致失效（需长期维护）。
- **安全隐患**: API Key 明文存储（MVP 阶段可接受，需排期改进）。

---

## 3. Product Roadmap (产品路线图)

### Phase 1: Polish & Experience (v0.2.0) - *Completed*
> **目标**: 让产品"好用"，不仅仅是"能用"。

- [x] **UX 升级**: 引入 Toast 通知系统 (Sonner)，移除所有 `alert()`。
- [x] **空状态设计**: Sidepanel 各个区域在无数据时提供引导文案和插画。
- [x] **Claude.ai 适配**: 增加对 Claude 的深度支持（复用 Adapter 模式）。
- [x] **视觉优化**: 统一 Capture Overlay 的样式，使其更符合原生 OS 质感。

### Phase 2: Power Features (v0.3.0) - *Next Priority*
> **目标**: 覆盖开发者核心工作流。

- [ ] **编辑 Clip**: 直接在 Sidepanel 编辑 Clip 内容。
- [ ] **快捷键支持**: `Ctrl+I` 打开侧边栏。
- [ ] **导出增强**: 支持一键导出为 Markdown 文件或复制到剪贴板（兼容 Obsidian/Notion 格式）。
- [ ] **Tag 系统**: 对 Clip 进行分类管理。
- [ ] **历史归档搜索**: 本地全文检索。
- [ ] **Onboarding Tour**: 首次安装的交互式教程。

---

## 4. Technical Debt (技术债)

- **测试覆盖率**: 核心 Utility (Parsing, Tokenizer) 缺少单元测试。
- **类型复用**: `ClipItem` 等类型定义在多处可能有冗余，需统一维护。
- **错误处理**: AI 请求超时或网络中断时的重试机制。

## 5. Next Actions (立即执行)

1. **Review**: 验证 v0.2.0 的所有新功能。
2. **Merge**: 将 `feature/phase1-ux-polish` 合并回主分支。
3. **Plan**: 启动 Phase 2 (Power User Features)。
