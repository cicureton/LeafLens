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
  refreshButton: {
    marginTop: 50,
    padding: 8,
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
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3f704d',
    fontWeight: '600',
  },

  // Disease Styles
  diseasesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  diseaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  diseaseSymptoms: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  learnMoreButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 12,
    color: '#3f704d',
    fontWeight: '600',
  },

  // Disease Detail Styles
  diseaseDetailSection: {
    padding: 20,
  },
  diseaseDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  diseaseInfoSection: {
    marginBottom: 24,
  },
  diseaseSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f704d',
    marginBottom: 8,
  },
  diseaseSectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  diseaseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  diseaseListItemName: {
    fontSize: 16,
    color: '#333',
  },

  // Plant Grid Styles
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
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3f704d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  commonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  speciesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
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

  // Empty States
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
  emptySection: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },

  // FAB
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

  // Modal Styles
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
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  commonNameLarge: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  detailActions: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  photoButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoButtonLargeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  deleteButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    padding: 16,
    borderRadius: 12,
  },
  deleteButtonLargeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },

  // Photo Gallery Styles
  photoGallerySection: {
    marginBottom: 20,
    paddingHorizontal: 20,
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
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletePhotoButton: {
    padding: 4,
  },

  // Photo Selection Indicators
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

  // Photo Selector Styles
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

  // Image Overlay
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

  // Photo Hint
  photoHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Empty Photos State
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
  diseasesListContainer: {
    padding: 16,
  },
  diseaseListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diseaseListItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  diseaseListItemSymptoms: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Disease Detail Modal Styles
  diseaseDetailContent: {
    flex: 1,
    padding: 20,
  },
  diseaseDetailHeader: {
    marginBottom: 24,
  },

  // Back to List Button
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  backToListText: {
    fontSize: 16,
    color: '#3f704d',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Modal Header Buttons
  closeButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
  },
});

export default styles;