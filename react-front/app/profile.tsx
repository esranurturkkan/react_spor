import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ScrollView, Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '@/components/ScreenWrapper';

export default function Profile() {
  const [tokenChecked, setTokenChecked] = useState(false);

  // Mevcut alanlar
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Yeni alanlar
  const [todaySteps, setTodaySteps] = useState('');
  const [todayCalories, setTodayCalories] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return router.replace('/login');

      try {
        const res = await fetch('http://172.20.10.4:3000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { user } = await res.json();
        if (res.ok) {
          setName(user.name);
          setAge(user.age?.toString() || '');
          setHeight(user.height_cm?.toString() || '');
          setWeight(user.weight_kg?.toString() || '');

          setTodaySteps(user.today_steps?.toString() || '');
          setTodayCalories(user.today_calories?.toString() || '');
          setFitnessLevel(user.fitness_level || '');

          setTokenChecked(true);
        } else {
          Alert.alert('Hata', user.error || 'Profil alınamadı');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Sunucu hatası', 'Profil alınamadı');
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://172.20.10.4:3000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          age: Number(age),
          height_cm: Number(height),
          weight_kg: Number(weight),
          today_steps: Number(todaySteps),
          today_calories: Number(todayCalories),
          fitness_level: fitnessLevel
        })
      });
      const { user } = await res.json();
      if (res.ok) {
        Alert.alert('Başarılı!', 'Profil güncellendi.');
      } else {
        Alert.alert('Hata', user.error || 'Güncelleme başarısız.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Sunucu hatası', 'Güncelleme başarısız.');
    }
  };

  if (!tokenChecked) return null;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.row}>
          <Text style={s.label}>Name:</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={s.row}>
          <Text style={s.label}>Age:</Text>
          <TextInput
            style={s.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>

        <View style={s.row}>
          <Text style={s.label}>Height (cm):</Text>
          <TextInput
            style={s.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </View>

        <View style={s.row}>
          <Text style={s.label}>Weight (kg):</Text>
          <TextInput
            style={s.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>

        {/* Yeni Alanlar */}
        <View style={s.row}>
          <Text style={s.label}>Today Steps:</Text>
          <TextInput
            style={s.input}
            value={todaySteps}
            onChangeText={setTodaySteps}
            keyboardType="numeric"
          />
        </View>

        <View style={s.row}>
          <Text style={s.label}>Today Calories:</Text>
          <TextInput
            style={s.input}
            value={todayCalories}
            onChangeText={setTodayCalories}
            keyboardType="numeric"
          />
        </View>

        <View style={s.row}>
          <Text style={s.label}>Fitness Level:</Text>
          <TextInput
            style={s.input}
            value={fitnessLevel}
            onChangeText={setFitnessLevel}
            placeholder="beginner/intermediate/advanced"
          />
        </View>

        <TouchableOpacity onPress={handleSave} style={s.button}>
          <Text style={s.buttonText}>Save Profile</Text>
        </TouchableOpacity>

        {/* GIF görüntüsü */}
        <Image
          source={{ uri: 'https://i.pinimg.com/originals/30/ab/43/30ab43926be6852d3b03572459ab847d.gif' }}
          style={s.gif}
          resizeMode="contain"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    width: 120,
    color: '#fff',
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    borderRadius: 6
  },
  button: {
    marginTop: 20,
    backgroundColor: '#f44',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  gif: {
    marginTop: 20,
    width: '100%',
    height: 200
  }
});