import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, points: number) => void;
};

const AddTaskModal = ({ visible, onClose, onSave }: Props) => {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('');

  const handleSave = () => {
    if (title.trim() && !isNaN(Number(points))) {
      onSave(title.trim(), Number(points));
      setTitle('');
      setPoints('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.label}>Görev Başlığı</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Kitap okudum"
          />
          <Text style={styles.label}>Puan</Text>
          <TextInput
            style={styles.input}
            value={points}
            onChangeText={setPoints}
            placeholder="Örn: 2"
            keyboardType="numeric"
          />
          <Button title="Kaydet" onPress={handleSave} />
          <View style={{ marginTop: 10 }}>
            <Button title="İptal" color="red" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTaskModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
