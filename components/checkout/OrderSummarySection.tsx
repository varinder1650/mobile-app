import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItemCard } from './index';

interface OrderSummarySectionProps {
  orderType: 'product' | 'porter' | 'printout';
  cartItems?: any[];
  porterData?: any;
  printoutData?: any;
  placingOrder: boolean;
  updatingQuantity: { [key: string]: boolean };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  orderType,
  cartItems = [],
  porterData,
  printoutData,
  placingOrder,
  updatingQuantity,
  onUpdateQuantity,
}) => {
  const renderPorterDetails = () => {
    if (!porterData) return null;

    return (
      <View style={styles.porterDetailsContainer}>
        <View style={styles.porterHeader}>
          <Ionicons name="bicycle" size={32} color="#007AFF" />
          <Text style={styles.porterTitle}>Porter Delivery Service</Text>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="location" size={20} color="#34C759" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Pickup</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.pickup_address.address}, {porterData.pickup_address.city}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="location" size={20} color="#FF3B30" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Delivery</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.delivery_address.address}, {porterData.delivery_address.city}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="cube-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Package</Text>
            <Text style={styles.porterDetailValue}>{porterData.description}</Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="resize-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Dimensions</Text>
            <Text style={styles.porterDetailValue}>
              {porterData.dimensions.length} × {porterData.dimensions.breadth} × {porterData.dimensions.height}
            </Text>
          </View>
        </View>

        <View style={styles.porterDetail}>
          <Ionicons name="barbell-outline" size={20} color="#007AFF" />
          <View style={styles.porterDetailText}>
            <Text style={styles.porterDetailLabel}>Weight</Text>
            <Text style={styles.porterDetailValue}>{porterData.weight_category}</Text>
          </View>
        </View>

        {porterData.urgent && (
          <View style={styles.urgentBadge}>
            <Ionicons name="flash" size={16} color="#FF9500" />
            <Text style={styles.urgentText}>Urgent Delivery (+₹20)</Text>
          </View>
        )}
      </View>
    );
  };

  const renderPrintoutDetails = () => {
    if (!printoutData) return null;

    return (
      <View style={styles.printoutContainer}>
        <View style={styles.printoutHeader}>
          <Ionicons name="print" size={32} color="#007AFF" />
          <Text style={styles.printoutTitle}>
            {printoutData.serviceType === 'photo' ? 'Photo Prints' : 'Document Printouts'}
          </Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Size:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.size.toUpperCase()}</Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Color:</Text>
          <Text style={styles.printoutDetailValue}>
            {printoutData.colorOption === 'bw' ? 'Black & White' : 'Color'}
          </Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Copies:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.copies}</Text>
        </View>

        <View style={styles.printoutDetail}>
          <Text style={styles.printoutDetailLabel}>Files:</Text>
          <Text style={styles.printoutDetailValue}>{printoutData.files.length}</Text>
        </View>

        {printoutData.description && (
          <View style={styles.printoutDetail}>
            <Text style={styles.printoutDetailLabel}>Instructions:</Text>
            <Text style={styles.printoutDetailValue}>{printoutData.description}</Text>
          </View>
        )}

        {/* File previews */}
        <View style={styles.filesContainer}>
          {printoutData.files.map((file: any, index: number) => (
            <View key={index} style={styles.fileItem}>
              {file.type.startsWith('image/') && file.url ? (
                <Image source={{ uri: file.url }} style={styles.filePreview} />
              ) : (
                <View style={styles.fileIcon}>
                  <Ionicons name="document-text" size={24} color="#007AFF" />
                </View>
              )}
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {orderType === 'porter' ? 'Service Details' : 
           orderType === 'printout' ? 'Printout Details' : 
           'Order Summary'}
        </Text>
      </View>

      {orderType === 'porter' && renderPorterDetails()}
      {orderType === 'printout' && renderPrintoutDetails()}
      {orderType === 'product' && cartItems.map(item => (
        <CartItemCard
          key={item._id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          updating={updatingQuantity[item._id]}
          disabled={placingOrder}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', marginTop: 8, paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  
  // Porter styles
  porterDetailsContainer: { gap: 12 },
  porterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  porterTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  porterDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  porterDetailText: { flex: 1 },
  porterDetailLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  porterDetailValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  urgentText: { fontSize: 14, fontWeight: '600', color: '#FF9500' },
  
  // Printout styles
  printoutContainer: { gap: 12 },
  printoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  printoutTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  printoutDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  printoutDetailLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  printoutDetailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  filesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  fileItem: {
    width: 80,
    alignItems: 'center',
    gap: 4,
  },
  filePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  fileIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});