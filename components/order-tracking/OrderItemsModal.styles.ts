// components/order-tracking/OrderItemsModal.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  itemsContainer: {
    padding: 16,
  },
  orderItemCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vegIconSmall: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#00A65A',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vegDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A65A',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyItemsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  priceBreakdownContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  discountRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
    paddingTop: 12,
  },
  discountLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});