// ✅ TYPE tanımını en �ste yap
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';

// ✅ Aktivite tipi
type Activity = {
  id: string;
  name: string;
  duration: string;
  calories: number;
};

export default function GoalsScreen() {
  const [stepGoal, setStepGoal] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);

  const MET_VALUES: { [key: string]: number } = {
    walking: 4,
    running: 7,
    cycling: 6,
    swimming: 5,
  };


  useEffect(() => {
    const fetchGoals = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return router.replace('/login');
      try {
        const res = await fetch('http://172.20.10.4:3000/goals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { goals } = await res.json();
        if (res.ok) {
          // DB’den gelen değerleri input’lara yaz
          setStepGoal(goals.daily_step_goal?.toString() || '');
          setCalorieGoal(goals.daily_calorie_goal?.toString() || '');
        } else {
          Alert.alert('Hata', goals.error || 'Hedefler alınamadı');
        }
      } catch (err) {
        console.error('GET /goals hatası:', err);
        Alert.alert('Sunucuya ulaşılamadı.');
      }
    };
    fetchGoals();
  }, []);
  const handleSaveGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
  
      const res = await fetch('http://172.20.10.4:3000/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          daily_step_goal: Number(stepGoal),
          daily_calorie_goal: Number(calorieGoal),
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        Alert.alert('Başarılı', 'Hedefler kaydedildi');
      } else {
        Alert.alert('Hata', data.error || 'Hedefler güncellenemedi');
      }
    } catch (err) {
      console.error('Goals PUT hatası:', err);
      Alert.alert('Sunucuya ulaşılamadı');
    }
  };
  
  const addActivity = () => {
    if (!activityName || !duration) {
      return Alert.alert('Eksik bilgi', 'Lütfen aktivite ve süre gir');
    }

    const met = MET_VALUES[activityName.toLowerCase()] || 4;
    const calories = Math.round((met * 3.5 * 70 / 200) * Number(duration));

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityName,
      duration,
      calories,
    };

    setActivities([...activities, newActivity]);
    setActivityName('');
    setDuration('');
  };

  const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
  const goalCalories = Number(calorieGoal) || 0;
  const completionPercent = goalCalories
    ? Math.min((totalCalories / goalCalories) * 100, 100)
    : 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Günlük Hedefler</Text>

        <TextInput
          style={styles.input}
          placeholder="Adım Hedefi"
          keyboardType="numeric"
          value={stepGoal}
          onChangeText={setStepGoal}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Kalori Hedefi"
          keyboardType="numeric"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          placeholderTextColor="#ccc"
        />
<TouchableOpacity onPress={handleSaveGoals} style={styles.button}>
  <Text style={styles.buttonText}>Hedefleri Kaydet</Text>
</TouchableOpacity>

        <Text style={styles.subtitle}>Aktivite Ekle</Text>
        <TextInput
          style={styles.input}
          placeholder="Aktivite (walking, running...)"
          value={activityName}
          onChangeText={setActivityName}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Süre (dk)"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity onPress={addActivity} style={styles.button}>
          <Text style={styles.buttonText}>Aktivite Ekle</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Bugünkü Aktiviteler</Text>
        {activities.map((act) => (
          <View key={act.id} style={styles.activityBox}>
            <Text style={styles.activityText}>
              {act.name} - {act.duration} dk - 🔥 {act.calories} kcal
            </Text>
          </View>
        ))}

        <Text style={styles.percentText}>
          Hedefe Ulaşma: %{Math.round(completionPercent)} 🔥
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 50 },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#f44',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f44',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activityBox: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  activityText: {
    color: '#fff',
  },
  percentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});
