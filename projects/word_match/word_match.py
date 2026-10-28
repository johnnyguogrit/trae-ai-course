# -*- coding: utf-8 -*-
"""
单词消消乐（第 4 课配套项目）
玩法：每轮随机抽 6 个单词，左边是打乱编号的英文（A-F），
     右边是打乱编号的中文（1-6），输入配对如 "A3"，
     配对正确 +10 分并消除，错误 -5 分。
运行方式：在终端执行  python word_match.py
"""

import random  # 导入随机模块：抽单词、打乱顺序都靠它

# ========== 词库：20 个初中英语单词（字典：英文 → 中文）==========
# 【改这里】想加新单词？照着格式往字典里加一行就行！
WORDS = {
    "apple": "苹果",
    "banana": "香蕉",
    "orange": "橙子",
    "school": "学校",
    "teacher": "老师",
    "student": "学生",
    "friend": "朋友",
    "family": "家庭",
    "happy": "快乐的",
    "sad": "伤心的",
    "water": "水",
    "bread": "面包",
    "music": "音乐",
    "sport": "运动",
    "book": "书",
    "dream": "梦想",
    "summer": "夏天",
    "winter": "冬天",
    "computer": "电脑",
    "garden": "花园",
}

PAIR_COUNT = 6   # 每轮抽取的单词对数 【改这里】可以调整难度
SCORE_RIGHT = 10  # 配对正确得分
SCORE_WRONG = 5   # 配对错误扣分


def draw_words(count):
    """从词库里随机抽 count 个单词，返回一个 {英文: 中文} 小字典。"""
    # random.sample(列表, 个数)：从列表里不重复地随机抽几个
    picked = random.sample(list(WORDS.keys()), count)
    return {en: WORDS[en] for en in picked}


def show_board(en_list, zh_list, matched):
    """打印当前的游戏面板。

    参数 en_list：打乱后的英文单词列表（编号 A、B、C...）
    参数 zh_list：打乱后的中文意思列表（编号 1、2、3...）
    参数 matched：已配对消除的英文编号集合
    """
    print("\n" + "=" * 34)
    for i in range(len(en_list)):
        letter = chr(ord("A") + i)  # 把 0、1、2... 变成字母 A、B、C...

        # 左边英文：已消除的显示 ✅，没消除的显示单词
        if letter in matched:
            left = f"  {letter}. ✅ 已消除"
        else:
            left = f"  {letter}. {en_list[i]}"

        # 右边中文：如果这一行的中文对应的英文已消除，也显示 ✅
        zh_en = find_english_by_zh(zh_list[i])  # 这个中文对应哪个英文
        zh_letter = chr(ord("A") + en_list.index(zh_en)) if zh_en in en_list else "?"
        if zh_letter in matched:
            right = f"{i + 1}. ✅ 已消除"
        else:
            right = f"{i + 1}. {zh_list[i]}"

        print(f"{left:<18}{right}")
    print("=" * 34)


def find_english_by_zh(zh):
    """根据中文意思，在词库里反查英文单词。"""
    for en, meaning in WORDS.items():
        if meaning == zh:
            return en
    return None  # 没找到就返回 None


def play_one_round():
    """玩一轮游戏，返回本轮得分。"""
    words = draw_words(PAIR_COUNT)      # 抽本轮单词
    en_list = list(words.keys())        # 英文列表
    zh_list = list(words.values())      # 中文列表
    random.shuffle(zh_list)             # 只打乱中文，英文按字母编号顺序展示
    random.shuffle(en_list)             # 英文也打乱，避免按词库顺序出题

    matched = set()  # 集合：记录已消除的英文编号（如 {"A", "C"}）
    score = 0        # 本轮得分

    print("\n🎮 新一轮开始！请输入配对，格式如 A3（英文编号 + 中文编号）")

    # 只要还没全部消除，就一直让玩家配对
    while len(matched) < PAIR_COUNT:
        show_board(en_list, zh_list, matched)
        print(f"当前得分：{score}")
        answer = input("你的配对（如 A3）：").strip().upper()  # strip 去空格，upper 转大写

        # ----- 检查输入格式 -----
        if len(answer) < 2:
            print("⚠️ 格式不对哦，请输入字母 + 数字，比如 A3")
            continue  # continue：跳过本次循环，让玩家重新输入
        letter = answer[0]          # 英文编号，如 "A"
        number_text = answer[1:]    # 中文编号，如 "3"

        # 检查字母是否在范围内
        if letter < "A" or letter >= chr(ord("A") + PAIR_COUNT):
            print(f"⚠️ 英文编号要在 A~{chr(ord('A') + PAIR_COUNT - 1)} 之间")
            continue
        # 检查数字是否是有效的编号
        if not number_text.isdigit() or not (1 <= int(number_text) <= PAIR_COUNT):
            print(f"⚠️ 中文编号要在 1~{PAIR_COUNT} 之间")
            continue
        # 检查这一对是否已被消除
        if letter in matched:
            print("⚠️ 这个英文单词已经消除了，换一个吧")
            continue

        # ----- 判断配对是否正确 -----
        en_index = ord(letter) - ord("A")   # 字母 A→0、B→1...
        zh_index = int(number_text) - 1     # 编号 1→下标 0
        en_word = en_list[en_index]         # 玩家选的英文单词
        zh_word = zh_list[zh_index]         # 玩家选的中文意思

        if words[en_word] == zh_word:
            # 配对正确：加分 + 记入已消除集合
            score += SCORE_RIGHT
            matched.add(letter)
            print(f"✅ 配对成功！{en_word} = {zh_word}，+{SCORE_RIGHT} 分")
        else:
            # 配对错误：扣分并告诉玩家正确答案
            score -= SCORE_WRONG
            print(f"❌ 不对哦，{en_word} 的正确意思是「{words[en_word]}」，-{SCORE_WRONG} 分")

    print(f"\n🎉 本轮全部配对完成！本轮得分：{score}")
    return score


def main():
    """主函数：控制多轮游戏和总分。"""
    print("=" * 34)
    print("📚 欢迎来到单词消消乐！中英配对，边玩边背单词！")

    total_score = 0  # 总分

    while True:
        total_score += play_one_round()  # 玩一轮，把本轮得分加进总分
        print(f"🏆 你的总分：{total_score}")

        again = input("再来一轮吗？(y/n)：")
        if again != "y" and again != "Y":
            break  # 不想玩了就跳出循环

    print(f"最终总分：{total_score}，背单词辛苦啦，下次见！")


if __name__ == "__main__":
    main()
