// components/order-tracking/TipSection.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tipSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  tipAddedSection: {
    backgroundColor: '#FFE8E8',
    marginTop: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipAddedText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tipButtonSelected: {
    backgroundColor: '#00A65A',
  },
  tipButtonDisabled: {
    opacity: 0.5,
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipButtonTextSelected: {
    color: '#fff',
  },
  savingTipIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  savingTipText: {
    fontSize: 14,
    color: '#00A65A',
  },
});