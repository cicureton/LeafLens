import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { styles } from "../styles/camerastyle";

const CameraScreen = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState([]); // Array to store multiple photos
  const [isPreviewMode, setIsPreviewMode] = useState(false); // New state to control mode
  const cameraRef = useRef(null);

  // Load saved photos on component mount
  useEffect(() => {
    loadSavedPhotos();
  }, []);

  // Load photos from AsyncStorage
  const loadSavedPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('@plant_photos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  // Save photos to AsyncStorage
  const savePhotosToStorage = async (photosArray) => {
    try {
      await AsyncStorage.setItem('@plant_photos', JSON.stringify(photosArray));
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  // Save photo to file system using legacy API
  const savePhotoToFileSystem = async (tempUri) => {
    try {
      const fileName = `plant_photo_${Date.now()}.jpg`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Using legacy copyAsync - this should work now
      await FileSystem.copyAsync({
        from: tempUri,
        to: permanentUri
      });
      
      return permanentUri;
    } catch (error) {
      console.error('Error saving photo:', error);
      return tempUri; // Fallback to original URI
    }
  };

  // ask for permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // where the camera is facing
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // lets user take picture, adding to photos array
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Save to permanent storage
        const savedUri = await savePhotoToFileSystem(photo.uri);
        
        const newPhotos = [...photos, {
          id: Date.now().toString(),
          uri: savedUri, // Use permanent URI
          timestamp: new Date().toLocaleTimeString(),
          date: new Date().toISOString()
        }];
        
        setPhotos(newPhotos);
        await savePhotosToStorage(newPhotos);
        
        Alert.alert("Success", "Photo added! You can take more photos or go to preview.");
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  // Go to preview mode
  const goToPreview = () => {
    if (photos.length === 0) {
      Alert.alert("No Photos", "Take some photos first!");
      return;
    }
    setIsPreviewMode(true);
  };

  // Return to camera mode
  const returnToCamera = () => {
    setIsPreviewMode(false);
  };

  // remove a specific photo
  const removePhoto = async (photoId: string) => {
    try {
      // Find photo to remove from file system
      const photoToRemove = photos.find(photo => photo.id === photoId);
      if (photoToRemove) {
        // Delete from file system using legacy API
        await FileSystem.deleteAsync(photoToRemove.uri, { idempotent: true });
      }
      
      const newPhotos = photos.filter(photo => photo.id !== photoId);
      setPhotos(newPhotos);
      await savePhotosToStorage(newPhotos);
      
      // If no photos left, return to camera
      if (newPhotos.length === 0) {
        setIsPreviewMode(false);
      }
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  // clear all photos
  const clearAllPhotos = async () => {
    Alert.alert(
      "Clear All Photos",
      "Are you sure you want to delete all photos?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all photos from file system
              for (const photo of photos) {
                try {
                  await FileSystem.deleteAsync(photo.uri, { idempotent: true });
                } catch (fileError) {
                  console.log('File already deleted or not found');
                }
              }
              setPhotos([]);
              await AsyncStorage.removeItem('@plant_photos');
              setIsPreviewMode(false); // Return to camera
            } catch (error) {
              console.error('Error clearing photos:', error);
            }
          }
        },
      ]
    );
  };

  // use photos (for analysis, saving, etc.)
  const usePhotos = async () => {
    if (photos.length === 0) {
      Alert.alert("No Photos", "Take some photos first!");
      return;
    }
  
    Alert.alert(
      "Use Photos",
      `Ready to analyze ${photos.length} plant photo(s)!`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Analyze Plants", 
          onPress: async () => {
            try {
  
              // Create FormData to send multiple images
              const formData = new FormData();
              photos.forEach((photo, index) => {
                formData.append("files", {
                  uri: photo.uri,
                  name: `plant_photo_${index}.jpg`,
                  type: "image/jpeg",
                } as any);
              });
  
              console.log("Sending photos to backend:", formData);
  
              // POST to FastAPI backend
              const response = await axios.post(
                "https://leaflens-16s1.onrender.com/predict_species_and_disease_batch",
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                  timeout: 30000, // optional: 30s timeout
                }
              );
  
              console.log("Backend response:", response.data);
  
              // Show predictions to user
              Alert.alert(
                "Predictions",
                JSON.stringify(response.data.predictions, null, 2)
              );
            } catch (error: any) {
              console.error("Error uploading or analyzing photos:", error);
              Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to analyze photos"
              );
            } finally {
              // Reset loading state
            }
          },
        },
      ]
    );
  };
  

  // render individual photo in the preview list
  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTime}>{item.timestamp}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => removePhoto(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Photo preview screen
  if (isPreviewMode) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>
            {photos.length} Photo{photos.length > 1 ? 's' : ''} Taken
          </Text>
          <TouchableOpacity onPress={clearAllPhotos}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.photosList}
          numColumns={2}
        />

        <View style={styles.previewButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.retakeButton]}
            onPress={returnToCamera}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.actionButtonText}>Take More</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.usePhotosButton]}
            onPress={usePhotos}
          >
            <Ionicons name="analytics" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              Analyze ({photos.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // display camera and buttons
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureCircle} />
        </TouchableOpacity>

        {/* Preview button instead of placeholder */}
        <TouchableOpacity style={styles.button} onPress={goToPreview}>
          <Ionicons name="images" size={30} color="white" />
          {photos.length > 0 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{photos.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Photo counter */}
      <View style={styles.photoCounter}>
        <Text style={styles.photoCounterText}>
          Photos Taken: {photos.length}
        </Text>
        {photos.length > 0 && (
          <TouchableOpacity onPress={goToPreview}>
            <Text style={styles.viewPhotosText}>View Photos →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CameraScreen;