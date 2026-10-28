"""分数、最高分、关卡、生命与结束提示的绘制。"""

import pygame


class Scoreboard:
    def __init__(self, settings, screen, stats):
        self.settings = settings
        self.screen = screen
        self.stats = stats
        self.text_color = (240, 248, 255)
        self.font = pygame.font.Font(None, 30)
        self.large_font = pygame.font.Font(None, 64)
        self.small_font = pygame.font.Font(None, 32)

    def draw(self):
        text = (
            f"Score: {self.stats.score}   High: {self.stats.high_score}   "
            f"Level: {self.stats.level}   Lives: {self.stats.ships_left}"
        )
        image = self.font.render(text, True, self.text_color)
        self.screen.blit(image, (18, 16))

        if not self.stats.game_active:
            center_x = self.settings.screen_width // 2
            title = self.large_font.render("GAME OVER", True, (255, 180, 100))
            title_rect = title.get_rect(center=(center_x, 270))
            self.screen.blit(title, title_rect)

            tip = self.small_font.render(
                "Press Enter to restart - Q / Esc to quit", True, self.text_color
            )
            tip_rect = tip.get_rect(center=(center_x, 330))
            self.screen.blit(tip, tip_rect)
