"""第 2 步：飞船与左右移动。直接运行本文件即可。"""

import pygame

# ==================== 学生修改区 ====================
# 任务：速度改为 6.0、换飞船颜色，再把安全边距改为 20。
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
BG_COLOR = (18, 24, 48)
WINDOW_TITLE = "AI 外星人入侵 · 第2步"
SHIP_SPEED = 4.0
SHIP_COLOR = (80, 200, 255)
SHIP_EDGE_MARGIN = 0  # 飞船与屏幕左右边缘之间的安全距离
# ==================================================


class Ship:
    """保存飞船的位置、移动状态和绘制方法。"""

    def __init__(self, screen):
        self.screen = screen
        self.screen_rect = screen.get_rect()
        self.rect = pygame.Rect(0, 0, 56, 38)
        self.rect.midbottom = self.screen_rect.midbottom
        self.rect.bottom -= 20

        # 浮点数保存精确位置；rect 的坐标是整数，主要用于绘制
        self.x = float(self.rect.centerx)
        self.moving_right = False
        self.moving_left = False

    def update(self):
        """根据按键标志移动，并限制在左右边界内。"""
        if self.moving_right and self.rect.right < self.screen_rect.right - SHIP_EDGE_MARGIN:
            self.x += SHIP_SPEED
        if self.moving_left and self.rect.left > SHIP_EDGE_MARGIN:
            self.x -= SHIP_SPEED

        # 即使速度很大，也把位置夹回安全范围
        half_width = self.rect.width / 2
        min_x = SHIP_EDGE_MARGIN + half_width
        max_x = self.screen_rect.right - SHIP_EDGE_MARGIN - half_width
        self.x = max(min_x, min(self.x, max_x))
        self.rect.centerx = self.x

    def draw(self):
        """用三角形和矩形画飞船，不需要图片。"""
        pygame.draw.polygon(
            self.screen,
            SHIP_COLOR,
            [self.rect.midtop, self.rect.bottomleft, self.rect.bottomright],
        )
        cockpit = pygame.Rect(0, 0, 14, 12)
        cockpit.center = self.rect.center
        pygame.draw.rect(self.screen, (230, 250, 255), cockpit, border_radius=4)


def handle_events(ship):
    """处理退出、按键按下和按键松开。返回是否继续运行。"""
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            return False
        if event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_q, pygame.K_ESCAPE):
                return False
            if event.key == pygame.K_RIGHT:
                ship.moving_right = True
            if event.key == pygame.K_LEFT:
                ship.moving_left = True
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_RIGHT:
                ship.moving_right = False
            if event.key == pygame.K_LEFT:
                ship.moving_left = False
    return True


def run_game():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption(WINDOW_TITLE)
    clock = pygame.time.Clock()
    ship = Ship(screen)  # Ship 是类，ship 是根据类创建的对象

    running = True
    while running:
        running = handle_events(ship)
        ship.update()

        screen.fill(BG_COLOR)
        ship.draw()
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    run_game()
