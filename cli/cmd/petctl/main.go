package main

import (
	"fmt"
	"os"
)

const usage = `petctl — 小狗成长记 · Go 命令行（智谱 AI harness）

用法:
  petctl env                 检查 .env.local / 环境变量里的智谱配置
  petctl chat <问题...>      用智谱直接问答（带重试 harness）
  petctl smoke               跑一组养狗问答冒烟评测
  petctl doctor              环境检查 + 一次极简连通测试

环境变量（或项目根目录 .env.local）:
  ZHIPU_API_KEY   必填（也可用 BIGMODEL_API_KEY）
  ZHIPU_MODEL     可选，默认 glm-4-flash

示例:
  petctl env
  petctl chat 幼犬多久打一次疫苗？
  petctl smoke
`

func main() {
	if len(os.Args) < 2 {
		fmt.Fprint(os.Stderr, usage)
		os.Exit(2)
	}

	switch os.Args[1] {
	case "env":
		cmdEnv()
	case "chat":
		cmdChat(os.Args[2:])
	case "smoke":
		cmdSmoke()
	case "doctor":
		cmdDoctor()
	case "help", "-h", "--help":
		fmt.Print(usage)
	default:
		fmt.Fprintf(os.Stderr, "未知命令: %s\n\n%s", os.Args[1], usage)
		os.Exit(2)
	}
}
