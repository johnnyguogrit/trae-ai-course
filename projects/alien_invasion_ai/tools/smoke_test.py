"""对 step01、step08、final 做 dummy 驱动启动与自动退出测试。"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import runpy
import subprocess
import sys
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "steps" / "step01" / "main.py",
    ROOT / "steps" / "step08" / "main.py",
    ROOT / "final" / "alien_invasion.py",
]


def launch_target(target: Path) -> None:
    """在子进程中运行游戏，显示初始化后自动投递退出事件。"""
    import pygame

    stop = threading.Event()

    def post_quit_when_ready() -> None:
        deadline = time.monotonic() + 8
        while not stop.is_set() and time.monotonic() < deadline:
            if pygame.get_init() and pygame.display.get_init():
                pygame.event.post(pygame.event.Event(pygame.QUIT))
                return
            time.sleep(0.05)

    worker = threading.Thread(target=post_quit_when_ready, daemon=True)
    worker.start()
    # 模拟在目标目录直接运行，让 final 的同目录模块可以被导入。
    sys.path.insert(0, str(target.parent))
    try:
        runpy.run_path(str(target), run_name="__main__")
    finally:
        sys.path.remove(str(target.parent))
        stop.set()
        worker.join(timeout=1)
        pygame.quit()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", type=Path, help=argparse.SUPPRESS)
    args = parser.parse_args()

    if args.target:
        launch_target(args.target.resolve())
        return 0

    env = os.environ.copy()
    env["SDL_VIDEODRIVER"] = "dummy"
    env["SDL_AUDIODRIVER"] = "dummy"
    env["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

    failures = []
    for target in TARGETS:
        try:
            result = subprocess.run(
                [sys.executable, str(Path(__file__).resolve()), "--target", str(target)],
                cwd=target.parent,
                env=env,
                capture_output=True,
                text=True,
                timeout=15,
                check=False,
            )
            if result.returncode == 0:
                print(f"PASS {target.relative_to(ROOT)}")
            else:
                failures.append(target)
                print(f"FAIL {target.relative_to(ROOT)}\n{result.stdout}\n{result.stderr}")
        except subprocess.TimeoutExpired:
            failures.append(target)
            print(f"FAIL {target.relative_to(ROOT)}: 15 秒超时，已终止子进程")

    if failures:
        print(f"{len(failures)} 个目标未通过")
        return 1
    print("3 个无头启动冒烟测试全部通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
