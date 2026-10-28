# -*- coding: utf-8 -*-
"""
猜数字游戏（第 3 课配套项目）
规则：电脑随机想一个 1~100 的整数，玩家最多猜 7 次，
     每次猜完提示"大了"或"小了"，猜中即胜利。
运行方式：在终端执行  python guess_number.py
"""

import random  # 导入随机数模块，用来生成秘密数字


def play_one_round():
    """玩一局游戏。函数可以把一段代码打包，方便反复调用。"""
    secret = random.randint(1, 100)  # 生成 1~100 的随机整数作为答案
    chances = 7  # 剩余可猜次数

    print("=" * 30)
    print("我想好了一个 1~100 的数字，你来猜！")
    print(f"你一共有 {chances} 次机会，加油！")

    # while 循环：只要还有剩余次数，就一直让玩家猜
    while chances > 0:
        # input() 拿到的是字符串，要用 int() 转成整数才能比大小
        guess = int(input("请输入你猜的数字："))

        if guess == secret:
            # 猜中了：break 跳出循环
            used = 7 - chances + 1  # 计算用了几次
            print(f"🎉 恭喜你猜对了！答案就是 {secret}，你只用了 {used} 次！")
            return True  # 返回 True 表示赢了
        elif guess > secret:
            print("📉 大了！往小猜。")
        else:
            print("📈 小了！往大猜。")

        chances = chances - 1  # 剩余次数减 1（别忘了，否则会死循环）
        if chances > 0:
            print(f"还剩 {chances} 次机会。")

    # 循环正常结束（次数用完都没猜中）
    print(f"😢 很遗憾，次数用完了。答案是 {secret}。")
    return False  # 返回 False 表示输了


def main():
    """主函数：控制整体流程，支持"再来一局"。"""
    print("欢迎来到猜数字游戏！")
    win_count = 0   # 胜场数
    lose_count = 0  # 负场数

    while True:  # 外层无限循环，直到玩家不想玩了
        if play_one_round():
            win_count += 1      # 赢了，胜场加 1
        else:
            lose_count += 1     # 输了，负场加 1

        # 问玩家要不要再来一局
        again = input("再来一局吗？(y/n)：")
        if again != "y" and again != "Y":
            break  # 玩家不想玩了，跳出循环

    print(f"战绩：胜 {win_count} 场，负 {lose_count} 场。下次再见！")


# 这一行的意思是：只有直接运行本文件时才执行 main()
# （被别的文件 import 时不会自动运行）
if __name__ == "__main__":
    main()
