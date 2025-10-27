import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#3f704d",
    padding: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 50,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    maxWidth: "80%",
  },
  notificationButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    marginTop: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: "#333",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginLeft: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  categoryTextActive: {
    color: "white",
    fontWeight: "600",
  },
  plantsGrid: {
    padding: 10,
  },
  plantCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  plantImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  plantInfo: {
    padding: 12,
  },
  plantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    marginRight: 8,
  },
  healthIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  plantDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  waterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  waterButtonText: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#bdc3c7",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
  },
  // Modal Styles
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#3f704d",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  typeOptions: {
    flexDirection: "row",
  },
  typeOption: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeOptionActive: {
    backgroundColor: "#e8f5e8",
    borderColor: "#3f704d",
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  addPlantButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#3f704d",
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  addPlantButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  addPlantButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Plant Details Styles
  detailsContent: {
    flex: 1,
  },
  detailImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  detailSection: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    marginRight: 16,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailItem: {
    width: "50%",
    padding: 10,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  careNotesSection: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    margin: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  careNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  waterButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  waterButtonLargeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  // Add these to your existing styles
  plantActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ecf0f1",
    borderRadius: 12,
  },
  photoButtonText: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 4,
  },
  photoGallerySection: {
    marginBottom: 20,
  },
  photoGallery: {
    paddingVertical: 10,
  },
  userPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  photoItem: {
    marginRight: 10,
  },
  photoInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  photoTimestamp: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  deletePhotoButton: {
    padding: 4,
  },
  detailActions: {
    marginTop: 20,
  },
  // Refresh and selection styles
refreshButton: {
  marginTop: 50,
  padding: 8,
},

photoSelectedIndicator: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: '#27ae60',
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
},

selectedBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#27ae60',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 8,
  marginRight: 4,
},

selectedText: {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
  marginLeft: 2,
},

photoActions: {
  flexDirection: 'row',
  alignItems: 'center',
},

// Photo selector styles
selectorContent: {
  flex: 1,
  padding: 16,
},

selectorSubtitle: {
  fontSize: 16,
  color: '#666',
  marginBottom: 16,
  textAlign: 'center',
},

selectionInfo: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},

selectionCount: {
  fontSize: 14,
  color: '#666',
  fontWeight: '600',
},

selectAllButton: {
  padding: 4,
},

selectAllText: {
  color: '#27ae60',
  fontSize: 14,
  fontWeight: '600',
},

photoSelectorGrid: {
  paddingBottom: 20,
},

cameraPhotoItem: {
  width: '31%',
  margin: '1%',
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: 'transparent',
},

cameraPhotoSelected: {
  borderColor: '#27ae60',
},

cameraPhoto: {
  width: '100%',
  height: 100,
  borderRadius: 6,
},

photoCheckbox: {
  position: 'absolute',
  top: 4,
  right: 4,
},

selectorActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: '#ecf0f1',
},

addPhotosButton: {
  backgroundColor: '#27ae60',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  flex: 1,
  marginLeft: 12,
  alignItems: 'center',
},

addPhotosButtonDisabled: {
  backgroundColor: '#bdc3c7',
},

addPhotosButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},

// Image overlay
imageOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: 8,
  alignItems: 'center',
},

imageOverlayText: {
  color: 'white',
  fontSize: 12,
  fontWeight: '600',
},

// Section header
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

photoCount: {
  fontSize: 14,
  color: '#666',
},

photoHint: {
  fontSize: 12,
  color: '#999',
  textAlign: 'center',
  marginTop: 8,
  fontStyle: 'italic',
},

// Empty photos state
emptyPhotos: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 60,
},

emptyPhotosText: {
  fontSize: 18,
  color: '#666',
  marginTop: 16,
},

emptyPhotosSubtext: {
  fontSize: 14,
  color: '#999',
  textAlign: 'center',
  marginTop: 8,
},
});

export default styles;
