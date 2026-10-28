"""模块化完整版入口：在 final 目录运行 python alien_invasion.py。"""

import pygame

import game_functions as gf
from game_stats import GameStats
from scoreboard import Scoreboard
from settings import Settings
from ship import Ship


def run_game():
    pygame.init()
    settings = Settings()
    screen = pygame.display.set_mode(
        (settings.screen_width, settings.screen_height)
    )
    pygame.display.set_caption(settings.window_title)
    clock = pygame.time.Clock()

    stats = GameStats(settings)
    ship = Ship(settings, screen)
    bullets = pygame.sprite.Group()
    aliens = pygame.sprite.Group()
    gf.create_fleet(settings, screen, aliens)
    scoreboard = Scoreboard(settings, screen, stats)

    running = True
    while running:
        # 事件监听始终执行；只有进行中的游戏才更新位置和碰撞
        running = gf.check_events(
            settings, screen, stats, ship, aliens, bullets
        )
        if stats.game_active:
            ship.update()
            gf.update_bullets(settings, screen, stats, ship, aliens, bullets)
            gf.update_aliens(settings, screen, stats, ship, aliens, bullets)

        gf.update_screen(
            settings, screen, stats, scoreboard, ship, aliens, bullets
        )
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    run_game()
