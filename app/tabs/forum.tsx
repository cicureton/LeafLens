import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../app/firebase";
import { styles } from "../styles/forumstyle";

// Define Post type
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  replies: number;
  likes: number;
  timestamp: string;
  category: string;
  authorAvatar: string;
  tags: string[];
  isLiked: boolean;
  likedBy: string[]; // Array of user IDs who liked the post
}

const ForumScreen = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("plant-care");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Try to get user data from AsyncStorage
        try {
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          } else {
            // Create basic user data from Firebase
            const basicUserData = {
              displayName: user.displayName || user.email?.split('@')[0] || 'Plant Lover',
              email: user.email,
              uid: user.uid
            };
            setUserData(basicUserData);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sample forum data - in a real app, this would come from your backend
  const [forumPosts, setForumPosts] = useState<Post[]>([
    {
      id: "1",
      title: "Help! My Monstera has yellow leaves",
      content: "I noticed my Monstera plant has been developing yellow leaves over the past week. The soil feels moist but not soggy. What could be causing this? I'm worried it might be root rot.",
      author: "plantlover23",
      authorId: "user123",
      replies: 12,
      likes: 24,
      timestamp: "2 hours ago",
      category: "plant-care",
      authorAvatar: "🌿",
      tags: ["monstera", "yellow-leaves", "help"],
      isLiked: false,
      likedBy: []
    },
    {
      id: "2",
      title: "Best soil mix for succulents?",
      content: "Looking for recommendations on the perfect soil mix for my succulent collection. I want something that provides good drainage but also retains some moisture.",
      author: "succulentqueen",
      authorId: "user456",
      replies: 8,
      likes: 15,
      timestamp: "5 hours ago",
      category: "soil",
      authorAvatar: "🌵",
      tags: ["succulents", "soil-mix", "drainage"],
      isLiked: false,
      likedBy: []
    },
  ]);

  const categories = [
    { id: "all", name: "All Topics", icon: "🌿", color: "#3f704d" },
    { id: "plant-care", name: "Plant Care", icon: "💧", color: "#4a90e2" },
    { id: "diseases", name: "Diseases", icon: "🐛", color: "#e74c3c" },
    { id: "soil", name: "Soil & Fertilizer", icon: "🪴", color: "#8b4513" },
    { id: "identification", name: "Plant ID", icon: "🔍", color: "#f39c12" },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call - in real app, fetch from your backend
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "Forum posts refreshed!");
    }, 1000);
  };

  // Handle liking a post
  const handleLike = (postId: string) => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to like posts");
      return;
    }

    setForumPosts((posts) =>
      posts.map((post) => {
        if (post.id === postId) {
          const userLiked = post.likedBy.includes(currentUser.uid);
          
          return {
            ...post,
            likes: userLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !userLiked,
            likedBy: userLiked 
              ? post.likedBy.filter(id => id !== currentUser.uid)
              : [...post.likedBy, currentUser.uid]
          };
        }
        return post;
      })
    );
  };

  // Handle creating a new post
  const handleCreatePost = () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to create posts");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Please fill in both title and content");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    // Create new post object
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: userData?.displayName || "Anonymous",
      authorId: currentUser.uid,
      replies: 0,
      likes: 0,
      timestamp: "Just now",
      category: selectedCategory,
      authorAvatar: "👤",
      tags: ["new"],
      isLiked: false,
      likedBy: []
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostTitle("");
    setNewPostContent("");
    setSelectedCategory("plant-care");
    setShowNewPostModal(false);
    Alert.alert("Success", "Your post has been published!");
  };

  // Filter posts based on search query and active category tab
  const filteredPosts = forumPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory = activeTab === "all" || post.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Render individual post item
  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorAvatar}>{item.authorAvatar}</Text>
          <View>
            <Text style={styles.author}>
              {item.authorId === currentUser?.uid ? userData?.displayName : item.author}
            </Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
        <View
          style={[
            styles.categoryTag,
            {
              backgroundColor:
                categories.find((cat) => cat.id === item.category)?.color ||
                "#3f704d",
            },
          ]}
        >
          <Text style={styles.categoryText}>
            {categories.find((cat) => cat.id === item.category)?.name}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.actionText}>{item.replies} replies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={18}
            color={item.isLiked ? "#e74c3c" : "#666"}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes} likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Handle closing new post modal
  const handleCloseModal = () => {
    setNewPostTitle("");
    setNewPostContent("");
    setSelectedCategory("plant-care");
    setShowNewPostModal(false);
  };

  // Handle pressing new post button
  const handleNewPostPress = () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to create posts");
      return;
    }
    setShowNewPostModal(true);
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main forum screen
  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Plant Community</Text>
          <Text style={styles.headerSubtitle}>
            {currentUser 
              ? `Welcome, ${userData?.displayName || 'Plant Lover'}!` 
              : "Ask questions, share tips, help fellow plant lovers"}
          </Text>
        </View>
        {currentUser ? (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => {
              // Navigate to login screen
              // You might need to adjust this based on your routing
              Alert.alert("Sign In", "Please sign in to access all features");
            }}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants, diseases, tips..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                activeTab === category.id && {
                  backgroundColor: category.color,
                },
              ]}
              onPress={() => setActiveTab(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  activeTab === category.id && { color: "white" },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Forum Posts */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3f704d"]}
            tintColor={"#3f704d"}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {currentUser ? "No posts found" : "Sign in to join the discussion"}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {currentUser 
                ? "Try changing your search or category filter" 
                : "Connect with fellow plant lovers"}
            </Text>
          </View>
        }
      />

      {/* Create New Post Button - Only show if signed in */}
      {currentUser && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewPostPress}
        >
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your plant question?"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              multiline
            />

            <Text style={styles.inputLabel}>Content *</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Describe your plant issue or share your experience..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <View style={styles.categoryOptions}>
              {categories
                .filter((cat) => cat.id !== "all")
                .map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && {
                        backgroundColor: category.color,
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory === category.id &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {selectedCategory && (
              <View style={styles.selectedCategoryDisplay}>
                <Text style={styles.selectedCategoryText}>
                  Selected:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {
                      categories.find((cat) => cat.id === selectedCategory)
                        ?.name
                    }
                  </Text>
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!newPostTitle.trim() ||
                  !newPostContent.trim() ||
                  !selectedCategory) &&
                  styles.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={
                !newPostTitle.trim() ||
                !newPostContent.trim() ||
                !selectedCategory
              }
            >
              <Text style={styles.postButtonText}>Publish Post</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ForumScreen;