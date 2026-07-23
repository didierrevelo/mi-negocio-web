// ============================================
// PANTALLA: HOME (SERVICIOS)
// ============================================
// Qué: Lista de servicios próximos
// Cómo: Carga servicios de la API → renderiza en FlatList → navega al detalle
// Conecta: Con api.ts (servicesAPI), con ServiceDetailScreen
// Escalabilidad: Pull-to-refresh, lazy loading

import React, { useState, useEffect } from 'react';

// React Native components
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';

// Ionicons: Iconos vectoriales
import { Ionicons } from '@expo/vector-icons';

// servicesAPI: Servicio de servicios
// Conecta: Con routes/services.ts (GET /services)
import { servicesAPI } from '../services/api';

// Service: Tipo TypeScript para servicios
// Conecta: Con types/index.ts
import { Service } from '../types';

export default function HomeScreen({ navigation }: any) {
  // ============================================
  // ESTADOS
  // ============================================
  
  // Lista de servicios
  const [services, setServices] = useState<Service[]>([]);
  
  // Estado de pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // ============================================
  // EFECTO: Cargar servicios al montar
  // ============================================
  useEffect(() => {
    loadServices();
  }, []);

  // ============================================
  // FUNCIÓN: loadServices
  // ============================================
  // Qué: Carga servicios del backend
  // Conecta: Con servicesAPI.getAll() → routes/services.ts
  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  // ============================================
  // FUNCIÓN: onRefresh
  // ============================================
  // Qué: Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================
  
  // Color del badge de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#FFA500';  // Naranja: planeado
      case 'confirmed': return '#4CAF50';  // Verde: confirmado
      case 'finished': return '#9E9E9E';  // Gris: finalizado
      default: return '#666';
    }
  };

  // Texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planificado';
      case 'confirmed': return 'Confirmado';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  };

  // Formatea fecha ISO a legible
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // ============================================
  // RENDER: Tarjeta de servicio
  // ============================================
  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
    >
      {/* Header: Título y estado */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      {/* Body: Fecha y hora */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
      </View>

      {/* Footer: Conteos */}
      <View style={styles.cardFooter}>
        <View style={styles.countItem}>
          <Ionicons name="people" size={14} color="#5B5EA6" />
          <Text style={styles.countText}>{item._count?.team || 0} miembros</Text>
        </View>
        <View style={styles.countItem}>
          <Ionicons name="musical-notes" size={14} color="#5B5EA6" />
          <Text style={styles.countText}>{item._count?.songs || 0} canciones</Text>
        </View>
        <View style={styles.countItem}>
          <Ionicons name="document" size={14} color="#5B5EA6" />
          <Text style={styles.countText}>{item._count?.files || 0} archivos</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ============================================
  // RENDER: Pantalla principal
  // ============================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximos Servicios</Text>
      </View>

      {/* Lista de servicios con pull-to-refresh */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay servicios programados</Text>
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
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
