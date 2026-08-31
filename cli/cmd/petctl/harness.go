package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	zhipuURL      = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
	systemPrompt  = "你是一个专业的宠物狗护理专家，擅长回答关于狗狗饲养、健康、训练等问题。请用友好、温暖的语气回答，并适当使用emoji。回答要简洁实用，每次回答控制在200字以内。"
	maxAttempts   = 3
	httpTimeout   = 60 * time.Second
)

type Harness struct {
	cfg    Config
	client *http.Client
}

type CallMeta struct {
	Model    string
	Attempts int
	Latency  time.Duration
	Status   int
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
}

type chatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Code    any    `json:"code"`
	} `json:"error"`
}

func NewHarness(cfg Config) *Harness {
	return &Harness{
		cfg: cfg,
		client: &http.Client{
			Timeout: httpTimeout,
		},
	}
}

// Chat 带重试的智谱调用：对 429/5xx 退避重试，记录 attempts / latency。
func (h *Harness) Chat(userText string) (string, CallMeta, error) {
	meta := CallMeta{Model: h.cfg.Model}
	start := time.Now()
	var lastErr error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		meta.Attempts = attempt
		content, status, err := h.once(userText)
		meta.Status = status
		meta.Latency = time.Since(start)
		if err == nil {
			return content, meta, nil
		}
		lastErr = err
		if !retryable(status) || attempt == maxAttempts {
			break
		}
		sleep := time.Duration(attempt*attempt) * 400 * time.Millisecond
		time.Sleep(sleep)
	}

	meta.Latency = time.Since(start)
	return "", meta, lastErr
}

func (h *Harness) once(userText string) (string, int, error) {
	body, err := json.Marshal(chatRequest{
		Model: h.cfg.Model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userText},
		},
		Temperature: 0.7,
	})
	if err != nil {
		return "", 0, err
	}

	req, err := http.NewRequest(http.MethodPost, zhipuURL, bytes.NewReader(body))
	if err != nil {
		return "", 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.cfg.APIKey)

	res, err := h.client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer res.Body.Close()

	raw, err := io.ReadAll(res.Body)
	if err != nil {
		return "", res.StatusCode, err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		msg := string(raw)
		var er chatResponse
		if json.Unmarshal(raw, &er) == nil && er.Error != nil && er.Error.Message != "" {
			msg = er.Error.Message
		}
		return "", res.StatusCode, fmt.Errorf("HTTP %d: %s", res.StatusCode, truncate(msg, 300))
	}

	var parsed chatResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return "", res.StatusCode, fmt.Errorf("解析响应失败: %w", err)
	}
	if len(parsed.Choices) == 0 || parsed.Choices[0].Message.Content == "" {
		return "", res.StatusCode, fmt.Errorf("模型未返回正文")
	}
	return parsed.Choices[0].Message.Content, res.StatusCode, nil
}

func retryable(status int) bool {
	return status == 429 || status == 502 || status == 503 || status == 504 || status == 0
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}
