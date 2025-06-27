import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const handleNavigateToMap = () => {
    // Usamos 'replace' para que o utilizador não possa voltar para a tela de onboarding
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Conteúdo Superior: Ícone e Título */}
      <View style={styles.content}>
        <Image
          source={require('../assets/images/icon.jpg')} // Certifique-se de que o seu ícone está neste caminho
          style={styles.logo}
        />
        <Text style={styles.title}>ChronoMap</Text>
        <Text style={styles.subtitle}>O seu mapa de ecos e memórias.</Text>
      </View>

      {/* Botão Inferior */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNavigateToMap}>
          <Ionicons name="map-outline" size={20} color="#1E222B" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Explore Memórias</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Deixe a sua marca no tempo.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E222B', // Fundo escuro do tema
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F8F8FF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    width: '100%',
  },
  button: {
    backgroundColor: '#F8F8FF', // Botão branco para alto contraste
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#1E222B', // Texto escuro no botão claro
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
