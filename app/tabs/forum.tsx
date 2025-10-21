import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { styles } from "../styles/forumstyle";

const ForumScreen = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("plant-care"); // Set default category

  // Sample forum data
  const [forumPosts, setForumPosts] = useState([
    {
      id: "1",
      title: "Help! My Monstera has yellow leaves",
      content:
        "I noticed my Monstera plant has been developing yellow leaves over the past week. The soil feels moist but not soggy. What could be causing this? I'm worried it might be root rot.",
      author: "plantlover23",
      replies: 12,
      likes: 24,
      timestamp: "2 hours ago",
      category: "plant-care",
      authorAvatar: "🌿",
      tags: ["monstera", "yellow-leaves", "help"],
      isLiked: false,
    },
    {
      id: "2",
      title: "Best soil mix for succulents?",
      content:
        "Looking for recommendations on the perfect soil mix for my succulent collection. I want something that provides good drainage but also retains some moisture.",
      author: "succulentqueen",
      replies: 8,
      likes: 15,
      timestamp: "5 hours ago",
      category: "soil",
      authorAvatar: "🌵",
      tags: ["succulents", "soil-mix", "drainage"],
      isLiked: true,
    },
  ]);

  // category filtering
  const categories = [
    { id: "all", name: "All Topics", icon: "🌿", color: "#3f704d" },
    { id: "plant-care", name: "Plant Care", icon: "💧", color: "#4a90e2" },
    { id: "diseases", name: "Diseases", icon: "🐛", color: "#e74c3c" },
    { id: "soil", name: "Soil & Fertilizer", icon: "🪴", color: "#8b4513" },
    { id: "identification", name: "Plant ID", icon: "🔍", color: "#f39c12" },
  ];

  // pull to refresh, refreshes forum content
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "Forum posts refreshed!");
    }, 1000);
  };

  // interactive posts, like, reply, share functionality
  const handleLike = (postId) => {
    setForumPosts((posts) =>
      posts.map((post) =>
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

  // create new post, modal for new discussions
  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Please fill in both title and content");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: "You",
      replies: 0,
      likes: 0,
      timestamp: "Just now",
      category: selectedCategory, // Use the selected category
      authorAvatar: "👤",
      tags: ["new"],
      isLiked: false,
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostTitle("");
    setNewPostContent("");
    setSelectedCategory("plant-care"); // Reset to default
    setShowNewPostModal(false);
    Alert.alert("Success", "Your post has been published!");
  };

  // search functionality, search post by title, content, tags
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

  // tag system and engagement metrics
  const renderPostItem = ({ item }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorAvatar}>{item.authorAvatar}</Text>
          <View>
            <Text style={styles.author}>{item.author}</Text>
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

  // Reset modal state when closed
  const handleCloseModal = () => {
    setNewPostTitle("");
    setNewPostContent("");
    setSelectedCategory("plant-care");
    setShowNewPostModal(false);
  };

  // displays the posts
  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Plant Community</Text>
          <Text style={styles.headerSubtitle}>
            Ask questions, share tips, help fellow plant lovers
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
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
            <Text style={styles.emptyStateText}>No posts found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your search or category filter
            </Text>
          </View>
        }
      />

      {/* Create New Post Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewPostModal(true)}
      >
        <Ionicons name="create" size={24} color="white" />
      </TouchableOpacity>

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

            {/* Show selected category */}
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
