import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { servicesAPI, teamAPI } from '../services/api';
import { Service, ServiceTeamMember } from '../types';

export default function ServiceDetailScreen({ route, navigation }: any) {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, []);

  const loadService = async () => {
    try {
      const response = await servicesAPI.getById(serviceId);
      setService(response.data);
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (memberId: string, status: string, note?: string) => {
    try {
      await teamAPI.updateStatus(memberId, { status, note });
      loadService();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'cannot_attend': return { name: 'close-circle', color: '#f44336' };
      case 'schedule_conflict': return { name: 'warning', color: '#FF9800' };
      default: return { name: 'help-circle', color: '#9E9E9E' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cannot_attend': return 'No puede asistir';
      case 'schedule_conflict': return 'Conflicto de horario';
      default: return 'Pendiente';
    }
  };

  if (loading || !service) {
    return (
      <View style={styles.loading}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Service Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.date}>{new Date(service.date).toLocaleDateString('es-ES')}</Text>
        <Text style={styles.time}>{service.time}</Text>
      </View>

      {/* Order of Service */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orden del Culto</Text>
        {service.segments?.map((segment, index) => (
          <View key={segment.id} style={styles.segment}>
            <View style={styles.segmentNumber}>
              <Text style={styles.segmentNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.segmentContent}>
              <Text style={styles.segmentTitle}>{segment.title}</Text>
              {segment.durationMin && (
                <Text style={styles.segmentDuration}>{segment.durationMin} min</Text>
              )}
              {segment.ministry && (
                <Text style={styles.segmentMinistry}>{segment.ministry.name}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Team by Ministry */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipo</Text>
        {Object.entries(service.teamByMinistry || {}).map(([ministryName, data]) => (
          <View key={ministryName} style={styles.ministryGroup}>
            <Text style={styles.ministryName}>{ministryName}</Text>
            {data.members.map((member: ServiceTeamMember) => {
              const statusInfo = getStatusIcon(member.status);
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.user?.name}</Text>
                    <Text style={styles.memberRole}>{member.ministryRole?.name}</Text>
                  </View>
                  <View style={styles.memberStatus}>
                    <Ionicons name={statusInfo.name as any} size={24} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {getStatusText(member.status)}
                    </Text>
                  </View>
                  {member.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.confirmBtn]}
                        onPress={() => handleStatusUpdate(member.id, 'confirmed')}
                      >
                        <Text style={styles.actionBtnText}>Confirmar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.declineBtn]}
                        onPress={() => handleStatusUpdate(member.id, 'cannot_attend')}
                      >
                        <Text style={styles.actionBtnText}>No puede</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Songs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set List</Text>
        {service.songs?.map((song, index) => (
          <View key={song.id} style={styles.songCard}>
            <View style={styles.songNumber}>
              <Text style={styles.songNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.title}</Text>
              {song.key && <Text style={styles.songKey}>Tono: {song.key}</Text>}
            </View>
            {song.youtubeLink && (
              <TouchableOpacity style={styles.youtubeBtn}>
                <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Files */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Archivos</Text>
        {service.files?.map((file) => (
          <View key={file.id} style={styles.fileCard}>
            <Ionicons name="document" size={24} color="#5B5EA6" />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMeta}>
                {file.uploadedBy?.name} • {new Date(file.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#5B5EA6',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  time: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  segmentNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5B5EA6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentNumberText: {
    color: '#fff',
    fontWeight: '600',
  },
  segmentContent: {
    flex: 1,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  segmentDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  segmentMinistry: {
    fontSize: 12,
    color: '#5B5EA6',
    marginTop: 2,
  },
  ministryGroup: {
    marginBottom: 16,
  },
  ministryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B5EA6',
    marginBottom: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
  },
  memberStatus: {
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    fontSize: 10,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
  },
  declineBtn: {
    backgroundColor: '#f44336',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  songNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songNumberText: {
    color: '#fff',
    fontWeight: '600',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  songKey: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  youtubeBtn: {
    padding: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
