package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func cmdEnv() {
	root := findProjectRoot()
	cfg, src, err := loadConfig(root)
	if err != nil {
		fmt.Fprintf(os.Stderr, "配置错误: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("项目根目录: %s\n", root)
	fmt.Printf("配置来源:   %s\n", src)
	fmt.Printf("模型:       %s\n", cfg.Model)
	if cfg.APIKey == "" {
		fmt.Println("ZHIPU_API_KEY: (未设置)")
		fmt.Println("请在 .env.local 写入 ZHIPU_API_KEY=... 或设置环境变量后重试。")
		os.Exit(1)
	}
	fmt.Printf("ZHIPU_API_KEY: %s\n", maskKey(cfg.APIKey))
	fmt.Println("OK")
}

func cmdChat(args []string) {
	if len(args) == 0 {
		fmt.Fprintln(os.Stderr, "用法: petctl chat <问题...>")
		os.Exit(2)
	}
	question := strings.TrimSpace(strings.Join(args, " "))
	root := findProjectRoot()
	cfg, _, err := loadConfig(root)
	if err != nil || cfg.APIKey == "" {
		fmt.Fprintln(os.Stderr, "缺少 ZHIPU_API_KEY，请先配置 .env.local 或环境变量。")
		os.Exit(1)
	}

	h := NewHarness(cfg)
	reply, meta, err := h.Chat(question)
	printMeta(meta)
	if err != nil {
		fmt.Fprintf(os.Stderr, "调用失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Println(reply)
}

func cmdSmoke() {
	root := findProjectRoot()
	cfg, _, err := loadConfig(root)
	if err != nil || cfg.APIKey == "" {
		fmt.Fprintln(os.Stderr, "缺少 ZHIPU_API_KEY，请先配置。")
		os.Exit(1)
	}

	cases := []string{
		"小狗多久打一次疫苗？",
		"金毛一天喂几顿合适？",
		"怎么训练坐下？",
	}

	h := NewHarness(cfg)
	fail := 0
	for i, q := range cases {
		fmt.Printf("\n[%d/%d] %s\n", i+1, len(cases), q)
		reply, meta, err := h.Chat(q)
		printMeta(meta)
		if err != nil {
			fmt.Printf("FAIL: %v\n", err)
			fail++
			continue
		}
		snippet := reply
		if len([]rune(snippet)) > 80 {
			snippet = string([]rune(snippet)[:80]) + "…"
		}
		fmt.Printf("OK: %s\n", snippet)
	}

	fmt.Printf("\n合计: %d 通过, %d 失败\n", len(cases)-fail, fail)
	if fail > 0 {
		os.Exit(1)
	}
}

func cmdDoctor() {
	root := findProjectRoot()
	fmt.Printf("项目根目录: %s\n", root)

	mustFiles := []string{
		"package.json",
		"api/chat.ts",
		"lib/zhipu-chat.ts",
		"src/pages/ChatPage.tsx",
	}
	for _, f := range mustFiles {
		p := filepath.Join(root, f)
		if _, err := os.Stat(p); err != nil {
			fmt.Printf("缺少文件: %s\n", f)
			os.Exit(1)
		}
		fmt.Printf("✓ %s\n", f)
	}

	cfg, src, err := loadConfig(root)
	if err != nil || cfg.APIKey == "" {
		fmt.Println("✗ 智谱密钥未配置")
		os.Exit(1)
	}
	fmt.Printf("✓ 密钥来自 %s (%s)\n", src, maskKey(cfg.APIKey))
	fmt.Printf("✓ 模型 %s\n", cfg.Model)

	h := NewHarness(cfg)
	reply, meta, err := h.Chat("用一句话介绍你是谁")
	printMeta(meta)
	if err != nil {
		fmt.Printf("✗ 连通测试失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✓ 连通测试: %s\n", strings.TrimSpace(reply))
	fmt.Println("doctor: 全部通过")
}

func printMeta(m CallMeta) {
	fmt.Fprintf(os.Stderr, "[harness] model=%s attempts=%d latency=%s status=%d\n",
		m.Model, m.Attempts, m.Latency, m.Status)
}

func findProjectRoot() string {
	// 优先：从可执行文件旁向上找 package.json；否则从 cwd 向上找
	start, _ := os.Getwd()
	if exe, err := os.Executable(); err == nil {
		if d := walkUpForPackageJSON(filepath.Dir(exe)); d != "" {
			return d
		}
	}
	if d := walkUpForPackageJSON(start); d != "" {
		return d
	}
	return start
}

func walkUpForPackageJSON(dir string) string {
	for {
		if _, err := os.Stat(filepath.Join(dir, "package.json")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return ""
		}
		dir = parent
	}
}

func maskKey(k string) string {
	k = strings.TrimSpace(k)
	if len(k) <= 8 {
		return "****"
	}
	return k[:4] + "…" + k[len(k)-4:]
}
