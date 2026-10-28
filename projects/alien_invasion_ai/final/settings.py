"""集中保存游戏配置：改参数时先来这里找。"""


class Settings:
    """屏幕、对象、计分和动态难度设置。"""

    def __init__(self):
        # ==================== 学生修改区 ====================
        self.screen_width = 900
        self.screen_height = 600
        self.bg_color = (18, 24, 48)
        self.window_title = "AI 外星人入侵 · 完整版"

        self.ship_speed = 4.0
        self.ship_color = (80, 200, 255)
        self.ship_limit = 3

        self.bullet_speed = 7.0
        self.bullet_width = 5
        self.bullet_height = 16
        self.bullet_color = (255, 220, 80)
        self.bullets_allowed = 4

        self.alien_rows = 4
        self.alien_columns = 8
        self.alien_gap_x = 20
        self.alien_gap_y = 24
        self.alien_color = (150, 240, 160)
        self.initial_alien_speed = 1.0
        self.fleet_drop_speed = 12
        self.fleet_direction = 1  # 1 向右，-1 向左
        self.alien_points = 10
        self.level_speedup = 0.4
        # ==================================================

        self.initialize_dynamic_settings()

    def initialize_dynamic_settings(self):
        """每次新一局都恢复初始动态速度。"""
        self.alien_speed = self.initial_alien_speed

    def increase_difficulty(self):
        """每清空一支舰队，提高外星人水平速度。"""
        self.alien_speed += self.level_speedup
