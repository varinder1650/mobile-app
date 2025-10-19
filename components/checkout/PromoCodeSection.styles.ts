// components/checkout/PromoCodeSection.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  applyPromoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyPromoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  appliedPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fff0',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoText: {
    marginLeft: 12,
  },
  appliedPromoCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appliedPromoDiscount: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
});