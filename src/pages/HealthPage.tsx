import { Heart, Syringe, Stethoscope, Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { HealthRecord } from '../types';
import { getHealthRecords, saveHealthRecord } from '../utils/storage';

export default function HealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vaccine' as 'vaccine' | 'checkup' | 'medication' | 'deworming',
    title: '',
    date: new Date().toISOString().split('T')[0],
    nextDate: '',
    notes: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const savedRecords = getHealthRecords();
    setRecords(savedRecords);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      petId: '1',
      ...formData,
      nextDate: formData.nextDate || undefined,
      notes: formData.notes || undefined,
    };
    saveHealthRecord(newRecord);
    loadRecords();
    setShowModal(false);
    setFormData({
      type: 'vaccine',
      title: '',
      date: new Date().toISOString().split('T')[0],
      nextDate: '',
      notes: '',
    });
  };

  const getRecordsByType = (type: string) => {
    return records.filter(r => r.type === type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return <Syringe size={32} className="text-blue-500 mx-auto mb-2" />;
      case 'checkup': return <Stethoscope size={32} className="text-green-500 mx-auto mb-2" />;
      case 'medication': return <Pill size={32} className="text-purple-500 mx-auto mb-2" />;
      case 'deworming': return <Heart size={32} className="text-red-500 mx-auto mb-2" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'vaccine': return '疫苗接种';
      case 'checkup': return '健康体检';
      case 'medication': return '用药记录';
      case 'deworming': return '驱虫记录';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-4xl font-black text-white drop-shadow-2xl mb-6">健康管理</h1>

        {/* 健康类型 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {['vaccine', 'checkup', 'medication', 'deworming'].map((type) => (
            <div key={type} className="glass rounded-3xl shadow-2xl p-6 text-center hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300 border-2 border-white/30">
              {getTypeIcon(type)}
              <h3 className="font-black text-gray-800 text-base">{getTypeName(type)}</h3>
              <p className="text-xs text-gray-600 mt-2 font-semibold">
                {getRecordsByType(type).length} 条记录
              </p>
            </div>
          ))}
        </div>

        {/* 添加按钮 */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full glass rounded-3xl py-4 font-black text-gray-800 text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 mb-6 border-2 border-white/50"
        >
          ➕ 添加健康记录
        </button>

        {/* 记录列表 */}
        {records.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-black text-white text-xl drop-shadow-lg mb-4">最近记录</h2>
            {records.map((record) => (
              <div key={record.id} className="glass rounded-3xl shadow-2xl p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300 border-2 border-white/30">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-gray-800 text-lg">{record.title}</h3>
                  <span className="text-xs bg-white/50 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full font-bold border border-white/30">{getTypeName(record.type)}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2 font-semibold">📅 日期: {record.date}</p>
                {record.nextDate && (
                  <p className="text-sm text-blue-700 font-semibold">⏰ 下次: {record.nextDate}</p>
                )}
                {record.notes && (
                  <p className="text-sm text-gray-700 mt-3 bg-white/30 backdrop-blur-sm p-3 rounded-2xl border border-white/30">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加记录弹窗 */}
      {showModal &&
        createPortal(
          <div className="modal-backdrop" role="presentation">
            <div className="modal-align" onClick={() => setShowModal(false)}>
              <div
                className="relative w-full max-w-md max-h-[min(90dvh,720px)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
            <h2 className="text-xl font-bold text-gray-800 mb-4">添加健康记录</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="vaccine">疫苗接种</option>
                    <option value="checkup">健康体检</option>
                    <option value="medication">用药记录</option>
                    <option value="deworming">驱虫记录</option>
                  </select>
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
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
                    placeholder="例如：狂犬疫苗"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    下次日期（可选）
                  </label>
                  <input
                    type="date"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备注（可选）
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500 h-20"
                    placeholder="记录更多细节..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-3xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white py-2 rounded-3xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
