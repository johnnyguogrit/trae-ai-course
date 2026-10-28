// ============================================
// 点击计数器 + 随机变色按钮（第 6 课配套项目）
// ============================================

// 第 1 步：定义变量。let = 定义一个"会变化"的变量
let count = 0; // 【改这里】想让初始值不是 0？改这个数字

// 第 2 步：抓取页面元素（靠 HTML 里的 id）
const numElement = document.getElementById("num");       // 大数字显示区
const addBtn = document.getElementById("addBtn");        // +1 按钮
const resetBtn = document.getElementById("resetBtn");    // 重置按钮
const colorBtn = document.getElementById("colorBtn");    // 变色按钮

// 第 3 步：给按钮绑定点击事件
// addEventListener("click", 函数) 意思是：被点击时就执行这个函数

// 「点我 +1」按钮：count 加 1，并更新页面上的数字
addBtn.addEventListener("click", function () {
    count = count + 1;                 // 变量加 1
    numElement.textContent = count;    // 把新数字显示到页面上（这步忘了页面就不变！）

    // 彩蛋：每到 10 的倍数就庆祝一下
    if (count % 10 === 0) {            // % 是取余数，count % 10 === 0 表示是 10 的倍数
        alert("🎉 哇，已经点了 " + count + " 次！");
    }
});

// 「重置」按钮：count 归零并更新显示
resetBtn.addEventListener("click", function () {
    count = 0;
    numElement.textContent = count;
});

// 生成随机十六进制颜色的函数，例如 "#a3f2c1"
function randomColor() {
    let color = "#"; // 十六进制颜色以 # 开头
    const chars = "0123456789abcdef";  // 十六进制的 16 个字符
    for (let i = 0; i < 6; i++) {      // 循环 6 次，每次随机挑一个字符
        const index = Math.floor(Math.random() * 16); // 0~15 的随机整数
        color = color + chars[index];
    }
    return color; // return 把结果送出去
}

// 「随机变色」按钮：把页面背景改成随机颜色
colorBtn.addEventListener("click", function () {
    document.body.style.background = randomColor();
});

// 页面加载时，在控制台打个招呼（按 F12 → Console 可以看到）
console.log("计数器加载完成！当前 count =", count);
