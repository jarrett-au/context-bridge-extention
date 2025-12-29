# Context Bridge 构建计划书

## 1. 项目概述
Context Bridge 旨在打造一个 LLM 时代的外部记忆组装工厂。通过浏览器插件，用户可以高效采集网页信息（Web Clipper），在侧边栏进行结构化清洗与重组（Context Assembler），最终生成高质量的上下文投喂给大模型。

## 2. 架构设计

### 2.1 技术栈
- **核心框架**: Chrome Extension Manifest V3
- **构建工具**: Vite + React + TypeScript
- **样式方案**: TailwindCSS (用于快速构建侧边栏 UI)
- **状态管理**: Zustand (轻量级，适合 React)
- **核心库**:
    - `@mozilla/readability`: 网页正文提取
    - `turndown`: HTML 转 Markdown
    - `gpt-tokenizer`: Token 估算
    - `dnd-kit`: 拖拽排序 (比 SortableJS 更适合 React)
    - `framer-motion`: 动画效果
    - `lucide-react`: 图标库

### 2.2 核心模块
1.  **Background Service Worker**: 处理跨组件通信、右键菜单、以及部分持久化逻辑。
2.  **Content Scripts**:
    - `capture-overlay.tsx`: 负责网页端的划选气泡、AI 对话框注入按钮。
    - `readability.ts`: 负责整页内容的解析与提取。
3.  **Side Panel (React App)**:
    - `App.tsx`: 主入口。
    - `StagingArea`: 暂存区组件。
    - `SynthesisZone`: 合成区组件。
    - `ArchiveArea`: 归档区组件。
4.  **Popup**: 全局开关控制、简单的状态预览。
5.  **Options**: 设置页面（黑白名单、API Key 配置）。

### 2.3 数据流
- **采集**: Content Script -> (Message) -> Background/Side Panel -> Storage (Local).
- **状态**: Side Panel 从 Storage 读取数据，使用 Zustand 维护运行时状态（选中、排序等）。
- **归档**: Staging Area -> (Action) -> Synthesis -> Archive Area (Storage Update).

## 3. 目录结构规划
```
context-bridge-extension/
├── src/
│   ├── assets/              # 图标、图片
│   ├── background/          # Service Worker
│   │   └── index.ts
│   ├── content/             # Content Scripts
│   │   ├── components/      # 注入页面的 React 组件 (如气泡)
│   │   └── index.tsx        # 入口
│   ├── sidepanel/           # 侧边栏 React 应用
│   │   ├── components/      # UI 组件 (Card, List, Button...)
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── store/           # Zustand Store
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── popup/               # 点击插件图标弹出的页面
│   ├── options/             # 设置页面
│   ├── lib/                 # 工具库 (markdown, tokenizer, readability)
│   ├── types/               # TypeScript 类型定义
│   └── manifest.json
├── public/
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 4. 详细开发计划

### Phase 1: 核心骨架 (MVP)
**目标**: 跑通“采集 -> 存储 -> 展示”的最简闭环。

- **Step 1.1: 项目初始化**
    - 使用 Vite 创建 React + TS 项目。
    - 配置多入口构建 (Sidepanel, Content, Background, Popup)。
    - 配置 TailwindCSS。
    - 编写基础 `manifest.json`。

- **Step 1.2: 侧边栏基础 UI (Side Panel)**
    - 实现三段式布局框架 (Header, Staging, Archive)。
    - 定义 `ClipItem` 数据结构。
    - Mock 一些数据展示在列表中。

- **Step 1.3: 采集功能 (Content Script)**
    - 实现“鼠标划选”监听。
    - 弹出简单的“采集”按钮 (Shadow DOM 以避免样式冲突)。
    - 引入 `turndown` 将选中 HTML 转为 Markdown。

- **Step 1.4: 通信与存储**
    - 实现 Content Script 发送消息给 Side Panel/Background。
    - 实现 `chrome.storage.local` 的读写封装。
    - 联调：网页划选 -> 点击采集 -> 侧边栏实时出现新条目。

- **Step 1.5: 基础管理**
    - 实现侧边栏条目的“删除”功能。
    - 实现“一键复制”Markdown 内容。

### Phase 2: 交互与流转
**目标**: 完善用户体验，实现暂存与归档的流转。

- **Step 2.1: 暂存区交互**
    - 引入 `dnd-kit` 实现列表拖拽排序。
    - 添加 Token 估算显示 (集成 `gpt-tokenizer` 或简单算法)。
    - 实现多选 Checkbox 逻辑。

- **Step 2.2: 归档区与动画**
    - 实现归档区 UI。
    - 使用 `framer-motion` 实现“确认并归档”时的下落动画。
    - 实现“一键回蓝” (Restore) 功能。

- **Step 2.3: 全局控制**
    - 实现 Popup 页面的全局开关 (Global Toggle)。
    - 在 Content Script 中监听开关状态，动态启用/禁用采集功能。

### Phase 3: AI 增强与高级采集
**目标**: 增强采集能力，接入 AI 合成。

- **Step 3.1: 智能选择器**
    - 针对 ChatGPT/Claude 页面，分析 DOM 结构。
    - 在 AI 回答下方注入“Add to Context”按钮。
    - 实现右键菜单“采集页面正文” (`Readability` 集成)。

- **Step 3.2: 合成预览区 (Synthesis Zone)**
    - 实现展开/折叠动画。
    - 实现模板选择逻辑 (直接拼接、去重、对话模式)。
    - 提供合成结果的预览编辑框 (Textarea)。

- **Step 3.3: 设置与优化**
    - 开发 Options 页面：黑白名单管理。
    - 优化 Markdown 清洗规则 (去除广告干扰)。
    - 实现“来源锚点”跳转 (Scroll to Text Fragment)。

### Phase 4: 测试与发布
- **Step 4.1: 测试**
    - 单元测试 (关键工具函数)。
    - E2E 测试 (手动测试各主流网站兼容性)。
- **Step 4.2: 打包发布**
    - 构建生产版本。
    - 准备发布素材。

## 5. 立即执行的任务 (Next Steps)
1.  **环境搭建**: 初始化代码仓库，配置构建脚本。
2.  **原型验证**: 快速实现一个能从网页发消息到 Side Panel 的 Demo。
