"""外星人精灵：几何图形绘制、浮点移动与碰边检测。"""

import pygame
from pygame.sprite import Sprite


class Alien(Sprite):
    WIDTH = 46
    HEIGHT = 38

    def __init__(self, settings, screen, x, y):
        super().__init__()
        self.settings = settings
        self.screen = screen
        self.rect = pygame.Rect(x, y, self.WIDTH, self.HEIGHT)
        self.x = float(self.rect.x)

    def update(self):
        self.x += self.settings.alien_speed * self.settings.fleet_direction
        self.rect.x = self.x

    def check_edges(self):
        screen_rect = self.screen.get_rect()
        return self.rect.right >= screen_rect.right or self.rect.left <= 0

    def draw(self):
        body = pygame.Rect(0, 0, self.rect.width, self.rect.height - 8)
        body.midtop = self.rect.midtop
        pygame.draw.ellipse(self.screen, self.settings.alien_color, body)
        pygame.draw.rect(
            self.screen,
            (90, 190, 130),
            (self.rect.x + 5, self.rect.bottom - 8, self.rect.width - 10, 8),
            border_radius=3,
        )
        pygame.draw.circle(
            self.screen, (18, 50, 50), (self.rect.centerx - 9, self.rect.y + 15), 3
        )
        pygame.draw.circle(
            self.screen, (18, 50, 50), (self.rect.centerx + 9, self.rect.y + 15), 3
        )
