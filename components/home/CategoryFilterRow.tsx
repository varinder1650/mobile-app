import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types/home.types';
import { IMAGE_BASE_URL } from '../../config/apiConfig';
import { styles } from '../../styles/home.styles';
import { RequestProductRef } from '../RequestProductSection';

interface CategoryFilterRowProps {
  categories: Category[];
  selectedCategory: string | null;
  handleCategoryPress: (categoryId: string | null) => void;
  requestFormRef: React.RefObject<RequestProductRef | null>;
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
        
        <TouchableOpacity 
          key="request-product"
          onPress={() => requestFormRef.current?.openForm()}
          style={{ alignItems: 'center', marginHorizontal: 8 }}
        >
          <View style={styles.requestProductIconContainer}>
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
          </View>
          <Text style={styles.requestProductLabel}>Request Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CategoryFilterRow;