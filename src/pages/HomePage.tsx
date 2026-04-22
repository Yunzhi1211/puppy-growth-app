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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4 shadow-lg">
            <Dog size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            小狗成长记
          </h1>
          <p className="text-gray-600">记录每一个温暖的瞬间 🐾</p>
        </div>

        {/* 宠物卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-purple-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
              <Dog size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {pet ? pet.name : '我的小狗'}
              </h2>
              <p className="text-gray-500 text-sm">
                {pet ? `${pet.breed} · ${pet.gender === 'male' ? '男孩 🐕' : '女孩 🐕'}` : '点击添加你的宠物信息'}
              </p>
            </div>
            <button
              onClick={openModal}
              className="text-blue-500 text-sm hover:text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              {pet ? '编辑' : '添加'}
            </button>
          </div>
        </div>

        {/* 快捷功能 */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/timeline')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-semibold text-white">记录日常</h3>
            <p className="text-xs text-blue-100 mt-1">添加成长事件</p>
          </div>

          <div
            onClick={() => navigate('/health')}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl mb-2">💉</div>
            <h3 className="font-semibold text-white">健康管理</h3>
            <p className="text-xs text-green-100 mt-1">疫苗和体检</p>
          </div>

          <div
            onClick={() => navigate('/timeline')}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl mb-2">🐾</div>
            <h3 className="font-semibold text-white">成长轨迹</h3>
            <p className="text-xs text-purple-100 mt-1">查看时间线</p>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl mb-2">💬</div>
            <h3 className="font-semibold text-white">AI助手</h3>
            <p className="text-xs text-orange-100 mt-1">宠物知识问答</p>
          </div>
        </div>
      </div>

      {/* 添加/编辑宠物弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
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
      )}
    </div>
  );
}
