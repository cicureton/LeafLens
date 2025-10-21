import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStorage from "expo-secure-store";
import React, { useState } from "react";
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
import { styles } from "../styles/profilestyle";

const ProfileScreen = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sample user data
  const userData = {
    username: "plantlover23",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    joinDate: "January 2024",
    plantsCount: 12,
    postsCount: 8,
    likesCount: 47,
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear any stored authentication tokens
            await SecureStorage.deleteItemAsync("auth_token");
            await AsyncStorage.removeItem("user_data");

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
    { label: "Plants", value: userData.plantsCount },
    { label: "Posts", value: userData.postsCount },
    { label: "Likes", value: userData.likesCount },
  ];

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
            {profileImage ? (
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

          <TouchableOpacity style={styles.editProfileButton}>
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