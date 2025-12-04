import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { styles } from '../../styles/profile.styles';

interface LogoutButtonProps {
  loggingOut: boolean;
  handleLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ loggingOut, handleLogout }) => {
  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.logoutButton, loggingOut && styles.disabledButton]} 
      onPress={confirmLogout}
      disabled={loggingOut}
    >
      {loggingOut ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.logoutText}>Logout</Text>
      )}
    </TouchableOpacity>
  );
};

export default LogoutButton;