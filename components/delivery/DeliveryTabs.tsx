import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabType } from '../../types/delivery.types';
import { styles } from '../../styles/delivery.styles';

interface DeliveryTabsProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  availableCount: number;
  assignedCount: number;
  deliveredCount: number;
}

const DeliveryTabs: React.FC<DeliveryTabsProps> = ({
  currentTab,
  setCurrentTab,
  availableCount,
  assignedCount,
  deliveredCount,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'available' && styles.activeTab]}
        onPress={() => setCurrentTab('available')}
      >
        <Ionicons 
          name="storefront-outline" 
          size={20} 
          color={currentTab === 'available' ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, currentTab === 'available' && styles.activeTabText]}>
          Available
        </Text>
        {availableCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{availableCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentTab === 'assigned' && styles.activeTab]}
        onPress={() => setCurrentTab('assigned')}
      >
        <Ionicons 
          name="bicycle-outline" 
          size={20} 
          color={currentTab === 'assigned' ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, currentTab === 'assigned' && styles.activeTabText]}>
          Assigned
        </Text>
        {assignedCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{assignedCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentTab === 'delivered' && styles.activeTab]}
        onPress={() => setCurrentTab('delivered')}
      >
        <Ionicons 
          name="checkmark-circle-outline" 
          size={20} 
          color={currentTab === 'delivered' ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, currentTab === 'delivered' && styles.activeTabText]}>
          Delivered
        </Text>
        {deliveredCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{deliveredCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DeliveryTabs;