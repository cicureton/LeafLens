import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3f704d",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "white",
    marginBottom: 10,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#dee2e6",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3f704d",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#3f704d",
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: "#3f704d",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3f704d",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statDivider: {
    position: "absolute",
    right: 0,
    top: "25%",
    bottom: "25%",
    width: 1,
    backgroundColor: "#e9ecef",
  },
  menuSection: {
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  userType: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },  
});

export default styles;
