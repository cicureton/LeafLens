import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PhotoStorage } from "../../app/api";
import { styles } from "../styles/camerastyle";

const CameraScreen = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);

  // Load user data and saved photos
  useEffect(() => {
    loadUserData();
    loadSavedPhotos();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Load photos from storage using the centralized API
  const loadSavedPhotos = async () => {
    try {
      const savedPhotos = await PhotoStorage.loadPhotos();
      setPhotos(savedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  // Save photos to storage using the centralized API
  const savePhotosToStorage = async (photosArray: any[]) => {
    try {
      await PhotoStorage.savePhotos(photosArray);
    } catch (error) {
      console.error("Error saving photos:", error);
    }
  };

  // Save photo to file system
  const savePhotoToFileSystem = async (tempUri: string) => {
    try {
      const fileName = `plant_photo_${Date.now()}.jpg`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: tempUri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error("Error saving photo:", error);
      return tempUri;
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

        const newPhotos = [
          ...photos,
          {
            id: Date.now().toString(),
            uri: savedUri,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toISOString(),
            uploaded: false,
          },
        ];

        setPhotos(newPhotos);
        await savePhotosToStorage(newPhotos);

        Alert.alert(
          "Success",
          "Photo added! You can take more photos or go to preview."
        );
      } catch (error) {
        console.error("Error taking picture:", error);
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
    setShowResults(false); // Reset results when going to preview
  };

  // Return to camera mode
  const returnToCamera = () => {
    setIsPreviewMode(false);
    setShowResults(false);
  };

  // remove a specific photo
  const removePhoto = async (photoId: string) => {
    try {
      // Find photo to remove from file system
      const photoToRemove = photos.find((photo) => photo.id === photoId);
      if (photoToRemove) {
        await FileSystem.deleteAsync(photoToRemove.uri, { idempotent: true });
      }

      const newPhotos = photos.filter((photo) => photo.id !== photoId);
      setPhotos(newPhotos);
      await savePhotosToStorage(newPhotos);

      // If no photos left, return to camera
      if (newPhotos.length === 0) {
        setIsPreviewMode(false);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error removing photo:", error);
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
                  console.log("File already deleted or not found");
                }
              }
              setPhotos([]);
              await PhotoStorage.clearPhotos();
              setIsPreviewMode(false);
              setShowResults(false);
            } catch (error) {
              console.error("Error clearing photos:", error);
            }
          },
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

    setLoading(true);
    setUploading(true);
    setLoadingMessage("Analyzing plant photos...");

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

      console.log("🟡 Sending photos to backend for analysis...");

      // POST to FastAPI backend
      const response = await axios.post(
        "https://leaflens-16s1.onrender.com/predict_species_and_disease_batch",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      console.log("🟢 Backend response:", response.data);

      // Transform backend response to match frontend format
      const backendData = response.data;

      // Create analysis results array - one result per photo
      const analysisResults = photos.map((photo, index) => {
        // Get species prediction (first one from species_predictions)
        const speciesPrediction = backendData.species_predictions?.[0] || {
          species: "Unknown",
          confidence: 0,
        };

        // Get disease prediction (first one from disease_predictions)
        const diseasePrediction = backendData.disease_predictions?.[0] || {
          disease: "Healthy",
          confidence: 0,
        };

        return {
          species: speciesPrediction.species,
          disease: diseasePrediction.disease,
          confidence: speciesPrediction.confidence / 100, // Convert from percentage to decimal
          disease_confidence: diseasePrediction.confidence / 100, // Convert from percentage to decimal
        };
      });

      console.log("📊 Transformed analysis results:", analysisResults);

      // Store results and show on screen
      setAnalysisResults(analysisResults);
      setShowResults(true);
    } catch (error: any) {
      console.error("🔴 Error analyzing photos:", error);
      Alert.alert(
        "Analysis Failed",
        error.response?.data?.detail ||
          "Failed to analyze photos. Please try again."
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Render individual analysis result
  const renderAnalysisResult = (result, index) => (
    <View key={index} style={styles.resultCard}>
      {/* Photo Preview */}
      <Image source={{ uri: photos[index]?.uri }} style={styles.resultImage} />

      {/* Analysis Results */}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>Photo {index + 1} Analysis</Text>

        {/* Species */}
        <View style={styles.resultRow}>
          <Ionicons name="leaf" size={16} color="#27ae60" />
          <Text style={styles.resultLabel}>Species:</Text>
          <Text style={styles.resultValue}>{result.species || "Unknown"}</Text>
        </View>

        {/* Species Confidence */}
        {result.confidence && (
          <View style={styles.resultRow}>
            <Ionicons name="trending-up" size={16} color="#3498db" />
            <Text style={styles.resultLabel}>Species Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {(result.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        )}

        {/* Species Confidence Bar */}
        {result.confidence && (
          <View style={styles.confidenceBarContainer}>
            <View
              style={[
                styles.confidenceBar,
                { width: `${result.confidence * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Disease */}
        <View style={styles.resultRow}>
          <Ionicons name="medical" size={16} color="#e74c3c" />
          <Text style={styles.resultLabel}>Disease:</Text>
          <Text style={styles.resultValue}>{result.disease || "Healthy"}</Text>
        </View>

        {/* Disease Confidence */}
        {result.disease_confidence && (
          <View style={styles.resultRow}>
            <Ionicons name="pulse" size={16} color="#e67e22" />
            <Text style={styles.resultLabel}>Disease Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {(result.disease_confidence * 100).toFixed(1)}%
            </Text>
          </View>
        )}

        {/* Disease Confidence Bar */}
        {result.disease_confidence && (
          <View style={styles.confidenceBarContainer}>
            <View
              style={[
                styles.diseaseConfidenceBar,
                { width: `${result.disease_confidence * 100}%` },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );

  // render individual photo in the preview list
  const renderPhotoItem = ({ item }: any) => (
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

  // Photo preview screen with results
  if (isPreviewMode) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>
            {photos.length} Photo{photos.length > 1 ? "s" : ""} Taken
          </Text>
          <TouchableOpacity onPress={clearAllPhotos}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {showResults ? (
          // Show Analysis Results
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Analysis Results</Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.resultsScrollView}
              showsVerticalScrollIndicator={false}
            >
              {analysisResults.map(renderAnalysisResult)}
            </ScrollView>
          </View>
        ) : (
          // Show Photo Grid
          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.photosList}
            numColumns={2}
          />
        )}

        <View style={styles.previewButtons}>
          {showResults ? (
            // Results Mode Buttons
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.retakeButton]}
                onPress={() => setShowResults(false)}
              >
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.actionButtonText}>View Photos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.usePhotosButton]}
                onPress={returnToCamera}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.actionButtonText}>Take More</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Preview Mode Buttons
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.retakeButton]}
                onPress={returnToCamera}
                disabled={uploading}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.actionButtonText}>Take More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.usePhotosButton,
                  uploading && styles.disabledButton,
                ]}
                onPress={usePhotos}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="analytics" size={20} color="white" />
                )}
                <Text style={styles.actionButtonText}>
                  {uploading ? "Analyzing..." : `Analyze (${photos.length})`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#3f704d" />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
          </View>
        )}
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
