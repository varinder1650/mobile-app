import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Category, Product, CartQuantities } from '../../types/home.types';
import ProductCard from './ProductCard';
import { styles } from '../../styles/home.styles';

interface CategorySectionProps {
  category: Category;
  index: number;
  products: Product[];
  cartQuantities: CartQuantities;
  addingToCart: {[key: string]: boolean};
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, newQuantity: number) => void;
  handleCategoryPress: (categoryId: string | null) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  index,
  products,
  cartQuantities,
  addingToCart,
  addToCart,
  updateCartQuantity,
  handleCategoryPress,
}) => {
  const categoryProducts = products.filter(product => {
    if (!product.category) {
      return false;
    }
    
    if (typeof product.category === 'object') {
      return product.category.id === category.id;
    }
    
    if (typeof product.category === 'string') {
      return product.category === category.id;
    }
    
    return false;
  });

  if (categoryProducts.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.categorySection}>
      <View style={styles.categorySectionHeader}>
        <Text style={styles.categorySectionTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => handleCategoryPress(category.id)}>
          <Text style={styles.viewAllText}>View All ({categoryProducts.length})</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categoryProducts}
        renderItem={({ item, index }) => (
          <ProductCard 
            item={item}
            index={index}
            cartQuantities={cartQuantities}
            addingToCart={addingToCart}
            addToCart={addToCart}
            updateCartQuantity={updateCartQuantity}
          />
        )}
        keyExtractor={(item, idx) => `cat-${category.id}-prod-${item.id}-${idx}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryProductList}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
      />
    </View>
  );
};

export default CategorySection;