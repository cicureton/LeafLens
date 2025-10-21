import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/homestyle";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();

  // State for posts with like functionality
  const [recentPosts, setRecentPosts] = useState([
    {
      id: 1,
      username: "plantlover23",
      content:
        "My Monstera recently had blight and I used neem oil to fix it! Worked like a charm!",
      timestamp: "2 hours ago",
      likes: 12,
      isLiked: false,
    },
    {
      id: 2,
      username: "greenthumb42",
      content:
        "Just propagated my snake plant successfully! Here's how I did it step by step...",
      timestamp: "5 hours ago",
      likes: 8,
      isLiked: false,
    },
    {
      id: 3,
      username: "botanyfan99",
      content:
        "Does anyone know why my fern's leaves are turning brown? Humidity is at 60%...",
      timestamp: "1 day ago",
      likes: 15,
      isLiked: false,
    },
  ]);

  const [yourPosts, setYourPosts] = useState([
    {
      id: 1,
      username: "You",
      content: "My plant is sick, what i do.",
      timestamp: "1 hour ago",
      likes: 3,
      isLiked: false,
    },
    {
      id: 2,
      username: "You",
      content: "How do I know if I have 80 HDs?",
      timestamp: "3 days ago",
      likes: 7,
      isLiked: false,
    },
    {
      id: 3,
      username: "You",
      content: "Anyone single?",
      timestamp: "1 week ago",
      likes: 5,
      isLiked: false,
    },
  ]);

  // Function to handle like/unlike for recent posts
  const handleLikeRecentPost = (postId: number) => {
    setRecentPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  // Function to handle like/unlike for your posts
  const handleLikeYourPost = (postId: number) => {
    setYourPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  // quick action buttons icons
  const quickActions = [
    {
      id: 1,
      icon: "camera",
      title: "Scan Plant",
      color: "#8BC34A",
      route: "/tabs/camera",
    },
    {
      id: 2,
      icon: "chatbubbles",
      title: "Community",
      color: "#FF9800",
      route: "/tabs/forum",
    },
    {
      id: 3,
      icon: "leaf",
      title: "My Plants",
      color: "#4CAF50",
      route: "/tabs/plants",
    },
    {
      id: 4,
      icon: "person",
      title: "Profile",
      color: "#2196F3",
      route: "/tabs/profile",
    },
  ];

  const handleQuickActionPress = (route: string) => {
    router.push(route);
  };

  // render post with clickable likes
  const renderPostItem = ({ item, isYourPost = false }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.likeContainer}
          onPress={() =>
            isYourPost
              ? handleLikeYourPost(item.id)
              : handleLikeRecentPost(item.id)
          }
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={18}
            color={item.isLiked ? "#e74c3c" : "#666"}
          />
          <Text style={[styles.likeCount, item.isLiked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // render the QAB
  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: item.color }]}
      onPress={() => handleQuickActionPress(item.route)}
    >
      <Ionicons name={item.icon} size={24} color="white" />
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // display
  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>LeafLens</Text>
              <Text style={styles.subtitle}>
                Discover, Diagnose, and Share Plants!
              </Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search plants, diseases, tips..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <FlatList
          data={quickActions}
          renderItem={renderQuickAction}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
        />

        {/* Recent Posts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Community Posts</Text>
          <TouchableOpacity onPress={() => router.push("/tabs/forum")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentPosts}
          renderItem={({ item }) => renderPostItem({ item, isYourPost: false })}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
          snapToInterval={width * 0.8 + 20}
          decelerationRate="fast"
        />

        {/* Your Posts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recent Posts</Text>
          <TouchableOpacity onPress={() => router.push("/tabs/forum")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={yourPosts}
          renderItem={({ item }) => renderPostItem({ item, isYourPost: true })}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
          snapToInterval={width * 0.8 + 20}
          decelerationRate="fast"
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/tabs/camera")}
      >
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
