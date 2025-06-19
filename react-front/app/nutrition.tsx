import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
   Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function NutritionScreen() {
  const [water, setWater] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    const fetchNutrition = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch('http://172.20.10.4:3000/nutrition', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setWater(data.nutrition.water_ml?.toString() || '');
        setProtein(data.nutrition.protein_gram?.toString() || '');
        setCarbs(data.nutrition.carb_gram?.toString() || '');
        setFat(data.nutrition.fat_gram?.toString() || '');
      } else {
        Alert.alert('Hata', data.error || 'Veri alınamadı');
      }
    };

    fetchNutrition();
  }, []);

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch('http://172.20.10.4:3000/nutrition', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        water_ml: Number(water),
        protein_gram: Number(protein),
        carb_gram: Number(carbs),
        fat_gram: Number(fat),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert('Başarılı', 'Veriler güncellendi');
    } else {
      Alert.alert('Hata', data.error || 'Güncelleme başarısız');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Beslenme Takibi</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Su (ml):</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={water}
            onChangeText={setWater}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Protein (gr):</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={protein}
            onChangeText={setProtein}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Karbonhidrat (gr):</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={carbs}
            onChangeText={setCarbs}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Yağ (gr):</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={fat}
            onChangeText={setFat}
          />
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>Kaydet</Text>
        </TouchableOpacity>
     <Image
        source={{ uri: 'https://i.pinimg.com/originals/79/c7/ff/79c7ff9d622c8fae535a06898f0d6700.gif' }}
        style={styles.gif}/>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 15,
  },
  label: {
    color: '#aaa',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
  },
  gif: {
   width: 120,
   height: 120,
 alignSelf: 'center',
  marginTop: 15,
 },
  button: {
    backgroundColor: '#f44',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
