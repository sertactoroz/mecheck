import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';

const TASKS_KEY = 'TASKS';

export const saveTasks = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Görevleri kaydederken hata:', error);
  }
};

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Görevleri yüklerken hata:', error);
    return [];
  }
};
