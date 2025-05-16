import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    TextInput,
    Button,
    StyleSheet,
    Text,
} from 'react-native';

type EditTaskModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (updatedTitle: string, updatedPoints: number) => void;
    initialTitle: string;
    initialPoints: number;
};

const EditTaskModal = ({
    visible,
    onClose,
    onSave,
    initialTitle,
    initialPoints,
}: EditTaskModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [points, setPoints] = useState(String(initialPoints));

    useEffect(() => {
        setTitle(initialTitle);
        setPoints(String(initialPoints));
    }, [initialTitle, initialPoints]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Görevi Düzenle</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Görev adı"
                    />
                    <TextInput
                        style={styles.input}
                        value={points}
                        onChangeText={setPoints}
                        placeholder="Puan"
                        keyboardType="numeric"
                    />
                    <Button
                        title="Kaydet"
                        onPress={() => {
                            onSave(title, parseInt(points));
                            onClose();
                        }}
                    />
                    <Button title="İptal" onPress={onClose} color="gray" />
                </View>
            </View>
        </Modal>
    );
};

export default EditTaskModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
