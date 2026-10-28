"""把可能变化的游戏状态集中管理。"""


class GameStats:
    def __init__(self, settings):
        self.settings = settings
        self.high_score = 0  # 当前程序运行期间跨局保留
        self.game_active = True
        self.reset_stats()

    def reset_stats(self):
        """开始新一局时重置普通状态，但不清空最高分。"""
        self.ships_left = self.settings.ship_limit
        self.score = 0
        self.level = 1
        self.game_active = True

    def add_score(self, points):
        self.score += points
        self.high_score = max(self.high_score, self.score)
