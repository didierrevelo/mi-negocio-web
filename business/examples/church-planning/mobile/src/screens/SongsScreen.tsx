import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { songsAPI } from '../services/api';
import { Song } from '../types';

export default function SongsScreen({ navigation }: any) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, [selectedService]);

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

  const openYouTube = (url: string) => {
    Linking.openURL(url);
  };

  const renderSong = ({ item, index }: { item: Song; index: number }) => (
    <View style={styles.card}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        {item.key && <Text style={styles.key}>Tono: {item.key}</Text>}
        <Text style={styles.updated}>
          Actualizado por {item.updatedBy?.name || 'N/A'}
        </Text>
      </View>
      <View style={styles.actions}>
        {item.youtubeLink && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => openYouTube(item.youtubeLink!)}
          >
            <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          </TouchableOpacity>
        )}
        {item.lyricsUrl && (
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="document-text" size={24} color="#5B5EA6" />
          </TouchableOpacity>
        )}
        {item.sheetMusicUrl && (
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="musical-notes" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set List</Text>
      </View>

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
