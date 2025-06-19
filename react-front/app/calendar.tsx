import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '@/components/ScreenWrapper';
import { router } from 'expo-router';

interface Entry {
  date: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number | string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const exerciseList = [
  { id: 1, name: 'Koşu bandı (8 km/sa)', calories: '100-120 kcal' },
  { id: 2, name: 'Eliptik bisiklet', calories: '80-100 kcal' },
  { id: 3, name: 'Spinning (yüksek tempo)', calories: '100-130 kcal' },
  { id: 4, name: 'HIIT (Yüksek Yoğunluk)', calories: '120-150 kcal' },
  { id: 5, name: 'Ağırlık antrenmanı (yoğun)', calories: '60-80 kcal' },
  { id: 6, name: 'Vücut ağırlığı antrenmanı', calories: '60-90 kcal' },
  { id: 7, name: 'Kettlebell antrenmanı', calories: '100-130 kcal' },
  { id: 8, name: 'CrossFit', calories: '120-150 kcal' },
  { id: 9, name: 'Zumba (fitness dansı)', calories: '60-90 kcal' },
  { id: 10, name: 'Pilates (orta seviye)', calories: '30-50 kcal' },
  { id: 11, name: 'Yoga (Vinyasa)', calories: '40-60 kcal' },
  { id: 12, name: 'Kardiyo kickboks', calories: '100-130 kcal' },
  { id: 13, name: 'Merdiven aleti (stairmaster)', calories: '80-110 kcal' },
  { id: 14, name: 'Rowing machine (kürek aleti)', calories: '80-110 kcal' },
  { id: 15, name: 'Battle rope (ip egzersizi)', calories: '100-140 kcal' },
  { id: 16, name: 'TRX antrenmanı', calories: '70-100 kcal' },
  { id: 17, name: 'Bootcamp', calories: '100-130 kcal' },
  { id: 18, name: 'Bosu topu antrenmanı', calories: '50-80 kcal' },
  { id: 19, name: 'Step aerobik', calories: '80-100 kcal' },
  { id: 20, name: 'Reformer Pilates', calories: '40-60 kcal' },
  { id: 21, name: 'Vücut geliştirme makineleri', calories: '50-80 kcal' },
  { id: 22, name: 'Barbell squat', calories: '60-80 kcal' },
  { id: 23, name: 'Deadlift (yoğun)', calories: '80-100 kcal' },
  { id: 24, name: 'Kendi vücut ağırlığıyla plank', calories: '30-50 kcal' },
  { id: 25, name: 'Medicine ball antrenmanı', calories: '70-100 kcal' },
  { id: 26, name: 'Jump rope (ip atlama)', calories: '100-140 kcal' },
  { id: 27, name: 'Box jump', calories: '90-120 kcal' },
  { id: 28, name: 'Sled push (ağırlık kızak)', calories: '100-140 kcal' },
  { id: 29, name: 'TRX + kettlebell kombinasyonu', calories: '110-140 kcal' },
  { id: 30, name: 'Sprints (koşu aralıkları)', calories: '120-150 kcal' }
];

export default function CalendarScreen() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [marks, setMarks] = useState<{ [date: string]: { marked: boolean; dotColor: string } }>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [exerciseName, setExerciseName] = useState('');
  const [difficulty, setDifficulty] = useState<Entry['difficulty']>('beginner');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [month]);

  const fetchEntries = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return router.replace('/login');
    const [year, monthNum] = month.split('-');
    try {
      const res = await fetch(
        `http://172.20.10.4:3000/calendar?year=${year}&month=${monthNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { entries: list = [] } = await res.json();
      setEntries(list);

      const total = list.reduce((sum: number, e: Entry) => {
        const n = typeof e.calories_burned === 'string'
          ? parseInt(e.calories_burned, 10) || 0
          : e.calories_burned;
        return sum + n;
      }, 0);
      setTotalCalories(total);

      const m: any = {};
      list.forEach(e => {
        const color = e.difficulty === 'beginner' ? 'green'
          : e.difficulty === 'intermediate' ? 'orange'
          : 'red';
        m[e.date] = { marked: true, dotColor: color };
      });
      setMarks(m);
    } catch {
      Alert.alert('Hata', 'Takvim yüklenemedi');
      setEntries([]);
      setTotalCalories(0);
      setMarks({});
    }
  };

  const saveEntry = async () => {
    if (!exerciseName || !duration) {
      Alert.alert('Eksik bilgi', 'Egzersiz adı ve süre girilmeli');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    const finalCalories = calories
      ? Number(calories)
      : Math.round(Number(duration) * (difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 8 : 12));
    try {
      await fetch('http://172.20.10.4:3000/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: selectedDate,
          exercise_name: exerciseName,
          duration_minutes: Number(duration),
          calories_burned: finalCalories,
          difficulty,
        }),
      });
      setExerciseName('');
      setDuration('');
      setCalories('');
      setModalVisible(false);
      fetchEntries();
    } catch {
      Alert.alert('Hata', 'Kaydedilemedi');
    }
  };

  const dayEntries = entries.filter(e => e.date === selectedDate);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }}>
        <Calendar
           style={styles.calendar}
          current={new Date().toISOString().slice(0, 10)}
          markedDates={marks}
          onDayPress={day => {
            setSelectedDate(day.dateString);
            setModalVisible(true);
          }}
          onMonthChange={m => setMonth(m.dateString.slice(0, 7))}
          theme={{
            calendarBackground: '#f5f5dc',
            backgroundColor: '#f5f5dc'
          }}
        />
        <Text style={styles.sum}>
          Bu ay toplam yakılan kalori: {totalCalories} kcal
        </Text>
        <Text style={styles.listTitle}>Sıra – Egzersiz – 10 dk Kalori (ort.)</Text>
        {exerciseList.map(item => (
          <Text key={item.id} style={styles.listItem}>
            {item.id}. {item.name} – {item.calories}
          </Text>
        ))}
        <Text style={styles.note}>* En doğru ölçüm profesyonel cihazla yapılır.</Text>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalheading}>{selectedDate}</Text>
          <FlatList
            data={dayEntries}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Text style={styles.entryRow}>
                {item.exercise_name}: {item.duration_minutes} dk, {item.calories_burned} kcal
              </Text>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Bugün kayıt yok.</Text>}
          />

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Egzersiz adı"
              value={exerciseName}
              onChangeText={setExerciseName}
            />
            <View style={styles.row}>
              {(['beginner', 'intermediate', 'advanced'] as Entry['difficulty'][]).map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setDifficulty(lvl)}
                  style={[styles.btn, difficulty === lvl && styles.btnActive]}>
                  <Text>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Süre (dk)"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
            <TextInput
              style={styles.input}
              placeholder="Kalori (isteğe bağlı)"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
            <TouchableOpacity onPress={saveEntry} style={styles.saveBtn}>
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modal: { backgroundColor: '#6a776c', margin: 20, padding: 20, borderRadius: 8 },
  modalheading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, color: '#fff' },
  empty: { color: '#fff', textAlign: 'center', marginVertical: 10 },
  formContainer: { marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  btn: { padding: 8, borderWidth: 1, borderRadius: 5, borderColor: '#fff' },
  btnActive: { backgroundColor: '#ddd' },
  input: { borderWidth: 1, padding: 8, marginVertical: 10, borderRadius: 5, borderColor: '#fff', color: '#fff' },
  saveBtn: { backgroundColor: 'green', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  closeBtn: { backgroundColor: 'gray', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff' },
  listTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 20, color: '#fff' },
  listItem: { color: '#fff', marginVertical: 2 },
  sum: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#f5f5dc',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  calendar: { backgroundColor: '#f5f5dc', borderRadius: 8, padding: 5 },
  note: { fontStyle: 'italic', color: '#fff', marginTop: 10 },
});

