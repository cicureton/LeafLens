import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
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
  const cameraRef = useRef(null);

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
        setPhotos(prevPhotos => [...prevPhotos, {
          id: Date.now().toString(),
          uri: photo.uri,
          timestamp: new Date().toLocaleTimeString()
        }]);
        Alert.alert("Success", "Photo added to collection!");
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  // remove a specific photo
  const removePhoto = (photoId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
  };

  // clear all photos
  const clearAllPhotos = () => {
    Alert.alert(
      "Clear All Photos",
      "Are you sure you want to delete all photos?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => setPhotos([])
        },
      ]
    );
  };

  // use photos (for analysis, saving, etc.)
  const usePhotos = () => {
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
          onPress: () => {
            // Here you would send photos to your plant analysis API
            console.log("Photos to analyze:", photos);
            Alert.alert("Analysis Started", "Processing your plant photos...");
          }
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
  if (photos.length > 0) {
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
            onPress={() => setPhotos([])}
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

        <View style={styles.placeholder} />
      </View>

      {/* Photo counter */}
      <View style={styles.photoCounter}>
        <Text style={styles.photoCounterText}>
          Photos: {photos.length}
        </Text>
      </View>
    </View>
  );
};

export default CameraScreen;