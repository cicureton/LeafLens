import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { diseasesAPI, PhotoStorage, plantsAPI } from "../../app/api";
import { styles } from "../styles/plantstyle";

// Key for storing plant photos in AsyncStorage
const PLANT_PHOTOS_STORAGE_KEY = "@plant_user_photos";

const PlantsScreen = () => {
  const [plants, setPlants] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [showAllDiseases, setShowAllDiseases] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [showDiseaseDetails, setShowDiseaseDetails] = useState(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraPhotos, setCameraPhotos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [plantPhotos, setPlantPhotos] = useState<Record<string, any[]>>({});

  // state for new plant form
  const [newPlant, setNewPlant] = useState({
    name: "",
    common_name: "",
    species: "",
  });

  // Load user data, plants, diseases, camera photos, and plant photos
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("🚀 Loading initial data...");
        await loadUserData();
        await loadPlantsFromBackend();
        await loadDiseasesFromBackend();
        await loadCameraPhotos();
        await loadPlantPhotos();
        console.log("✅ All initial data loaded");
      } catch (error) {
        console.error("❌ Error loading initial data:", error);
      }
    };

    loadInitialData();
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

  // Load plant photos from storage
  const loadPlantPhotos = async () => {
    try {
      const storedPlantPhotos = await AsyncStorage.getItem(
        PLANT_PHOTOS_STORAGE_KEY
      );
      if (storedPlantPhotos) {
        setPlantPhotos(JSON.parse(storedPlantPhotos));
        console.log(
          "📸 Loaded plant photos:",
          Object.keys(JSON.parse(storedPlantPhotos)).length
        );
      } else {
        setPlantPhotos({});
      }
    } catch (error) {
      console.error("Error loading plant photos:", error);
      setPlantPhotos({});
    }
  };

  // Save plant photos to storage
  const savePlantPhotos = async (photos: Record<string, any[]>) => {
    try {
      await AsyncStorage.setItem(
        PLANT_PHOTOS_STORAGE_KEY,
        JSON.stringify(photos)
      );
      setPlantPhotos(photos);
      console.log("💾 Saved plant photos:", Object.keys(photos).length);
    } catch (error) {
      console.error("Error saving plant photos:", error);
    }
  };

  // Load plants from backend
  const loadPlantsFromBackend = async () => {
    try {
      console.log("🌿 Loading plants from backend...");
      const response = await plantsAPI.getPlants();
      
      // Handle the response format properly
      const backendPlants = response.data || response || [];
      
      console.log("📥 Raw plants response:", backendPlants);

      // Transform backend data to app format
      const transformedPlants = backendPlants.map((plant: any) => ({
        id: plant.plant_id?.toString() || plant.id?.toString() || Math.random().toString(),
        name: plant.name || "Unknown Plant",
        common_name: plant.common_name || plant.name,
        species: plant.species || "",
        image: require("../../assets/images/imagenotfound.jpg"),
        backendId: plant.plant_id || plant.id,
      }));

      console.log("✅ Transformed plants:", transformedPlants.length);
      setPlants(transformedPlants);
    } catch (error) {
      console.error("❌ Error loading plants from backend:", error);
      // Set empty array instead of crashing
      setPlants([]);
    }
  };

  // Load diseases from backend
  const loadDiseasesFromBackend = async () => {
    try {
      console.log("🦠 Loading diseases from backend...");
      const response = await diseasesAPI.getDiseases();
      
      // Handle the response format properly
      const backendDiseases = response.data || response || [];
      
      console.log("📥 Raw diseases response:", backendDiseases);

      const transformedDiseases = backendDiseases.map((disease: any) => ({
        id: disease.disease_id?.toString() || disease.id?.toString() || Math.random().toString(),
        name: disease.name || "Unknown Disease",
        symptoms: disease.symptoms || "No symptoms information available",
        treatments: disease.treatments || "No treatment information available",
        prevention: disease.prevention || "No prevention information available",
        backendId: disease.disease_id || disease.id,
      }));

      console.log("✅ Transformed diseases:", transformedDiseases.length);
      setDiseases(transformedDiseases);
    } catch (error) {
      console.error("❌ Error loading diseases from backend:", error);
      // Set empty array instead of crashing
      setDiseases([]);
    }
  };

  // Load camera photos
  const loadCameraPhotos = async () => {
    try {
      const savedPhotos = await PhotoStorage.loadPhotos();
      setCameraPhotos(savedPhotos);
      console.log("📱 Loaded camera photos:", savedPhotos.length);
    } catch (error) {
      console.error("Error loading camera photos:", error);
      setCameraPhotos([]);
    }
  };

  // Refresh function - preserve plant photos
  const onRefresh = async () => {
    setRefreshing(true);
    console.log("🔄 Refreshing plants and diseases data...");

    try {
      // Save current plant photos before refresh
      const currentPhotos = { ...plantPhotos };

      // Load all data in parallel with error handling
      await Promise.allSettled([
        loadPlantsFromBackend(),
        loadDiseasesFromBackend(),
        loadCameraPhotos(),
      ]);

      // Restore plant photos after refresh
      setPlantPhotos(currentPhotos);
      await savePlantPhotos(currentPhotos);

      console.log("✅ Refresh complete");
    } catch (error) {
      console.error("❌ Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get photos for a specific plant
  const getPlantPhotos = (plantId: string) => {
    return plantPhotos[plantId] || [];
  };

  // Get selected photo for a plant
  const getPlantSelectedPhoto = (plantId: string) => {
    const photos = getPlantPhotos(plantId);
    return (
      photos.find((photo) => photo.isSelected) ||
      (photos.length > 0 ? photos[0] : null)
    );
  };

  // Get the display image for a plant
  const getPlantDisplayImage = (plant: any) => {
    const selectedPhoto = getPlantSelectedPhoto(plant.id);
    if (selectedPhoto) {
      return { uri: selectedPhoto.uri };
    }
    const photos = getPlantPhotos(plant.id);
    if (photos.length > 0) {
      return { uri: photos[0].uri };
    }
    return plant.image;
  };

  // Add photo to a specific plant
  const addPhotoToPlant = async (plantId: string, photoUri: string) => {
    const newPhoto = {
      id: Date.now().toString(),
      uri: photoUri,
      timestamp: new Date().toLocaleString(),
      isSelected: false,
    };

    const currentPhotos = getPlantPhotos(plantId);
    const updatedPhotos = [...currentPhotos, newPhoto];

    // If this is the first photo, set it as selected
    if (currentPhotos.length === 0) {
      newPhoto.isSelected = true;
    }

    const updatedPlantPhotos = {
      ...plantPhotos,
      [plantId]: updatedPhotos,
    };

    await savePlantPhotos(updatedPlantPhotos);
    console.log("📸 Added photo to plant:", plantId);
  };

  // Remove photo from plant
  const removePhotoFromPlant = async (plantId: string, photoId: string) => {
    const currentPhotos = getPlantPhotos(plantId);
    const updatedPhotos = currentPhotos.filter((photo) => photo.id !== photoId);

    // If we're removing the selected photo, select another one
    let needsReselection = false;
    const updatedPhotosWithSelection = updatedPhotos.map((photo) => {
      if (photo.id === photoId && photo.isSelected) {
        needsReselection = true;
        return { ...photo, isSelected: false };
      }
      return photo;
    });

    // Select the first photo if we removed the selected one and there are photos left
    if (needsReselection && updatedPhotosWithSelection.length > 0) {
      updatedPhotosWithSelection[0].isSelected = true;
    }

    const updatedPlantPhotos = {
      ...plantPhotos,
      [plantId]: updatedPhotosWithSelection,
    };

    await savePlantPhotos(updatedPlantPhotos);
    console.log("🗑️ Removed photo from plant:", plantId);
  };

  // Set selected photo for a plant
  const setPlantSelectedPhoto = async (plantId: string, photoId: string) => {
    const currentPhotos = getPlantPhotos(plantId);
    const updatedPhotos = currentPhotos.map((photo) => ({
      ...photo,
      isSelected: photo.id === photoId,
    }));

    const updatedPlantPhotos = {
      ...plantPhotos,
      [plantId]: updatedPhotos,
    };

    await savePlantPhotos(updatedPlantPhotos);
    setShowPhotoSelector(false);
    Alert.alert("Success", "Main photo updated!");
    console.log("⭐ Set selected photo for plant:", plantId);
  };

  // Assign specific camera photos to a plant
  const assignPhotosToPlant = async (plantId: string, selectedPhotos: any[] | null = null) => {
    const photosToAdd = selectedPhotos || cameraPhotos;

    if (photosToAdd.length === 0) {
      Alert.alert(
        "No Photos Selected",
        "Please select at least one photo to add."
      );
      return;
    }

    // Add each photo to the plant
    for (const photo of photosToAdd) {
      await addPhotoToPlant(plantId, photo.uri);
    }

    // Remove added photos from camera photos
    if (!selectedPhotos) {
      // Clear all camera photos
      await PhotoStorage.clearPhotos();
      setCameraPhotos([]);
    } else {
      // Remove only the selected photos
      const remainingPhotos = cameraPhotos.filter(
        (cameraPhoto) =>
          !selectedPhotos.some((selected) => selected.id === cameraPhoto.id)
      );
      await PhotoStorage.savePhotos(remainingPhotos);
      setCameraPhotos(remainingPhotos);
    }

    Alert.alert("Success", `${photosToAdd.length} photo(s) added to plant!`);
  };

  // Select specific photos from camera
  const selectPhotosForPlant = (plantId: string) => {
    if (cameraPhotos.length === 0) {
      Alert.alert("No Photos", "Take some photos in the camera first!");
      return;
    }

    setSelectedPlant(plants.find((p) => p.id === plantId));
    setShowPhotoSelector(true);
  };

  // Handle adding a new plant
  const handleAddPlant = async () => {
    if (!newPlant.name.trim()) {
      Alert.alert("Error", "Please enter a plant name");
      return;
    }

    try {
      console.log("🟡 Creating new plant:", newPlant);
      
      // Create plant in backend
      const response = await plantsAPI.createPlant({
        name: newPlant.name.trim(),
        common_name: newPlant.common_name?.trim() || newPlant.name.trim(),
        species: newPlant.species?.trim() || "",
      });

      // Handle the response format
      const backendPlant = response.data || response;
      
      if (!backendPlant) {
        throw new Error("No response from server");
      }

      const plant = {
        id: backendPlant.plant_id?.toString() || backendPlant.id?.toString() || Math.random().toString(),
        name: newPlant.name.trim(),
        common_name: newPlant.common_name?.trim() || newPlant.name.trim(),
        species: newPlant.species?.trim() || "",
        image: require("../../assets/images/imagenotfound.jpg"),
        backendId: backendPlant.plant_id || backendPlant.id,
      };

      console.log("✅ Created plant:", plant);
      
      setPlants(prev => [plant, ...prev]);
      setNewPlant({ name: "", common_name: "", species: "" });
      setShowAddPlantModal(false);
      Alert.alert("Success", `${plant.name} added to your collection!`);
    } catch (error) {
      console.error("❌ Error adding plant:", error);
      Alert.alert("Error", "Failed to add plant. Please try again.");
    }
  };

  // Delete plant
  const handleDeletePlant = async (plantId: string) => {
    Alert.alert(
      "Delete Plant",
      "Are you sure you want to delete this plant and all its photos?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const plantToDelete = plants.find((p) => p.id === plantId);

            // Delete from backend if it has a backend ID
            if (plantToDelete?.backendId) {
              try {
                await plantsAPI.deletePlant(plantToDelete.backendId.toString());
              } catch (error) {
                console.error("Error deleting plant from backend:", error);
              }
            }

            // Remove plant photos from storage
            const updatedPlantPhotos = { ...plantPhotos };
            delete updatedPlantPhotos[plantId];
            await savePlantPhotos(updatedPlantPhotos);

            setPlants(plants.filter((plant) => plant.id !== plantId));
            setShowPlantDetails(false);
            Alert.alert(
              "Deleted",
              "Plant has been removed from your collection"
            );
          },
        },
      ]
    );
  };

  // Show disease details
  const handleShowDisease = (disease: any) => {
    setSelectedDisease(disease);
    setShowDiseaseDetails(true);
  };

  // Filter categories
  const categories = [
    { id: "all", name: "All Plants", color: "#3f704d" },
    { id: "with-photos", name: "With Photos", color: "#3f704d" },
  ];

  // Filter plants based on search query and active filter
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.common_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "with-photos" && getPlantPhotos(plant.id).length > 0);

    return matchesSearch && matchesFilter;
  });

  // Render each plant card in the grid
  const renderPlantCard = ({ item }: { item: any }) => {
    const plantPhotos = getPlantPhotos(item.id);
    const selectedPhoto = getPlantSelectedPhoto(item.id);

    return (
      <TouchableOpacity
        style={styles.plantCard}
        onPress={() => {
          setSelectedPlant(item);
          setShowPlantDetails(true);
        }}
      >
        <Image source={getPlantDisplayImage(item)} style={styles.plantImage} />

        {/* Photo selection indicator */}
        {selectedPhoto && (
          <View style={styles.photoSelectedIndicator}>
            <Ionicons name="star" size={12} color="white" />
          </View>
        )}

        <View style={styles.plantInfo}>
          <View style={styles.plantHeader}>
            <Text style={styles.plantName}>{item.name}</Text>
            {plantPhotos.length > 0 && (
              <View style={styles.photoCountBadge}>
                <Ionicons name="images" size={12} color="white" />
                <Text style={styles.photoCountText}>{plantPhotos.length}</Text>
              </View>
            )}
          </View>

          {item.common_name && item.common_name !== item.name && (
            <Text style={styles.commonName}>{item.common_name}</Text>
          )}

          {item.species && (
            <Text style={styles.speciesText}>{item.species}</Text>
          )}

          <View style={styles.plantDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="images-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {plantPhotos.length} photo{plantPhotos.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={styles.plantActions}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => selectPhotosForPlant(item.id)}
            >
              <Ionicons name="camera" size={16} color="#27ae60" />
              <Text style={styles.photoButtonText}>
                {plantPhotos.length > 0 ? "Add More" : "Add Photos"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render disease card
  const renderDiseaseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.diseaseCard}
      onPress={() => handleShowDisease(item)}
    >
      <View style={styles.diseaseHeader}>
        <Text style={styles.diseaseName}>{item.name}</Text>
        <Ionicons name="medical" size={20} color="#e74c3c" />
      </View>
      <Text style={styles.diseaseSymptoms} numberOfLines={2}>
        {item.symptoms}
      </Text>
      <TouchableOpacity
        style={styles.learnMoreButton}
        onPress={() => handleShowDisease(item)}
      >
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render user photo in gallery
  const renderUserPhoto = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => setPlantSelectedPhoto(selectedPlant.id, item.id)}
    >
      <Image source={{ uri: item.uri }} style={styles.userPhoto} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTimestamp}>{item.timestamp}</Text>
        <View style={styles.photoActions}>
          {item.isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="star" size={12} color="white" />
              <Text style={styles.selectedText}>Main</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.deletePhotoButton}
            onPress={() => removePhotoFromPlant(selectedPlant.id, item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render camera photo for selection
  const renderCameraPhoto = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.cameraPhotoItem,
        item.selected && styles.cameraPhotoSelected,
      ]}
      onPress={() => togglePhotoSelection(item.id)}
    >
      <Image source={{ uri: item.uri }} style={styles.cameraPhoto} />
      <View style={styles.photoCheckbox}>
        {item.selected && (
          <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
        )}
      </View>
      <Text style={styles.photoTimestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  // Toggle photo selection in photo selector
  const togglePhotoSelection = (photoId: string) => {
    setCameraPhotos(
      cameraPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, selected: !photo.selected } : photo
      )
    );
  };

  // Get selected camera photos
  const getSelectedCameraPhotos = () => {
    return cameraPhotos.filter((photo) => photo.selected);
  };

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Plants</Text>
          <Text style={styles.headerSubtitle}>
            {plants.length} plants • {diseases.length} diseases
            {cameraPhotos.length > 0 &&
              ` • ${cameraPhotos.length} new photo(s)`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants or diseases..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                activeFilter === category.id && {
                  backgroundColor: category.color,
                },
              ]}
              onPress={() => setActiveFilter(category.id)}
            >
              <Text
                style={[
                  styles.categoryName,
                  activeFilter === category.id && { color: "white" },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Common Diseases Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Common Plant Diseases</Text>
        <TouchableOpacity onPress={() => setShowAllDiseases(true)}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {diseases.length > 0 ? (
        <FlatList
          data={diseases.slice(0, 3)}
          renderItem={renderDiseaseCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.diseasesList}
        />
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="medical-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No disease data</Text>
          <Text style={styles.emptySubtext}>
            Disease information will appear here
          </Text>
        </View>
      )}

      {/* Plants Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Plant Collection</Text>
        <Text style={styles.seeAllText}>{filteredPlants.length} plants</Text>
      </View>

      {filteredPlants.length > 0 ? (
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.plantsGrid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#27ae60"]}
              tintColor="#27ae60"
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {searchQuery ? "No plants found" : "No plants yet"}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {searchQuery
              ? "Try a different search"
              : "Add your first plant to get started"}
          </Text>
        </View>
      )}

      {/* Add Plant FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddPlantModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Plant Modal */}
      <Modal
        visible={showAddPlantModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Plant</Text>
            <TouchableOpacity onPress={() => setShowAddPlantModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Plant Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Monstera Deliciosa"
              value={newPlant.name}
              onChangeText={(text) => setNewPlant({ ...newPlant, name: text })}
            />

            <Text style={styles.inputLabel}>Common Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Swiss Cheese Plant"
              value={newPlant.common_name}
              onChangeText={(text) =>
                setNewPlant({ ...newPlant, common_name: text })
              }
            />

            <Text style={styles.inputLabel}>Species (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Monstera deliciosa"
              value={newPlant.species}
              onChangeText={(text) =>
                setNewPlant({ ...newPlant, species: text })
              }
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddPlantModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addPlantButton,
                !newPlant.name.trim() && styles.addPlantButtonDisabled,
              ]}
              onPress={handleAddPlant}
              disabled={!newPlant.name.trim()}
            >
              <Text style={styles.addPlantButtonText}>Add Plant</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Plant Details Modal */}
      <Modal
        visible={showPlantDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedPlant && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plant Details</Text>
              <TouchableOpacity onPress={() => setShowPlantDetails(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContent}>
              {/* Plant main image */}
              <TouchableOpacity>
                <Image
                  source={getPlantDisplayImage(selectedPlant)}
                  style={styles.detailImage}
                />
              </TouchableOpacity>

              <View style={styles.detailSection}>
                <Text style={styles.detailName}>{selectedPlant.name}</Text>
                {selectedPlant.common_name &&
                  selectedPlant.common_name !== selectedPlant.name && (
                    <Text style={styles.commonNameLarge}>
                      {selectedPlant.common_name}
                    </Text>
                  )}
                {selectedPlant.species && (
                  <Text style={styles.speciesText}>
                    {selectedPlant.species}
                  </Text>
                )}
              </View>

              {/* Photo Gallery Section */}
              {getPlantPhotos(selectedPlant.id).length > 0 && (
                <View style={styles.photoGallerySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Plant Photos</Text>
                    <Text style={styles.photoCount}>
                      {getPlantPhotos(selectedPlant.id).length} photos
                    </Text>
                  </View>
                  <FlatList
                    horizontal
                    data={getPlantPhotos(selectedPlant.id)}
                    renderItem={renderUserPhoto}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoGallery}
                  />
                  <Text style={styles.photoHint}>
                    Tap a photo to set as main • Tap ★ to see current main photo
                  </Text>
                </View>
              )}

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.deleteButtonLarge}
                  onPress={() => handleDeletePlant(selectedPlant.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.deleteButtonLargeText}>Delete Plant</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* All Diseases List Modal */}
      <Modal
        visible={showAllDiseases}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllDiseases(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              All Plant Diseases ({diseases.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowAllDiseases(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Diseases List */}
          <FlatList
            data={diseases}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.diseasesListContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.diseaseListItem}
                onPress={() => {
                  setSelectedDisease(item);
                  setShowDiseaseDetails(true);
                  setShowAllDiseases(false);
                }}
              >
                <View style={styles.diseaseListItemContent}>
                  <View style={styles.diseaseListItemInfo}>
                    <Text style={styles.diseaseListItemName}>{item.name}</Text>
                    <Text
                      style={styles.diseaseListItemSymptoms}
                      numberOfLines={2}
                    >
                      {item.symptoms || "No symptoms description available"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No diseases found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Disease information will appear here when available
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Single Disease Detail Modal */}
      <Modal
        visible={showDiseaseDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDiseaseDetails(false)}
      >
        {selectedDisease && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowDiseaseDetails(false);
                  setShowAllDiseases(true);
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Disease Details</Text>
              <TouchableOpacity
                onPress={() => setShowDiseaseDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diseaseDetailContent}>
              <View style={styles.diseaseDetailHeader}>
                <Text style={styles.diseaseDetailName}>
                  {selectedDisease.name}
                </Text>
              </View>

              {/* Symptoms Section */}
              <View style={styles.diseaseInfoSection}>
                <Text style={styles.diseaseSectionTitle}>Symptoms</Text>
                <Text style={styles.diseaseSectionText}>
                  {selectedDisease.symptoms ||
                    "No symptoms information available."}
                </Text>
              </View>

              {/* Treatments Section */}
              <View style={styles.diseaseInfoSection}>
                <Text style={styles.diseaseSectionTitle}>Treatments</Text>
                <Text style={styles.diseaseSectionText}>
                  {selectedDisease.treatments ||
                    "No treatment information available."}
                </Text>
              </View>

              {/* Prevention Section */}
              <View style={styles.diseaseInfoSection}>
                <Text style={styles.diseaseSectionTitle}>Prevention</Text>
                <Text style={styles.diseaseSectionText}>
                  {selectedDisease.prevention ||
                    "No prevention information available."}
                </Text>
              </View>

              {/* Back to List Button */}
              <TouchableOpacity
                style={styles.backToListButton}
                onPress={() => {
                  setShowDiseaseDetails(false);
                  setShowAllDiseases(true);
                }}
              >
                <Ionicons name="list" size={20} color="#3f704d" />
                <Text style={styles.backToListText}>Back to All Diseases</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Photo Selector Modal */}
      <Modal
        visible={showPhotoSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Photos</Text>
            <TouchableOpacity onPress={() => setShowPhotoSelector(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.selectorContent}>
            <Text style={styles.selectorSubtitle}>
              Choose photos to add to {selectedPlant?.name}
            </Text>

            {cameraPhotos.length > 0 ? (
              <>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionCount}>
                    {getSelectedCameraPhotos().length} of {cameraPhotos.length}{" "}
                    selected
                  </Text>
                  <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={() => {
                      const allSelected =
                        getSelectedCameraPhotos().length ===
                        cameraPhotos.length;
                      setCameraPhotos(
                        cameraPhotos.map((photo) => ({
                          ...photo,
                          selected: !allSelected,
                        }))
                      );
                    }}
                  >
                    <Text style={styles.selectAllText}>
                      {getSelectedCameraPhotos().length === cameraPhotos.length
                        ? "Deselect All"
                        : "Select All"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={cameraPhotos}
                  renderItem={renderCameraPhoto}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  contentContainerStyle={styles.photoSelectorGrid}
                  showsVerticalScrollIndicator={false}
                />

                <View style={styles.selectorActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPhotoSelector(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addPhotosButton,
                      getSelectedCameraPhotos().length === 0 &&
                        styles.addPhotosButtonDisabled,
                    ]}
                    onPress={() => {
                      assignPhotosToPlant(
                        selectedPlant.id,
                        getSelectedCameraPhotos()
                      );
                      setShowPhotoSelector(false);
                    }}
                    disabled={getSelectedCameraPhotos().length === 0}
                  >
                    <Text style={styles.addPhotosButtonText}>
                      Add Selected ({getSelectedCameraPhotos().length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyPhotos}>
                <Ionicons name="camera-outline" size={64} color="#ccc" />
                <Text style={styles.emptyPhotosText}>No photos available</Text>
                <Text style={styles.emptyPhotosSubtext}>
                  Take some photos in the camera first!
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default PlantsScreen;