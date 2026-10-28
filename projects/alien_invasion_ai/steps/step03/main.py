"""第 3 步：发射子弹。直接运行本文件即可。"""

import pygame

# ==================== 学生修改区 ====================
# 任务：子弹改橙色、速度改 9.0、同屏上限改 6。
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
BG_COLOR = (18, 24, 48)
WINDOW_TITLE = "AI 外星人入侵 · 第3步"
SHIP_SPEED = 4.0
SHIP_COLOR = (80, 200, 255)
BULLET_SPEED = 7.0
BULLET_COLOR = (255, 220, 80)
BULLETS_ALLOWED = 4
# ==================================================


class Ship:
    """管理飞船位置与移动标志。"""

    def __init__(self, screen):
        self.screen = screen
        self.screen_rect = screen.get_rect()
        self.rect = pygame.Rect(0, 0, 56, 38)
        self.rect.midbottom = self.screen_rect.midbottom
        self.rect.bottom -= 20
        self.x = float(self.rect.centerx)
        self.moving_right = False
        self.moving_left = False

    def update(self):
        if self.moving_right and self.rect.right < self.screen_rect.right:
            self.x += SHIP_SPEED
        if self.moving_left and self.rect.left > 0:
            self.x -= SHIP_SPEED
        half_width = self.rect.width / 2
        self.x = max(half_width, min(self.x, self.screen_rect.right - half_width))
        self.rect.centerx = self.x

    def draw(self):
        pygame.draw.polygon(
            self.screen,
            SHIP_COLOR,
            [self.rect.midtop, self.rect.bottomleft, self.rect.bottomright],
        )
        cockpit = pygame.Rect(0, 0, 14, 12)
        cockpit.center = self.rect.center
        pygame.draw.rect(self.screen, (230, 250, 255), cockpit, border_radius=4)


class Bullet:
    """一颗向上飞行的矩形子弹。"""

    def __init__(self, screen, ship):
        self.screen = screen
        self.rect = pygame.Rect(0, 0, 5, 16)
        self.rect.centerx = ship.rect.centerx
        self.rect.top = ship.rect.top
        self.y = float(self.rect.y)

    def update(self):
        self.y -= BULLET_SPEED  # 屏幕 y 越小，位置越靠上
        self.rect.y = self.y

    def draw(self):
        pygame.draw.rect(self.screen, BULLET_COLOR, self.rect, border_radius=2)


def fire_bullet(screen, ship, bullets):
    """只有未达到同屏上限时，才创建并加入一颗子弹。"""
    if len(bullets) < BULLETS_ALLOWED:
        bullets.append(Bullet(screen, ship))


def handle_events(screen, ship, bullets):
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
            if event.key == pygame.K_SPACE:
                fire_bullet(screen, ship, bullets)
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
    ship = Ship(screen)
    bullets = []  # 列表可以保存许多子弹对象

    running = True
    while running:
        running = handle_events(screen, ship, bullets)
        ship.update()

        # 遍历列表副本，因为循环中可能从原列表删除子弹
        for bullet in bullets[:]:
            bullet.update()
            if bullet.rect.bottom <= 0:
                bullets.remove(bullet)

        screen.fill(BG_COLOR)
        for bullet in bullets:
            bullet.draw()
        ship.draw()
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    run_game()
