"""子弹精灵：使用矩形绘制，无需图片。"""

import pygame
from pygame.sprite import Sprite


class Bullet(Sprite):
    def __init__(self, settings, screen, ship):
        super().__init__()
        self.settings = settings
        self.screen = screen
        self.rect = pygame.Rect(
            0, 0, settings.bullet_width, settings.bullet_height
        )
        self.rect.centerx = ship.rect.centerx
        self.rect.top = ship.rect.top
        self.y = float(self.rect.y)

    def update(self):
        self.y -= self.settings.bullet_speed
        self.rect.y = self.y

    def draw(self):
        pygame.draw.rect(
            self.screen,
            self.settings.bullet_color,
            self.rect,
            border_radius=2,
        )
