import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
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
import { forumAPI, scansAPI } from "../../app/api";
import { styles } from "../styles/profilestyle";

// Key for storing plant photos in AsyncStorage (should match your plants page)
const PLANT_PHOTOS_STORAGE_KEY = "@plant_user_photos";
const PROFILE_PIC_STORAGE_KEY = "@user_profile_pic";

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    plantsCount: 0,
    postsCount: 0,
    likesCount: 0,
    scansCount: 0
  });

  // Load user data and stats from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          
          // Load user data
          const userInfo = {
            ...parsedData,
            username: parsedData.displayName?.toLowerCase().replace(/\s+/g, '') || "plantlover",
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          };
          setUserData(userInfo);

          // Load profile picture
          await loadProfilePicture();

          // Load user stats from local storage
          await loadUserStats(parsedData.uid);
        } else {
          // No user data found, redirect to login
          router.replace("/");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Load profile picture from storage
  const loadProfilePicture = async () => {
    try {
      const storedProfilePic = await AsyncStorage.getItem(PROFILE_PIC_STORAGE_KEY);
      if (storedProfilePic) {
        setProfileImage(storedProfilePic);
      }
    } catch (error) {
      console.error("Error loading profile picture:", error);
    }
  };

  // Save profile picture to storage
  const saveProfilePicture = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem(PROFILE_PIC_STORAGE_KEY, imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error("Error saving profile picture:", error);
      throw error;
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveProfilePicture(result.assets[0].uri);
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Choose from gallery
  const chooseFromGallery = async () => {
    try {
      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need gallery permissions to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveProfilePicture(result.assets[0].uri);
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Error choosing photo:", error);
      Alert.alert("Error", "Failed to select photo");
    }
  };

  // Show photo options
  const handleEditPhoto = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhoto,
        },
        {
          text: "Choose from Gallery",
          onPress: chooseFromGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PROFILE_PIC_STORAGE_KEY);
              setProfileImage(null);
              Alert.alert("Success", "Profile picture removed");
            } catch (error) {
              console.error("Error removing profile picture:", error);
              Alert.alert("Error", "Failed to remove profile picture");
            }
          },
        },
      ]
    );
  };

  // Long press on profile picture for more options
  const handleProfilePictureLongPress = () => {
    if (profileImage) {
      Alert.alert(
        "Profile Picture",
        "What would you like to do?",
        [
          {
            text: "Change Picture",
            onPress: handleEditPhoto,
          },
          {
            text: "Remove Picture",
            style: "destructive",
            onPress: removeProfilePicture,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      handleEditPhoto();
    }
  };

  // Load plants count from local storage (matches your plants page)
  const loadPlantsCountFromStorage = async () => {
    try {
      const storedPlantPhotos = await AsyncStorage.getItem(PLANT_PHOTOS_STORAGE_KEY);
      if (storedPlantPhotos) {
        const plantPhotos = JSON.parse(storedPlantPhotos);
        const plantsCount = Object.keys(plantPhotos).length;
        console.log(`🌿 Plants count from storage: ${plantsCount}`);
        return plantsCount;
      }
      return 0;
    } catch (error) {
      console.error("Error loading plants count from storage:", error);
      return 0;
    }
  };

  // Load posts count from backend
  const loadPostsCount = async (userId: string) => {
    try {
      const response = await forumAPI.getForumPosts();
      const posts = response.data || response || [];
      
      // Convert userId to number for comparison
      const userIdNum = parseInt(userId);
      
      // Count posts by this user
      const userPosts = posts.filter((post: any) => 
        post.user_id === userIdNum
      );
      
      console.log(`📝 Posts count: ${userPosts.length}`);
      return userPosts.length;
    } catch (error) {
      console.error("Error loading posts count:", error);
      return 0;
    }
  };

  // Load scans count from backend
  const loadScansCount = async (userId: string) => {
    try {
      const response = await scansAPI.getScans(userId);
      const scans = response.data || response || [];
      console.log(`📸 Scans count: ${scans.length}`);
      return scans.length;
    } catch (error) {
      console.error("Error loading scans count:", error);
      return 0;
    }
  };

  // Load likes count by calculating from user's posts
  const loadLikesCount = async (userId: string) => {
    try {
      const response = await forumAPI.getForumPosts();
      const posts = response.data || response || [];
      
      // Convert userId to number for comparison
      const userIdNum = parseInt(userId);
      
      // Get posts by this user and sum their likes
      const userPosts = posts.filter((post: any) => 
        post.user_id === userIdNum
      );
      
      const totalLikes = userPosts.reduce((sum: number, post: any) => {
        return sum + (post.like_count || 0);
      }, 0);
      
      console.log(`❤️ Likes count: ${totalLikes}`);
      return totalLikes;
    } catch (error) {
      console.error("Error loading likes count:", error);
      return 0;
    }
  };

  // Load user stats
  const loadUserStats = async (userId: string) => {
    try {
      console.log("📊 Loading user stats from local storage...");
      
      // Load plants count from local storage
      const plantsCount = await loadPlantsCountFromStorage();
      
      // Load other stats from backend
      const [postsCount, scansCount, likesCount] = await Promise.allSettled([
        loadPostsCount(userId),
        loadScansCount(userId),
        loadLikesCount(userId)
      ]);

      const stats = {
        plantsCount: plantsCount,
        postsCount: postsCount.status === 'fulfilled' ? postsCount.value : 0,
        scansCount: scansCount.status === 'fulfilled' ? scansCount.value : 0,
        likesCount: likesCount.status === 'fulfilled' ? likesCount.value : 0
      };

      console.log("✅ User stats loaded:", stats);
      setUserStats(stats);
    } catch (error) {
      console.error("❌ Error loading user stats:", error);
      setUserStats({
        plantsCount: 0,
        postsCount: 0,
        likesCount: 0,
        scansCount: 0
      });
    }
  };

  // Refresh stats
  const refreshStats = async () => {
    if (!userData) return;
    
    try {
      console.log("🔄 Refreshing user stats...");
      await loadUserStats(userData.uid);
      Alert.alert("Success", "Stats updated!");
    } catch (error) {
      console.error("Error refreshing stats:", error);
      Alert.alert("Error", "Failed to refresh stats");
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all local storage
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("user_token");
            await AsyncStorage.removeItem(PLANT_PHOTOS_STORAGE_KEY);
            // Keep profile picture on sign out? Remove next line if you want to keep it
            // await AsyncStorage.removeItem(PROFILE_PIC_STORAGE_KEY);

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
      icon: "camera-outline",
      title: "My Scans",
      subtitle: "View your plant scan history",
      onPress: () => router.push("/tabs/camera"),
    },
    {
      icon: "chatbubble-outline",
      title: "My Posts",
      subtitle: "View your forum posts",
      onPress: () => router.push("/tabs/forum"),
    },
    {
      icon: "refresh-outline",
      title: "Refresh Stats",
      subtitle: "Update your statistics",
      onPress: refreshStats,
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
    { label: "Plants", value: userStats.plantsCount },
    { label: "Posts", value: userStats.postsCount },
    { label: "Likes", value: userStats.likesCount },
    { label: "Scans", value: userStats.scansCount },
  ];

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={48} color="#3f704d" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.errorButtonText}>Go to Login</Text>
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
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={refreshStats}
          >
            <Ionicons name="refresh-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleEditPhoto}
            onLongPress={handleProfilePictureLongPress}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : userData.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editPhotoButton}
              onPress={handleEditPhoto}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.userName}>{userData.displayName}</Text>
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