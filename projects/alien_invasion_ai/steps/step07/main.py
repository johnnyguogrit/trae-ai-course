"""第 7 步：生命与游戏结束。直接运行本文件即可。"""

import pygame

# ==================== 学生修改区 ====================
# 任务：初始生命改为 5，并检查 reset_game 的分数和位置重置规则。
SCREEN_WIDTH = 900
SCREEN_HEIGHT = 600
BG_COLOR = (18, 24, 48)
WINDOW_TITLE = "AI 外星人入侵 · 第7步"
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
FLEET_DROP_SPEED = 12
FLEET_DIRECTION = 1
ALIEN_POINTS = 10
SHIP_LIMIT = 3
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

    def update(self, direction):
        self.x += ALIEN_SPEED * direction
        self.rect.x = self.x

    def draw(self):
        body = pygame.Rect(0, 0, self.rect.width, self.rect.height - 8)
        body.midtop = self.rect.midtop
        pygame.draw.ellipse(self.screen, (150, 240, 160), body)
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
            y = 55 + row * (Alien.HEIGHT + ALIEN_GAP_Y)
            aliens.append(Alien(screen, x, y))
    return aliens


def update_fleet(screen, aliens, direction):
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
        alien.update(direction)
    return direction


def handle_collisions(screen, bullets, aliens, score):
    for bullet in bullets[:]:
        for alien in aliens[:]:
            if bullet.rect.colliderect(alien.rect):
                bullets.remove(bullet)
                aliens.remove(alien)
                score += ALIEN_POINTS
                break
    if not aliens:
        bullets.clear()
        aliens.extend(create_fleet(screen))
    return score


def reset_round(screen, ship, bullets):
    """失去一条生命但游戏未结束时，重置当前局面。"""
    bullets.clear()
    ship.center_ship()
    return create_fleet(screen)


def reset_game(screen, ship, bullets):
    """开始全新一局：生命恢复、当前分数清零、对象重建。"""
    aliens = reset_round(screen, ship, bullets)
    return aliens, SHIP_LIMIT, 0, True


def draw_text(screen, text, size, color, center):
    font = pygame.font.Font(None, size)
    image = font.render(text, True, color)
    rect = image.get_rect(center=center)
    screen.blit(image, rect)


def draw_hud(screen, score, ships_left):
    font = pygame.font.Font(None, 32)
    image = font.render(f"Score: {score}    Lives: {ships_left}", True, (240, 248, 255))
    screen.blit(image, (18, 16))


def handle_events(screen, ship, bullets, game_active):
    """返回（是否继续运行，是否请求重开）。"""
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
    aliens, ships_left, score, game_active = reset_game(screen, ship, bullets)
    fleet_direction = FLEET_DIRECTION

    running = True
    while running:
        running, restart = handle_events(screen, ship, bullets, game_active)
        if restart:
            aliens, ships_left, score, game_active = reset_game(screen, ship, bullets)
            fleet_direction = FLEET_DIRECTION

        if game_active:
            ship.update()
            for bullet in bullets[:]:
                bullet.update()
                if bullet.rect.bottom <= 0:
                    bullets.remove(bullet)
            fleet_direction = update_fleet(screen, aliens, fleet_direction)
            score = handle_collisions(screen, bullets, aliens, score)

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
        draw_hud(screen, score, ships_left)
        if not game_active:
            draw_text(screen, "GAME OVER", 64, (255, 180, 100), (SCREEN_WIDTH // 2, 250))
            draw_text(
                screen,
                "Press Enter to restart - Q / Esc to quit",
                32,
                (240, 248, 255),
                (SCREEN_WIDTH // 2, 310),
            )
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    run_game()
