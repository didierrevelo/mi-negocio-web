// ============================================
// PANTALLA: LOGIN
// ============================================
// Qué: Formulario de autenticación
// Cómo: Valida credenciales → obtiene token → guarda en storage → navega a Home
// Conecta: Con api.ts (authAPI.login), con AsyncStorage, con AppNavigator
// Seguridad: Token JWT, rate limiting en backend

import React, { useState } from 'react';

// React Native components
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// AsyncStorage: Almacenamiento local persistente
// Conecta: Con api.ts (guarda token), con ProfileScreen (lee usuario)
import AsyncStorage from '@react-native-async-storage/async-storage';

// authAPI: Servicio de autenticación
// Conecta: Con routes/auth.ts (POST /auth/login)
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  // ============================================
  // ESTADOS
  // ============================================
  
  // Email del usuario
  const [email, setEmail] = useState('');
  
  // Contraseña del usuario
  const [password, setPassword] = useState('');
  
  // Estado de carga (muestra spinner)
  const [loading, setLoading] = useState(false);

  // ============================================
  // FUNCIÓN: handleLogin
  // ============================================
  // Qué: Valida credenciales y navega a Home
  // Cómo: Llama a API → guarda token → limpia storage → navega
  // Conecta: Con authAPI.login(), con AsyncStorage, con navigation
  const handleLogin = async () => {
    // Validación básica
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Llama al backend para autenticar
      // Conecta: Con routes/auth.ts (POST /auth/login)
      const response = await authAPI.login(email, password);
      
      // Guarda token JWT en AsyncStorage
      // Seguridad: Token se usa en cada request (api.ts interceptor)
      await AsyncStorage.setItem('token', response.data.token);
      
      // Guarda datos del usuario (sin password)
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navega a Home y limpia el historial (no puede volver con back)
      navigation.replace('Home');
    } catch (error: any) {
      // Muestra error al usuario
      Alert.alert('Error', error.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <View style={styles.container}>
      {/* Header con logo y título */}
      <View style={styles.header}>
        <Text style={styles.logo}>⛪</Text>
        <Text style={styles.title}>Church Planning</Text>
        <Text style={styles.subtitle}>Gestiona tus servicios</Text>
      </View>

      {/* Formulario de login */}
      <View style={styles.form}>
        {/* Campo de email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {/* Campo de contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry  // Oculta caracteres
        />
        
        {/* Botón de login */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}  // Deshabilita mientras carga
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================
// Qué: Estilos CSS-in-JS para React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#5B5EA6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
