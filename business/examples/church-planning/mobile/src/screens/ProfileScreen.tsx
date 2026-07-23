// ============================================
// PANTALLA: MI PERFIL
// ============================================
// Qué: Información del usuario actual, configuración y cerrar sesión
// Carga usuario de AsyncStorage → muestra avatar, nombre, email, rol
// Conecta: Con AsyncStorage (datos locales), con authAPI (logout)
// Menú: Editar perfil, cambiar contraseña, notificaciones, servicios, ministerios

import React, { useState, useEffect } from 'react';

// React Native components
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

// Ionicons: Iconos vectoriales
import { Ionicons } from '@expo/vector-icons';

// AsyncStorage: Almacenamiento local persistente
// Conecta: Con LoginScreen (guarda datos), con api.ts (guarda token)
import AsyncStorage from '@react-native-async-storage/async-storage';

// authAPI: Servicio de autenticación
// Conecta: Con routes/auth.ts (POST /auth/logout)
import { authAPI } from '../services/api';

// User: Tipo TypeScript para usuario
// Conecta: Con types/index.ts
import { User } from '../types';

export default function ProfileScreen({ navigation }: any) {
  // ============================================
  // ESTADOS
  // ============================================
  
  // Datos del usuario actual
  const [user, setUser] = useState<User | null>(null);

  // ============================================
  // EFECTO: Cargar usuario al montar
  // ============================================
  useEffect(() => {
    loadUser();
  }, []);

  // ============================================
  // FUNCIÓN: loadUser
  // ============================================
  // Qué: Carga datos del usuario desde AsyncStorage
  // Seguridad: Datos se guardan en login, se leen aquí
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // ============================================
  // FUNCIÓN: handleLogout
  // ============================================
  // Qué: Cierra sesión y limpia storage
  // Seguridad: Elimina token JWT y datos del usuario
  // Conecta: Con LoginScreen (navigation.replace)
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            // Elimina token y usuario del storage
            await AsyncStorage.multiRemove(['token', 'user']);
            // Navega a Login y limpia historial
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // ============================================
  // RENDER: Pantalla principal
  // ============================================
  return (
    <ScrollView style={styles.container}>
      {/* Header: Avatar, nombre, email, badge admin */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Administrador</Text>
          </View>
        )}
      </View>

      {/* Sección: Configuración de cuenta */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="key-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Cambiar Contraseña</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="calendar-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Mis Servicios</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="people-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Mis Ministerios</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Sección: Ayuda e información */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Ayuda</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#5B5EA6" />
          <Text style={styles.menuText}>Acerca de</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Botón: Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#f44336" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Versión de la app */}
      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#5B5EA6',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#5B5EA6',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  adminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
    marginBottom: 24,
  },
});
