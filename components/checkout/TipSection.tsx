import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TipSectionProps {
  selectedTip: number | null;
  onTipSelect: (amount: number) => void;
  onRemoveTip: () => void;
  disabled?: boolean;
}

export const TipSection: React.FC<TipSectionProps> = ({
  selectedTip,
  onTipSelect,
  onRemoveTip,
  disabled = false,
}) => {
  return (
    <View style={styles.tipSection}>
      <View style={styles.tipHeader}>
        <View style={styles.tipHeaderLeft}>
          <Ionicons name="heart" size={20} color="#E74C3C" />
          <Text style={styles.tipTitle}>Tip your delivery partner</Text>
        </View>
      </View>
      <Text style={styles.tipDescription}>
        100% of the tip goes to your delivery partner
      </Text>
      <View style={styles.tipOptions}>
        {[20, 30, 50, 0].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.tipButton,
              selectedTip === amount && styles.tipButtonSelected,
            ]}
            onPress={() => onTipSelect(amount)}
            disabled={disabled}
          >
            <Text style={[
              styles.tipButtonText,
              selectedTip === amount && styles.tipButtonTextSelected,
            ]}>
              {amount === 0 ? 'Custom' : `₹${amount}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedTip && selectedTip > 0 && (
        <View style={styles.tipSelectedContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.tipSelectedText}>
            ₹{selectedTip} tip added
          </Text>
          <TouchableOpacity onPress={onRemoveTip} disabled={disabled}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tipSection: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  tipDescription: { fontSize: 13, color: '#666', marginBottom: 16 },
  tipOptions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tipButton: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 8,
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tipButtonSelected: { 
    borderColor: '#007AFF', 
    backgroundColor: '#E3F2FD',
  },
  tipButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tipButtonTextSelected: { color: '#007AFF' },
  tipSelectedContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F8F4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  tipSelectedText: { flex: 1, fontSize: 14, color: '#4CAF50', fontWeight: '500' },
});