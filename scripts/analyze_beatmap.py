#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
谱面分析脚本
读取谱面 JSON，输出统计分析
"""

import argparse
import json
from typing import Dict, List
from collections import Counter, defaultdict


def load_beatmap(file_path: str) -> Dict:
    """
    加载谱面 JSON 文件
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"错误: 文件不存在 - {file_path}")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"错误: JSON 解析失败 - {e}")
        exit(1)


def analyze_beats(beats: List[Dict]) -> Dict:
    """
    分析节拍数据
    """
    if not beats:
        return {}
    
    # 统计节拍类型
    beat_types = [beat["type"] for beat in beats]
    beat_type_counts = Counter(beat_types)
    total_beats = len(beats)
    
    # 统计敌人类型
    enemy_types = [beat["enemyType"] for beat in beats]
    enemy_type_counts = Counter(enemy_types)
    
    # 计算时间间隔
    time_intervals = []
    beats_sorted = sorted(beats, key=lambda x: x["time"])
    for i in range(1, len(beats_sorted)):
        interval = beats_sorted[i]["time"] - beats_sorted[i-1]["time"]
        time_intervals.append(interval)
    
    # 找到最密集段落（连续快速节拍）
    dense_segments = find_dense_segments(beats_sorted)
    
    return {
        "total_beats": total_beats,
        "beat_type_counts": beat_type_counts,
        "beat_type_percentages": {k: v/total_beats*100 for k, v in beat_type_counts.items()},
        "enemy_type_counts": enemy_type_counts,
        "enemy_type_percentages": {k: v/total_beats*100 for k, v in enemy_type_counts.items()},
        "time_intervals": time_intervals,
        "dense_segments": dense_segments
    };


def find_dense_segments(beats: List[Dict], threshold: float = 300) -> List[Dict]:
    """
    找到最密集段落（连续快速节拍）
    threshold: 快速节拍的时间间隔阈值（毫秒）
    """
    if len(beats) < 2:
        return []
    
    dense_segments = []
    current_segment = [beats[0]]
    
    for i in range(1, len(beats)):
        interval = beats[i]["time"] - beats[i-1]["time"]
        if interval <= threshold:
            current_segment.append(beats[i])
        else:
            if len(current_segment) >= 3:  # 至少3拍才算密集段落
                dense_segments.append({
                    "start": current_segment[0]["time"],
                    "end": current_segment[-1]["time"],
                    "count": len(current_segment),
                    "beats": current_segment
                })
            current_segment = [beats[i]]
    
    # 检查最后一个段落
    if len(current_segment) >= 3:
        dense_segments.append({
            "start": current_segment[0]["time"],
            "end": current_segment[-1]["time"],
            "count": len(current_segment),
            "beats": current_segment
        })
    
    # 按节拍数量排序，取前3个最密集的
    dense_segments.sort(key=lambda x: x["count"], reverse=True)
    return dense_segments[:3]


def evaluate_difficulty(analysis: Dict) -> float:
    """
    基于类型分布评估难度
    返回 1-5 的难度值
    """
    beat_type_counts = analysis.get("beat_type_counts", {})
    total_beats = analysis.get("total_beats", 1)
    
    # 计算复杂度分数
    complexity_score = 0
    
    # punch 类型占比越高，难度越低
    punch_ratio = beat_type_counts.get("punch", 0) / total_beats
    complexity_score -= punch_ratio * 2
    
    # block 和 dodge 增加难度
    block_ratio = beat_type_counts.get("block", 0) / total_beats
    dodge_ratio = beat_type_counts.get("dodge", 0) / total_beats
    complexity_score += (block_ratio + dodge_ratio) * 2
    
    # hold 和 combo 大幅增加难度
    hold_ratio = beat_type_counts.get("hold", 0) / total_beats
    combo_ratio = beat_type_counts.get("combo", 0) / total_beats
    complexity_score += (hold_ratio + combo_ratio) * 4
    
    # 转换为 1-5 的难度值
    difficulty = max(1, min(5, round(complexity_score + 2)))
    return difficulty


def print_table(headers: List[str], rows: List[List[str]]) -> None:
    """
    打印格式化表格
    """
    # 计算每列宽度
    col_widths = [len(str(header)) for header in headers]
    for row in rows:
        for i, cell in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(cell)))
    
    # 打印表头
    header_line = " | ".join(str(header).ljust(col_widths[i]) for i, header in enumerate(headers))
    print(header_line)
    print("-" * len(header_line))
    
    # 打印数据行
    for row in rows:
        row_line = " | ".join(str(cell).ljust(col_widths[i]) for i, cell in enumerate(row))
        print(row_line)


def main():
    parser = argparse.ArgumentParser(description="谱面分析器")
    parser.add_argument("--input", type=str, required=True, help="输入谱面 JSON 文件路径")
    
    args = parser.parse_args()
    
    # 加载谱面
    beatmap = load_beatmap(args.input)
    
    # 基本信息
    print("=" * 60)
    print("谱面基本信息")
    print("=" * 60)
    print(f"ID: {beatmap.get('id', 'N/A')}")
    print(f"名称: {beatmap.get('name', 'N/A')}")
    print(f"场景: {beatmap.get('scene', 'N/A')}")
    print(f"BPM: {beatmap.get('bpm', 'N/A')}")
    print(f"难度: {beatmap.get('difficulty', 'N/A')}")
    
    # 分析节拍
    beats = beatmap.get("beats", [])
    if not beats:
        print("\n警告: 谱面中没有节拍数据")
        return
    
    analysis = analyze_beats(beats)
    
    # 总时长
    total_duration = max(beats[-1]["time"], beats[0]["time"]) if beats else 0
    duration_seconds = total_duration / 1000.0
    print(f"总时长: {duration_seconds:.2f} 秒")
    
    # 节拍统计
    print("\n" + "=" * 60)
    print("节拍类型统计")
    print("=" * 60)
    
    beat_type_rows = []
    for beat_type, count in analysis["beat_type_counts"].items():
        percentage = analysis["beat_type_percentages"][beat_type]
        beat_type_rows.append([beat_type, str(count), f"{percentage:.1f}%"])
    
    print_table(["类型", "数量", "占比"], beat_type_rows)
    
    # 敌人类型统计
    print("\n" + "=" * 60)
    print("敌人类型统计")
    print("=" * 60)
    
    enemy_type_rows = []
    for enemy_type, count in analysis["enemy_type_counts"].items():
        percentage = analysis["enemy_type_percentages"][enemy_type]
        enemy_type_rows.append([enemy_type, str(count), f"{percentage:.1f}%"])
    
    print_table(["类型", "数量", "占比"], enemy_type_rows)
    
    # 难度评估
    print("\n" + "=" * 60)
    print("难度评估")
    print("=" * 60)
    evaluated_difficulty = evaluate_difficulty(analysis)
    print(f"基于类型分布的评估难度: {evaluated_difficulty}")
    print(f"设定难度: {beatmap.get('difficulty', 'N/A')}")
    
    # 最密集段落
    print("\n" + "=" * 60)
    print("最密集段落（快速节拍）")
    print("=" * 60)
    
    dense_segments = analysis["dense_segments"]
    if dense_segments:
        for i, segment in enumerate(dense_segments, 1):
            start_time = segment["start"]
            end_time = segment["end"]
            count = segment["count"]
            print(f"段落 {i}: 时间 {start_time:.0f}ms - {end_time:.0f}ms ({count} 拍)")
    else:
        print("未发现明显的密集段落")
    
    print("\n" + "=" * 60)
    print(f"总节拍数: {analysis['total_beats']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
