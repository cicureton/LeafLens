// app/scan_detail.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../app/api";

export default function ScanDetailScreen() {
  const { id } = useLocalSearchParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);

  useEffect(() => {
    loadUserDataAndScan();
  }, [id]);

  useEffect(() => {
    if (scan) {
      loadAdditionalInfo();
    }
  }, [scan]);

  const loadUserDataAndScan = async () => {
    try {
      setLoading(true);
      setError("");

      // Load user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");

      if (!storedUserData) {
        setError("Please log in to view scan details");
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUserData);
      setUserData(userData);

      // Support multiple user ID field names
      const user_id = userData?.user_id || userData?.id || userData?.uid;

      if (!user_id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Get all user scans and find the specific one
      const response = await api.scans.getUserScans(user_id.toString());
      const userScans = response.data || response;

      if (!userScans || userScans.length === 0) {
        setError("No scans found for this user");
        setLoading(false);
        return;
      }

      // Find the specific scan by ID
      const scanId = parseInt(Array.isArray(id) ? id[0] : id);
      const foundScan = userScans.find((scan) => scan.scan_id === scanId);

      if (foundScan) {
        console.log("🟢 Scan data:", foundScan);
        setScan(foundScan);
      } else {
        setError(`Scan #${scanId} not found in your scan history`);
      }
    } catch (error) {
      console.error("🔴 Error loading scan details:", error);
      setError("Failed to load scan details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // In scan_detail.tsx - update the loadAdditionalInfo function
  const loadAdditionalInfo = async () => {
    try {
      // Load disease info if disease_id exists
      if (scan.disease_id) {
        console.log("🟡 Loading disease info for ID:", scan.disease_id);
        try {
          const diseaseResponse = await api.diseases.getDisease(
            scan.disease_id.toString()
          );
          const diseaseData = diseaseResponse.data || diseaseResponse;
          console.log("🟢 Disease info loaded:", diseaseData);
          setDiseaseInfo(diseaseData);
        } catch (diseaseError) {
          console.error("🔴 Error loading disease info:", diseaseError);
          // If we can't load from API, try to get from analysis data
          const analysisDataJson = await AsyncStorage.getItem(
            "@scan_analysis_data"
          );
          const analysisData = analysisDataJson
            ? JSON.parse(analysisDataJson)
            : [];
          const analysis = analysisData.find((a) => a.scan_id === scan.scan_id);

          if (analysis?.disease && analysis.disease !== "Healthy") {
            setDiseaseInfo({
              name: analysis.disease,
              symptoms: "Information not available",
              treatments: "Please consult a plant specialist",
              prevention: "General plant care recommended",
            });
          }
        }
      }

      // Load plant info if plant_id exists
      if (scan.plant_id) {
        console.log("🟡 Loading plant info for ID:", scan.plant_id);
        try {
          const plantResponse = await api.plants.getPlant(
            scan.plant_id.toString()
          );
          const plantData = plantResponse.data || plantResponse;
          console.log("🟢 Plant info loaded:", plantData);
          setPlantInfo(plantData);
        } catch (plantError) {
          console.error("🔴 Error loading plant info:", plantError);
        }
      }
    } catch (error) {
      console.error("🔴 Error loading additional info:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3f704d" />
        <Text style={styles.loadingText}>Loading scan details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Scan ID: #{id}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadUserDataAndScan}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!scan) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="search" size={48} color="#ccc" />
        <Text style={styles.errorText}>Scan not found</Text>
        <Text style={styles.errorSubtext}>Scan ID: #{id}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadUserDataAndScan}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan #{scan.scan_id}</Text>
        <Text style={styles.subtitle}>
          {/* Use 'date' field from your schema instead of 'timestamp' */}
          {formatDate(scan.date || scan.timestamp || scan.created_at)}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Confidence Score */}
        {scan.confidence_score && (
          <View style={styles.confidenceSection}>
            <Text style={styles.sectionTitle}>Confidence Score</Text>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${Math.min(scan.confidence_score, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {scan.confidence_score.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        {/* Disease Information with Treatments & Prevention */}
        {diseaseInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Disease Analysis</Text>
            <View style={styles.diseaseCard}>
              <Ionicons name="medical" size={24} color="#e74c3c" />
              <View style={styles.diseaseContent}>
                <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>

                {/* Symptoms */}
                {diseaseInfo.symptoms &&
                  diseaseInfo.symptoms !== "Information not available" && (
                    <View style={styles.infoBox}>
                      <View style={styles.infoHeader}>
                        <Ionicons name="warning" size={16} color="#e67e22" />
                        <Text style={styles.infoBoxTitle}>Symptoms</Text>
                      </View>
                      <Text style={styles.infoBoxText}>
                        {diseaseInfo.symptoms}
                      </Text>
                    </View>
                  )}

                {/* Treatments */}
                {diseaseInfo.treatments &&
                  diseaseInfo.treatments !==
                    "Please consult a plant specialist" && (
                    <View style={styles.infoBox}>
                      <View style={styles.infoHeader}>
                        <Ionicons name="medkit" size={16} color="#27ae60" />
                        <Text style={styles.infoBoxTitle}>
                          Recommended Treatments
                        </Text>
                      </View>
                      <Text style={styles.infoBoxText}>
                        {diseaseInfo.treatments}
                      </Text>
                    </View>
                  )}

                {/* Prevention */}
                {diseaseInfo.prevention &&
                  diseaseInfo.prevention !==
                    "General plant care recommended" && (
                    <View style={styles.infoBox}>
                      <View style={styles.infoHeader}>
                        <Ionicons
                          name="shield-checkmark"
                          size={16}
                          color="#3498db"
                        />
                        <Text style={styles.infoBoxTitle}>Prevention Tips</Text>
                      </View>
                      <Text style={styles.infoBoxText}>
                        {diseaseInfo.prevention}
                      </Text>
                    </View>
                  )}

                {/* Fallback message if no specific info available */}
                {(!diseaseInfo.symptoms ||
                  !diseaseInfo.treatments ||
                  !diseaseInfo.prevention) && (
                  <View style={styles.infoBox}>
                    <View style={styles.infoHeader}>
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color="#f39c12"
                      />
                      <Text style={styles.infoBoxTitle}>
                        Additional Information
                      </Text>
                    </View>
                    <Text style={styles.infoBoxText}>
                      For detailed treatment and prevention advice for{" "}
                      {diseaseInfo.name}, consult with a plant disease
                      specialist or agricultural extension service.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        {/* Plant Information */}
        {plantInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Plant Identified</Text>
            <View style={styles.plantCard}>
              <Ionicons name="leaf" size={24} color="#27ae60" />
              <View style={styles.plantContent}>
                <Text style={styles.plantName}>{plantInfo.name}</Text>
                {plantInfo.common_name && (
                  <Text style={styles.plantDetail}>
                    <Text style={styles.detailLabel}>Common Name: </Text>
                    {plantInfo.common_name}
                  </Text>
                )}
                {plantInfo.species && (
                  <Text style={styles.plantDetail}>
                    <Text style={styles.detailLabel}>Species: </Text>
                    {plantInfo.species}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        {/* Scan Details */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Scan Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Scan ID</Text>
              <Text style={styles.infoValue}>#{scan.scan_id}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{scan.user_id}</Text>
            </View>
          </View>

          {scan.plant_id && !plantInfo && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Plant ID</Text>
                <Text style={styles.infoValue}>{scan.plant_id}</Text>
              </View>
            </View>
          )}

          {scan.disease_id && !diseaseInfo && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Disease ID</Text>
                <Text style={styles.infoValue}>{scan.disease_id}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date Analyzed</Text>
              <Text style={styles.infoValue}>
                {/* Use 'date' field from your schema */}
                {formatDate(scan.date || scan.timestamp || scan.created_at)}
              </Text>
            </View>
          </View>
        </View>
        {/* Analysis Context - WITH CORRECT HEALTHY DETECTION */}
        <View style={styles.contextSection}>
          <Text style={styles.sectionTitle}>Analysis Summary</Text>

          {scan.confidence_score && (
            <View style={styles.confidenceSummary}>
              <Ionicons name="analytics" size={16} color="#3498db" />
              <Text style={styles.confidenceSummaryText}>
                {diseaseInfo?.name === "Healthy" ||
                diseaseInfo?.name === "healthy"
                  ? "Health status confidence: "
                  : "Disease detection confidence: "}
                <Text style={styles.confidenceValue}>
                  {scan.confidence_score.toFixed(1)}%
                </Text>
              </Text>
            </View>
          )}

          {/* Show treatments for REAL diseases like "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot" */}
          {diseaseInfo &&
            diseaseInfo.name !== "Healthy" &&
            diseaseInfo.name !== "healthy" && (
              <View style={styles.actionAdvice}>
                <Text style={styles.actionTitle}>
                  Recommended Actions for {diseaseInfo.name}:
                </Text>

                {diseaseInfo.treatments && (
                  <View style={styles.actionItem}>
                    <Ionicons name="medical" size={14} color="#27ae60" />
                    <Text style={styles.actionText}>
                      <Text style={styles.actionLabel}>Treatment: </Text>
                      {diseaseInfo.treatments}
                    </Text>
                  </View>
                )}

                {diseaseInfo.prevention && (
                  <View style={styles.actionItem}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#3498db"
                    />
                    <Text style={styles.actionText}>
                      <Text style={styles.actionLabel}>Prevention: </Text>
                      {diseaseInfo.prevention}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* Only show healthy status for actual "Healthy" predictions */}
          {(diseaseInfo?.name === "Healthy" ||
            diseaseInfo?.name === "healthy") && (
            <View style={styles.healthyStatus}>
              <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              <Text style={styles.healthyText}>
                Your plant appears to be healthy! Continue with regular care and
                monitoring.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#3f704d",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
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
  content: {
    padding: 16,
    gap: 16,
  },
  confidenceSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contextSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 6,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#27ae60",
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    minWidth: 60,
  },
  // Disease and Plant Cards
  diseaseCard: {
    flexDirection: "row",
    backgroundColor: "#fff5f5",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  plantCard: {
    flexDirection: "row",
    backgroundColor: "#f0fff4",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  diseaseContent: {
    flex: 1,
    marginLeft: 12,
  },
  plantContent: {
    flex: 1,
    marginLeft: 12,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 8,
  },
  diseaseDetail: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  plantDetail: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#333",
  },
  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  contextText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  // Add to your styles in scan_detail.tsx
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
  // Add to your styles in scan_detail.tsx
  confidenceSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebf5fb",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  confidenceSummaryText: {
    fontSize: 14,
    color: "#2c3e50",
    marginLeft: 8,
    flex: 1,
  },
  confidenceValue: {
    fontWeight: "bold",
    color: "#2980b9",
  },
  actionAdvice: {
    marginTop: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
    flex: 1,
    marginLeft: 8,
  },
  actionLabel: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
  healthyStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d5f4e6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  healthyText: {
    fontSize: 14,
    color: "#27ae60",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
});
