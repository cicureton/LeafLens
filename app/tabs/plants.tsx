import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/plantstyle";

const PlantsScreen = () => {
  // sample plant data
  const [plants, setPlants] = useState([
    {
      id: "1",
      name: "Monstera Deliciosa",
      type: "Indoor",
      location: "Living Room",
      health: "Excellent",
      lastWatered: "2 days ago",
      nextWatering: "In 3 days",
      image: require("../../assets/images/imagenotfound.jpg"),
      careNotes: "Loves bright indirect light. Water when top soil is dry.",
    },
    {
      id: "2",
      name: "Snake Plant",
      type: "Indoor",
      location: "Bedroom",
      health: "Good",
      lastWatered: "1 week ago",
      nextWatering: "In 2 weeks",
      image: require("../../assets/images/imagenotfound.jpg"),
      careNotes: "Very low maintenance. Thrives in low light.",
    },
    {
      id: "3",
      name: "Peace Lily",
      type: "Indoor",
      location: "Office",
      health: "Needs Care",
      lastWatered: "4 days ago",
      nextWatering: "Today",
      image: require("../../assets/images/imagenotfound.jpg"),
      careNotes: "Drooping leaves need water. Prefers humid environment.",
    },
  ]);

  // state for modals and selected plant
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // state for new plant form
  const [newPlant, setNewPlant] = useState({
    name: "",
    type: "Indoor",
    location: "",
    careNotes: "",
  });

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
      <Image source={item.image} style={styles.plantImage} />

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
        </View>

        <TouchableOpacity
          style={styles.waterButton}
          onPress={() => handleWaterPlant(item.id)}
        >
          <Ionicons name="water" size={16} color="#3498db" />
          <Text style={styles.waterButtonText}>Water</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // main component render
  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Plants</Text>
          <Text style={styles.headerSubtitle}>
            {plants.length} plants in your collection
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="white" />
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

      {/* Add Plant Modal */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddPlantModal(true)}
      >
        <Ionicons name="create" size={24} color="white" />
      </TouchableOpacity>
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
              <Image source={selectedPlant.image} style={styles.detailImage} />

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

                <View style={styles.detailItem}>
                  <Ionicons name="skull-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Disease</Text>
                  <Text style={styles.detailValue}>
                    {selectedPlant.diseases}
                  </Text>
                </View>
              </View>

              <View style={styles.careNotesSection}>
                <Text style={styles.sectionTitle}>Care Notes</Text>
                <Text style={styles.careNotes}>{selectedPlant.careNotes}</Text>
              </View>

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
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default PlantsScreen;
