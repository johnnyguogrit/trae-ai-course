# -*- coding: utf-8 -*-
"""
AI 聊天机器人（第 2 课配套项目）
原理：检查用户的话里有没有关键词，有就回复对应的话。
运行方式：在终端执行  python chatbot.py
"""

import random  # 导入随机模块，用来随机选笑话


def get_reply(text):
    """根据用户输入的文字，返回机器人的回复。

    参数 text：用户说的话（字符串）
    返回值：机器人要回复的话（字符串）
    """
    # in 是"包含"判断："你好" in text 表示用户的话里有没有"你好"两个字
    if "你好" in text:
        return "你好呀！很高兴见到你 😊"
    elif "名字" in text:
        return "我叫小T，是用 Python 写出来的聊天机器人。"
    elif "几岁" in text or "年龄" in text:
        return "我才出生 1 天，还是个小宝宝机器人呢！"
    elif "笑话" in text:
        # 列表里存了 3 个冷笑话，random.choice 随机挑一个
        jokes = [
            "为什么程序员分不清万圣节和圣诞节？因为 Oct 31 == Dec 25！",
            "有一只北极熊闲得无聊，就开始拔自己的毛……拔完了，好冷。",
            "小明问老师：为什么 1+1=2？老师：因为 2-1=1。",
        ]
        return random.choice(jokes)
    elif "再见" in text or "拜拜" in text:
        return "再见啦，下次再来找我聊天哦！👋"
    else:
        # 所有关键词都没匹配上时的兜底回复
        return "唔，我还不太明白这句话……你可以对我说：你好 / 笑话 / 再见"


def main():
    """主函数：负责开场白和聊天循环。"""
    print("=" * 30)
    print("🤖 你好，我是聊天机器人小T！")

    name = input("先告诉我，你叫什么名字？")  # 记下用户名字，后面回复时带上
    print(f"{name}，很高兴认识你！想聊点什么？（说\"再见\"结束聊天）")

    # while True 无限循环：一直聊天，直到用户说再见
    while True:
        text = input(f"{name}：")  # 接收用户输入
        reply = get_reply(text)    # 调用函数拿到回复
        print(f"小T：{reply}")

        # 用户说再见就跳出循环，结束程序
        if "再见" in text or "拜拜" in text:
            break


if __name__ == "__main__":
    main()
