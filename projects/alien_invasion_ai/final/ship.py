"""飞船类：浮点位置、移动标志、边界与绘制。"""

import pygame
from pygame.sprite import Sprite


class Ship(Sprite):
    def __init__(self, settings, screen):
        super().__init__()  # 让飞船也能参与 Pygame 精灵碰撞检测
        self.settings = settings
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
            self.x += self.settings.ship_speed
        if self.moving_left and self.rect.left > 0:
            self.x -= self.settings.ship_speed

        # 浮点位置负责精确累加，rect 负责绘制和碰撞
        half_width = self.rect.width / 2
        self.x = max(half_width, min(self.x, self.screen_rect.right - half_width))
        self.rect.centerx = self.x

    def center_ship(self):
        self.x = float(self.screen_rect.centerx)
        self.rect.centerx = self.x
        self.moving_right = False
        self.moving_left = False

    def draw(self):
        pygame.draw.polygon(
            self.screen,
            self.settings.ship_color,
            [self.rect.midtop, self.rect.bottomleft, self.rect.bottomright],
        )
        cockpit = pygame.Rect(0, 0, 14, 12)
        cockpit.center = self.rect.center
        pygame.draw.rect(self.screen, (230, 250, 255), cockpit, border_radius=4)
