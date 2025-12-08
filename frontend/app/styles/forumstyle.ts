import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  
  // Header Styles
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
  signInButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 50,
  },
  signInText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Search Styles
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

  // Category Tabs
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
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
  },

  // Posts List
  postsList: {
    padding: 15,
    paddingBottom: 80,
  },
  postCard: {
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
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorAvatar: {
    fontSize: 20,
    marginRight: 10,
  },
  author: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  actionText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  likedText: {
    color: "#e74c3c",
    fontWeight: "600",
  },

  // Floating Action Button
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

  // Empty States
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
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
  createFirstPostButton: {
    backgroundColor: "#3f704d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createFirstPostText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
    borderBottomColor: "#ecf0f1",
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

  // New Post Form Styles
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
  },
  contentInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryOption: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
  },
  categoryOptionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  selectedCategoryDisplay: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  selectedCategoryText: {
    fontSize: 14,
    color: "#3f704d",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  postButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#3f704d",
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // Replies Modal Styles
  repliesList: {
    padding: 16,
    flexGrow: 1,
  },
  replyCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3f704d",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyAuthorInfo: {
    marginLeft: 8,
    flex: 1,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  replyTimestamp: {
    fontSize: 12,
    color: "#666",
  },
  replyContent: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  // Original Post in Replies Modal
  originalPost: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  originalPostTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  originalPostContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  originalPostFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  originalPostAuthor: {
    fontSize: 12,
    color: "#999",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  likeCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },

  // Reply Input Styles
  replyInputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    padding: 16,
  },
  addReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  addReplyText: {
    color: "#3f704d",
    fontWeight: "600",
    marginLeft: 8,
  },
  replyInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  replyTextInput: {
    fontSize: 14,
    color: "#333",
    minHeight: 60,
    textAlignVertical: "top",
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelReplyText: {
    color: "#666",
    fontWeight: "600",
  },
  postReplyButton: {
    backgroundColor: "#3f704d",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postReplyButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  postReplyText: {
    color: "white",
    fontWeight: "600",
  },

  // Empty Replies State
  emptyReplies: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyRepliesText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  emptyRepliesSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
});

export default styles;