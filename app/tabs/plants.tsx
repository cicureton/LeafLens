import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { styles } from "../styles/plantstyle";

const PlantsScreen = () => {
  
  const [plants, setPlants] = useState([
  ]);

  // state for modals and selected plant
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraPhotos, setCameraPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // state for new plant form
  const [newPlant, setNewPlant] = useState({
    name: "",
    type: "Indoor",
    location: "",
    careNotes: "",
  });

  // Load camera photos when component mounts
  useEffect(() => {
    loadCameraPhotos();
  }, []);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCameraPhotos();
    
    // Simulate API call delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Load photos from camera storage
  const loadCameraPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('@plant_photos');
      if (savedPhotos) {
        setCameraPhotos(JSON.parse(savedPhotos));
      } else {
        setCameraPhotos([]);
      }
    } catch (error) {
      console.error('Error loading camera photos:', error);
    }
  };

  // predefined filter categories
  const categories = [
    { id: "all", name: "All Plants", color: "#3f704d" },
    { id: "indoor", name: "Indoor", color: "#3f704d" },
    { id: "outdoor", name: "Outdoor", color: "#3f704d" },
    { id: "needs-care", name: "Needs Care", color: "#3f704d" },
  ];

  // filters plants based on search query and active filter
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "indoor" && plant.type === "Indoor") ||
      (activeFilter === "outdoor" && plant.type === "Outdoor") ||
      (activeFilter === "needs-care" && plant.health === "Needs Care");

    return matchesSearch && matchesFilter;
  });

  // Get the display image for a plant
  const getPlantDisplayImage = (plant) => {
    if (plant.selectedPhoto) {
      const selected = plant.userPhotos.find(photo => photo.id === plant.selectedPhoto);
      if (selected) return { uri: selected.uri };
    }
    if (plant.userPhotos.length > 0) {
      return { uri: plant.userPhotos[0].uri };
    }
    return plant.image;
  };

  // Add photo to a specific plant
  const addPhotoToPlant = (plantId, photoUri) => {
    const newPhoto = {
      id: Date.now().toString(),
      uri: photoUri,
      timestamp: new Date().toLocaleString(),
    };

    setPlants(plants.map(plant => 
      plant.id === plantId 
        ? {
            ...plant,
            userPhotos: [...plant.userPhotos, newPhoto],
            // Auto-select first photo if none selected
            selectedPhoto: plant.selectedPhoto || newPhoto.id
          }
        : plant
    ));
  };

  // Remove photo from plant
  const removePhotoFromPlant = (plantId, photoId) => {
    setPlants(plants.map(plant => {
      if (plant.id === plantId) {
        const updatedPhotos = plant.userPhotos.filter(photo => photo.id !== photoId);
        let newSelectedPhoto = plant.selectedPhoto;
        
        // If we're removing the selected photo, select another one or clear selection
        if (photoId === plant.selectedPhoto) {
          newSelectedPhoto = updatedPhotos.length > 0 ? updatedPhotos[0].id : null;
        }

        return {
          ...plant,
          userPhotos: updatedPhotos,
          selectedPhoto: newSelectedPhoto
        };
      }
      return plant;
    }));
  };

  // Set selected photo for a plant
  const setPlantSelectedPhoto = (plantId, photoId) => {
    setPlants(plants.map(plant =>
      plant.id === plantId
        ? { ...plant, selectedPhoto: photoId }
        : plant
    ));
    setShowPhotoSelector(false);
    Alert.alert("Success", "Main photo updated!");
  };

  // Assign specific camera photos to a plant
  const assignPhotosToPlant = (plantId, selectedPhotos = null) => {
    if (cameraPhotos.length === 0) {
      Alert.alert("No Photos", "Take some photos in the camera first!");
      return;
    }

    // If specific photos are selected, use those
    const photosToAdd = selectedPhotos || cameraPhotos;

    if (photosToAdd.length === 0) {
      Alert.alert("No Photos Selected", "Please select at least one photo to add.");
      return;
    }

    photosToAdd.forEach(photo => {
      addPhotoToPlant(plantId, photo.uri);
    });

    // Remove added photos from camera photos
    if (!selectedPhotos) {
      // If no specific selection, clear all camera photos
      AsyncStorage.removeItem('@plant_photos');
      setCameraPhotos([]);
    } else {
      // Remove only the selected photos
      const remainingPhotos = cameraPhotos.filter(
        cameraPhoto => !selectedPhotos.some(selected => selected.id === cameraPhoto.id)
      );
      setCameraPhotos(remainingPhotos);
      AsyncStorage.setItem('@plant_photos', JSON.stringify(remainingPhotos));
    }

    Alert.alert("Success", `${photosToAdd.length} photo(s) added to plant!`);
  };

  // Select specific photos from camera
  const selectPhotosForPlant = (plantId) => {
    if (cameraPhotos.length === 0) {
      Alert.alert("No Photos", "Take some photos in the camera first!");
      return;
    }

    setSelectedPlant(plants.find(p => p.id === plantId));
    setShowPhotoSelector(true);
  };

  // handles adding a new plant to the collection
  const handleAddPlant = () => {
    if (!newPlant.name.trim()) {
      Alert.alert("Error", "Please enter a plant name");
      return;
    }

    const plant = {
      id: Date.now().toString(),
      name: newPlant.name,
      type: newPlant.type,
      location: newPlant.location || "Unknown",
      health: "Good",
      lastWatered: "Just now",
      nextWatering: "In 7 days",
      image: require("../../assets/images/imagenotfound.jpg"),
      careNotes: newPlant.careNotes || "No notes yet.",
      userPhotos: [],
      selectedPhoto: null,
    };

    setPlants([plant, ...plants]);
    setNewPlant({ name: "", type: "Indoor", location: "", careNotes: "" });
    setShowAddPlantModal(false);
    Alert.alert("Success", `${plant.name} added to your collection!`);
  };

  // handles watering a plant data
  const handleWaterPlant = (plantId) => {
    setPlants(
      plants.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              lastWatered: "Just now",
              nextWatering: "In 7 days",
              health: plant.health === "Needs Care" ? "Good" : plant.health,
            }
          : plant
      )
    );
    Alert.alert("Watered!", "Plant watering recorded");
  };

  // determines color based on plant health status
  const getHealthColor = (health) => {
    switch (health) {
      case "Excellent":
        return "#27ae60";
      case "Good":
        return "#2ecc71";
      case "Needs Care":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  // renders each plant card in the grid
  const renderPlantCard = ({ item }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => {
        setSelectedPlant(item);
        setShowPlantDetails(true);
      }}
    >
      <Image source={getPlantDisplayImage(item)} style={styles.plantImage} />
      
      {/* Photo selection indicator */}
      {item.userPhotos.length > 0 && item.selectedPhoto && (
        <View style={styles.photoSelectedIndicator}>
          <Ionicons name="star" size={12} color="white" />
        </View>
      )}

      <View style={styles.plantInfo}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{item.name}</Text>
          <View
            style={[
              styles.healthIndicator,
              { backgroundColor: getHealthColor(item.health) },
            ]}
          >
            <Text style={styles.healthText}>{item.health}</Text>
          </View>
        </View>

        <View style={styles.plantDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="home-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Water: {item.nextWatering}</Text>
          </View>

          {/* Photo count indicator */}
          {item.userPhotos.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="images-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.userPhotos.length} photo(s)</Text>
            </View>
          )}
        </View>

        <View style={styles.plantActions}>
          <TouchableOpacity
            style={styles.waterButton}
            onPress={() => handleWaterPlant(item.id)}
          >
            <Ionicons name="water" size={16} color="#3498db" />
            <Text style={styles.waterButtonText}>Water</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => selectPhotosForPlant(item.id)}
          >
            <Ionicons name="camera" size={16} color="#27ae60" />
            <Text style={styles.photoButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render user photo in gallery
  const renderUserPhoto = ({ item }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => setPlantSelectedPhoto(selectedPlant.id, item.id)}
    >
      <Image source={{ uri: item.uri }} style={styles.userPhoto} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTimestamp}>{item.timestamp}</Text>
        <View style={styles.photoActions}>
          {selectedPlant.selectedPhoto === item.id && (
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
  const renderCameraPhoto = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.cameraPhotoItem,
        item.selected && styles.cameraPhotoSelected
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
  const togglePhotoSelection = (photoId) => {
    setCameraPhotos(cameraPhotos.map(photo =>
      photo.id === photoId
        ? { ...photo, selected: !photo.selected }
        : photo
    ));
  };

  // Get selected camera photos
  const getSelectedCameraPhotos = () => {
    return cameraPhotos.filter(photo => photo.selected);
  };

  // main component render
  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Plants</Text>
          <Text style={styles.headerSubtitle}>
            {plants.length} plants in your collection
            {cameraPhotos.length > 0 && ` • ${cameraPhotos.length} new photo(s) from camera`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color="white" 
            style={{ transform: [{ rotate: refreshing ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your plants"
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

      {/* Plants Grid */}
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
          <Text style={styles.emptyStateText}>No plants found</Text>
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

            <Text style={styles.inputLabel}>Plant Type</Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newPlant.type === "Indoor" && styles.typeOptionActive,
                ]}
                onPress={() => setNewPlant({ ...newPlant, type: "Indoor" })}
              >
                <Text style={styles.typeOptionText}>Indoor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newPlant.type === "Outdoor" && styles.typeOptionActive,
                ]}
                onPress={() => setNewPlant({ ...newPlant, type: "Outdoor" })}
              >
                <Text style={styles.typeOptionText}>Outdoor</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Living Room, Garden"
              value={newPlant.location}
              onChangeText={(text) =>
                setNewPlant({ ...newPlant, location: text })
              }
            />

            <Text style={styles.inputLabel}>Care Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Any special care instructions..."
              value={newPlant.careNotes}
              onChangeText={(text) =>
                setNewPlant({ ...newPlant, careNotes: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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
              <TouchableOpacity 
                onPress={() => selectedPlant.userPhotos.length > 0 && setShowPhotoGallery(true)}
              >
                <Image source={getPlantDisplayImage(selectedPlant)} style={styles.detailImage} />
                {selectedPlant.userPhotos.length > 0 && (
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>Tap to view gallery</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.detailSection}>
                <Text style={styles.detailName}>{selectedPlant.name}</Text>
                <View
                  style={[
                    styles.healthIndicator,
                    { backgroundColor: getHealthColor(selectedPlant.health) },
                  ]}
                >
                  <Text style={styles.healthText}>{selectedPlant.health}</Text>
                </View>
              </View>

              {/* Photo Gallery Section */}
              {selectedPlant.userPhotos.length > 0 && (
                <View style={styles.photoGallerySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Plant Photos</Text>
                    <Text style={styles.photoCount}>
                      {selectedPlant.userPhotos.length} photos
                    </Text>
                  </View>
                  <FlatList
                    horizontal
                    data={selectedPlant.userPhotos}
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

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="home-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {selectedPlant.location}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="leaf-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{selectedPlant.type}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Last Watered</Text>
                  <Text style={styles.detailValue}>
                    {selectedPlant.lastWatered}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Next Watering</Text>
                  <Text style={styles.detailValue}>
                    {selectedPlant.nextWatering}
                  </Text>
                </View>
              </View>

              <View style={styles.careNotesSection}>
                <Text style={styles.sectionTitle}>Care Notes</Text>
                <Text style={styles.careNotes}>{selectedPlant.careNotes}</Text>
              </View>

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.waterButtonLarge}
                  onPress={() => {
                    handleWaterPlant(selectedPlant.id);
                    setShowPlantDetails(false);
                  }}
                >
                  <Ionicons name="water" size={20} color="white" />
                  <Text style={styles.waterButtonLargeText}>
                    Water This Plant
                  </Text>
                </TouchableOpacity>

              </View>
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
                    {getSelectedCameraPhotos().length} of {cameraPhotos.length} selected
                  </Text>
                  <TouchableOpacity 
                    style={styles.selectAllButton}
                    onPress={() => {
                      const allSelected = getSelectedCameraPhotos().length === cameraPhotos.length;
                      setCameraPhotos(cameraPhotos.map(photo => ({
                        ...photo,
                        selected: !allSelected
                      })));
                    }}
                  >
                    <Text style={styles.selectAllText}>
                      {getSelectedCameraPhotos().length === cameraPhotos.length ? 'Deselect All' : 'Select All'}
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
                      getSelectedCameraPhotos().length === 0 && styles.addPhotosButtonDisabled,
                    ]}
                    onPress={() => {
                      assignPhotosToPlant(selectedPlant.id, getSelectedCameraPhotos());
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