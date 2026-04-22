import type { Pet, GrowthEvent, HealthRecord } from '../types';

const STORAGE_KEYS = {
  PET: 'puppy_pet_info',
  EVENTS: 'puppy_growth_events',
  HEALTH: 'puppy_health_records',
};

// 宠物信息
export const getPet = (): Pet | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PET);
  return data ? JSON.parse(data) : null;
};

export const savePet = (pet: Pet): void => {
  localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet));
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
