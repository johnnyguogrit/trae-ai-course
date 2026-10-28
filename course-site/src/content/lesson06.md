# 第 6 课：JavaScript 让网页动起来

> 产出项目：**点击计数器 + 变色按钮页面**（见 `projects/counter/`）

---

## 本课目标

- 理解 JavaScript 的角色：网页的"肌肉"，负责交互。
- 掌握 JS 基础：**变量（let）、函数、事件监听、DOM 操作**。
- 用 Tab 补全写事件处理函数，完成计数器与随机变色按钮。

## 课前准备

- [ ] 复习第 5 课的 HTML 标签和 CSS。
- [ ] 打开 `projects/counter/` 确认双击 `index.html` 能正常运行。

---

## 模块 1：JavaScript 初体验（10 分钟）

### 知识点讲解

- JS 写在哪里？`<script>` 标签里，或独立 `.js` 文件用 `<script src="script.js"></script>` 引入（推荐，**放在 body 末尾**）。
- 变量：`let count = 0;`（let = 定义一个会变的变量）。
- 控制台：`console.log("hello")` 在浏览器按 **F12** 的 Console 面板里能看到，是 JS 的 print。
- 弹窗：`alert("你好")`。

### 教师演示脚本

1. 在 HTML 末尾加 `<script>`，写 `alert("网页加载好了！")`，刷新页面看弹窗。
2. 按 F12 打开开发者工具，演示 `console.log`。
3. 输入注释 `// 定义变量 count 初始为 0，并打印到控制台` → Tab 补全。

### 学生动手任务（5 分钟）

在你的页面里加 `<script>`：页面打开时弹窗"欢迎来到我的网页"，并在控制台打印你的名字。按 F12 验证。

> **AI 提示词示例**：
>
> ```
> 在 HTML 页面里加 JavaScript：页面加载时 alert 欢迎语，并用 console.log 打印我的名字。代码加中文注释。
> ```

---

## 模块 2：事件与 DOM —— 让按钮听懂点击（15 分钟）

### 知识点讲解

- **DOM**：JS 眼中网页的"家族树"，每个标签都是一个可以抓到手的对象。
- 抓元素：`document.getElementById("btn")` —— 抓取 id 为 btn 的标签。
- 改内容：`element.textContent = "新文字";`。
- 听事件：

```javascript
btn.addEventListener("click", function () {
    // 点击 btn 时，这里的代码就会执行
});
```

### 教师演示脚本

1. 写一个按钮 `<button id="btn">点我</button>` 和一段 `<p id="msg">还没点过</p>`。
2. 输入注释 `// 点击按钮时，把 msg 的文字改成"你点了我！"` → 让 AI 补全 JS → Tab。
3. 刷新页面点击验证。

### 学生动手任务（8 分钟）

做一个"变脸"按钮：页面有一句话，点按钮在两个句子之间来回切换（提示：用一个变量记录当前是第几句，或者用 if 判断当前文字）。

> **AI 提示词示例**：
>
> ```
> HTML 里有一个 p 标签 id="msg" 和一个按钮 id="btn"。写 JavaScript：每点击一次按钮，msg 的文字就在"今天天气真好"和"明天会更好"之间切换。加中文注释。
> ```

---

## 模块 3：项目实战 —— 点击计数器 + 变色按钮（25 分钟）

### 项目效果

- 一个大数字显示当前点击次数；
- 「点我 +1」按钮：数字加 1；
- 「重置」按钮：数字归零；
- 「变色」按钮：页面背景随机换一种颜色。

### 教师演示脚本

1. 打开 `projects/counter/index.html`，演示三个按钮的功能。
2. 打开 `script.js`，带学生读代码，指出三处关键：变量 `count`、`addEventListener`、`Math.random()` 生成随机颜色。
3. 现场改一处：把每次 +1 改成 +2，刷新验证。

### 学生动手任务（18 分钟）

**任务 A（跟做）**：新建 `counter.html`，用注释 + Tab 补全的方式指挥 AI 写出计数器：

```javascript
// 定义变量 count 初始为 0
// 抓取 id 为 num 的元素和 id 为 addBtn 的按钮
// 给按钮添加点击事件：count 加 1，并更新 num 的显示文字
```

**任务 B（独立完成变色按钮）**：加一个按钮，点击时让 `document.body.style.background` 变成随机颜色。随机颜色的写法不会就问 Chat（提示词见下）。

> **AI 提示词示例**：
>
> ```
> JavaScript 里怎么生成一个随机的十六进制颜色（比如 #a3f2c1）？给我一个函数 randomColor()，并演示点击按钮时把网页背景改成随机颜色。加中文注释。
> ```

---

## 课堂练习（10 分钟）

给计数器加"彩蛋"：当 count 到 10 的倍数时，alert 一句"🎉 达成 X 次点击！"。提示：`count % 10 === 0` 表示是 10 的倍数。

## 课后挑战

**做"鼠标移入计数"版**：把点击改成鼠标移入一个大方块就 +1，移出不算。把事件名从 `"click"` 换成什么？自己去查（提示：问 Chat「JS 鼠标移入事件叫什么」）。

## 常见问题与 AI 排错指南

| 现象 | 原因 | 修法 |
| --- | --- | --- |
| 点击没反应，F12 报 `null` | `getElementById` 抓不到元素 | 检查 id 拼写；`<script>` 是否放在 body 末尾（元素还没加载就抓了） |
| `Uncaught SyntaxError` | JS 语句写错，多半漏分号/括号 | 看 F12 Console 报错的行号 |
| 数字不变 | 改了变量但忘了更新页面文字 | `num.textContent = count;` 这行有没有写 |
| 引入 js 文件无效 | `src` 路径错或文件没保存 | 检查 `<script src="script.js"></script>` 拼写，Ctrl+S 保存 |

排错口诀：**F12 是 JS 的听诊器**——页面没反应，第一件事就是打开 Console 看红色报错，然后原样贴给 Chat。
