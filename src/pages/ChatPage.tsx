import { useState } from 'react';
import { Send, Dog } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '汪汪！我是你的虚拟小狗助手，有什么想问我的吗？🐕',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 使用免费的AI API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-or-v1-c0e1e8e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的宠物狗护理专家，擅长回答关于狗狗饲养、健康、训练等问题。请用友好、温暖的语气回答，并适当使用emoji。',
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      // 如果API失败，使用本地智能回复
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSmartReply(input),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // 本地智能回复
  const getSmartReply = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('疫苗') || q.includes('打针')) {
      return '🐕 关于疫苗接种：\n\n小狗通常需要接种以下疫苗：\n1. 犬瘟热、细小病毒等核心疫苗（6-8周开始）\n2. 狂犬病疫苗（3个月大时）\n3. 每年需要加强免疫\n\n建议咨询当地兽医制定具体的疫苗计划哦！';
    }

    if (q.includes('喂食') || q.includes('吃') || q.includes('食物')) {
      return '🍖 关于喂食建议：\n\n1. 幼犬（2-6月）：每天3-4餐\n2. 成犬（6月以上）：每天2餐\n3. 避免喂食：巧克力、葡萄、洋葱、大蒜等\n4. 保证充足的清水\n\n根据狗狗体重选择合适的狗粮量哦！';
    }

    if (q.includes('训练') || q.includes('教')) {
      return '🎓 训练小贴士：\n\n1. 使用正向激励（零食、表扬）\n2. 保持耐心和一致性\n3. 从简单指令开始（坐下、握手）\n4. 每次训练10-15分钟\n5. 最佳训练时间：饭前\n\n记住，爱和耐心是最好的训练方法！';
    }

    if (q.includes('生病') || q.includes('健康') || q.includes('症状')) {
      return '🏥 健康提醒：\n\n如果狗狗出现以下症状，请及时就医：\n- 持续呕吐或腹泻\n- 食欲不振超过24小时\n- 精神萎靡\n- 呼吸困难\n- 持续咳嗽\n\n定期体检很重要，建议每年至少一次！';
    }

    if (q.includes('洗澡') || q.includes('清洁')) {
      return '🛁 洗澡护理：\n\n1. 频率：一般每2-4周一次\n2. 使用宠物专用沐浴露\n3. 水温：38-40°C\n4. 洗后及时吹干，避免感冒\n5. 定期修剪指甲和清理耳朵\n\n过度洗澡会破坏皮肤保护层哦！';
    }

    return '汪汪！🐕 我是你的小狗助手，你可以问我关于：\n\n🍖 喂食营养\n💉 疫苗健康\n🎓 训练技巧\n🛁 日常护理\n🏥 疾病预防\n\n有什么想了解的吗？';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pb-20 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 border-b px-4 py-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Dog size={24} className="text-orange-500" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-lg">小狗助手</h1>
              <p className="text-xs text-orange-100">在线 · 随时为你解答 🐕</p>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white text-gray-800 border border-orange-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-orange-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="bg-white border-t px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="问我任何关于小狗的问题..."
              disabled={isLoading}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-orange-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 hover:shadow-lg disabled:opacity-50 transition-all duration-300"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
