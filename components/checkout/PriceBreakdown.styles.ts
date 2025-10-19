// components/checkout/PriceBreakdown.styles.ts
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountLabel: {
    color: '#4CAF50',
  },
  discountValue: {
    color: '#4CAF50',
  },
  freeDeliveryText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});