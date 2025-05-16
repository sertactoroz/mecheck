import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import AddTaskModal from '../components/AddTaskModal';

type Task = {
  id: string;
  title: string;
  points: number;
  completed: boolean;
};

const STORAGE_KEY = '@tasks';

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      setTasks(JSON.parse(json));
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const addNewTask = async (title: string, points: number) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      points,
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setModalVisible(false);
  };

  const getTotalPoints = () => {
    return tasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.points, 0);
  };

  const getStatus = () => {
    const total = getTotalPoints();
    if (total >= 30) return 'Harika Gün 🎉';
    if (total >= 20) return 'İyi Gün 🙂';
    if (total > 0) return 'Fena Değil 👌';
    return 'Henüz Başlanmadı 😴';
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{item.title}</Text>
        <Text style={{ color: 'gray' }}>{item.points} puan</Text>
      </View>
      <Switch value={item.completed} onValueChange={() => toggleTask(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>meCheck+</Text>

      <Text style={styles.statusText}>
        Bugünkü Puan: {getTotalPoints()} – {getStatus()}
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ gap: 12 }}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Görev Ekle" onPress={() => setModalVisible(true)} />
      </View>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addNewTask}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});
