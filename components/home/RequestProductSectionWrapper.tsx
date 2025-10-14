import React from 'react';
import { View } from 'react-native';
import { RequestProductSection, RequestProductRef } from '../RequestProductSection';
import { styles } from '../../styles/home.styles';

interface RequestProductSectionWrapperProps {
  requestFormRef: React.RefObject<RequestProductRef | null>;
  handleRequestSubmitted: () => void;
}

const RequestProductSectionWrapper: React.FC<RequestProductSectionWrapperProps> = ({
  requestFormRef,
  handleRequestSubmitted,
}) => {
  return (
    <View>
      <View style={styles.borderlessRequestSection}>
        <RequestProductSection 
          ref={requestFormRef}
          onRequestSubmitted={handleRequestSubmitted} 
        />
      </View>
      <View style={{ height: 180 }} />
    </View>
  );
};

export default RequestProductSectionWrapper;