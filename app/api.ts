import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://leaflens-16s1.onrender.com";

// In api.ts - FIX the apiCall return format
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const token = await AsyncStorage.getItem("user_token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`🔵 Making ${options.method || "GET"} request to: ${url}`);
    console.log(
      `🔵 Request payload:`,
      options.body ? JSON.parse(options.body as string) : "No body"
    );

    const response = await fetch(url, config);

    console.log(
      `🔵 Response status: ${response.status} ${response.statusText}`
    );

    const responseText = await response.text();
    console.log(`🔵 Raw response body:`, responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText, raw: responseText };
      }

      console.log(`🔴 Detailed error:`, errorData);

      throw {
        message: `API error: ${response.status} - ${response.statusText}`,
        status: response.status,
        data: errorData,
        url,
        method: options.method || "GET",
      };
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`🟢 Success response:`, responseData);

    // FIX: Return the expected format with data property
    return { data: responseData };
  } catch (error) {
    console.error(`🔴 API call failed: ${endpoint}`, error);
    throw error;
  }
};

// File upload API call
const apiUpload = async (endpoint: string, formData: FormData) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const token = await AsyncStorage.getItem("user_token");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`🔴 Upload failed: ${endpoint}`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // In authAPI.register - Fix the return format
  register: async (userData: {
    name: string;
    email: string;
    password_hash: string;
    user_type?: string;
  }) => {
    console.log("🟡 Registration attempt with data:", {
      ...userData,
      password_hash: "[HIDDEN]",
    });

    const correctPayload = {
      name: userData.name,
      email: userData.email,
      password_hash: userData.password_hash,
      user_type: userData.user_type || "user",
    };

    console.log("🟡 Sending correct payload:", {
      ...correctPayload,
      password_hash: "[HIDDEN]",
    });

    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(correctPayload),
      });

      const responseText = await response.text();
      console.log("🟡 Raw response:", responseText);

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = {
            message: "Registration successful",
            raw: responseText,
          };
        }
        console.log("🟢 Registration successful!");

        // FIX: Return the same format
        return { data: responseData };
      } else {
        console.log(
          `🔴 Registration failed with status ${response.status}:`,
          responseText
        );
        throw {
          status: response.status,
          data: responseText,
          message: `Registration failed: ${response.status}`,
        };
      }
    } catch (error) {
      console.error("🔴 Registration error:", error);
      throw error;
    }
  },

  // Updated login function to match backend expectations
  login: async (email: string, password: string) => {
    console.log("🟡 Login attempt for:", email);

    try {
      // Get all users to find matching email
      const usersResponse = await apiCall("/users/");
      console.log("🟡 Users response:", usersResponse);

      // Handle different response structures
      const users = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse.data
        ? usersResponse.data
        : [];

      const user = users.find((u: any) => u.email === email);

      if (!user) {
        console.log("🔴 User not found with email:", email);
        throw new Error("User not found");
      }

      console.log("🟢 User found:", {
        id: user.user_id,
        email: user.email,
        name: user.name,
      });

      // In a real app, you'd verify the password hash properly
      // For now, we'll assume any password works for development
      return {
        user: {
          id: user.user_id || user.id,
          email: user.email,
          name: user.name,
          user_type: user.user_type || "user",
        },
        access_token: user.access_token || `token-${user.user_id || user.id}`,
      };
    } catch (error: any) {
      console.error("🔴 Login failed:", error);
      throw new Error("Login failed: " + error.message);
    }
  },
};

// Users API
export const usersAPI = {
  getUsers: () => apiCall("/users/"),
  getUser: (userId: string) => apiCall(`/users/${userId}`),
  updateUser: (userId: string, userData: any) =>
    apiCall(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  deleteUser: (userId: string) =>
    apiCall(`/users/${userId}`, {
      method: "DELETE",
    }),
  // ADD THIS FUNCTION:
  getUserStats: async (userId: string) => {
    return apiCall(`/users/${userId}/stats`);
  },
};

// Plants API
export const plantsAPI = {
  getPlants: () => apiCall("/plants/"),
  getPlant: (plantId: string) => apiCall(`/plants/${plantId}`),
  createPlant: (plantData: any) =>
    apiCall("/plants/", {
      method: "POST",
      body: JSON.stringify(plantData),
    }),
  updatePlant: (plantId: string, plantData: any) =>
    apiCall(`/plants/${plantId}`, {
      method: "PUT",
      body: JSON.stringify(plantData),
    }),
  deletePlant: (plantId: string) =>
    apiCall(`/plants/${plantId}`, {
      method: "DELETE",
    }),
};

// Scans API
export const scansAPI = {
  getScans: (userId?: string, plantId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (plantId) params.append("plant_id", plantId);

    return apiCall(`/scans/?${params.toString()}`);
  },
  createScan: (scanData: any) =>
    apiCall("/scans/", {
      method: "POST",
      body: JSON.stringify(scanData),
    }),
  getScan: (scanId: string) => apiCall(`/scans/${scanId}`),
};

// Scan Images API
export const scanImagesAPI = {
  getScanImages: () => apiCall("/scan_images/"),
  uploadScanImage: (scanId: number, imageData: FormData) =>
    apiUpload("/scan_images/", imageData),
};

// Diseases API
export const diseasesAPI = {
  getDiseases: () => apiCall("/diseases/"),
  getDisease: (diseaseId: string) => apiCall(`/diseases/${diseaseId}`),
  createDisease: (diseaseData: any) =>
    apiCall("/diseases/", {
      method: "POST",
      body: JSON.stringify(diseaseData),
    }),
};

// Forum API - FIXED version
export const forumAPI = {
  // Get all forum posts
  getForumPosts: async (plant?: string, disease?: string) => {
    const params = new URLSearchParams();
    if (plant) params.append("plant", plant);
    if (disease) params.append("disease", disease);

    const queryString = params.toString();
    const url = queryString ? `/forum_posts/?${queryString}` : `/forum_posts/`;

    return apiCall(url);
  },

  // Create new forum post
  createForumPost: async (postData: {
    user_id: number;
    title: string;
    content: string;
  }) => {
    return apiCall("/forum_posts/", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  // Get single forum post
  getForumPost: async (postId: number) => {
    return apiCall(`/forum_posts/${postId}`);
  },

  // Get replies for a post
  getReplies: async (postId: number) => {
    return apiCall(`/forum_posts/${postId}/replies`);
  },

  // Create a reply
  createReply: async (
    postId: number,
    replyData: { user_id: number; content: string }
  ) => {
    return apiCall(`/forum_posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        user_id: replyData.user_id,
        content: replyData.content,
      }),
    });
  },

  // Like/unlike a post
  toggleLike: async (postId: number, userId: number) => {
    return apiCall(`/forum_posts/${postId}/like`, {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        user_id: userId,
      }),
    });
  },

  // Get user stats
  getUserStats: async (userId: number) => {
    return apiCall(`/users/${userId}/stats`);
  },
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: () => apiCall("/recommendations/"),
  createRecommendation: (recommendationData: any) =>
    apiCall("/recommendations/", {
      method: "POST",
      body: JSON.stringify(recommendationData),
    }),
};

// Weather API
export const weatherAPI = {
  getWeather: () => apiCall("/weather/"),
  createWeather: (weatherData: any) =>
    apiCall("/weather/", {
      method: "POST",
      body: JSON.stringify(weatherData),
    }),
};

// Photo Storage Utility
export const PhotoStorage = {
  savePhotos: async (photos: any[]) => {
    try {
      await AsyncStorage.setItem("@plant_photos", JSON.stringify(photos));
      console.log("💾 Photos saved to storage:", photos.length);
      return true;
    } catch (error) {
      console.error("❌ Error saving photos:", error);
      return false;
    }
  },

  loadPhotos: async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem("@plant_photos");
      if (savedPhotos) {
        const photos = JSON.parse(savedPhotos);
        console.log("💾 Photos loaded from storage:", photos.length);
        return photos.map((photo: any) => ({
          id: photo.id || Date.now().toString(),
          uri: photo.uri,
          timestamp: photo.timestamp || new Date().toLocaleString(),
          date: photo.date || new Date().toISOString(),
          selected: photo.selected || false,
        }));
      }
      console.log("💾 No photos found in storage");
      return [];
    } catch (error) {
      console.error("❌ Error loading photos:", error);
      return [];
    }
  },

  clearPhotos: async () => {
    try {
      await AsyncStorage.removeItem("@plant_photos");
      console.log("💾 Photos cleared from storage");
      return true;
    } catch (error) {
      console.error("❌ Error clearing photos:", error);
      return false;
    }
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  plants: plantsAPI,
  scans: scansAPI,
  scanImages: scanImagesAPI,
  diseases: diseasesAPI,
  forum: forumAPI,
  recommendations: recommendationsAPI,
  weather: weatherAPI,
  photoStorage: PhotoStorage,
};
