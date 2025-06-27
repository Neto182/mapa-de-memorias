import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, Button, ActivityIndicator, Platform, Animated } from 'react-native';
import MapView, { LongPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../supabaseClient';
import { MemoryMarker } from '../../components/MemoryMarker';
import mapStyle from '../../mapStyle.json';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNetInfo } from '@react-native-community/netinfo';

// Interfaces
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
interface Memory {
  id: number;
  created_at: string;
  text: string;
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  // Estados do Componente
  const [location, setLocation] = useState<Region | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number; longitude: number; } | null>(null);

  // Refs e Hooks
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const netInfo = useNetInfo();
  const offlineAnim = useRef(new Animated.Value(0)).current;

  // Efeito para o banner offline
  useEffect(() => {
    Animated.timing(offlineAnim, {
      toValue: netInfo.isConnected === false ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [netInfo.isConnected]);

  // Efeito de inicialização do mapa
  useEffect(() => {
    const initializeMap = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permissão negada', text2: 'Precisamos da sua localização para o mapa funcionar.' });
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        await fetchMemories();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Erro de Localização', text2: 'Não foi possível obter a sua localização.' });
        setLoading(false);
      }
    };

    initializeMap();
  }, []);

  // Funções de dados
  const fetchMemories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('memories').select('*');
    if (error) Toast.show({ type: 'error', text1: 'Erro ao buscar memórias', text2: error.message });
    else setMemories(data as Memory[]);
    setLoading(false);
  };

  // Handlers de interação
  const handleMarkerPress = (memory: Memory) => {
    setSelectedMemory(memory);
    bottomSheetModalRef.current?.present();
  };
  
  const handleLongPress = (event: LongPressEvent) => {
    if (netInfo.isConnected === false) {
      Toast.show({ type: 'error', text1: 'Você está offline', text2: 'Conecte-se à internet para adicionar uma memória.' });
      return;
    }
    setSelectedCoordinate(event.nativeEvent.coordinate);
    setModalVisible(true);
  };
  
  const handleSaveMemory = async () => {
    if (netInfo.isConnected === false) {
      Toast.show({ type: 'error', text1: 'Você está offline' });
      return;
    }
    if (!newMemoryText.trim() || !selectedCoordinate) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'A memória não pode estar vazia.' });
      return;
    }
    
    setLoading(true);
    setModalVisible(false);
    const { error } = await supabase.from('memories').insert([{ text: newMemoryText, latitude: selectedCoordinate.latitude, longitude: selectedCoordinate.longitude }]);
    
    if (error) {
      Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Memória Guardada', text2: 'O seu eco foi deixado no mapa.' });
      setNewMemoryText('');
      await fetchMemories();
    }
    setLoading(false);
  };

  // Renderização condicional
  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EAEAEA" />
        <Text style={styles.loadingText}>A preparar o mapa...</Text>
      </View>
    );
  }

  // JSX Principal
  return (
    <>
      <MapView
        style={styles.map}
        initialRegion={location}
        onLongPress={handleLongPress}
        showsUserLocation={true}
        customMapStyle={mapStyle}
        provider="google"
      >
        {memories.map((memory) => (
          <MemoryMarker
            key={memory.id}
            coordinate={{ latitude: memory.latitude, longitude: memory.longitude }}
            onPress={() => handleMarkerPress(memory)} 
          />
        ))}
      </MapView>
      
      {/* NOVO: Painel de Instruções na parte inferior */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <Ionicons name="hand-left-outline" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={styles.instructionsText}>Pressione e segure para deixar um eco.</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="sparkles-outline" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={styles.instructionsText}>Toque em um ponto de luz para ver uma memória.</Text>
        </View>
      </View>
      
      {/* Modal para Adicionar Memória */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>O que quer lembrar aqui?</Text>
            <TextInput
              style={styles.input}
              placeholder="Escreva a sua memória..."
              placeholderTextColor="#888"
              multiline
              onChangeText={setNewMemoryText}
              value={newMemoryText}
            />
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color={Platform.OS === 'ios' ? '#ff3b30' : '#888'} />
              <Button title="Guardar Memória" onPress={handleSaveMemory} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet para Visualizar Memória */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.cardContainer}>
          {selectedMemory && (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="location-sharp" size={20} color="#EAEAEA" />
                <Text style={styles.cardTitle}>Eco de uma Memória</Text>
              </View>
              <Text style={styles.cardText}>{selectedMemory.text}</Text>
              <Text style={styles.cardDate}>Deixada em: {new Date(selectedMemory.created_at).toLocaleDateString('pt-BR')}</Text>
            </>
          )}
        </View>
      </BottomSheetModal>
      
      {/* Banner de Offline */}
      <Animated.View style={[styles.offlineBanner, { transform: [{ translateY: offlineAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
        <Text style={styles.offlineText}>Você está offline.</Text>
      </Animated.View>
    </>
  );
}

// Folha de Estilos
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E222B' },
  loadingText: { marginTop: 10, color: '#EAEAEA' },
  map: { ...StyleSheet.absoluteFillObject },
  
  // ESTILOS ATUALIZADOS/NOVOS PARA AS INSTRUÇÕES
  instructionsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  instructionsText: {
    color: '#EAEAEA',
    marginLeft: 15,
    fontSize: 15,
    flexShrink: 1,
  },
  
  // Estilos do Modal de Adicionar
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalView: { margin: 20, backgroundColor: '#2c3e50', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  modalTitle: { fontSize: 18, marginBottom: 15, textAlign: 'center', color: '#EAEAEA' },
  input: { width: '100%', minHeight: 100, backgroundColor: '#34495e', color: '#EAEAEA', borderColor: '#7f8c8d', borderWidth: 1, marginBottom: 20, padding: 10, textAlignVertical: 'top', borderRadius: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  
  // Estilos do Card de Visualizar
  bottomSheetBackground: { backgroundColor: '#1E222B', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  handleIndicator: { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  cardContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { color: '#EAEAEA', fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  cardText: { color: '#BDBDBD', fontSize: 16, lineHeight: 24 },
  cardDate: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 16, textAlign: 'right' },
  
  // Estilo do Banner Offline
  offlineBanner: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#c0392b', padding: 12, alignItems: 'center' },
  offlineText: { color: '#fff', fontWeight: 'bold' },
});
