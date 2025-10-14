import React, { useEffect, useRef } from 'react';
import { Animated, Image } from 'react-native';
import { styles } from '../../styles/home.styles';

const AnimatedLogo = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Image
        source={require('../../assets/icon.png')}
        style={styles.loadingLogo}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default AnimatedLogo;