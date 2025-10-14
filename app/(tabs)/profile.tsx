import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from '../../styles/profile.styles';

import ProfileHeader from '../../components/profile/ProfileHeader';
import UserInfo from '../../components/profile/UserInfo';
import MenuSection from '../../components/profile/MenuSection';
import LogoutButton from '../../components/profile/LogoutButton';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />
      <UserInfo user={user} />
      <MenuSection />
      <LogoutButton 
        loggingOut={loggingOut}
        handleLogout={handleLogout}
      />
    </SafeAreaView>
  );
}