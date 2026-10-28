"""第 8 步：完整游戏、计分与难度递增。直接运行本文件即可。"""

import pygame

# ==================== 学生修改区 ====================
# 只选一种个性化：改配色 / 改子弹节奏 / 改计分，并先写验收条件。
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
BG_COLOR = (18, 24, 48)
WINDOW_TITLE = "AI 外星人入侵 · 第8步"
SHIP_SPEED = 4.0
SHIP_COLOR = (80, 200, 255)
BULLET_SPEED = 7.0
BULLET_COLOR = (255, 220, 80)
BULLETS_ALLOWED = 4
ALIEN_ROWS = 4
ALIEN_COLUMNS = 8
ALIEN_GAP_X = 20
ALIEN_GAP_Y = 24
ALIEN_SPEED = 1.0
ALIEN_COLOR = (150, 240, 160)
FLEET_DROP_SPEED = 12
FLEET_DIRECTION = 1
ALIEN_POINTS = 10
SHIP_LIMIT = 3
LEVEL_SPEEDUP = 0.4  # 每过一关，外星人水平速度增加多少
# 选讲字典：DIFFICULTY = {"easy": 0.8, "normal": 1.0, "hard": 1.4}
# ==================================================


class Ship:
    def __init__(self, screen):
        self.screen = screen
        self.screen_rect = screen.get_rect()
        self.rect = pygame.Rect(0, 0, 56, 38)
        self.rect.midbottom = self.screen_rect.midbottom
        self.rect.bottom -= 20
        self.x = float(self.rect.centerx)
        self.moving_right = False
        self.moving_left = False

    def center_ship(self):
        self.x = float(self.screen_rect.centerx)
        self.rect.centerx = self.x
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
    def __init__(self, screen, ship):
        self.screen = screen
        self.rect = pygame.Rect(0, 0, 5, 16)
        self.rect.centerx = ship.rect.centerx
        self.rect.top = ship.rect.top
        self.y = float(self.rect.y)

    def update(self):
        self.y -= BULLET_SPEED
        self.rect.y = self.y

    def draw(self):
        pygame.draw.rect(self.screen, BULLET_COLOR, self.rect, border_radius=2)


class Alien:
    WIDTH = 46
    HEIGHT = 38

    def __init__(self, screen, x, y):
        self.screen = screen
        self.rect = pygame.Rect(x, y, self.WIDTH, self.HEIGHT)
        self.x = float(self.rect.x)

    def update(self, direction, speed):
        self.x += speed * direction
        self.rect.x = self.x

    def draw(self):
        body = pygame.Rect(0, 0, self.rect.width, self.rect.height - 8)
        body.midtop = self.rect.midtop
        pygame.draw.ellipse(self.screen, ALIEN_COLOR, body)
        pygame.draw.rect(
            self.screen,
            (90, 190, 130),
            (self.rect.x + 5, self.rect.bottom - 8, self.rect.width - 10, 8),
            border_radius=3,
        )
        pygame.draw.circle(self.screen, (18, 50, 50), (self.rect.centerx - 9, self.rect.y + 15), 3)
        pygame.draw.circle(self.screen, (18, 50, 50), (self.rect.centerx + 9, self.rect.y + 15), 3)


def fire_bullet(screen, ship, bullets):
    if len(bullets) < BULLETS_ALLOWED:
        bullets.append(Bullet(screen, ship))


def create_fleet(screen):
    aliens = []
    for row in range(ALIEN_ROWS):
        for column in range(ALIEN_COLUMNS):
            x = 50 + column * (Alien.WIDTH + ALIEN_GAP_X)
            y = 70 + row * (Alien.HEIGHT + ALIEN_GAP_Y)
            aliens.append(Alien(screen, x, y))
    return aliens


def get_alien_speed(level):
    """关卡越高，速度越快；从 1 开始计算。"""
    return ALIEN_SPEED + (level - 1) * LEVEL_SPEEDUP


def update_fleet(screen, aliens, direction, speed):
    screen_rect = screen.get_rect()
    hit_edge = any(
        alien.rect.right >= screen_rect.right or alien.rect.left <= 0
        for alien in aliens
    )
    if hit_edge:
        for alien in aliens:
            alien.rect.y += FLEET_DROP_SPEED
        direction *= -1
    for alien in aliens:
        alien.update(direction, speed)
    return direction


def handle_collisions(screen, bullets, aliens, score, level):
    """返回分数、关卡和本关速度；清空舰队时升级。"""
    for bullet in bullets[:]:
        for alien in aliens[:]:
            if bullet.rect.colliderect(alien.rect):
                bullets.remove(bullet)
                aliens.remove(alien)
                score += ALIEN_POINTS
                break

    if not aliens:
        bullets.clear()
        level += 1
        aliens.extend(create_fleet(screen))
    return score, level, get_alien_speed(level)


def reset_round(screen, ship, bullets):
    bullets.clear()
    ship.center_ship()
    return create_fleet(screen)


def reset_game(screen, ship, bullets):
    """重置当前局；最高分数独存放，不在这里清零。"""
    aliens = reset_round(screen, ship, bullets)
    level = 1
    return aliens, SHIP_LIMIT, 0, level, get_alien_speed(level), True


def draw_text(screen, text, size, color, center):
    font = pygame.font.Font(None, size)
    image = font.render(text, True, color)
    rect = image.get_rect(center=center)
    screen.blit(image, rect)


def draw_hud(screen, score, high_score, level, ships_left):
    font = pygame.font.Font(None, 30)
    text = (
        f"Score: {score}   High: {high_score}   "
        f"Level: {level}   Lives: {ships_left}"
    )
    image = font.render(text, True, (240, 248, 255))
    screen.blit(image, (18, 16))


def handle_events(screen, ship, bullets, game_active):
    restart = False
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            return False, restart
        if event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_q, pygame.K_ESCAPE):
                return False, restart
            if event.key == pygame.K_RETURN and not game_active:
                restart = True
            if event.key == pygame.K_RIGHT:
                ship.moving_right = True
            if event.key == pygame.K_LEFT:
                ship.moving_left = True
            if event.key == pygame.K_SPACE and game_active:
                fire_bullet(screen, ship, bullets)
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_RIGHT:
                ship.moving_right = False
            if event.key == pygame.K_LEFT:
                ship.moving_left = False
    return True, restart


def run_game():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption(WINDOW_TITLE)
    clock = pygame.time.Clock()
    ship = Ship(screen)
    bullets = []
    aliens, ships_left, score, level, alien_speed, game_active = reset_game(
        screen, ship, bullets
    )
    high_score = 0  # 当前程序运行期间跨局保留；关闭程序后重新计算
    fleet_direction = FLEET_DIRECTION

    running = True
    while running:
        running, restart = handle_events(screen, ship, bullets, game_active)
        if restart:
            aliens, ships_left, score, level, alien_speed, game_active = reset_game(
                screen, ship, bullets
            )
            fleet_direction = FLEET_DIRECTION

        if game_active:
            ship.update()
            for bullet in bullets[:]:
                bullet.update()
                if bullet.rect.bottom <= 0:
                    bullets.remove(bullet)
            fleet_direction = update_fleet(screen, aliens, fleet_direction, alien_speed)
            score, level, alien_speed = handle_collisions(
                screen, bullets, aliens, score, level
            )
            high_score = max(high_score, score)

            hit_ship = any(alien.rect.colliderect(ship.rect) for alien in aliens)
            reached_bottom = any(alien.rect.bottom >= screen.get_rect().bottom for alien in aliens)
            if hit_ship or reached_bottom:
                ships_left -= 1
                if ships_left > 0:
                    aliens = reset_round(screen, ship, bullets)
                else:
                    bullets.clear()
                    aliens.clear()
                    game_active = False

        screen.fill(BG_COLOR)
        for alien in aliens:
            alien.draw()
        for bullet in bullets:
            bullet.draw()
        ship.draw()
        draw_hud(screen, score, high_score, level, ships_left)
        if not game_active:
            draw_text(screen, "GAME OVER", 64, (255, 180, 100), (SCREEN_WIDTH // 2, 270))
            draw_text(
                screen,
                "Press Enter to restart - Q / Esc to quit",
                32,
                (240, 248, 255),
                (SCREEN_WIDTH // 2, 330),
            )
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


# 模块拆分地图：常量 → final/settings.py；Ship/Bullet/Alien → 各自同名文件；
# 分数与生命 → final/game_stats.py；函数 → final/game_functions.py；
# run_game → final/alien_invasion.py。拆分前后游戏规则保持一致。
if __name__ == "__main__":
    run_game()
