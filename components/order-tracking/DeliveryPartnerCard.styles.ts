// components/order-tracking/DeliveryPartnerCard.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  deliveryPartnerSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  partnerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  deliveriesText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  callPartnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});