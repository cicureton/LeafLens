import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
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
import { styles } from "../styles/homestyle";

const { width } = Dimensions.get("window");

interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  postId: number;
  user_id: number;
}

const Home = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State for posts with like functionality
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [yourPosts, setYourPosts] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState({
    plantsCount: 0,
    scansCount: 0,
    postsCount: 0
  });

  // New post modal state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [likingPost, setLikingPost] = useState<number | null>(null);

  // Load user data and content
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload content when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHomeContent();
    }, [userData])
  );

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all home content
  const loadHomeContent = async () => {
    try {
      await Promise.all([
        loadRecentPosts(),
        loadYourPosts(),
      ]);
    } catch (error) {
      console.error('Error loading home content:', error);
    }
  };

  // Load recent community posts
  const loadRecentPosts = async () => {
    try {
      const response = await forumAPI.getForumPosts();
      const backendPosts = response.data || [];
      
      console.log('Loaded recent posts:', backendPosts.length);
      
      const transformedPosts = backendPosts.slice(0, 5).map((post: any) => {
        const likeCount = post.like_count !== undefined ? post.like_count : 0;
        
        return {
          id: post.post_id,
          username: `User${post.user_id || 'Anonymous'}`,
          title: post.title || 'No Title',
          content: post.content?.length > 100 ? post.content.substring(0, 100) + '...' : post.content || 'No content',
          timestamp: post.timestamp ? formatTimestamp(post.timestamp) : 'Recently',
          likes: likeCount,
          isLiked: false,
          postId: post.post_id,
          user_id: post.user_id
        };
      });
      
      setRecentPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading recent posts:', error);
      setRecentPosts(getMockRecentPosts());
    }
  };

  // Load user's posts
  const loadYourPosts = async () => {
    if (!userData) {
      setYourPosts([]);
      return;
    }

    try {
      const response = await forumAPI.getForumPosts();
      const allPosts = response.data || [];
      
      const userPosts = allPosts.filter((post: any) => 
        post.user_id?.toString() === userData.uid
      ).slice(0, 5);
      
      const transformedPosts = userPosts.map((post: any) => {
        const likeCount = post.like_count !== undefined ? post.like_count : 0;
        
        return {
          id: post.post_id,
          username: userData.displayName || 'You',
          title: post.title || 'No Title',
          content: post.content?.length > 100 ? post.content.substring(0, 100) + '...' : post.content || 'No content',
          timestamp: post.timestamp ? formatTimestamp(post.timestamp) : 'Recently',
          likes: likeCount,
          isLiked: false,
          postId: post.post_id,
          user_id: post.user_id
        };
      });
      
      setYourPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading your posts:', error);
      setYourPosts([]);
    }
  };

  // Handle creating a new post
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

      const newPostData = {
        user_id: userId,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
      };

      console.log("📤 Creating new post:", newPostData);

      const response = await forumAPI.createForumPost(newPostData);
      const backendPost = response.data;

      console.log("✅ Post created successfully:", backendPost);

      // Create the new post object for immediate display
      const newPost: Post = {
        id: backendPost.post_id,
        username: userData.displayName || 'You',
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
        postId: backendPost.post_id,
        user_id: userId
      };

      // Add to both recent posts and your posts
      setRecentPosts(prev => [newPost, ...prev]);
      setYourPosts(prev => [newPost, ...prev]);

      // Reset form and close modal
      setNewPostTitle("");
      setNewPostContent("");
      setShowNewPostModal(false);

      Alert.alert("Success", "Your post has been published!");
    } catch (error: any) {
      console.error("❌ Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // Handle like/unlike
  const handleLikePost = async (postId: number, isYourPost: boolean = false) => {
    if (!userData) {
      router.push('/');
      return;
    }

    setLikingPost(postId);
    try {
      const userId = userData.uid ? parseInt(userData.uid) : userData.id || 1;
      
      const response = await forumAPI.toggleLike(postId, userId);
      const { liked, like_count } = response.data;

      // Update recent posts
      setRecentPosts(prevPosts =>
        prevPosts.map(post =>
          post.postId === postId
            ? {
                ...post,
                likes: like_count,
                isLiked: liked,
              }
            : post
        )
      );

      // Update your posts if it's in that list
      if (isYourPost) {
        setYourPosts(prevPosts =>
          prevPosts.map(post =>
            post.postId === postId
              ? {
                  ...post,
                  likes: like_count,
                  isLiked: liked,
                }
              : post
          )
        );
      }

    } catch (error: any) {
      console.error('Error liking post:', error);
      Alert.alert("Error", "Failed to like post. Please try again.");
    } finally {
      setLikingPost(null);
    }
  };

  // Format timestamp helper
  const formatTimestamp = (timestamp: string) => {
    try {
      const now = new Date();
      const postDate = new Date(timestamp);
      const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return postDate.toLocaleDateString();
    } catch (error) {
      return "Recently";
    }
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeContent();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Quick action buttons - Updated with Create Post
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
      icon: "create",
      title: "Create Post",
      color: "#FF9800",
      action: () => setShowNewPostModal(true),
    },
    {
      id: 3,
      icon: "chatbubbles",
      title: "Community",
      color: "#4CAF50",
      route: "/tabs/forum",
    },
    {
      id: 4,
      icon: "leaf",
      title: "My Plants",
      color: "#2196F3",
      route: "/tabs/plants",
    },
  ];

  // Stats cards
  const statsCards = [
    {
      id: 1,
      icon: "leaf",
      title: "My Plants",
      value: userStats.plantsCount,
      color: "#4CAF50",
      route: "/tabs/plants"
    },
    {
      id: 2,
      icon: "camera",
      title: "Scans",
      value: userStats.scansCount,
      color: "#2196F3",
      route: "/tabs/camera"
    },
    {
      id: 3,
      icon: "chatbubbles",
      title: "Posts",
      value: userStats.postsCount,
      color: "#FF9800",
      route: "/tabs/forum"
    },
  ];

  const handleQuickActionPress = (item: any) => {
    if (item.action) {
      if (!userData) {
        router.push('/');
        return;
      }
      item.action();
    } else if (item.route) {
      if (!userData && item.route !== "/tabs/forum") {
        router.push('/');
        return;
      }
      router.push(item.route);
    }
  };

  const handleStatCardPress = (route: string) => {
    if (!userData) {
      router.push('/');
      return;
    }
    router.push(route);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/tabs/forum',
        params: { search: searchQuery }
      });
    }
  };

  // Render post with clickable likes
  const renderPostItem = ({ item, isYourPost = false }: { item: Post; isYourPost?: boolean }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => router.push('/tabs/forum')}
    >
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      
      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.likeContainer}
          onPress={(e) => {
            e.stopPropagation();
            handleLikePost(item.postId, isYourPost);
          }}
          disabled={likingPost === item.postId}
        >
          {likingPost === item.postId ? (
            <ActivityIndicator size="small" color="#e74c3c" />
          ) : (
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={18}
              color={item.isLiked ? "#e74c3c" : "#666"}
            />
          )}
          <Text style={[styles.likeCount, item.isLiked && styles.likedText]}>
            {item.likes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.commentButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push('/tabs/forum');
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render quick action button
  const renderQuickAction = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: item.color }]}
      onPress={() => handleQuickActionPress(item)}
    >
      <Ionicons name={item.icon} size={24} color="white" />
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Render stat card
  const renderStatCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: item.color }]}
      onPress={() => handleStatCardPress(item.route)}
    >
      <Ionicons name={item.icon} size={24} color="white" />
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Mock data for fallback
  const getMockRecentPosts = () => [
    {
      id: 1,
      username: "PlantLover42",
      title: "Help with Yellow Leaves",
      content: "My monstera is developing yellow leaves. Anyone know what could be causing this? I water it once a week...",
      timestamp: "2 hours ago",
      likes: 15,
      isLiked: false,
      postId: 1,
      user_id: 1
    },
    {
      id: 2,
      username: "GreenThumb99",
      title: "Amazing Fertilizer Discovery",
      content: "Just discovered this amazing fertilizer for indoor plants! My pothos has never been happier 🌿",
      timestamp: "5 hours ago",
      likes: 23,
      isLiked: false,
      postId: 2,
      user_id: 2
    },
    {
      id: 3,
      username: "UrbanGardener",
      title: "Plant Identification Help",
      content: "Help identifying this plant? Found it at my local nursery but it wasn't labeled properly.",
      timestamp: "1 day ago",
      likes: 8,
      isLiked: false,
      postId: 3,
      user_id: 3
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3f704d" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3f704d"]}
            tintColor="#3f704d"
          />
        }
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
                {userData 
                  ? `Welcome back, ${userData.displayName || 'Plant Lover'}!` 
                  : "Discover, Diagnose, and Share Plants!"
                }
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
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

        {recentPosts.length > 0 ? (
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
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start a discussion!</Text>
            {userData && (
              <TouchableOpacity 
                style={styles.createPostButton}
                onPress={() => setShowNewPostModal(true)}
              >
                <Text style={styles.createPostText}>Create First Post</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Your Posts Section - Only show if logged in */}
        {userData && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Recent Posts</Text>
              <TouchableOpacity onPress={() => router.push("/tabs/forum")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {yourPosts.length > 0 ? (
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
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="create-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Share your plant experiences!</Text>
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={() => setShowNewPostModal(true)}
                >
                  <Text style={styles.createPostText}>Create First Post</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Sign In Prompt - Show if not logged in */}
        {!userData && (
          <View style={styles.signInPrompt}>
            <Ionicons name="leaf" size={64} color="#3f704d" />
            <Text style={styles.signInTitle}>Join the Community</Text>
            <Text style={styles.signInText}>
              Sign in to track your plants, share experiences, and get help from fellow plant lovers!
            </Text>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
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
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNewPostModal(false)}
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

      {/* Floating Action Button - Only show if logged in */}
      {userData && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowNewPostModal(true)}
        >
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Home;