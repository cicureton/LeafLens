import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  button: {
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#f0f0f0",
  },
  captureCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
  },
  placeholder: {
    width: 60,
    height: 60,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  // Multiple Photos Styles
  photoCounter: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoCounterText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Preview Screen Styles
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
    marginTop: 40,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  clearAllText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  photosList: {
    padding: 10,
    flexGrow: 1,
  },
  photoItem: {
    flex: 1,
    margin: 5,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
    maxWidth: width / 2 - 15,
  },
  photoThumbnail: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  photoInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  photoTime: {
    color: "white",
    fontSize: 12,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  previewButtons: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#1a1a1a",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: "#3498db",
  },
  usePhotosButton: {
    backgroundColor: "#3f704d",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  // Add these to your existing styles
  photoCountBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  photoCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewPhotosText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Results Section Styles
  resultsSection: {
    flex: 1,
    backgroundColor: "white",
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
  },
  resultsScrollView: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#3f704d",
  },
  resultImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginLeft: 8,
    marginRight: 8,
    width: 80,
  },
  resultValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  confidenceValue: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "bold",
  },
  confidenceBarContainer: {
    height: 6,
    backgroundColor: "#ecf0f1",
    borderRadius: 3,
    marginTop: 5,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 3,
  },
  diseaseConfidenceBar: {
    height: "100%",
    backgroundColor: "#e67e22",
    borderRadius: 3,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  // Loading Overlay
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },

  // Add to your styles
  errorCard: {
    borderLeftColor: "#e74c3c",
    backgroundColor: "#fdf2f2",
  },
  errorSection: {
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
  errorDetail: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },

  floatingHistoryButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 25,
    zIndex: 10,
  },

  // Add these styles to your existing styles
  scanIdSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 6,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  scanIdText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0fff4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3f704d",
    alignSelf: "flex-start",
  },
  viewDetailsText: {
    color: "#3f704d",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default styles;
