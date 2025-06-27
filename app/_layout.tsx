import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Adicione as suas fontes aqui se as tiver
  });

  // Este efeito trata de erros de carregamento de fontes
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null; // A Splash Screen nativa será mostrada aqui
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // A lógica de redirecionamento com `useEffect` foi removida para uma abordagem mais direta.
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {/*
          A CORREÇÃO: Definimos a tela inicial diretamente no Stack com `initialRouteName`.
          Esta é a forma mais robusta de garantir que o onboarding apareça primeiro, sempre.
        */}
        <Stack screenOptions={{ headerShown: false }} initialRouteName="onboarding">
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* O Toast fica aqui para estar disponível em toda a app */}
        <Toast />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
