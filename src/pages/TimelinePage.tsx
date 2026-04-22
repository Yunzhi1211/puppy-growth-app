import { PawPrint, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GrowthEvent } from '../types';
import { getEvents, saveEvent } from '../utils/storage';

export default function TimelinePage() {
  const [events, setEvents] = useState<GrowthEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
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
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'daily',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">成长轨迹</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* 时间线 */}
        <div className="relative">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={event.id} className="mb-8 flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <PawPrint size={24} className="text-white" />
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-1 h-full bg-blue-200 mt-2"></div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow p-4 flex-1">
                  <div className="text-sm text-gray-500 mb-1">{event.date}</div>
                  <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-12">
              还没有成长记录，点击右上角添加吧！
            </div>
          )}
        </div>
      </div>

      {/* 添加事件弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
      )}
    </div>
  );
}
