package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	APIKey string
	Model  string
}

func loadConfig(projectRoot string) (Config, string, error) {
	cfg := Config{Model: "glm-4-flash"}

	// 1) 进程环境变量优先
	if v := firstNonEmpty(os.Getenv("ZHIPU_API_KEY"), os.Getenv("BIGMODEL_API_KEY")); v != "" {
		cfg.APIKey = v
		if m := os.Getenv("ZHIPU_MODEL"); m != "" {
			cfg.Model = m
		}
		return cfg, "process env", nil
	}

	// 2) 读项目 .env.local / .env
	for _, name := range []string{".env.local", ".env"} {
		path := filepath.Join(projectRoot, name)
		vals, err := parseDotEnv(path)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return cfg, "", err
		}
		key := firstNonEmpty(vals["ZHIPU_API_KEY"], vals["BIGMODEL_API_KEY"])
		if key == "" {
			continue
		}
		cfg.APIKey = key
		if m := vals["ZHIPU_MODEL"]; m != "" {
			cfg.Model = m
		}
		return cfg, name, nil
	}

	return cfg, "(none)", fmt.Errorf("未找到 ZHIPU_API_KEY / BIGMODEL_API_KEY")
}

func parseDotEnv(path string) (map[string]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	out := map[string]string{}
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		// 去掉行内注释（简单处理）
		if i := strings.Index(line, " #"); i >= 0 {
			line = strings.TrimSpace(line[:i])
		}
		eq := strings.IndexByte(line, '=')
		if eq <= 0 {
			continue
		}
		k := strings.TrimSpace(line[:eq])
		v := strings.TrimSpace(line[eq+1:])
		v = strings.Trim(v, `"'`)
		if k != "" {
			out[k] = v
		}
	}
	return out, sc.Err()
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}
