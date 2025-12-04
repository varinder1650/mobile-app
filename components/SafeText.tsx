// components/SafeText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { SecuritySanitizer } from '../utils/sanitization';

interface SafeTextProps extends TextProps {
  children: string | null | undefined;
  logThreats?: boolean;
}

export const SafeText: React.FC<SafeTextProps> = ({ 
  children, 
  logThreats = true,
  ...props 
}) => {
  const result = SecuritySanitizer.sanitizeText(children);
  
  if (!result.safe && logThreats && __DEV__) {
    console.warn('⚠️ Sanitized content with threats:', result.threats);
  }
  
  return <Text {...props}>{result.sanitized}</Text>;
};