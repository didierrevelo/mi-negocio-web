// ============================================
// PANTALLA: SET LIST (CANCIONES)
// ============================================
// Qué: Lista de canciones del set list de un servicio
// Carga canciones por servicio → renderiza en FlatList → permite abrir YouTube/letras/partituras
// Conecta: Con api.ts (songsAPI), con ServiceDetailScreen
// Acciones: Ver en YouTube, ver letra, ver partitura

import React, { useState, useEffect } from 'react';

// React Native components
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';

// Ionicons: Iconos vectoriales
import { Ionicons } from '@expo/vector-icons';

// songsAPI: Servicio de canciones
// Conecta: Con routes/songs.ts (GET /songs/service/:serviceId)
import { songsAPI } from '../services/api';

// Song: Tipo TypeScript para canciones
// Conecta: Con types/index.ts
import { Song } from '../types';

export default function SongsScreen({ navigation }: any) {
  // ============================================
  // ESTADOS
  // ============================================
  
  // Lista de canciones del set list
  const [songs, setSongs] = useState<Song[]>([]);
  
  // Servicio seleccionado (para filtrar canciones)
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // ============================================
  // EFECTO: Cargar canciones cuando cambia el servicio
  // ============================================
  useEffect(() => {
    loadSongs();
  }, [selectedService]);

  // ============================================
  // FUNCIÓN: loadSongs
  // ============================================
  // Qué: Carga canciones del set list de un servicio
  // Conecta: Con songsAPI.getByService() → routes/songs.ts (GET /songs/service/:id)
  const loadSongs = async () => {
    if (!selectedService) {
      setSongs([]);
      return;
    }
    try {
      const response = await songsAPI.getByService(selectedService);
      setSongs(response.data);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  // ============================================
  // FUNCIÓN: openYouTube
  // ============================================
  // Qué: Abre enlace de YouTube en navegador o app
  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  // ============================================
  // RENDER: Tarjeta de canción
  // ============================================
  const renderSong = ({ item, index }: { item: Song; index: number }) => (
    <View style={styles.card}>
      {/* Número de orden */}
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{index + 1}</Text>
      </View>
      
      {/* Información de la canción */}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        {item.key && <Text style={styles.key}>Tono: {item.key}</Text>}
        <Text style={styles.updated}>
          Actualizado por {item.updatedBy?.name || 'N/A'}
        </Text>
      </View>
      
      {/* Botones de acción */}
      <View style={styles.actions}>
        {/* Botón YouTube: Abre enlace si existe */}
        {item.youtubeLink && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => openYouTube(item.youtubeLink!)}
          >
            <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          </TouchableOpacity>
        )}
        {/* Botón Letra: Abre documento */}
        {item.lyricsUrl && (
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="document-text" size={24} color="#5B5EA6" />
          </TouchableOpacity>
        )}
        {/* Botón Partitura: Abre partitura */}
        {item.sheetMusicUrl && (
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="musical-notes" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>Set List</Text>
      </View>

      {/* Vista condicional: Sin servicio seleccionado vs lista de canciones */}
      {!selectedService ? (
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Selecciona un servicio para ver las canciones</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay canciones en el set list</Text>
            </View>
          }
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  number: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  key: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  updated: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
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
    textAlign: 'center',
  },
});
