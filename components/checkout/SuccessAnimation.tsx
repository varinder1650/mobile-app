// components/checkout/SuccessAnimation.tsx
import React from 'react';
import { View, Text, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SuccessAnimation.styles';

interface SuccessAnimationProps {
  visible: boolean;
  scaleAnim: Animated.Value;
  fadeAnim: Animated.Value;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  visible, 
  scaleAnim, 
  fadeAnim 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
    >
      <View style={styles.successOverlay}>
        <Animated.View 
          style={[
            styles.successContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={80} color="#fff" />
          </View>
          <Text style={styles.successText}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtext}>Your order will be delivered soon</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};