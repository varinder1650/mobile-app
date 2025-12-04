import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Import your existing order screens
import RegularOrdersTab from '../components/orders/RegularOrdersTab';
import PorterOrdersTab from '../components/orders/PorterOrdersTab';
import PrintoutOrdersTab from '../components/orders/PrintoutOrdersTab';

const initialLayout = { width: Dimensions.get('window').width };

export default function OrdersScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'orders', title: 'Orders' },
    { key: 'porter', title: 'Porter' },
    { key: 'printout', title: 'Printout' },
  ]);

  const renderScene = SceneMap({
    orders: RegularOrdersTab,
    porter: PorterOrdersTab,
    printout: PrintoutOrdersTab,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      activeColor="#007AFF"
      inactiveColor="#999"
      pressColor="transparent"
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        swipeEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  indicator: {
    backgroundColor: '#007AFF',
    height: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
});