#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
谱面生成器脚本
根据 BPM、时长、难度参数，自动生成节拍谱面 JSON
"""

import argparse
import json
import random
import uuid
from typing import List, Dict


def get_beat_types_for_difficulty(difficulty: int) -> Dict[str, float]:
    """
    根据难度获取节拍类型分布
    """
    distributions = {
        1: {"punch": 0.90, "block": 0.10},
        2: {"punch": 0.70, "block": 0.15, "dodge": 0.15},
        3: {"punch": 0.50, "block": 0.20, "dodge": 0.20, "hold": 0.10},
        4: {"punch": 0.40, "block": 0.25, "dodge": 0.20, "hold": 0.15},
        5: {"punch": 0.30, "block": 0.25, "dodge": 0.20, "hold": 0.15, "combo": 0.10}
    }
    return distributions.get(difficulty, distributions[2])


def get_enemy_type(beat_type: str) -> str:
    """
    根据节拍类型自动分配敌人类型
    """
    enemy_mapping = {
        "punch": "white",
        "block": "red",
        "dodge": "stealth",
        "hold": "yellow",
        "combo": "boss"
    }
    return enemy_mapping.get(beat_type, "white")


def generate_beat_type(difficulty: int) -> str:
    """
    根据难度随机生成节拍类型
    """
    distribution = get_beat_types_for_difficulty(difficulty)
    rand = random.random()
    cumulative = 0.0
    
    for beat_type, probability in distribution.items():
        cumulative += probability
        if rand <= cumulative:
            return beat_type
    
    return "punch"


def generate_beats(bpm: int, duration: int, difficulty: int) -> List[Dict]:
    """
    生成节拍列表
    """
    beats = []
    beat_interval = 60000 / bpm  # 毫秒
    total_beats = int((duration * 1000) / beat_interval)
    
    # 难度4以上可能加入半拍
    use_half_beats = difficulty >= 4
    
    for i in range(total_beats):
        time = i * beat_interval
        beat_type = generate_beat_type(difficulty)
        
        # 根据节拍类型设置持续时间
        duration_map = {
            "punch": 300,
            "block": 400,
            "dodge": 300,
            "hold": 800,
            "combo": 600
        }
        beat_duration = duration_map.get(beat_type, 300)
        
        # 生成节拍对象
        beat = {
            "time": time,
            "type": beat_type,
            "duration": beat_duration / 1000.0,  # 转换为秒
            "enemyType": get_enemy_type(beat_type)
        }
        beats.append(beat)
        
        # 难度4以上可能加入半拍
        if use_half_beats and random.random() < 0.2:
            half_beat_time = time + beat_interval / 2
            half_beat_type = "punch" if beat_type != "punch" else "block"
            half_beat = {
                "time": half_beat_time,
                "type": half_beat_type,
                "duration": 300 / 1000.0,
                "enemyType": get_enemy_type(half_beat_type)
            }
            beats.append(half_beat)
    
    # 按时间排序
    beats.sort(key=lambda x: x["time"])
    return beats


def generate_beatmap(args) -> Dict:
    """
    生成完整的谱面数据
    """
    beats = generate_beats(args.bpm, args.duration, args.difficulty)
    
    beatmap = {
        "id": str(uuid.uuid4()),
        "name": args.name or "未命名关卡",
        "description": f"自动生成的 {args.bpm} BPM 难度 {args.difficulty} 关卡",
        "scene": args.scene,
        "bpm": args.bpm,
        "difficulty": args.difficulty,
        "beats": beats,
        "createdAt": 0,
        "updatedAt": 0
    }
    
    return beatmap


def main():
    parser = argparse.ArgumentParser(description="谱面生成器")
    parser.add_argument("--bpm", type=int, default=120, help="BPM 值，默认 120")
    parser.add_argument("--duration", type=int, default=60, help="时长（秒），默认 60")
    parser.add_argument("--difficulty", type=int, default=2, choices=[1, 2, 3, 4, 5], help="难度 1-5，默认 2")
    parser.add_argument("--output", type=str, default="output_beatmap.json", help="输出文件路径，默认 output_beatmap.json")
    parser.add_argument("--name", type=str, default="", help="关卡名称")
    parser.add_argument("--scene", type=str, default="bamboo", choices=["bamboo", "tavern", "temple"], help="场景类型")
    
    args = parser.parse_args()
    
    # 生成谱面
    beatmap = generate_beatmap(args)
    
    # 输出到文件
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(beatmap, f, indent=2, ensure_ascii=False)
    
    print(f"谱面已生成: {args.output}")
    print(f"  BPM: {args.bpm}")
    print(f"  时长: {args.duration} 秒")
    print(f"  难度: {args.difficulty}")
    print(f"  节拍数: {len(beatmap['beats'])}")


if __name__ == "__main__":
    main()
