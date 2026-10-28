// ============================================
// 打地鼠游戏逻辑（第 7 课配套项目）
// 规则：30 秒内，地鼠每 0.8 秒随机从一个洞冒出，
//      停留 1 秒后缩回，点中 +1 分。
// ============================================

// ---------- 可调参数 【改这里】 ----------
const GAME_TIME = 30;       // 游戏总时长（秒）
const MOLE_INTERVAL = 800;  // 地鼠出现的间隔（毫秒），越小越难
const MOLE_STAY = 1000;     // 地鼠停留的时间（毫秒）

// ---------- 抓取页面元素 ----------
const gameBoard = document.getElementById("game");       // 游戏区
const scoreElement = document.getElementById("score");   // 分数显示
const timeElement = document.getElementById("time");     // 倒计时显示
const startBtn = document.getElementById("startBtn");    // 开始按钮
const gameOverPanel = document.getElementById("gameOver"); // 结算面板
const finalScore = document.getElementById("finalScore");  // 最终得分
const restartBtn = document.getElementById("restartBtn");  // 重新开始按钮

// ---------- 游戏状态变量 ----------
let score = 0;            // 当前得分
let timeLeft = GAME_TIME; // 剩余时间
let moleTimer = null;     // 地鼠出现的定时器
let timeTimer = null;     // 倒计时的定时器
let playing = false;      // 游戏是否正在进行

// ---------- 第 1 步：生成 9 个洞 ----------
const holes = []; // 数组：保存所有洞元素
for (let i = 0; i < 9; i++) {
    const hole = document.createElement("div"); // 动态创建一个 div
    hole.className = "hole";                    // 给它 .hole 样式
    hole.innerHTML = '<span class="mole">🐹</span>'; // 洞里放一只隐藏的地鼠

    // 给每个洞绑定点击事件：点中有地鼠的洞就加分
    hole.addEventListener("click", function () {
        // 只有"游戏进行中 + 这个洞里有地鼠"才记分
        if (playing && hole.classList.contains("active")) {
            score = score + 1;                    // 得 1 分
            scoreElement.textContent = score;     // 更新页面上的分数
            hole.classList.remove("active");      // 地鼠立刻缩回去
        }
    });

    gameBoard.appendChild(hole); // 把洞放进游戏区
    holes.push(hole);            // 也存进数组，方便随机挑选
}

// ---------- 第 2 步：地鼠随机出现 ----------
function showMole() {
    // 先让所有洞里的地鼠都缩回去（保证同一时间只有一只）
    holes.forEach(function (hole) {
        hole.classList.remove("active");
    });

    // Math.random() * 9 得到 0~8.99，Math.floor 取整后就是 0~8
    const index = Math.floor(Math.random() * holes.length);
    const luckyHole = holes[index];     // 随机选一个洞
    luckyHole.classList.add("active");  // 让这个洞的地鼠冒出来

    // setTimeout：MOLE_STAY 毫秒后，地鼠自动缩回
    setTimeout(function () {
        luckyHole.classList.remove("active");
    }, MOLE_STAY);
}

// ---------- 第 3 步：开始游戏 ----------
function startGame() {
    // 重置状态
    score = 0;
    timeLeft = GAME_TIME;
    playing = true;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    gameOverPanel.classList.add("hidden"); // 隐藏结算面板
    startBtn.disabled = true;              // 游戏期间禁用开始按钮，防止重复开定时器

    // 保险起见，先清掉可能残留的旧定时器
    clearInterval(moleTimer);
    clearInterval(timeTimer);

    // 定时器 1：每隔 MOLE_INTERVAL 毫秒让一只地鼠出现
    moleTimer = setInterval(showMole, MOLE_INTERVAL);

    // 定时器 2：每秒倒计时一次
    timeTimer = setInterval(function () {
        timeLeft = timeLeft - 1;              // 剩余时间减 1
        timeElement.textContent = timeLeft;   // 更新显示

        if (timeLeft <= 0) {
            endGame(); // 时间到，结束游戏
        }
    }, 1000); // 1000 毫秒 = 1 秒
}

// ---------- 第 4 步：结束游戏 ----------
function endGame() {
    playing = false;
    clearInterval(moleTimer);  // 停掉地鼠定时器
    clearInterval(timeTimer);  // 停掉倒计时定时器

    // 所有地鼠缩回去
    holes.forEach(function (hole) {
        hole.classList.remove("active");
    });

    finalScore.textContent = score;            // 显示最终得分
    gameOverPanel.classList.remove("hidden");  // 弹出结算面板
    startBtn.disabled = false;                 // 恢复开始按钮
}

// ---------- 绑定按钮事件 ----------
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", function () {
    gameOverPanel.classList.add("hidden");
    startGame(); // 重新开始一局
});

console.log("打地鼠加载完成，点击「开始游戏」来玩吧！");
