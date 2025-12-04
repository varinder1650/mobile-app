// components/checkout/CartItemCard.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderItemBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stockWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledQuantityButton: {
    opacity: 0.5,
  },
  quantityDisplay: {
    marginHorizontal: 16,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});