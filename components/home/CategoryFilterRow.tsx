import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Category } from '../../types/home.types';
import { IMAGE_BASE_URL } from '../../config/apiConfig';
import { styles } from '../../styles/home.styles';
import { RequestSectionRef } from '../RequestSection';

interface CategoryFilterRowProps {
  categories: Category[];
  selectedCategory: string | null;
  handleCategoryPress: (categoryId: string | null) => void;
  requestFormRef: React.RefObject<RequestSectionRef | null>;
}

const CategoryFilterRow: React.FC<CategoryFilterRowProps> = ({
  categories,
  selectedCategory,
  handleCategoryPress,
  requestFormRef,
}) => {
  const getCategoryIconUrl = (category: Category): string => {
    const iconSource = category.icon || category.image;
    
    if (!iconSource) {
      return 'https://via.placeholder.com/48?text=' + encodeURIComponent(category.name.charAt(0));
    }
    
    if (iconSource.startsWith('http')) {
      return iconSource;
    }
    
    return `${IMAGE_BASE_URL}${iconSource}`;
  };

  return (
    <View style={styles.categoryFilterRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
        {/* All Categories */}
        <TouchableOpacity 
          key="category-all"
          onPress={() => handleCategoryPress(null)} 
          style={{ alignItems: 'center', marginHorizontal: 8 }}
        >
          <View style={[styles.categoryIconContainer, selectedCategory === null && styles.categoryUberSelected]}>
            <Ionicons name="grid" size={24} color={selectedCategory === null ? '#fff' : '#007AFF'} />
          </View>
          <Text style={[styles.categoryUberLabel, selectedCategory === null && styles.categoryUberLabelSelected]}>All</Text>
        </TouchableOpacity>
        
        {/* Category Items */}
        {categories.map((cat, index) => {
          const iconUrl = getCategoryIconUrl(cat);
          const categoryKey = cat.id || `category-${cat.name}-${index}`;
          const isSelected = selectedCategory === cat.id;
          
          return (
            <TouchableOpacity 
              key={categoryKey}
              onPress={() => handleCategoryPress(cat.id)} 
              style={{ alignItems: 'center', marginHorizontal: 8 }}
            >
              <View style={[styles.categoryIconContainer, isSelected && styles.categoryUberSelected]}>
                <Image
                  source={{ uri: iconUrl }}
                  style={styles.categoryIcon}
                  resizeMode="contain"
                  onError={() => {
                    console.log('Category icon failed to load for:', cat.name);
                  }}
                />
              </View>
              <Text style={[styles.categoryUberLabel, isSelected && styles.categoryUberLabelSelected]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
        
        {/* ✅ NEW: Printouts Button */}
        <TouchableOpacity 
          key="printouts-service"
          onPress={() => router.push('/create-printout-order')}
          style={{ alignItems: 'center', marginHorizontal: 8 }}
        >
          <View style={styles.printoutsIconContainer}>
            <Ionicons name="print" size={24} color="#8E44AD" />
          </View>
          <Text style={styles.printoutsLabel}>Print{'\n'}Service</Text>
        </TouchableOpacity>
        
        {/* Request Product Button */}
        <TouchableOpacity 
          key="request-product"
          onPress={() => requestFormRef.current?.openForm('product')}
          style={{ alignItems: 'center', marginHorizontal: 8 }}
        >
          <View style={styles.requestProductIconContainer}>
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
          </View>
          <Text style={styles.requestProductLabel}>Request{'\n'}Product</Text>
        </TouchableOpacity>

        {/* Porter Request Button */}
        <TouchableOpacity 
          key="request-porter"
          onPress={() => router.push('/create-porter-request')}
          style={{ alignItems: 'center', marginHorizontal: 8 }}
        >
          <View style={styles.porterRequestIconContainer}>
            <Ionicons name="bicycle-outline" size={24} color="#34C759" />
          </View>
          <Text style={styles.porterRequestLabel}>Porter{'\n'}Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CategoryFilterRow;