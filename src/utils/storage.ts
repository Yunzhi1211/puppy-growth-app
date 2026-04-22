import type { Pet, GrowthEvent, HealthRecord } from '../types';

const STORAGE_KEYS = {
  PETS: 'puppy_pets_list',
  CURRENT_PET: 'puppy_current_pet_id',
  EVENTS: 'puppy_growth_events',
  HEALTH: 'puppy_health_records',
};

// 宠物信息 - 多宠物支持
export const getPets = (): Pet[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PETS);
  return data ? JSON.parse(data) : [];
};

export const getCurrentPetId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PET);
};

export const setCurrentPetId = (petId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PET, petId);
};

export const getCurrentPet = (): Pet | null => {
  const currentId = getCurrentPetId();
  if (!currentId) return null;
  const pets = getPets();
  return pets.find(p => p.id === currentId) || null;
};

export const savePet = (pet: Pet): void => {
  const pets = getPets();
  const index = pets.findIndex(p => p.id === pet.id);
  if (index >= 0) {
    pets[index] = pet;
  } else {
    pets.push(pet);
  }
  localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));

  // 如果是第一只宠物，自动设为当前宠物
  if (pets.length === 1 || !getCurrentPetId()) {
    setCurrentPetId(pet.id);
  }
};

export const deletePet = (petId: string): void => {
  const pets = getPets().filter(p => p.id !== petId);
  localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));

  // 如果删除的是当前宠物，切换到第一只
  if (getCurrentPetId() === petId && pets.length > 0) {
    setCurrentPetId(pets[0].id);
  } else if (pets.length === 0) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PET);
  }
};

// 兼容旧版本的getPet
export const getPet = (): Pet | null => {
  return getCurrentPet();
};

// 成长事件
export const getEvents = (): GrowthEvent[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
};

export const saveEvent = (event: GrowthEvent): void => {
  const events = getEvents();
  events.unshift(event);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const deleteEvent = (id: string): void => {
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

// 健康记录
export const getHealthRecords = (): HealthRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HEALTH);
  return data ? JSON.parse(data) : [];
};

export const saveHealthRecord = (record: HealthRecord): void => {
  const records = getHealthRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(records));
};

export const deleteHealthRecord = (id: string): void => {
  const records = getHealthRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(records));
};
