"""第 1 步：游戏窗口与主循环。直接运行本文件即可。"""

import pygame

# ==================== 学生修改区 ====================
# 任务：改成 960×640、背景 (240, 248, 255)，标题加上自己的名字。
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
BG_COLOR = (18, 24, 48)  # RGB 颜色：红、绿、蓝，范围都是 0～255
WINDOW_TITLE = "AI 外星人入侵 · 第1步"
# ==================================================


def run_game():
    """创建窗口并不断处理事件、绘制画面。"""
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption(WINDOW_TITLE)
    clock = pygame.time.Clock()

    running = True  # 布尔值：True 表示继续循环，False 表示结束
    while running:
        # 每次循环都处理事件，窗口才不会“卡住”
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_q, pygame.K_ESCAPE):
                    running = False

        screen.fill(BG_COLOR)  # 先清空上一帧
        pygame.display.flip()  # 再把这一帧显示出来
        clock.tick(60)  # 每秒最多约 60 帧，避免全速空转

    pygame.quit()


if __name__ == "__main__":
    run_game()
