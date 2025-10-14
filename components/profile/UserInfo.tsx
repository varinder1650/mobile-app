import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/profile.styles';

interface UserInfoProps {
  user: any;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <View style={styles.userInfo}>
      <Text style={styles.name}>{user?.name || 'User'}</Text>
      <Text style={styles.email}>{user?.email || 'No email'}</Text>
      <Text style={styles.phone}>{user?.phone || 'No phone'}</Text>
    </View>
  );
};

export default UserInfo;