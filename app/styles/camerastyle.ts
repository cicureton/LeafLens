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
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: (width / 2) - 15,
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
});

export default styles;