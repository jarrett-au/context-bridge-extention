# 产品设计规格书：Context Bridge

## 1. 项目愿景 (Vision)
打造一个**LLM 时代的外部记忆组装工厂**。通过浏览器插件，让用户能够极其高效地从互联网各个角落采集碎片化信息（Web Clipper），在侧边栏进行结构化清洗与重组（Context Assembler），最后生成高质量的上下文投喂给大模型。

## 2. 核心交互流 (User Flow)
用户的典型操作路径分为四个阶段：
1.  **采集 (Capture)：** 在网页端（普通网页或 AI 对话框）通过快捷方式获取内容。
2.  **暂存 (Staging)：** 内容自动飞入侧边栏顶部的“暂存区”，用户进行拖拽排序和勾选。
3.  **合成 (Synthesis)：** 选中条目，选择模板（如“逻辑拼接”），AI 生成预览结果。
4.  **归档 (Archive)：** 确认结果后，原碎片自动归档，合成后的内容复制或发送。

---

## 3. 功能模块详解 (Functional Specifications)

### 3.1. 全局控制系统 (Control System)
*   **全局开关 (Global Toggle)：**
    *   位于插件 Popup 面板及侧边栏顶部。
    *   **OFF 状态：** 停止所有 Content Script 注入，隐藏所有页面上的浮窗和按钮，降低对用户浏览的干扰。
    *   **ON 状态：** 激活采集功能。
*   **黑白名单策略 (Access Control)：**
    *   **黑名单模式（默认）：** 所有网站可用，但在“设置”中添加的域名（如网银、内部系统）自动禁用。
    *   **白名单模式：** 仅在特定列表内的域名（如 `chat.openai.com`, `github.com`）激活。

### 3.2. 采集模块 (Capture Engine)
*目标：获取纯净的 Markdown 文本，去除 HTML 噪音。*

*   **智能选择器 (Smart Selectors)：**
    *   **通用模式：** 鼠标划选文本 -> 浮现“采集”气泡 -> 点击存入暂存区。
    *   **AI 对话模式：** 针对 ChatGPT/Claude/Gemini 页面，自动识别每一条回答的 DOM 节点，在回答下方注入“加入 Context”按钮。
    *   **整页模式：** 右键菜单 -> “采集页面正文”。利用 `Readability` 算法提取正文。
*   **格式清洗：**
    *   使用 `Turndown` 库将 HTML 转换为 Markdown。
    *   **过滤规则：** 自动移除 `<img>`, `<video>`, `<script>`, `<style>` 标签，仅保留文本结构（标题、列表、代码块）。

### 3.3. 侧边栏工作台 (Side Panel Workbench)
*布局：纵向三段式结构，高度可动态调整。*

#### A. 顶部：暂存处理区 (Staging Area)
这是用户的“案板”。
*   **列表视图：** 显示待处理的碎片卡片。
    *   **卡片内容：** 来源图标、标题（截取前20字）、Token 估算值、删除按钮、编辑按钮。
*   **交互逻辑：**
    *   **拖拽排序：** 支持 `Drag & Drop`，调整喂给 LLM 的先后顺序。
    *   **多选机制：** Checkbox 勾选参与本次“合成”的条目。
*   **统计栏：** 实时显示 `已选 3 项 | 约 2,400 Tokens`。

#### B. 中部：AI 合成与预览区 (Synthesis Zone)
这是“加工车间”。默认折叠，点击“合并”后展开。
*   **模板选择器：**
    *   *直接拼接 (Concatenate)*：仅按顺序连接文本。
    *   *去重总结 (Summarize)*：调用 AI 接口去除冗余。
    *   *对话还原 (Dialogue)*：保留 User/AI 的角色标签。
*   **预览编辑窗：** 显示合成后的 Markdown 文本，支持手动二次修改。
*   **动作按钮：**
    *   `复制结果`
    *   `填入 AI 输入框`（如果当前页面是 ChatGPT 等）
    *   `确认并归档`（触发流转逻辑）

#### C. 底部：归档与历史区 (Archive)
这是“仓库”。
*   **流转逻辑：** 当暂存区的条目被“确认并归档”后，卡片会执行**下落动画**移动至此区域。
*   **层级关系 (Lineage)：**
    *   如果是一个“AI 合成”后的新条目，点击详情可查看到它是由哪几个原始碎片生成的（父子链接）。
*   **回溯功能：**
    *   **一键回蓝：** 点击归档区条目的“还原”按钮，该条目重新回到顶部的“暂存区”。

---

## 4. 数据结构设计 (Data Schema)

建议使用 `chrome.storage.local` 存储短期数据，若数据量大可升级为 `IndexedDB`。

### 4.1. 碎片条目 (Clip Item)
```typescript
interface ClipItem {
  id: string;              // UUID
  type: 'text' | 'code' | 'page_content' | 'ai_response';
  content: string;         // 清洗后的 Markdown
  raw_html?: string;       // 可选，保留原始 HTML 以备重新解析
  metadata: {
    source_url: string;
    source_title: string;
    timestamp: number;
    favicon: string;
  };
  status: 'staging' | 'archived'; // 当前处于哪个区域
  token_estimate: number;  // 简单的估算值 (字符数 / 4)
}
```

### 4.2. 合成记录 (Synthesis Session)
```typescript
interface SynthesisItem extends ClipItem {
  is_synthesized: true;
  parent_ids: string[];    // 关联的原始碎片 ID，用于溯源
  template_used: string;   // 使用的模板类型
}
```

---

## 5. 技术栈选型 (Tech Stack)

*   **Core Framework:** Chrome Extension Manifest V3
*   **UI Framework:** React (推荐) 或 Vue3 + TailwindCSS (便于构建侧边栏 UI)
*   **State Management:** Zustand (React) 或 Pinia (Vue) - 处理暂存区/归档区的状态流转
*   **Content Processing:**
    *   `@mozilla/readability`: 网页正文提取
    *   `turndown`: HTML 转 Markdown
    *   `gpt-tokenizer` (可选轻量版): Token 估算
*   **Interaction:**
    *   `SortableJS` / `dnd-kit`: 实现流畅的拖拽排序
    *   `framer-motion` (React) / `AutoAnimate`: 实现列表项从暂存区飞入归档区的平滑动画

---

## 6. 开发路线图 (Roadmap)

### Phase 1: 核心骨架 (MVP)
*   [ ] 搭建 Side Panel 基础 UI。
*   [ ] 实现 Content Script 的“划选采集”功能。
*   [ ] 实现 `Turndown` 转换，将内容存入 Storage 并显示在侧边栏。
*   [ ] 实现侧边栏列表的“一键复制”和“删除”。

### Phase 2: 交互与流转
*   [ ] 引入“暂存区”与“归档区”的分区 UI。
*   [ ] 实现 `SortableJS` 拖拽排序。
*   [ ] 实现 Global Toggle (全局开关) 逻辑。
*   [ ] 开发“流转动画”：点击归档后，数据状态变更及视觉移动。

### Phase 3: AI 增强 (The Brain)
*   [ ] 注入脚本适配：专门识别 ChatGPT/Claude 网页的 DOM 结构。
*   [ ] 开发“AI 合成预览区”。
*   [ ] 接入 OpenAI API (让用户填 Key) 或简单的 Prompt 拼接模板。

---

## 7. 关键交互细节描述 (UX Polish)

为了让这个工具好用，请务必关注以下细节：

1.  **去噪反馈：** 在采集普通网页时，如果用户选中了包含广告的代码块，插件应尽量在转 Markdown 阶段自动剔除，或者在编辑区提供一个“清洗”按钮。
2.  **来源锚点：** 在侧边栏点击某条碎片的“来源链接”时，应尝试打开原标签页并**滚动到当初采集的位置** (使用 Scroll to Text Fragment 技术)。
3.  **防止重复：** 如果用户重复采集了同一段文字，侧边栏应闪烁已存在的卡片，而不是新增一条重复数据。

这份文档为你接下来的开发提供了完整的蓝图。你可以直接将其作为 Prompt 的一部分，分模块让 AI 辅助你编写具体代码。