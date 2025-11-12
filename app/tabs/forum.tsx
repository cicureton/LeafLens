import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { forumAPI } from "../../app/api";
import { styles } from "../styles/forumstyle";

// Define Post type matching your backend schema
interface Post {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  timestamp: string;
  author?: string;
  replies?: number;
  likes?: number;
  isLiked?: boolean;
  category?: string;
  tags?: string[];
  like_count?: number; // Add this to match backend
}

interface Reply {
  reply_id: number;
  post_id: number;
  user_id: number;
  content: string;
  timestamp: string;
  author?: string;
}

// Key for storing liked posts
const LIKED_POSTS_KEY = "@forum_liked_posts";

const ForumScreen = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("plant-care");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forumPosts, setForumPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replying, setReplying] = useState(false);
  const [liking, setLiking] = useState<number | null>(null);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<number>>(new Set());

  // Load user data and forum posts
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        // Load liked posts for this user
        await loadUserLikedPosts(parsedData.uid);
      }
      // Always load forum posts, even if user is not logged in
      await loadForumPosts();
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  // Load user's liked posts from storage
  const loadUserLikedPosts = async (userId: string) => {
    try {
      const userLikesKey = `${LIKED_POSTS_KEY}_${userId}`;
      const storedLikes = await AsyncStorage.getItem(userLikesKey);
      if (storedLikes) {
        const likedArray = JSON.parse(storedLikes);
        setUserLikedPosts(new Set(likedArray));
      }
    } catch (error) {
      console.error("Error loading user liked posts:", error);
    }
  };

  // Save user's liked posts to storage
  const saveUserLikedPosts = async (
    userId: string,
    likedPosts: Set<number>
  ) => {
    try {
      const userLikesKey = `${LIKED_POSTS_KEY}_${userId}`;
      const likedArray = Array.from(likedPosts);
      await AsyncStorage.setItem(userLikesKey, JSON.stringify(likedArray));
      setUserLikedPosts(likedPosts);
    } catch (error) {
      console.error("Error saving user liked posts:", error);
    }
  };

  // Load forum posts from backend - FIXED VERSION
  const loadForumPosts = async () => {
    try {
      const response = await forumAPI.getForumPosts();
      const backendPosts = response.data || [];

      // Transform backend data to frontend format
      const transformedPosts = await Promise.all(
        backendPosts.map(async (post: any) => {
          try {
            // Get reply count for this post
            let replyCount = 0;
            try {
              const repliesResponse = await forumAPI.getReplies(post.post_id);
              replyCount = repliesResponse.data?.length || 0;
            } catch (error) {
              console.error(
                "Error loading replies for post:",
                post.post_id,
                error
              );
            }

            // Use like_count from backend response
            const likeCount = post.like_count || 0;

            // Check if current user has liked this post
            const isLiked = userData ? userLikedPosts.has(post.post_id) : false;

            return {
              post_id: post.post_id,
              user_id: post.user_id,
              title: post.title,
              content: post.content,
              timestamp: post.timestamp,
              author: `User${post.user_id}`,
              replies: replyCount,
              likes: likeCount, // Use the actual like count from backend
              isLiked: isLiked,
              category: extractCategoryFromContent(post.content),
              tags: extractTagsFromContent(post.content),
            };
          } catch (error) {
            console.error("Error processing post:", post.post_id, error);
            return {
              post_id: post.post_id,
              user_id: post.user_id,
              title: post.title,
              content: post.content,
              timestamp: post.timestamp,
              author: `User${post.user_id}`,
              replies: 0,
              likes: post.like_count || 0, // Fallback to backend data
              isLiked: false,
              category: "plant-care",
              tags: ["help"],
            };
          }
        })
      );

      setForumPosts(transformedPosts);
    } catch (error) {
      console.error("Error loading forum posts:", error);
      Alert.alert("Error", "Failed to load forum posts");
      setForumPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle liking a post - FIXED VERSION
  const handleLike = async (postId: number) => {
    if (!userData) {
      Alert.alert("Sign In Required", "Please sign in to like posts");
      return;
    }

    setLiking(postId);
    try {
      const userId = userData.uid ? parseInt(userData.uid) : userData.id || 1;

      const response = await forumAPI.toggleLike(postId, userId);

      // FIX: Use the response data correctly
      const { liked, like_count } = response.data;

      // Update user's liked posts in storage
      const newLikedPosts = new Set(userLikedPosts);
      if (liked) {
        newLikedPosts.add(postId);
      } else {
        newLikedPosts.delete(postId);
      }

      await saveUserLikedPosts(userData.uid, newLikedPosts);

      // Update forum posts with new like status and count
      setForumPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                likes: like_count, // Use the like_count from backend response
                isLiked: liked, // Use the liked status from backend response
              }
            : post
        )
      );

      // Update selected post if it's currently viewed
      if (selectedPost && selectedPost.post_id === postId) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                likes: like_count,
                isLiked: liked,
              }
            : null
        );
      }
    } catch (error: any) {
      console.error("Error liking post:", error);
      Alert.alert("Error", "Failed to like post. Please try again.");
    } finally {
      setLiking(null);
    }
  };

  // Handle viewing replies - FIXED VERSION
  const handleViewReplies = async (post: Post) => {
    if (!userData) {
      Alert.alert("Sign In Required", "Please sign in to view replies");
      return;
    }

    setSelectedPost(post);
    setShowRepliesModal(true);
    await loadReplies(post.post_id);
  };

  // Load replies for a post - FIXED VERSION
  const loadReplies = async (postId: number) => {
    setLoadingReplies(true);
    try {
      const response = await forumAPI.getReplies(postId);
      const backendReplies = response.data || [];

      const transformedReplies = backendReplies.map((reply: any) => ({
        reply_id: reply.reply_id,
        post_id: reply.post_id,
        user_id: reply.user_id,
        content: reply.content,
        timestamp: reply.timestamp,
        author: `User${reply.user_id}`,
      }));

      setReplies(transformedReplies);
    } catch (error) {
      console.error("Error loading replies:", error);
      Alert.alert("Error", "Failed to load replies");
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Handle creating a reply - FIXED VERSION
  const handleCreateReply = async () => {
    if (!userData || !selectedPost) {
      Alert.alert("Sign In Required", "Please sign in to reply");
      return;
    }

    if (!newReplyContent.trim()) {
      Alert.alert("Error", "Please enter a reply");
      return;
    }

    setReplying(true);
    try {
      const userId = userData.uid ? parseInt(userData.uid) : userData.id || 1;

      await forumAPI.createReply(selectedPost.post_id, {
        user_id: userId,
        content: newReplyContent.trim(),
      });

      // Refresh replies
      await loadReplies(selectedPost.post_id);

      // Update post reply count
      setForumPosts((prev) =>
        prev.map((post) =>
          post.post_id === selectedPost.post_id
            ? { ...post, replies: (post.replies || 0) + 1 }
            : post
        )
      );

      // Update selected post
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              replies: (prev.replies || 0) + 1,
            }
          : null
      );

      setNewReplyContent("");
      setShowReplyInput(false);
      Alert.alert("Success", "Reply posted!");
    } catch (error: any) {
      console.error("Error creating reply:", error);
      Alert.alert("Error", "Failed to post reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  // Handle creating a new post - FIXED: Include like_count
  const handleCreatePost = async () => {
    if (!userData) {
      Alert.alert("Sign In Required", "Please sign in to create posts");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Please fill in both title and content");
      return;
    }

    setPosting(true);
    try {
      const userId = userData.uid ? parseInt(userData.uid) : userData.id || 1;

      // FIX:
      const newPostData = {
        user_id: userId,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        // ❌ REMOVE THIS: like_count: 0 because backend handles it
      };

      console.log("📤 Sending post data:", newPostData); // Debug log

      const response = await forumAPI.createForumPost(newPostData);
      const backendPost = response.data;

      console.log("✅ Post created successfully:", backendPost); // Debug log

      const newPost: Post = {
        post_id: backendPost.post_id,
        user_id: userId,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        timestamp: new Date().toISOString(),
        author: userData.displayName || `User${userId}`,
        replies: 0,
        likes: 0, // New posts start with 0 likes
        isLiked: false,
        category: selectedCategory,
        tags: extractTagsFromContent(newPostContent),
      };

      setForumPosts([newPost, ...forumPosts]);
      setNewPostTitle("");
      setNewPostContent("");
      setSelectedCategory("plant-care");
      setShowNewPostModal(false);

      Alert.alert("Success", "Your post has been published!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      console.error("Error details:", error.response?.data); // More detailed error logging

      // Show more specific error message
      if (error.response?.data?.detail) {
        Alert.alert(
          "Validation Error",
          JSON.stringify(error.response.data.detail)
        );
      } else {
        Alert.alert("Error", "Failed to create post. Please try again.");
      }
    } finally {
      setPosting(false);
    }
  };

  // Handle pull-to-refresh - FIXED VERSION
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Reload both user data and forum posts
      await loadUserData();
    } catch (error) {
      console.error("Error refreshing forum:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to extract category from content
  const extractCategoryFromContent = (content: string) => {
    const contentLower = content.toLowerCase();
    if (
      contentLower.includes("disease") ||
      contentLower.includes("pest") ||
      contentLower.includes("fungus")
    )
      return "diseases";
    if (
      contentLower.includes("soil") ||
      contentLower.includes("fertilizer") ||
      contentLower.includes("compost")
    )
      return "soil";
    if (
      contentLower.includes("identify") ||
      contentLower.includes("what plant") ||
      contentLower.includes("what is this")
    )
      return "identification";
    return "plant-care";
  };

  // Helper function to extract tags from content
  const extractTagsFromContent = (content: string) => {
    const tags = [];
    const contentLower = content.toLowerCase();

    if (contentLower.includes("water") || contentLower.includes("watering"))
      tags.push("watering");
    if (contentLower.includes("sun") || contentLower.includes("light"))
      tags.push("sunlight");
    if (contentLower.includes("leaf") || contentLower.includes("leaves"))
      tags.push("leaves");
    if (contentLower.includes("grow") || contentLower.includes("growth"))
      tags.push("growth");
    if (contentLower.includes("bug") || contentLower.includes("insect"))
      tags.push("pests");

    return tags.length > 0 ? tags : ["help"];
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  // Handle closing modals
  const handleCloseModals = () => {
    setShowNewPostModal(false);
    setShowRepliesModal(false);
    setShowReplyInput(false);
    setNewReplyContent("");
    setSelectedPost(null);
    setReplies([]);
  };

  // Handle closing new post modal
  const handleCloseNewPostModal = () => {
    setNewPostTitle("");
    setNewPostContent("");
    setSelectedCategory("plant-care");
    setShowNewPostModal(false);
  };

  // Handle pressing new post button
  const handleNewPostPress = () => {
    if (!userData) {
      Alert.alert("Sign In Required", "Please sign in to create posts");
      return;
    }
    setShowNewPostModal(true);
  };

  // Filter posts based on search query and active category tab
  const filteredPosts = forumPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags &&
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesCategory = activeTab === "all" || post.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  // Render individual post item
  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorAvatar}>👤</Text>
          <View>
            <Text style={styles.author}>
              {item.user_id === (userData?.uid ? parseInt(userData.uid) : -1)
                ? userData?.displayName || "You"
                : item.author}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
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
            {categories.find((cat) => cat.id === item.category)?.name ||
              "General"}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewReplies(item)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.actionText}>{item.replies || 0} replies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.post_id)}
          disabled={liking === item.post_id}
        >
          {liking === item.post_id ? (
            <ActivityIndicator size="small" color="#e74c3c" />
          ) : (
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={18}
              color={item.isLiked ? "#e74c3c" : "#666"}
            />
          )}
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes || 0} likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render individual reply item
  const renderReplyItem = ({ item }: { item: Reply }) => (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <Text style={styles.authorAvatar}>👤</Text>
        <View style={styles.replyAuthorInfo}>
          <Text style={styles.replyAuthor}>
            {item.user_id === (userData?.uid ? parseInt(userData.uid) : -1)
              ? userData?.displayName || "You"
              : item.author}
          </Text>
          <Text style={styles.replyTimestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
      <Text style={styles.replyContent}>{item.content}</Text>
    </View>
  );

  const categories = [
    { id: "all", name: "All Topics", icon: "🌿", color: "#3f704d" },
    { id: "plant-care", name: "Plant Care", icon: "💧", color: "#4a90e2" },
    { id: "diseases", name: "Diseases", icon: "🐛", color: "#e74c3c" },
    { id: "soil", name: "Soil & Fertilizer", icon: "🪴", color: "#8b4513" },
    { id: "identification", name: "Plant ID", icon: "🔍", color: "#f39c12" },
  ];

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3f704d" />
          <Text style={styles.loadingText}>Loading forum...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Plant Community</Text>
          <Text style={styles.headerSubtitle}>
            {userData
              ? `Welcome, ${userData?.displayName || "Plant Lover"}!`
              : "Ask questions, share tips, help fellow plant lovers"}
          </Text>
        </View>
        {userData ? (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => {
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
        keyExtractor={(item) => item.post_id.toString()}
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
              {userData ? "No posts found" : "Sign in to join the discussion"}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {userData
                ? "Try changing your search or category filter"
                : "Connect with fellow plant lovers"}
            </Text>
            {userData && (
              <TouchableOpacity
                style={styles.createFirstPostButton}
                onPress={handleNewPostPress}
              >
                <Text style={styles.createFirstPostText}>
                  Create First Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Create New Post Button - Only show if signed in */}
      {userData && (
        <TouchableOpacity style={styles.fab} onPress={handleNewPostPress}>
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseNewPostModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={handleCloseNewPostModal}>
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
              maxLength={100}
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
              maxLength={1000}
            />

            <Text style={styles.inputLabel}>Category</Text>
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
              onPress={handleCloseNewPostModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!newPostTitle.trim() || !newPostContent.trim()) &&
                  styles.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={
                !newPostTitle.trim() || !newPostContent.trim() || posting
              }
            >
              {posting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.postButtonText}>Publish Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Replies Modal */}
      <Modal
        visible={showRepliesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModals}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModals}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedPost?.replies || 0} Replies
            </Text>
            <TouchableOpacity onPress={handleCloseModals}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Original Post */}
          {selectedPost && (
            <View style={styles.originalPost}>
              <Text style={styles.originalPostTitle}>{selectedPost.title}</Text>
              <Text style={styles.originalPostContent}>
                {selectedPost.content}
              </Text>
              <View style={styles.originalPostFooter}>
                <Text style={styles.originalPostAuthor}>
                  By {selectedPost.author}
                </Text>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(selectedPost.post_id)}
                  disabled={liking === selectedPost.post_id}
                >
                  {liking === selectedPost.post_id ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <Ionicons
                      name={selectedPost.isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={selectedPost.isLiked ? "#e74c3c" : "#666"}
                    />
                  )}
                  <Text style={styles.likeCount}>{selectedPost.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Replies List */}
          <FlatList
            data={replies}
            renderItem={renderReplyItem}
            keyExtractor={(item) => item.reply_id.toString()}
            contentContainerStyle={styles.repliesList}
            ListEmptyComponent={
              <View style={styles.emptyReplies}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.emptyRepliesText}>No replies yet</Text>
                <Text style={styles.emptyRepliesSubtext}>
                  Be the first to reply to this post!
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={loadingReplies}
                onRefresh={() =>
                  selectedPost && loadReplies(selectedPost.post_id)
                }
              />
            }
          />

          {/* Reply Input */}
          {userData && (
            <View style={styles.replyInputContainer}>
              {showReplyInput ? (
                <View style={styles.replyInput}>
                  <TextInput
                    style={styles.replyTextInput}
                    placeholder="Write your reply..."
                    value={newReplyContent}
                    onChangeText={setNewReplyContent}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={styles.cancelReplyButton}
                      onPress={() => setShowReplyInput(false)}
                    >
                      <Text style={styles.cancelReplyText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.postReplyButton,
                        (!newReplyContent.trim() || replying) &&
                          styles.postReplyButtonDisabled,
                      ]}
                      onPress={handleCreateReply}
                      disabled={!newReplyContent.trim() || replying}
                    >
                      {replying ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.postReplyText}>Reply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addReplyButton}
                  onPress={() => setShowReplyInput(true)}
                >
                  <Ionicons name="add" size={20} color="#3f704d" />
                  <Text style={styles.addReplyText}>Add a reply</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ForumScreen;
