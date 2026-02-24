# 墨韵节拍：止戈 | Ink Beat: Zhige

> 将节奏打击感与中华武术结合的武术节奏游戏

## 项目架构

```
moyunzhige/
├── frontend-react/    # 前端 — React + Vite + TypeScript
│   ├── src/
│   │   ├── main.tsx              # React 入口
│   │   ├── App.tsx               # 主应用组件（状态管理）
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx     # Canvas 游戏主循环
│   │   │   ├── StartScreen.tsx    # 开始界面
│   │   │   └── ResultScreen.tsx   # 结算界面 + 排行榜
│   │   ├── engine/               # 游戏引擎（ES Module）
│   │   │   ├── BambooScene.js    # 竹林场景渲染
│   │   │   ├── AudioManager.js   # Web Audio API 音效
│   │   │   ├── RhythmEngine.js   # 节奏引擎
│   │   │   ├── Player.js         # 侠士角色
│   │   │   ├── EnemyManager.js   # 忍者敌人
│   │   │   ├── InputManager.js   # 输入管理
│   │   │   ├── EffectsManager.js # 水墨特效
│   │   │   └── GameUI.js         # Canvas HUD
│   │   ├── services/api.ts       # 后端 API 客户端
│   │   ├── types/game.ts         # TypeScript 类型定义
│   │   └── styles/index.css      # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── frontend/          # 旧前端（原生 JS 版本，已废弃）
├── backend/           # Java 后端 — COLA 架构
│   ├── moyunzhige-domain/         # 领域层：实体、网关接口、领域服务
│   ├── moyunzhige-app/            # 应用层：DTO、应用服务
│   ├── moyunzhige-adapter/        # 适配层：REST Controller
│   ├── moyunzhige-infrastructure/ # 基础设施层：本地文件存储
│   └── moyunzhige-start/          # 启动模块：Spring Boot 入口
├── scripts/           # Python 脚本
│   ├── generate_beatmap.py  # 谱面生成器
│   └── analyze_beatmap.py   # 谱面分析器
└── data/              # 本地数据存储
    ├── levels/              # 关卡谱面 JSON
    └── scores.json          # 玩家成绩
```

## 快速开始

### 1. 启动后端

```bash
cd backend
mvn clean package -DskipTests
java -jar moyunzhige-start/target/moyunzhige-start-1.0.0-SNAPSHOT.jar
```

后端默认运行在 `http://localhost:8081`。

### 2. 启动前端（React）

```bash
cd frontend-react
npm install
npm run dev
```

访问 `http://localhost:3000`，Vite 会自动将 `/api` 请求代理到后端 `http://localhost:8081`。

> 前端支持离线运行：如果后端不可用，会自动使用内置谱面数据。

### 3. Python 脚本

```bash
cd scripts

# 生成谱面
python3 generate_beatmap.py --bpm 120 --duration 60 --difficulty medium --output ../data/levels/new_level.json

# 分析谱面
python3 analyze_beatmap.py ../data/levels/bamboo_battle.json
```

## 后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/levels` | 获取所有关卡列表 |
| GET | `/api/levels/{id}` | 获取关卡详情（含谱面） |
| POST | `/api/levels` | 创建新关卡 |
| DELETE | `/api/levels/{id}` | 删除关卡 |
| POST | `/api/scores` | 提交游戏成绩 |
| GET | `/api/scores/leaderboard/{levelId}?limit=10` | 获取排行榜 |

## 游戏操作

| 按键 | 动作 |
|------|------|
| `←` | 左拳 |
| `→` | 右拳 |
| `↑` | 跳闪 |
| `↓` | 蹲闪 |
| `Space` | 格挡 |

## 技术栈

- **前端**: React 18、TypeScript、Vite、HTML5 Canvas、Web Audio API
- **后端**: Java 17、Spring Boot 3.2、COLA 架构、Jackson
- **脚本**: Python 3（无外部依赖）
- **存储**: 本地 JSON 文件
