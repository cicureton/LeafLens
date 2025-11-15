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

// In your api.ts - Update the analysisAPI
export const analysisAPI = {
  analyzePhoto: async (
    imageUri: string,
    user_id: number,
    plant_id?: number
  ) => {
    try {
      console.log("🟡 Starting photo analysis...");

      // Create form data
      const formData = new FormData();

      // Get the file name from the URI
      const filename = imageUri.split("/").pop() || "photo.jpg";

      // Append the image file
      formData.append("files", {
        uri: imageUri,
        type: "image/jpeg",
        name: filename,
      } as any);

      // Append user_id as form field
      formData.append("user_id", user_id.toString());

      // Append plant_id if provided
      if (plant_id) {
        formData.append("plant_id", plant_id.toString());
        console.log("🟡 Including plant_id in analysis:", plant_id);
      }

      console.log("🟡 Sending analysis request with:", {
        user_id,
        plant_id: plant_id || "not provided",
        hasImage: !!imageUri,
        filename,
      });

      const response = await fetch(
        `${API_BASE_URL}/predict_species_and_disease_batch`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();
      console.log(`🟡 Analysis response status: ${response.status}`);

      if (!response.ok) {
        console.log("🔴 Analysis failed with response:", responseText);
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText };
        }
        throw {
          status: response.status,
          data: errorData,
          message: `Analysis failed: ${response.status}`,
        };
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.log("🔴 Failed to parse response as JSON:", responseText);
        throw new Error("Invalid response from server");
      }

      console.log("🟢 Analysis successful:", responseData);
      return responseData;
    } catch (error: any) {
      console.error("🔴 Analysis error:", error);
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: "Network error during analysis",
        originalError: error,
      };
    }
  },
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
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    user_type?: string;
  }) => {
    try {
      console.log("🚀 Starting registration...");
      console.log("🟡 Sending registration with password_hash field");

      const payload = {
        name: userData.name,
        email: userData.email,
        password_hash: userData.password,
        user_type: userData.user_type || "gardener", // ✅ FIXED - Use parameter value
      };

      console.log("🟡 Full payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(`🟡 Response status: ${response.status}`);

      const responseText = await response.text();
      console.log("🟡 Raw response:", responseText);

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log("🟢 REAL backend registration successful!", responseData);

          return {
            data: responseData,
            user: responseData,
            status: response.status,
            isMock: false,
          };
        } catch (parseError) {
          console.log("🟡 Backend returned non-JSON response");
          return {
            data: {
              user_id: Date.now(),
              ...payload,
              message: responseText,
            },
            user: {
              user_id: Date.now(),
              ...payload,
              message: responseText,
            },
            status: response.status,
            isMock: false,
          };
        }
      } else {
        console.log(`🔴 Backend returned error: ${response.status}`);
        console.log(`🔴 Error response: ${responseText}`);

        // Create mock user as fallback
        console.log("🟡 Creating mock user as fallback");
        const mockUser = {
          user_id: Date.now(),
          name: userData.name,
          email: userData.email,
          user_type: userData.user_type || "gardener", // ✅ Use the actual user_type
          created_at: new Date().toISOString(),
        };

        // Store mock user
        try {
          const existingUsersJson = await AsyncStorage.getItem("mockUsers");
          const existingUsers = existingUsersJson
            ? JSON.parse(existingUsersJson)
            : [];
          const updatedUsers = [...existingUsers, mockUser];
          await AsyncStorage.setItem("mockUsers", JSON.stringify(updatedUsers));
          await AsyncStorage.setItem("userData", JSON.stringify(mockUser));
        } catch (storageError) {
          console.log("🟡 Storage error:", storageError);
        }

        return {
          data: mockUser,
          user: mockUser,
          status: 200,
          isMock: true,
          error: responseText,
        };
      }
    } catch (error: any) {
      console.error("🔴 Network error during registration:", error);

      // Create mock user on network error
      const mockUser = {
        user_id: Date.now(),
        name: userData.name,
        email: userData.email,
        user_type: userData.user_type || "gardener", // ✅ Use the actual user_type
        created_at: new Date().toISOString(),
      };

      // Store mock user
      try {
        await AsyncStorage.setItem("userData", JSON.stringify(mockUser));
      } catch (storageError) {
        console.log("🟡 Storage error:", storageError);
      }

      return {
        data: mockUser,
        user: mockUser,
        status: 200,
        isMock: true,
        error: error.message,
      };
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

// Scans API - UPDATED version
export const scansAPI = {
  getScans: (userId?: string, plantId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (plantId) params.append("plant_id", plantId);

    return apiCall(`/scans/?${params.toString()}`);
  },

  getScan: (scanId: string) => apiCall(`/scans/${scanId}`),

  createScan: (scanData: any) =>
    apiCall("/scans/", {
      method: "POST",
      body: JSON.stringify(scanData),
    }),

  // ADD THESE NEW ENDPOINTS:
  deleteScan: (scanId: string) =>
    apiCall(`/scans/${scanId}`, {
      method: "DELETE",
    }),

  getUserScans: async (userId: number) => {
    return apiCall(`/scans/?user_id=${userId}`);
  },
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
  analysis: analysisAPI,
};
