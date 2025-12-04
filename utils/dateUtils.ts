export const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  export const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#007AFF';
      case 'assigned': return '#5856D6';
      case 'out_for_delivery': return '#FF2D92';
      case 'delivered': return '#34C759';
      default: return '#8E8E93';
    }
  };