import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { MapView, MarkerView, Camera } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import Geolocation from '@react-native-community/geolocation';

interface AddressMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  loading: boolean;
}

export default function AddressMap({ 
  latitude, 
  longitude, 
  onLocationChange,
  loading 
}: AddressMapProps) {
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    console.log('🔍 Requesting location...');
    setGettingLocation(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Location received:', position.coords);
        const { latitude: lat, longitude: lng } = position.coords;
        
        console.log(`Coordinates: ${lat}, ${lng}`);
        
        // Check if location is in India
        const isInIndia = lat >= 8.4 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25;
        
        // if (isInIndia) {
          console.log('✅ Location is in India');
          onLocationChange(lat, lng);
          
          // Animate camera to new location
          setTimeout(() => {
            if (cameraRef.current) {
              console.log('📷 Moving camera to:', [lng, lat]);
              cameraRef.current.setCamera({
                centerCoordinate: [lng, lat],
                zoomLevel: 16,
                animationDuration: 1000,
              });
            }
          }, 500);
        // } else {
        //   console.log('❌ Location is outside India');
        //   Alert.alert(
        //     'Location Outside India',
        //     `Detected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\nSmartBag currently operates only in India. Please enter your Indian address manually.`
        //   );
        // }
        setGettingLocation(false);
      },
      (error) => {
        console.error('❌ Location error:', error);
        setGettingLocation(false);
        
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case 1:
            errorMessage += 'Location permission denied. Please enable location permissions in your device settings.';
            break;
          case 2:
            errorMessage += 'Location unavailable. Please check your GPS is enabled.';
            break;
          case 3:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please try again or enter address manually.';
        }
        
        Alert.alert('Location Error', errorMessage);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000,
        maximumAge: 0,
        distanceFilter: 0
      }
    );
  };

  useEffect(() => {
    // Animate camera when coordinates change
    if (mapLoaded && latitude && longitude && cameraRef.current) {
      console.log('📷 Updating camera position to:', [longitude, latitude]);
      setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 16,
          animationDuration: 800,
        });
      }, 300);
    }
  }, [latitude, longitude, mapLoaded]);

  const defaultCenter: [number, number] = [77.5946, 12.9716]; // Bangalore
  const currentCenter: [number, number] = 
    latitude && longitude ? [longitude, latitude] : defaultCenter;

  const handleMapLoaded = () => {
    console.log('✅ Map loaded successfully');
    setMapLoaded(true);
  };

  const handleMapError = (error: any) => {
    console.error('❌ Map loading error:', error);
    Alert.alert('Map Error', 'Failed to load map. Please check your internet connection.');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={true}
        compassPosition={{ top: 60, right: 10 }}
        onDidFinishLoadingMap={handleMapLoaded}
        onDidFailLoadingMap={handleMapError}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={latitude && longitude ? 16 : 12}
          centerCoordinate={currentCenter}
          animationMode="flyTo"
          animationDuration={1000}
        />
        
        {latitude && longitude && (
          <MarkerView coordinate={[longitude, latitude]}>
            <View style={styles.customMarker}>
              <View style={styles.markerDot} />
              <View style={styles.markerPulse} />
            </View>
          </MarkerView>
        )}
      </MapView>

      {/* Loading indicator */}
      {!mapLoaded && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.mapLoadingText}>Loading map tiles...</Text>
          <Text style={styles.mapLoadingSubtext}>This may take a moment</Text>
        </View>
      )}

      {/* Location controls overlay */}
      <View style={styles.controlsContainer}>
        {/* Current location button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons 
              name={latitude && longitude ? "locate" : "locate-outline"} 
              size={24} 
              color="#007AFF" 
            />
          )}
        </TouchableOpacity>

        {/* Location info card */}
        {latitude && longitude && (
          <View style={styles.locationInfoCard}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color="#4CAF50" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>Location Detected</Text>
              <Text style={styles.locationCoords}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={getCurrentLocation}
              style={styles.refreshButton}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="refresh" size={18} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* No location detected card */}
        {!latitude && !longitude && !gettingLocation && mapLoaded && (
          <View style={styles.noLocationCard}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.noLocationText}>Tap the location button to detect your address</Text>
          </View>
        )}

        {/* Getting location indicator */}
        {gettingLocation && (
          <View style={styles.gettingLocationCard}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.gettingLocationText}>Detecting your location...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  mapLoadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshButton: {
    padding: 8,
  },
  noLocationCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  noLocationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  gettingLocationCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  gettingLocationText: {
    fontSize: 14,
    color: '#0277BD',
    marginLeft: 12,
    fontWeight: '500',
  },
  customMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
});