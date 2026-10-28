"""事件、更新、碰撞、生成舰队和绘制等辅助函数。"""

import pygame

from alien import Alien
from bullet import Bullet


# ---------- 事件与新一局 ----------
def fire_bullet(settings, screen, ship, bullets):
    """达到同屏上限时不再创建子弹。"""
    if len(bullets) < settings.bullets_allowed:
        bullets.add(Bullet(settings, screen, ship))


def start_new_game(settings, screen, stats, ship, aliens, bullets):
    """恢复动态速度、统计、位置和对象集合。"""
    settings.initialize_dynamic_settings()
    settings.fleet_direction = 1
    stats.reset_stats()
    aliens.empty()
    bullets.empty()
    ship.center_ship()
    create_fleet(settings, screen, aliens)


def check_events(settings, screen, stats, ship, aliens, bullets):
    """返回 False 表示退出；游戏结束也继续监听退出和重开。"""
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
            if event.key == pygame.K_SPACE and stats.game_active:
                fire_bullet(settings, screen, ship, bullets)
            if event.key == pygame.K_RETURN and not stats.game_active:
                start_new_game(settings, screen, stats, ship, aliens, bullets)
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_RIGHT:
                ship.moving_right = False
            if event.key == pygame.K_LEFT:
                ship.moving_left = False
    return True


# ---------- 子弹与碰撞 ----------
def update_bullets(settings, screen, stats, ship, aliens, bullets):
    bullets.update()
    for bullet in bullets.copy():
        if bullet.rect.bottom <= 0:
            bullets.remove(bullet)
    check_bullet_alien_collisions(settings, screen, stats, ship, aliens, bullets)


def check_bullet_alien_collisions(settings, screen, stats, ship, aliens, bullets):
    # 两个 True：碰撞后子弹与外星人都从各自 Group 删除
    collisions = pygame.sprite.groupcollide(bullets, aliens, True, True)
    for hit_aliens in collisions.values():
        stats.add_score(len(hit_aliens) * settings.alien_points)

    if not aliens:
        bullets.empty()
        stats.level += 1
        settings.increase_difficulty()
        create_fleet(settings, screen, aliens)


# ---------- 舰队生成与移动 ----------
def create_fleet(settings, screen, aliens):
    """嵌套循环生成配置指定的行列。"""
    for row in range(settings.alien_rows):
        for column in range(settings.alien_columns):
            x = 50 + column * (Alien.WIDTH + settings.alien_gap_x)
            y = 70 + row * (Alien.HEIGHT + settings.alien_gap_y)
            aliens.add(Alien(settings, screen, x, y))


def check_fleet_edges(settings, aliens):
    for alien in aliens.sprites():
        if alien.check_edges():
            change_fleet_direction(settings, aliens)
            break


def change_fleet_direction(settings, aliens):
    for alien in aliens.sprites():
        alien.rect.y += settings.fleet_drop_speed
    settings.fleet_direction *= -1


# ---------- 生命、到底与重开 ----------
def reset_round(settings, screen, ship, aliens, bullets):
    aliens.empty()
    bullets.empty()
    ship.center_ship()
    create_fleet(settings, screen, aliens)


def ship_hit(settings, screen, stats, ship, aliens, bullets):
    """一次失败只扣一条生命，再决定重置还是结束。"""
    stats.ships_left -= 1
    if stats.ships_left > 0:
        reset_round(settings, screen, ship, aliens, bullets)
    else:
        stats.ships_left = 0
        stats.game_active = False
        aliens.empty()
        bullets.empty()


def check_aliens_bottom(settings, screen, stats, ship, aliens, bullets):
    screen_rect = screen.get_rect()
    for alien in aliens.sprites():
        if alien.rect.bottom >= screen_rect.bottom:
            ship_hit(settings, screen, stats, ship, aliens, bullets)
            break


def update_aliens(settings, screen, stats, ship, aliens, bullets):
    check_fleet_edges(settings, aliens)
    aliens.update()

    if pygame.sprite.spritecollideany(ship, aliens):
        ship_hit(settings, screen, stats, ship, aliens, bullets)
        return  # 已处理失败，不在同一帧重复扣命
    check_aliens_bottom(settings, screen, stats, ship, aliens, bullets)


# ---------- 每帧绘制 ----------
def update_screen(settings, screen, stats, scoreboard, ship, aliens, bullets):
    screen.fill(settings.bg_color)
    for alien in aliens.sprites():
        alien.draw()
    for bullet in bullets.sprites():
        bullet.draw()
    ship.draw()
    scoreboard.draw()
    pygame.display.flip()
