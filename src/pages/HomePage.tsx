import { Dog, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Pet } from '../types';
import { getPets, getCurrentPet, savePet, deletePet, setCurrentPetId } from '../utils/storage';

export default function HomePage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPetList, setShowPetList] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthday: '',
    gender: 'male' as 'male' | 'female',
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = () => {
    const allPets = getPets();
    setPets(allPets);
    const current = getCurrentPet();
    setCurrentPet(current);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPet: Pet = {
      id: editingPet?.id || Date.now().toString(),
      ...formData,
    };
    savePet(newPet);
    loadPets();
    setShowModal(false);
    setEditingPet(null);
    setFormData({
      name: '',
      breed: '',
      birthday: '',
      gender: 'male',
    });
  };

  const openAddModal = () => {
    setEditingPet(null);
    setFormData({
      name: '',
      breed: '',
      birthday: '',
      gender: 'male',
    });
    setShowModal(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      breed: pet.breed,
      birthday: pet.birthday,
      gender: pet.gender,
    });
    setShowModal(true);
    setShowPetList(false);
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('确定要删除这只宠物吗？')) {
      deletePet(petId);
      loadPets();
    }
  };

  const handleSwitchPet = (petId: string) => {
    setCurrentPetId(petId);
    loadPets();
    setShowPetList(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
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
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/30 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
              <Dog size={56} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                {currentPet ? currentPet.name : '我的小狗'}
              </h2>
              <p className="text-gray-600 text-base">
                {currentPet ? `${currentPet.breed} · ${currentPet.gender === 'male' ? '男孩 🐕' : '女孩 🐕'}` : '点击下方按钮添加你的宠物信息'}
              </p>
            </div>
            <div className="w-full flex gap-2">
              <button
                onClick={openAddModal}
                className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-3xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg"
              >
                ➕ 添加宠物
              </button>
              {pets.length > 0 && (
                <button
                  onClick={() => setShowPetList(true)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white px-6 py-3 rounded-3xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg"
                >
                  📋 管理宠物 ({pets.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 快捷功能 */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/timeline')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">📝</div>
            <h3 className="font-black text-gray-800 text-lg">记录日常</h3>
            <p className="text-xs text-gray-600 mt-2">添加成长事件</p>
          </div>

          <div
            onClick={() => navigate('/health')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">💉</div>
            <h3 className="font-black text-gray-800 text-lg">健康管理</h3>
            <p className="text-xs text-gray-600 mt-2">疫苗和体检</p>
          </div>

          <div
            onClick={() => navigate('/timeline')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">🐾</div>
            <h3 className="font-black text-gray-800 text-lg">成长轨迹</h3>
            <p className="text-xs text-gray-600 mt-2">查看时间线</p>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="glass rounded-3xl shadow-2xl p-8 text-center hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/30 group"
          >
            <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">💬</div>
            <h3 className="font-black text-gray-800 text-lg">AI助手</h3>
            <p className="text-xs text-gray-600 mt-2">宠物知识问答</p>
          </div>
        </div>
      </div>

      {/* 添加/编辑宠物弹窗 — portal + 高于底栏 z-index，避免宽屏/层叠导致不居中 */}
      {showModal &&
        createPortal(
          <div className="modal-backdrop" role="presentation">
            <div
              className="modal-align"
              onClick={() => setShowModal(false)}
            >
              <div
                className="relative w-full max-w-md max-h-[min(90dvh,720px)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingPet ? '编辑宠物信息' : '添加宠物信息'}
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
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
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
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
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
                    className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-gray-500"
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

      {/* 宠物列表弹窗 */}
      {showPetList &&
        createPortal(
          <div className="modal-backdrop" role="presentation">
            <div
              className="modal-align"
              onClick={() => setShowPetList(false)}
            >
              <div
                className="relative w-full max-w-md max-h-[min(90dvh,720px)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
            <h2 className="text-xl font-bold text-gray-800 mb-4">我的宠物</h2>
            <div className="space-y-3">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className={`p-4 rounded-3xl border-2 transition-all ${
                    currentPet?.id === pet.id
                      ? 'bg-gray-100 border-gray-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSwitchPet(pet.id)}
                    >
                      <h3 className="font-bold text-gray-800 text-lg">{pet.name}</h3>
                      <p className="text-sm text-gray-600">
                        {pet.breed} · {pet.gender === 'male' ? '男孩' : '女孩'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(pet)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPetList(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded-3xl font-semibold hover:bg-gray-300 transition-colors"
            >
              关闭
            </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
