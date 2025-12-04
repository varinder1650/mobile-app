// components/home/ShopClosedBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShopClosedBannerProps {
  reason?: string | null;
  reopenTime?: string | null;
}

export const ShopClosedBanner: React.FC<ShopClosedBannerProps> = ({ 
  reason, 
  reopenTime 
}) => {
  const formatReopenTime = (timeString: string | null) => {
    if (!timeString) return null;
    
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  const reopenTimeFormatted = reopenTime ? formatReopenTime(reopenTime) : null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={20} color="#FF6B35" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>⚠️ Shop Currently Closed</Text>
        <Text style={styles.message}>
          {reason || 'The shop is temporarily closed. You can browse and add to cart, but orders will be processed when we reopen.'}
        </Text>
        {reopenTimeFormatted && (
          <Text style={styles.reopenTime}>
            Expected to reopen: {reopenTimeFormatted}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF0EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D84315',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
    marginBottom: 4,
  },
  reopenTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 4,
  },
});