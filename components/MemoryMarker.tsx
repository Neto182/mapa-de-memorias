import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

interface Props {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress: () => void;
}


export const MemoryMarker = ({ coordinate, onPress }: Props) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.pulse}>
         <View style={styles.dot} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  pulse: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgb(116, 255, 61)', // Cor da ponto da memoria
    shadowColor: '#fff',
     shadowRadius: 8,
    shadowOpacity: 1,
  },
});