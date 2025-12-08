import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../app/api";

const ScanHistoryScreen = ({ navigation }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadScans();
  }, []);

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

  // In scan_history.tsx, update the loadScans function
  const loadScans = async () => {
    try {
      setLoading(true);
      const userDataJson = await AsyncStorage.getItem("userData");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      const user_id = userData?.user_id || userData?.id || userData?.uid;

      if (!user_id) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Get scans from backend
      const response = await api.scans.getUserScans(user_id.toString());
      const userScans = response.data || response;

      // Get analysis data from storage
      const analysisDataJson = await AsyncStorage.getItem(
        "@scan_analysis_data"
      );
      const analysisData = analysisDataJson ? JSON.parse(analysisDataJson) : [];

      console.log("🟡 Backend scans:", userScans.length);
      console.log("🟡 Analysis data:", analysisData.length);

      // Combine backend scans with analysis data
      const enrichedScans = userScans.map((scan) => {
        const analysis = analysisData.find((a) => a.scan_id === scan.scan_id);
        return {
          ...scan,
          // Add analysis data if available
          species_name: analysis?.species || "Unknown",
          disease_name: analysis?.disease || "Healthy",
          species_confidence: analysis?.species_confidence || 0,
          disease_confidence: analysis?.disease_confidence || 0,
        };
      });

      const sortedScans = enrichedScans.sort(
        (a, b) =>
          new Date(b.date || b.timestamp || b.created_at) -
          new Date(a.date || a.timestamp || a.created_at)
      );

      setScans(sortedScans);
    } catch (error) {
      console.error("Error loading scans:", error);
      Alert.alert("Error", "Failed to load scan history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadScans();
  };

  const deleteScan = async (scanId: number) => {
    Alert.alert("Delete Scan", "Are you sure you want to delete this scan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.scans.deleteScan(scanId.toString());
            // Remove from local state
            setScans(scans.filter((scan) => scan.scan_id !== scanId));
            Alert.alert("Success", "Scan deleted successfully");
          } catch (error) {
            console.error("Error deleting scan:", error);
            Alert.alert("Error", "Failed to delete scan");
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const renderScanItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.scanCard}
      onPress={() => router.push(`/scan_detail?id=${item.scan_id}`)}
    >
      <View style={styles.scanHeader}>
        <View style={styles.scanTitle}>
          <Ionicons name="leaf" size={20} color="#3f704d" />
          <Text style={styles.scanId}>Scan #{item.scan_id}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteScan(item.scan_id)}>
          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.scanDetails}>
        <Text style={styles.scanDate}>
          {formatDate(item.date || item.timestamp || item.created_at)}
        </Text>
        {item.confidence_score && (
          <Text style={styles.confidenceText}>
            Confidence: {item.confidence_score.toFixed(1)}%
          </Text>
        )}
      </View>

      {/* SHOW SPECIES AND DISEASE NAMES */}
      <View style={styles.analysisInfo}>
        <View style={styles.analysisRow}>
          <Ionicons name="leaf" size={14} color="#27ae60" />
          <View style={styles.analysisTextContainer}>
            <Text style={styles.analysisText}>
              Species: {item.species_name || "Unknown"}
              {item.species_confidence
                ? ` (${item.species_confidence.toFixed(1)}%)`
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.analysisRow}>
          <Ionicons name="medical" size={14} color="#e74c3c" />
          <View style={styles.analysisTextContainer}>
            <Text style={styles.analysisText}>
              Disease: {item.disease_name || "Healthy"}
              {item.disease_confidence
                ? ` (${item.disease_confidence.toFixed(1)}%)`
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* ADD TREATMENT PREVIEW - FIXED */}
      {item.disease_name && item.disease_name !== "Healthy" && (
        <View style={styles.treatmentPreview}>
          <Ionicons name="medkit" size={14} color="#27ae60" />
          <Text style={styles.treatmentText} numberOfLines={2}>
            💡 Tap for treatment recommendations
          </Text>
        </View>
      )}

      {/* Keep the debug info for now */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          User ID: {item.user_id} | Plant ID: {item.plant_id || "None"} |
          Disease ID: {item.disease_id || "None"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>
          {scans.length} scan{scans.length !== 1 ? "s" : ""} total
        </Text>
      </View>

      <FlatList
        data={scans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.scan_id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>
              Take some photos to start analyzing plants
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  scanCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scanTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  scanDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scanDate: {
    fontSize: 14,
    color: "#666",
  },
  confidenceText: {
    fontSize: 14,
    color: "#3f704d",
    fontWeight: "500",
  },
  diseaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 8,
    borderRadius: 6,
  },
  diseaseText: {
    fontSize: 14,
    color: "#e74c3c",
    marginLeft: 6,
    fontWeight: "500",
  },
  debugInfo: {
    marginTop: 8,
    padding: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: "#666",
    fontFamily: "monospace",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  analysisInfo: {
    marginBottom: 8,
  },
  analysisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  analysisTextContainer: {
    flex: 1,
    marginLeft: 6,
  },
  analysisText: {
    fontSize: 14,
    color: "#333",
  },
  confidenceSmall: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  treatmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  treatmentText: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 6,
    fontWeight: "500",
    flex: 1,
  },
});

export default ScanHistoryScreen;
