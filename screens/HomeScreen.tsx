import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
    View,
    Text,
    FlatList,
    Button,
    StyleSheet,
    Switch,
} from 'react-native';

import { v4 as uuidv4 } from 'uuid';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';

type Task = {
    id: string;
    title: string;
    points: number;
    completed: boolean;
};

const STORAGE_KEY = '@tasks';
const DAILY_SCORES_KEY = '@daily_scores';

const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const getDayCategory = (score: number): string => {
    if (score >= 20) return 'Harika Gün 😎';
    if (score >= 10) return 'İyi Gün 🙂';
    return 'Kötü Gün 😞';
};
const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [selectedPoints, setSelectedPoints] = useState(0);
    const [dailyScores, setDailyScores] = useState<{ [date: string]: number }>({});

    const loadDailyScores = async () => {
        try {
            const json = await AsyncStorage.getItem(DAILY_SCORES_KEY);
            if (json) {
                setDailyScores(JSON.parse(json));
            }
        } catch (error) {
            console.error('Günlük puanlar yüklenirken hata:', error);
        }
    };
    // Günlük puanı AsyncStorage'a kaydetme fonksiyonu
    const saveTodayScore = async (score: number) => {
        try {
            const today = getTodayDate();
            const json = await AsyncStorage.getItem(DAILY_SCORES_KEY);
            const data = json ? JSON.parse(json) : {};

            data[today] = score; // Bugünün puanını güncelle

            await AsyncStorage.setItem(DAILY_SCORES_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Günlük puan kaydedilirken hata:', error);
        }
    };

    // Görevleri yükle
    const loadTasks = async () => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) {
                setTasks(JSON.parse(json));
            }
        } catch (error) {
            console.error('Görevler yüklenirken hata:', error);
        }
    };

    // Görevleri kaydet
    const saveTasks = async (updatedTasks: Task[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
        } catch (error) {
            console.error('Görevler kaydedilirken hata:', error);
        }
    };

    useEffect(() => {
        loadTasks();
        loadDailyScores();
    }, []);

    // tasks her değiştiğinde günlük puanı kaydet
    useEffect(() => {
        const dailyScore = tasks
            .filter(task => task.completed)
            .reduce((total, task) => total + task.points, 0);

        saveTodayScore(dailyScore);
        loadDailyScores();
    }, [tasks]);

    const toggleTask = async (id: string) => {
        const updated = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        setTasks(updated);
        await saveTasks(updated);
    };
    const getLast7DaysData = () => {
        const today = new Date();
        let labels: string[] = [];
        let data: number[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(dateStr.slice(5)); // MM-DD olarak göster
            data.push(dailyScores[dateStr] || 0);
        }
        return { labels, data };
    };
    const chartData = getLast7DaysData();

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

    const deleteTask = async (id: string) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
    };

    const openEditModal = (task: Task) => {
        setSelectedTaskId(task.id);
        setSelectedTitle(task.title);
        setSelectedPoints(task.points);
        setEditModalVisible(true);
    };

    const saveEditedTask = async (newTitle: string, newPoints: number) => {
        if (!selectedTaskId) return;

        const updatedTasks = tasks.map(task =>
            task.id === selectedTaskId
                ? { ...task, title: newTitle, points: newPoints }
                : task
        );
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
        setEditModalVisible(false);
    };

    const calculateDailyScore = (tasks: Task[]) => {
        return tasks
            .filter(task => task.completed)
            .reduce((total, task) => total + task.points, 0);
    };

    const dailyScore = calculateDailyScore(tasks);
    const dayCategory = getDayCategory(dailyScore);

    const renderTask = ({ item }: { item: Task }) => (
        <View style={styles.taskItem}>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{item.title}</Text>
                <Text style={{ color: 'gray' }}>{item.points} puan</Text>
            </View>

            <Switch
                value={item.completed}
                onValueChange={() => toggleTask(item.id)}
                style={{ marginRight: 10 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons
                    name="create-outline"
                    size={24}
                    color="#2980b9"
                    onPress={() => openEditModal(item)}
                />
                <Ionicons
                    name="trash-outline"
                    size={24}
                    color="#c0392b"
                    onPress={() => deleteTask(item.id)}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>meCheck+</Text>

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>Bugünkü Puan: {dailyScore}</Text>
                <Text style={{ fontSize: 16, color: 'gray' }}>{dayCategory}</Text>
            </View>

            {/* Grafik */}
            <ScrollView horizontal={true} style={{ marginVertical: 20 }}>
                <LineChart
                    data={{
                        labels: chartData.labels,
                        datasets: [
                            {
                                data: chartData.data,
                                strokeWidth: 2,
                            },
                        ],
                    }}
                    width={Math.max(screenWidth, chartData.labels.length * 50)} // genişlik dinamik
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="p"
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                        },
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
            </ScrollView>

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

            <EditTaskModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={saveEditedTask}
                initialTitle={selectedTitle}
                initialPoints={selectedPoints}
            />
        </SafeAreaView>
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
        gap: 10,
    },
});
