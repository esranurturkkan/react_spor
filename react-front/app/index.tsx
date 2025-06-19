import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      {/* Motivasyon yazıları */}
      <View style={styles.motivation}>
        <Text style={styles.motivationText}>Take a breath.</Text>
        <Text style={styles.motivationText}>
          The journey to a healthier you isn't about perfection, it's about progress.
        </Text>
        <Text style={styles.motivationText}>Trust yourself.</Text>
      </View>

      {/* 3 Bulut Kart */}
      <View style={styles.buttonsWrapper}>
        <View style={styles.row}>
          <View style={styles.cloudCard}>
            <Text style={styles.cloudCardText}>Setting target calories</Text>
          </View>
          <View style={styles.cloudCard}>
            <Text style={styles.cloudCardText}>Create exercise programs</Text>
          </View>
        </View>

        <View style={styles.singleCloud}>
          <View style={styles.cloudCard}>
            <Text style={styles.cloudCardText}>Calorie record</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  motivation: {
    marginTop: 180,
    paddingHorizontal: 10,
    zIndex: 2,
  },
  motivationText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 5,
  },
  buttonsWrapper: {
    position: 'absolute',
    bottom: 210,
    width: '90%',
    alignItems: 'center',
    zIndex: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  singleCloud: {
    alignItems: 'center',
  },
  cloudCard: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 50,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cloudCardText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
  },
});
