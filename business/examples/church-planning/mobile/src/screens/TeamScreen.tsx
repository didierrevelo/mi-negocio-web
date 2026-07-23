// ============================================
// PANTALLA: MI EQUIPO
// ============================================
// Qué: Lista de miembros del equipo asignados a servicios del usuario
// Carga miembros del API → renderiza en FlatList → permite filtrar por estado
// Conecta: Con api.ts (teamAPI), con ServiceDetailScreen
// Filtros: Todos, Confirmados, Pendientes

import React, { useState, useEffect } from 'react';

// React Native components
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// Ionicons: Iconos vectoriales
import { Ionicons } from '@expo/vector-icons';

// teamAPI: Servicio de equipo
// Conecta: Con routes/team.ts (GET /team)
import { teamAPI } from '../services/api';

// ServiceTeamMember: Tipo TypeScript para miembros del equipo
// Conecta: Con types/index.ts
import { ServiceTeamMember } from '../types';

export default function TeamScreen({ navigation }: any) {
  // ============================================
  // ESTADOS
  // ============================================
  
  // Lista de miembros del equipo
  const [members, setMembers] = useState<ServiceTeamMember[]>([]);
  
  // Filtro activo: 'all', 'confirmed', 'pending'
  const [filter, setFilter] = useState('all');

  // ============================================
  // EFECTO: Cargar miembros al montar
  // ============================================
  useEffect(() => {
    loadMembers();
  }, []);

  // ============================================
  // FUNCIÓN: loadMembers
  // ============================================
  // Qué: Carga miembros del equipo del usuario actual
  // Conecta: Con teamAPI.getAll() → routes/team.ts (GET /team)
  const loadMembers = async () => {
    try {
      const response = await teamAPI.getAll();
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================
  
  // Color del badge según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';  // Verde: confirmado
      case 'cannot_attend': return '#f44336';  // Rojo: no puede asistir
      case 'schedule_conflict': return '#FF9800';  // Naranja: conflicto
      default: return '#9E9E9E';  // Gris: pendiente
    }
  };

  // Símbolo del estado
  const getStatusSymbol = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';  // Confirmado
      case 'cannot_attend': return '✗';  // No puede
      default: return '?';  // Pendiente
    }
  };

  // ============================================
  // RENDER: Tarjeta de miembro
  // ============================================
  const renderMember = ({ item }: { item: ServiceTeamMember }) => (
    <View style={styles.card}>
      {/* Avatar con inicial del nombre */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || '?'}</Text>
      </View>
      
      {/* Información del miembro */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.user?.name}</Text>
        <Text style={styles.role}>
          {item.ministryRole?.name} • {item.ministry?.name}
        </Text>
      </View>
      
      {/* Badge de estado */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{getStatusSymbol(item.status)}</Text>
      </View>
    </View>
  );

  // ============================================
  // RENDER: Pantalla principal
  // ============================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Equipo</Text>
      </View>

      {/* Filtros de estado */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'confirmed' && styles.filterActive]}
          onPress={() => setFilter('confirmed')}
        >
          <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
            Confirmados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'pending' && styles.filterActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de miembros filtrados */}
      <FlatList
        data={members.filter(m => filter === 'all' || m.status === filter)}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay miembros asignados</Text>
          </View>
        }
      />
    </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterActive: {
    backgroundColor: '#5B5EA6',
  },
  filterText: {
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B5EA6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  role: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
