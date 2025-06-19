import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';

export default function ScreenWrapper({ children }: { children: ReactNode }) {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/67/1b/59/671b59411a699238097a043775b5a13a.jpg' }}
      style={styles.background}
    >
      <View style={styles.diagonalShape} />

      {/* Üst Menü ve Logo */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>EXCELSIZE</Text>
      </View>

      {/* Sayfa İçeriği */}
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, position: 'relative' },
  diagonalShape: {
    position: 'absolute',
    top: 200,
    left: -100,
    width: '250%',
    height: 790,
    backgroundColor: '#1c1c1c',
    transform: [{ rotate: '-15deg' }],
    zIndex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    zIndex: 2,
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
    marginRight: 20,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    zIndex: 2,
  },
});
