// components/checkout/SuccessAnimation.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
});