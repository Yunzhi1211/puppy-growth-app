import { Heart, Syringe, Stethoscope, Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">健康管理</h1>

        {/* 健康类型 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {['vaccine', 'checkup', 'medication', 'deworming'].map((type) => (
            <div key={type} className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-100">
              {getTypeIcon(type)}
              <h3 className="font-semibold text-gray-800">{getTypeName(type)}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {getRecordsByType(type).length} 条记录
              </p>
            </div>
          ))}
        </div>

        {/* 添加按钮 */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 mb-6"
        >
          ➕ 添加健康记录
        </button>

        {/* 记录列表 */}
        {records.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800 mb-3">最近记录</h2>
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{record.title}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{getTypeName(record.type)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">📅 日期: {record.date}</p>
                {record.nextDate && (
                  <p className="text-sm text-blue-600">⏰ 下次: {record.nextDate}</p>
                )}
                {record.notes && (
                  <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加记录弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备注（可选）
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-20"
                    placeholder="记录更多细节..."
                  />
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
