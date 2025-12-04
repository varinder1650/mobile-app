// components/checkout/AddressSection.styles.ts
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
  addressCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addressInfo: {
    marginBottom: 12,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#4CAF50',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  changeAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  changeAddressText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  selectAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 12,
  },
});