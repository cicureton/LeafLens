import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStorage from "expo-secure-store";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../app/firebase";
import { styles } from "../styles/profilestyle";

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Firebase and AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user from Firebase auth
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Try to get additional data from AsyncStorage
          const storedUserData = await AsyncStorage.getItem('userData');
          const parsedData = storedUserData ? JSON.parse(storedUserData) : {};
          
          // Combine Firebase user data with stored data
          const userInfo = {
            uid: currentUser.uid,
            username: currentUser.displayName?.toLowerCase().replace(/\s+/g, '') || "plantlover",
            name: currentUser.displayName || "Plant Lover",
            email: currentUser.email,
            joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            plantsCount: 0, // You can fetch these from your backend later
            postsCount: 0,
            likesCount: 0,
            photoURL: currentUser.photoURL,
            ...parsedData // Override with any stored data
          };
          
          setUserData(userInfo);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData();
      } else {
        // No user signed in, redirect to login
        router.replace("/");
      }
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear local storage
            await AsyncStorage.removeItem("userData");
            await SecureStorage.deleteItemAsync("auth_token");

            // Navigate to login screen
            router.replace("/");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be available soon!", [
      { text: "OK" }
    ]);
  };

  const menuItems = [
    {
      icon: "leaf-outline",
      title: "My Plants",
      subtitle: "Manage your plant collection",
      onPress: () => router.push("/tabs/plants"),
    },
    {
      icon: "book-outline",
      title: "Saved Posts",
      subtitle: "Your bookmarked content",
      onPress: () => Alert.alert("Saved Posts", "Coming soon!"),
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Push notifications settings",
      onPress: () => {},
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={notificationsEnabled ? "#3f704d" : "#f4f3f4"}
        />
      ),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help with the app",
      onPress: () => Alert.alert("Help & Support", "Coming soon!"),
    },
    {
      icon: "information-circle-outline",
      title: "About LeafLens",
      subtitle: "App version and info",
      onPress: () => Alert.alert("About", "LeafLens v1.0.0"),
    },
    {
      icon: "log-out-outline",
      title: "Sign Out",
      subtitle: "Log out of your account",
      onPress: handleSignOut,
      color: "#e74c3c",
    },
  ];

  const stats = [
    { label: "Plants", value: userData?.plantsCount || 0 },
    { label: "Posts", value: userData?.postsCount || 0 },
    { label: "Likes", value: userData?.likesCount || 0 },
  ];

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Unable to load profile</Text>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userData.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.profileImage}
              />
            ) : profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.username}>@{userData.username}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {index < stats.length - 1 && <View style={styles.statDivider} />}
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.color || "#3f704d"}
                />
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuTitle,
                      item.color && { color: item.color },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              {item.rightElement ? (
                item.rightElement
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>LeafLens v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;