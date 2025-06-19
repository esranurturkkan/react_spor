import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://172.20.10.4:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
      if (res.ok) {
        // ✅ TOKEN'ı Kaydet!
        await AsyncStorage.setItem('token', data.token);
  
        Alert.alert('Giriş başarılı!', `Hoş geldin, ${data.user.name}`);
        router.replace('/profile'); // anasayfaya yönlendir
      } else {
        Alert.alert('Hata', data.error || 'E-posta ya da şifre yanlış');
      }
    } catch (err) {
      Alert.alert('Bağlantı hatası', 'Sunucuya ulaşılamadı');
    }
  };
  
  return (
    <ScreenWrapper>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, flexDirection: 'row' }}>
        <Text style={{ color: '#aaa' }}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={{ color: '#f44' }}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 135,
    
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
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
