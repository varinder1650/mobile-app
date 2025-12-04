// components/home/PorterRequestSectionWrapper.tsx - RESTORE ORIGINAL WRAPPER
import React from 'react';
import { PorterRequestSection, PorterRequestRef } from '../PorterRequestSection';

interface PorterRequestSectionWrapperProps {
  porterFormRef: React.RefObject<PorterRequestRef>;
  handleRequestSubmitted: () => void;
}

const PorterRequestSectionWrapper: React.FC<PorterRequestSectionWrapperProps> = ({
  porterFormRef,
  handleRequestSubmitted,
}) => {
  return (
    <PorterRequestSection 
      ref={porterFormRef}
      onRequestSubmitted={handleRequestSubmitted}
    />
  );
};

export default PorterRequestSectionWrapper;