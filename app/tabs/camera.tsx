import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
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
import api, { PhotoStorage } from "../../app/api";
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

  const router = useRouter();

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

  // In your CameraScreen.tsx, update the usePhotos function
  const usePhotos = async () => {
    if (photos.length === 0) {
      Alert.alert("No Photos", "Take some photos first!");
      return;
    }

    setLoading(true);
    setUploading(true);
    setLoadingMessage("Analyzing plant photos...");

    try {
      console.log(`🟡 Analyzing ${photos.length} photos individually...`);

      // Get current user ID
      const userDataJson = await AsyncStorage.getItem("userData");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      const user_id = userData?.user_id || userData?.id || userData?.uid;

      console.log(`🟡 Using user_id: ${user_id}`);

      // Process each photo individually
      const analysisResults = [];
      const scanData = []; // Store scan data for history

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setLoadingMessage(`Analyzing photo ${i + 1} of ${photos.length}...`);

        try {
          console.log(`📤 Sending photo ${i + 1} to backend...`);
          const response = await api.analysis.analyzePhoto(photo.uri, user_id);

          console.log(`✅ Photo ${i + 1} response:`, response);

          const backendData = response;
          const speciesPrediction = backendData.species_predictions?.[0] || {
            species: "Unknown",
            confidence: 0,
          };
          const diseasePrediction = backendData.disease_predictions?.[0] || {
            disease: "Healthy",
            confidence: 0,
          };

          // Store the analysis result for display
          analysisResults.push({
            species: speciesPrediction.species,
            disease: diseasePrediction.disease,
            confidence: speciesPrediction.confidence / 100,
            disease_confidence: diseasePrediction.confidence / 100,
            photoIndex: i,
            scan_id: backendData.scan_id,
          });

          // ALSO store the analysis data for history
          scanData.push({
            scan_id: backendData.scan_id,
            species: speciesPrediction.species,
            disease: diseasePrediction.disease,
            species_confidence: speciesPrediction.confidence,
            disease_confidence: diseasePrediction.confidence,
            timestamp: new Date().toISOString(),
          });
        } catch (photoError: any) {
          // ... error handling ...
        }
      }

      // Save scan data to AsyncStorage for history
      await saveScanDataToStorage(scanData);

      console.log("📊 All analysis results:", analysisResults);
      setAnalysisResults(analysisResults);
      setShowResults(true);
    } catch (error: any) {
      // ... error handling ...
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Add this function to save scan data
  const saveScanDataToStorage = async (scanData: any[]) => {
    try {
      const existingScans = await AsyncStorage.getItem("@scan_analysis_data");
      const allScans = existingScans ? JSON.parse(existingScans) : [];
      const updatedScans = [...allScans, ...scanData];
      await AsyncStorage.setItem(
        "@scan_analysis_data",
        JSON.stringify(updatedScans)
      );
      console.log("💾 Saved scan analysis data:", scanData.length);
    } catch (error) {
      console.error("Error saving scan data:", error);
    }
  };

  // In your CameraScreen.tsx - updated renderAnalysisResult function
  const renderAnalysisResult = (result, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.resultCard, result.error && styles.errorCard]}
      onPress={() => {
        if (result.scan_id && !result.error) {
          console.log(`🟡 Navigating to scan details: ${result.scan_id}`);
          router.push(`/scan_detail?id=${result.scan_id}`);
        }
      }}
      disabled={!result.scan_id || result.error}
    >
      {/* Photo Preview */}
      <Image source={{ uri: photos[index]?.uri }} style={styles.resultImage} />

      {/* Analysis Results */}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>
          Photo {index + 1} Analysis
          {result.error && " ⚠️"}
        </Text>

        {result.error ? (
          // Error state
          <View style={styles.errorSection}>
            <Ionicons name="warning" size={20} color="#e74c3c" />
            <Text style={styles.errorText}>Failed to analyze this photo</Text>
            {result.errorMessage && (
              <Text style={styles.errorDetail}>{result.errorMessage}</Text>
            )}
          </View>
        ) : (
          // Success state
          <>
            {/* Species */}
            <View style={styles.resultRow}>
              <Ionicons name="leaf" size={16} color="#27ae60" />
              <Text style={styles.resultLabel}>Species:</Text>
              <Text style={styles.resultValue}>
                {result.species || "Unknown"}
              </Text>
            </View>

            {/* Species Confidence */}
            {result.confidence > 0 && (
              <>
                <View style={styles.resultRow}>
                  <Ionicons name="trending-up" size={16} color="#3498db" />
                  <Text style={styles.resultLabel}>Species Confidence:</Text>
                  <Text style={styles.confidenceValue}>
                    {(result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.confidenceBarContainer}>
                  <View
                    style={[
                      styles.confidenceBar,
                      { width: `${result.confidence * 100}%` },
                    ]}
                  />
                </View>
              </>
            )}

            {/* Disease */}
            <View style={styles.resultRow}>
              <Ionicons name="medical" size={16} color="#e74c3c" />
              <Text style={styles.resultLabel}>Disease:</Text>
              <Text style={styles.resultValue}>
                {result.disease || "Healthy"}
              </Text>
            </View>

            {/* Disease Confidence */}
            {result.disease_confidence > 0 && (
              <>
                <View style={styles.resultRow}>
                  <Ionicons name="pulse" size={16} color="#e67e22" />
                  <Text style={styles.resultLabel}>Disease Confidence:</Text>
                  <Text style={styles.confidenceValue}>
                    {(result.disease_confidence * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.confidenceBarContainer}>
                  <View
                    style={[
                      styles.diseaseConfidenceBar,
                      { width: `${result.disease_confidence * 100}%` },
                    ]}
                  />
                </View>
              </>
            )}

            {/* Scan ID (if available) */}
            {result.scan_id && (
              <View style={styles.scanIdSection}>
                <Ionicons name="document-text" size={14} color="#666" />
                <Text style={styles.scanIdText}>
                  Scan ID: #{result.scan_id}
                </Text>
              </View>
            )}

            {/* View Details Prompt */}
            {result.scan_id && (
              <View style={styles.viewDetails}>
                <Ionicons name="chevron-forward" size={14} color="#3f704d" />
                <Text style={styles.viewDetailsText}>
                  Tap to view scan details
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
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

      {/* Floating Scan History Button */}
      <TouchableOpacity
        style={styles.floatingHistoryButton}
        onPress={() => router.push("/scan_history")}
      >
        <Ionicons name="time-outline" size={24} color="white" />
      </TouchableOpacity>

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
