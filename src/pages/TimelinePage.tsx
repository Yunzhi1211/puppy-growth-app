import { PawPrint, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GrowthEvent } from '../types';
import { getEvents, saveEvent } from '../utils/storage';

export default function TimelinePage() {
  const [events, setEvents] = useState<GrowthEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPawAnimation, setShowPawAnimation] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'daily' as 'milestone' | 'health' | 'daily' | 'other',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: GrowthEvent = {
      id: Date.now().toString(),
      petId: '1',
      ...formData,
    };
    saveEvent(newEvent);
    loadEvents();
    setShowModal(false);

    // 显示爪印动画
    setShowPawAnimation(true);
    setTimeout(() => setShowPawAnimation(false), 2000);

    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'daily',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-white drop-shadow-2xl">成长轨迹</h1>
          <button
            onClick={() => setShowModal(true)}
            className="glass text-gray-800 rounded-full p-4 hover:shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white/50"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* 时间线 */}
        <div className="relative">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={event.id} className="mb-8 flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
                    <PawPrint size={28} className="text-white" />
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-1 h-full bg-white/30 backdrop-blur-sm mt-2 rounded-full"></div>
                  )}
                </div>
                <div className="glass rounded-3xl shadow-2xl p-6 flex-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300 border-2 border-white/30">
                  <div className="text-sm text-purple-700 font-bold mb-2">📅 {event.date}</div>
                  <h3 className="font-black text-gray-800 mb-3 text-xl">{event.title}</h3>
                  <p className="text-gray-700 text-base leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass rounded-3xl shadow-2xl py-16 text-center border-2 border-white/30">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-gray-700 text-lg font-semibold">还没有成长记录</p>
              <p className="text-gray-600 mt-2">点击右上角添加吧！</p>
            </div>
          )}
        </div>

        {/* 爪印动画 */}
        {showPawAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="animate-bounce">
              <PawPrint size={80} className="text-purple-500 opacity-80" />
            </div>
          </div>
        )}
      </div>

      {/* 添加事件弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div className="min-h-screen flex items-center justify-center py-8">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
            <h2 className="text-xl font-bold text-gray-800 mb-4">添加成长记录</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="例如：第一次散步"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-24"
                    placeholder="记录这个特别的时刻..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="daily">日常</option>
                    <option value="milestone">里程碑</option>
                    <option value="health">健康</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
