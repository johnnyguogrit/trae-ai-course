export interface GameStep {
  id: number
  title: string
  file: string
  goal: string
  effect: string
  syntax: { name: string; detail: string }[]
  idePrompt: string
  soloPrompt: string
  task: string
  checkpoints: string[]
  errors: { problem: string; solution: string }[]
}

export const gameSteps: GameStep[] = [
  {
    id: 1,
    title: '游戏窗口与主循环',
    file: 'steps/step01/main.py',
    goal: '创建能持续刷新、能正常退出的 Pygame 窗口。',
    effect: '看到 900×600 的深蓝色窗口；它不断处理事件，而不是打开后马上关闭。',
    syntax: [
      { name: '变量与数值', detail: '用 SCREEN_WIDTH、BG_COLOR 等变量集中保存尺寸、颜色和标题。' },
      { name: 'while 主循环', detail: 'while running 让程序持续处理事件和绘制画面。' },
      { name: '布尔值与 if', detail: '收到退出事件后把 running 设为 False，结束循环。' },
    ],
    idePrompt: '我是 Python 零基础学生，正在学习 Pygame。请打开 steps/step01/main.py，只逐行解释窗口变量、while 主循环、事件退出和 clock.tick(60)，不要修改代码。然后给我一个只改窗口背景色的小练习，并告诉我应该改哪一行。',
    soloPrompt: `上下文：这是 AI 协同游戏设计专题的第 1 步，当前只有 steps/step01/main.py，使用 Pygame 绘制窗口，无外部素材。
目标：制作一个 900×600 的游戏窗口，标题为「AI 外星人入侵 · 第1步」，背景为深蓝色，并能稳定刷新。
约束：保持单文件 main.py 和中文注释；保留「学生修改区」；点击关闭按钮、按 Q 或 Esc 都能退出；不要添加飞船、子弹等后续功能，不依赖网络或图片。
运行验证：请实际启动程序，确认窗口可显示和退出；检查没有语法错误。
保护条件：不得破坏已有事件循环和 60 FPS 限速，不做无关重构。完成后列出修改点和手动验收方法。`,
    task: '在「学生修改区」把窗口改为 960×640，背景色改为 (240, 248, 255)，标题加上自己的姓名或昵称。',
    checkpoints: ['窗口尺寸、背景色和标题确实发生变化', '窗口能持续显示，不会立即退出', '关闭按钮、Q、Esc 都能退出', '能指出一个变量、一个 while 和一个 if'],
    errors: [
      { problem: "ModuleNotFoundError: No module named 'pygame'", solution: '在当前 Python 环境执行 python -m pip install pygame。' },
      { problem: '窗口无响应', solution: '检查 pygame.event.get() 是否仍在主循环中。' },
      { problem: 'IndentationError', solution: '检查 while、for、if 内代码是否统一缩进 4 个空格。' },
    ],
  },
  {
    id: 2,
    title: '飞船与左右移动',
    file: 'steps/step02/main.py',
    goal: '用类和对象创建飞船，按住方向键移动，松开停止，不飞出屏幕。',
    effect: '屏幕底部出现三角形飞船；长按左右键连续移动，碰到边界会停下。',
    syntax: [
      { name: '类与对象', detail: 'Ship 类描述飞船的数据和行为，ship = Ship(...) 创建一个对象。' },
      { name: '布尔移动标志', detail: 'KEYDOWN 把 moving_left/right 设为 True，KEYUP 设回 False。' },
      { name: '浮点位置与边界', detail: 'self.x 精确累加，rect 负责绘制；if 限制左右范围。' },
    ],
    idePrompt: '请阅读 steps/step02/main.py 中的 Ship 类。用初学者能懂的话解释 self.x、self.rect、moving_left 和 moving_right 的关系，不要改代码。然后请用注释 + 代码补全引导我把飞船速度从 4.0 改为 6.0，一次只给一步。',
    soloPrompt: `上下文：这是第 2 步，steps/step02/main.py 已有窗口主循环，需要用 Pygame 图形加入飞船。
目标：在窗口底部中央创建三角形飞船，按住左右方向键连续移动，松开停止，并始终留在屏幕内。
约束：使用 Ship 类和对象、布尔移动标志、if 边界判断；self.x 用浮点数保存位置；保持单文件和中文注释；保留第 1 步窗口、60 FPS 以及 Q/Esc/关闭按钮退出。
运行验证：启动后测试长按左右键、松开、撞击左右边界，确认移动和退出正常。
保护条件：不得加入子弹或外星人，不删除学生修改区，不破坏第 1 步功能。完成后说明修改点和验收结果。`,
    task: '把 SHIP_SPEED 从 4.0 改为 6.0，换飞船颜色；再把边界规则改为左右各保留 20 像素安全距离。',
    checkpoints: ['长按左右键连续移动，松开立即停止', '飞船不会越过左右边界或新设安全边界', '能解释 True/False 的含义', '能指出类和对象各在哪里'],
    errors: [
      { problem: '按键只动一下', solution: '使用持续更新的移动标志，不要只在 KEYDOWN 时改一次坐标。' },
      { problem: '松键后仍移动', solution: '检查 KEYUP 是否把对应标志设回 False。' },
      { problem: '飞船抖动或速度异常', solution: '每帧从 self.x 更新 rect.centerx，不要重复累加。' },
    ],
  },
  {
    id: 3,
    title: '发射子弹',
    file: 'steps/step03/main.py',
    goal: '用函数和列表管理多发子弹，限制同屏数量并删除离屏子弹。',
    effect: '按空格从飞船顶端发射黄色矩形子弹；连续射击也不会无限创建对象。',
    syntax: [
      { name: '函数', detail: 'fire_bullet() 把数量判断、创建和加入列表封装为一个动作。' },
      { name: '列表与对象集合', detail: 'bullets 保存多个 Bullet 对象，len(bullets) 得到当前数量。' },
      { name: 'for 遍历副本', detail: '遍历 bullets[:] 时可以安全地从原列表删除离屏子弹。' },
    ],
    idePrompt: '请阅读 steps/step03/main.py，只解释 fire_bullet 函数、bullets 列表、bullets[:] 和 len(bullets) 的作用，不要修改代码。然后引导我手动把子弹颜色改为橙色、速度改为 9.0、同屏上限改为 6，并提醒我每改一项就运行。',
    soloPrompt: `上下文：这是第 3 步，steps/step03/main.py 已有可左右移动且不越界的飞船。
目标：按空格从飞船顶端发射向上的矩形子弹；支持多个子弹，默认同屏最多 4 颗；飞出顶部的子弹要删除。
约束：用 Bullet 类、fire_bullet 函数、列表和 for 遍历；保持单文件、中文注释和学生修改区；不得破坏飞船移动、边界限制、窗口与退出功能。
运行验证：测试连续射击、同屏数量上限、子弹飞出顶部，以及移动中射击和 Q/Esc 退出。
保护条件：不添加外星人和碰撞，不做无关模块拆分。完成后报告修改点和验收结果。`,
    task: '把子弹颜色改为橙色，把 BULLET_SPEED 改为 9.0，把 BULLETS_ALLOWED 改为 6，观察射速与同屏数量的区别。',
    checkpoints: ['空格从飞船当前位置发射子弹', '连续射击不突破自己设定的同屏上限', '子弹向上移动并在飞出顶部后删除', '移动、射击和退出可以同时正常工作'],
    errors: [
      { problem: '只能发射一颗', solution: '检查上限判断，以及是否误清空整个列表。' },
      { problem: 'list.remove(x): x not in list', solution: '每颗子弹只删除一次，遍历副本并检查重复 remove。' },
      { problem: '子弹不移动', solution: '检查主循环是否调用每颗子弹的 update()。' },
    ],
  },
  {
    id: 4,
    title: '生成外星舰队',
    file: 'steps/step04/main.py',
    goal: '使用嵌套循环和行列计算批量生成外星人，而不是复制几十段代码。',
    effect: '顶部出现默认 4 行 8 列的绿色外星舰队，本步暂时不移动。',
    syntax: [
      { name: '嵌套 for', detail: '外层循环控制行，内层循环控制列。' },
      { name: '行列计算', detail: '列号乘水平间距得到 x，行号乘垂直间距得到 y。' },
      { name: '对象列表', detail: '每次创建 Alien 后加入 aliens，绘制时统一遍历。' },
    ],
    idePrompt: '请阅读 steps/step04/main.py 的 create_fleet 函数。用一个 2 行 3 列的例子解释嵌套 for 循环、row、column 以及 x/y 坐标计算，不要修改代码。然后让我先手算把间距从 20 改为 28 后第一列和第二列的 x，再补全代码验证。',
    soloPrompt: `上下文：这是第 4 步，steps/step04/main.py 已有窗口、可移动飞船和可连续发射的子弹。
目标：用 Alien 类和对象列表生成默认 4 行 8 列的外星舰队；外星人用圆形和矩形绘制，位置由行列与间距计算。
约束：必须使用嵌套 for 循环，不得手工复制对象；保持单文件、中文注释和学生修改区；本步外星人先不移动。
运行验证：启动后核对外星人数量与排列，并复测飞船移动、连续射击和退出。
保护条件：不得破坏第 1～3 步已有功能，不提前加入碰撞或生命系统。完成后报告修改点和验收结果。`,
    task: '把舰队改为 5 行 6 列，把水平间距从 20 改为 28；再尝试让每行错开半个外星人宽度。',
    checkpoints: ['行列数与修改后的预期一致', '每个位置来自计算而非逐个手写', '修改间距不会导致全部重叠或跑出窗口', '能说出外层控制行、内层控制列'],
    errors: [
      { problem: '只出现一行或一个外星人', solution: '检查两层循环和 aliens.append(alien) 的缩进。' },
      { problem: '外星人挤在一起', solution: '检查坐标是否使用 row/column，以及间距是否过小。' },
      { problem: '舰队超出屏幕', solution: '减少列数或间距，重新计算总宽度。' },
    ],
  },
  {
    id: 5,
    title: '舰队移动与碰边转向',
    file: 'steps/step05/main.py',
    goal: '让舰队统一移动；任一成员碰边时，整队下移并反向。',
    effect: '外星人整体左右巡逻，碰边后向下靠近一行并朝相反方向移动。',
    syntax: [
      { name: '方向参数', detail: 'fleet_direction 用 1 表示向右、-1 表示向左，乘 -1 即可换向。' },
      { name: 'if 碰边检测', detail: '任一外星人碰到左右边缘，就触发一次整队处理。' },
      { name: '统一更新', detail: '遍历 aliens，让所有对象使用同一方向和速度。' },
    ],
    idePrompt: '请阅读 steps/step05/main.py，解释 fleet_direction 为什么用 1 和 -1，以及 update_fleet 中碰边、下移、换向、统一更新的顺序，不要修改代码。然后引导我手动把下移距离改为 18，并把初始方向改为向左。',
    soloPrompt: `上下文：这是第 5 步，steps/step05/main.py 已有窗口、飞船、子弹和静止的外星舰队。
目标：让整支舰队左右移动；任意成员碰到左右边缘时，所有成员一起下移并反向；默认水平速度 1.0，下移距离 12。
约束：使用方向参数、if 碰边判断和统一列表更新；浮点保存外星人水平位置；保持单文件、中文注释和学生修改区。
运行验证：分别测试左右碰边、连续转向，并复测移动、射击、窗口与退出。
保护条件：不得破坏已有功能；本步不加入子弹碰撞和生命系统。完成后报告修改点和验收结果。`,
    task: '把 FLEET_DROP_SPEED 改为 18，把初始 FLEET_DIRECTION 改为 -1；再把水平速度调为 1.5，比较压迫感。',
    checkpoints: ['舰队初始方向与参数一致', '碰边后整队只下移一次并反向', '连续碰边不会卡住或突然消失', '能解释 direction *= -1 的含义'],
    errors: [
      { problem: '舰队在边缘反复抖动', solution: '碰边处理每帧只执行一次，换向后及时跳出检测循环。' },
      { problem: '只有一个外星人转向', solution: '下移与更新必须遍历整个 aliens 列表。' },
      { problem: '舰队不动', solution: '检查主循环是否保存 update_fleet() 返回的新方向。' },
    ],
  },
  {
    id: 6,
    title: '子弹与外星人碰撞',
    file: 'steps/step06/main.py',
    goal: '检测子弹命中，安全删除双方并计分；清空舰队后重新开始下一队。',
    effect: '命中后子弹和外星人消失、分数增加；整队清空后出现新舰队。',
    syntax: [
      { name: '碰撞检测', detail: 'bullet.rect.colliderect(alien.rect) 判断两个矩形是否重叠。' },
      { name: '遍历与删除', detail: '遍历两个列表副本，命中后 remove 双方并 break 内层循环。' },
      { name: '状态驱动', detail: 'not aliens 表示舰队清空，此时删除残留子弹并重建。' },
    ],
    idePrompt: '请阅读 steps/step06/main.py 的 handle_collisions 函数，解释 colliderect、两个列表副本、remove 和 break，不要修改代码。然后引导我把每个外星人的分值从 10 改为 20，并设计一个只改命中颜色或加分规则的个性化效果。',
    soloPrompt: `上下文：这是第 6 步，steps/step06/main.py 已有窗口、飞船、子弹、移动舰队及碰边转向。
目标：子弹命中外星人后双方消失，每个外星人得 10 分并显示分数；整队清空后删除残留子弹并生成新舰队。
约束：使用矩形碰撞检测、列表副本遍历和安全删除；保持单文件、中文注释和学生修改区；不得破坏移动、射击和舰队转向。
运行验证：测试一次命中只加一次分、连续射击、清空舰队后重建，以及 Q/Esc 退出。
保护条件：本步不加入生命与游戏结束，不做无关重构。完成后报告修改点和验收结果。`,
    task: '把每个外星人的分值从 10 改为 20；再选择一种命中颜色或子弹颜色效果，并写清预期结果。',
    checkpoints: ['子弹和外星人命中后都消失', '一次命中只加一次分且显示更新', '清空舰队后生成新舰队且游戏不中断', '连续射击不会报列表删除错误'],
    errors: [
      { problem: '分数一次增加很多', solution: '检查命中后是否 break，以及对象是否只删除一次。' },
      { problem: '子弹还在但外星人消失', solution: '检查两个 remove 是否都执行。' },
      { problem: '清空后没有新舰队', solution: '检查 if not aliens 和 create_fleet() 是否被调用。' },
    ],
  },
  {
    id: 7,
    title: '生命与游戏结束',
    file: 'steps/step07/main.py',
    goal: '加入生命、撞船/到底检测、局面重置、结束状态和 Enter 重开。',
    effect: '失败会扣生命并重置；生命耗尽后显示 GAME OVER，按 Enter 开始新一局。',
    syntax: [
      { name: '统计状态', detail: 'ships_left、score、game_active 集中描述当前局面的状态。' },
      { name: '重置函数', detail: 'reset_round 重置当前局面，reset_game 恢复新一局状态。' },
      { name: '活动标志', detail: '结束后停止更新，但事件循环继续响应 Enter、Q 和 Esc。' },
    ],
    idePrompt: '请阅读 steps/step07/main.py，解释 game_active、ships_left、ship_hit 和 reset_game 的关系，不要修改代码。然后引导我把初始生命从 3 改为 5，并讨论重新开始时分数应清零还是保留；让我先写预期再改代码。',
    soloPrompt: `上下文：这是第 7 步，steps/step07/main.py 已有窗口、飞船、子弹、舰队移动、碰撞计分和舰队重建。
目标：加入默认 3 条生命；外星人撞飞船或到达底部时失去 1 条生命并重置当前局面；生命耗尽后显示游戏结束，按 Enter 可重开。
约束：用清晰的状态变量和重置函数；游戏结束后仍处理退出和重开事件；保持单文件、中文注释和学生修改区；保留已有全部功能。
运行验证：测试撞船、到底、生命耗尽、Enter 重开、重开后再次射击，以及 Q/Esc 退出。
保护条件：不得破坏已有功能，不添加无关资源或网络依赖。完成后报告修改点和验收结果。`,
    task: '把 SHIP_LIMIT 从 3 改为 5；检查 reset_game() 的规则，并用注释说明分数清零、生命恢复、飞船归位或自己选择的规则。',
    checkpoints: ['撞船和到底都会且只扣一条生命', '失去生命后飞船归位，子弹与舰队重置', '生命耗尽后显示结束且不再移动或计分', 'Enter 能重开，之后可再次移动、射击和退出'],
    errors: [
      { problem: '一次碰撞扣光生命', solution: '碰撞后立即清空或重建对象，避免同一帧重复处理。' },
      { problem: '游戏结束后窗口卡死', solution: '事件循环必须放在 if game_active 外面。' },
      { problem: '重开后仍是旧状态', solution: '在 reset_game() 中明确恢复分数、生命、位置和对象。' },
    ],
  },
  {
    id: 8,
    title: '完整游戏与个性化',
    file: 'steps/step08/main.py · final/',
    goal: '组合完整游戏，加入最高分、关卡和难度递增，并完成一种自选改造。',
    effect: '清空舰队后关卡加 1、外星人加速；最高分在当前程序运行期间跨局保留。',
    syntax: [
      { name: '动态难度', detail: '每关更新 level，并用初始速度 + (level - 1) × 增量计算速度。' },
      { name: '模块拆分', detail: '设置、对象、统计、辅助函数和主入口分别放入清晰文件。' },
      { name: '字典配置（选讲）', detail: '可用 DIFFICULTY = {"easy": 0.8, "normal": 1.0} 按键读取配置。' },
    ],
    idePrompt: '请对照 steps/step08/main.py 与 final/ 的模块文件，说明设置、对象、统计、辅助函数和主入口分别搬到了哪里，不要修改代码。然后帮我从「改配色、改子弹上限、改命中分值」中选一项，由我先写验收条件，再用小步补全完成。',
    soloPrompt: `上下文：这是专题第 8 步。steps/step08/main.py 已组合窗口、飞船、子弹、舰队、碰撞、生命、结束与 Enter 重开；final/ 是对应的模块化项目。
目标：完成可展示的完整游戏，包含分数、当前会话最高分、关卡与难度递增；每清空一支舰队，关卡加 1 且外星人速度提高；随后完成我明确选择的一项个性化改造。
约束：不得破坏移动、边界、连续射击、碰撞计分、撞船/到底扣命、结束与重开；继续使用 Pygame 原生图形、中文注释和学生修改区；单文件步骤仍可独立运行，模块化 final 入口为 alien_invasion.py。
运行验证：实际启动并测试完整一局；清空舰队验证升级，耗尽生命验证结束和重开；复测全部既有操作键。
保护条件：不做未要求的联网、账号、素材下载或大规模重构；个性化只改我选定的功能。完成后列出修改文件、测试结果和仍需人工验收的项目。`,
    task: '只选一种：改配色、改子弹节奏或改计分规则。先写验收条件，再亲手修改并运行验证。',
    checkpoints: ['分数、最高分、关卡和生命正确显示', '清空舰队后关卡加 1 且外星人加速', '最高分跨局保留，普通分数按规则清零', '个性化符合验收条件，能指出至少 3 个 final 模块职责'],
    errors: [
      { problem: '清空舰队后难度不变', solution: '同时更新 level 和动态速度，并让舰队使用新速度。' },
      { problem: '重开后最高分被清零', solution: '最高分与普通分数分开，重置普通统计时保留最高分。' },
      { problem: '模块版 ImportError', solution: '从 final/ 目录运行 python alien_invasion.py，不要只复制一个文件。' },
    ],
  },
]
