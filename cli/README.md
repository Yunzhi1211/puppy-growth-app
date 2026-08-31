# petctl — 小狗成长记 Go CLI（智谱 AI harness）

终端里直接调智谱、检查环境、跑冒烟用例。与网页 `/api/chat` 共用同一套密钥（`.env.local` 的 `ZHIPU_API_KEY`）。

## 前提

1. 安装 [Go](https://go.dev/dl/)（建议 1.22+），新开一个终端确认：

```powershell
go version
```

2. 项目根目录已有 `.env.local`：

```env
ZHIPU_API_KEY=你的密钥
# ZHIPU_MODEL=glm-4-flash
```

## 编译与使用

在 `cli` 目录：

```powershell
cd D:\GithubProject\pet\puppy-growth-app\cli
go build -o petctl.exe ./cmd/petctl
.\petctl.exe doctor
.\petctl.exe chat 幼犬多久打疫苗？
.\petctl.exe smoke
.\petctl.exe env
```

也可不生成文件，直接跑：

```powershell
go run ./cmd/petctl doctor
```

## 命令说明

| 命令 | 作用 |
|------|------|
| `env` | 检查密钥是否读到（打码显示） |
| `chat <问题>` | 单次问答；429/5xx 自动重试最多 3 次 |
| `smoke` | 固定 3 个养狗问题冒烟评测 |
| `doctor` | 检查关键源文件 + 一次连通测试 |

stderr 会打印 harness 元信息，例如：

```text
[harness] model=glm-4-flash attempts=1 latency=1.2s status=200
```

## 和网页端的关系

- **网页**：浏览器 → `POST /api/chat` → 智谱  
- **本 CLI**：终端 → 智谱（同一 harness 思路：校验配置、重试、打日志）  

两者互不替代；CLI 方便本地调试与回归，不必每次打开浏览器。
