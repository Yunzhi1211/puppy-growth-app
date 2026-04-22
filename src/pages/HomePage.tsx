import { Dog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Pet } from '../types';
import { getPet, savePet } from '../utils/storage';

export default function HomePage() {
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthday: '',
    gender: 'male' as 'male' | 'female',
  });

  useEffect(() => {
    const savedPet = getPet();
    if (savedPet) {
      setPet(savedPet);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPet: Pet = {
      id: pet?.id || Date.now().toString(),
      ...formData,
    };
    savePet(newPet);
    setPet(newPet);
    setShowModal(false);
  };

  const openModal = () => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed,
        birthday: pet.birthday,
        gender: pet.gender,
      });
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white/30 backdrop-blur-md rounded-3xl mb-6 shadow-2xl border-4 border-white/50">
            <Dog size={56} className="text-white drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl">
            小狗成长记
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">记录每一个温暖的瞬间 🐾</p>
        </div>

        {/* 宠物卡片 */}
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
              <Dog size={56} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                {pet ? pet.name : '我的小狗'}
              </h2>
              <p className="text-gray-600 text-base">
                {pet ? `${pet.breed} · ${pet.gender === 'male' ? '男孩 🐕' : '女孩 🐕'}` : '点击下方按钮添加你的宠物信息'}
              </p>
            </div>
            <button
              onClick={openModal}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg"
            >
              {pet ? '✏️ 编辑信息' : '➕ 添加宠物'}
            </button>
          </div>
        </div>

        {/* 快捷功能 */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/timeline')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">📝</div>
            <h3 className="font-black text-gray-800 text-lg">记录日常</h3>
            <p className="text-xs text-gray-600 mt-2">添加成长事件</p>
          </div>

          <div
            onClick={() => navigate('/health')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(34,197,94,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">💉</div>
            <h3 className="font-black text-gray-800 text-lg">健康管理</h3>
            <p className="text-xs text-gray-600 mt-2">疫苗和体检</p>
          </div>

          <div
            onClick={() => navigate('/timeline')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(168,85,247,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">🐾</div>
            <h3 className="font-black text-gray-800 text-lg">成长轨迹</h3>
            <p className="text-xs text-gray-600 mt-2">查看时间线</p>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(249,115,22,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">💬</div>
            <h3 className="font-black text-gray-800 text-lg">AI助手</h3>
            <p className="text-xs text-gray-600 mt-2">宠物知识问答</p>
          </div>
        </div>
      </div>

      {/* 添加/编辑宠物弹窗 */}
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {pet ? '编辑宠物信息' : '添加宠物信息'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名字
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="给你的小狗起个名字"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品种
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="例如：金毛、柯基"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    生日
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    性别
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                        className="mr-2"
                      />
                      男孩
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                        className="mr-2"
                      />
                      女孩
                    </label>
                  </div>
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
