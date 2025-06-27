import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Esconde o cabeçalho de cada aba
        headerShown: false,
        // Esconde completamente a barra de abas na parte inferior
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // Esta opção é necessária, mas não será visível
          title: 'Mapa',
        }}
      />
    </Tabs>
  );
}