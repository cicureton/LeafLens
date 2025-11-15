import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../app/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("gardener"); // Default to gardener
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Starting registration...");
      console.log("🟡 Selected user type:", userType);

      const result = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        user_type: userType,
      });

      console.log("🟢 Registration result:", result);

      // Store user data - transform to include all necessary fields
      let userDataToStore;

      if (result.isMock) {
        // Mock user data structure
        userDataToStore = {
          user_id: result.data.user_id,
          name: result.data.name,
          email: result.data.email,
          user_type: result.data.user_type,
          created_at: result.data.created_at || new Date().toISOString(),
          // Add fields that profile expects
          uid: result.data.user_id,
          displayName: result.data.name,
          username: result.data.name.toLowerCase().replace(/\s+/g, ""),
        };
      } else {
        // Real backend user data structure
        userDataToStore = {
          user_id: result.data.user_id || result.data.id,
          name: result.data.name,
          email: result.data.email,
          user_type: result.data.user_type,
          created_at: result.data.created_at || new Date().toISOString(),
          // Add fields that profile expects
          uid: result.data.user_id || result.data.id,
          displayName: result.data.name,
          username: result.data.name.toLowerCase().replace(/\s+/g, ""),
          // Include any other fields from backend response
          ...result.data,
        };
      }

      console.log("💾 Storing user data:", userDataToStore);
      await AsyncStorage.setItem("userData", JSON.stringify(userDataToStore));

      // Verify storage
      const storedData = await AsyncStorage.getItem("userData");
      console.log("✅ Verified stored data:", JSON.parse(storedData));

      // Show success message
      const message = result.isMock
        ? "Account created successfully! (Using offline mode)"
        : "Account created successfully!";

      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => {
            console.log("🎯 Navigating to home tab...");
            router.replace("/tabs/home");
          },
        },
      ]);
    } catch (error: any) {
      console.log("❌ Signup error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#043927", "#00A86B"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo + App Title */}
          <View style={styles.upperContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>LeafLens</Text>
          </View>

          {/* Signup form */}
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>I am a:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === "gardener" && styles.userTypeButtonSelected,
                  ]}
                  onPress={() => setUserType("gardener")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === "gardener" &&
                        styles.userTypeButtonTextSelected,
                    ]}
                  >
                    🌱 Gardener
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === "farmer" && styles.userTypeButtonSelected,
                  ]}
                  onPress={() => setUserType("farmer")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === "farmer" &&
                        styles.userTypeButtonTextSelected,
                    ]}
                  >
                    🚜 Farmer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.buttonTextWithUnderline}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  upperContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 2,
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  userTypeContainer: {
    width: "90%",
    marginBottom: 20,
  },
  userTypeLabel: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  userTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  userTypeButtonSelected: {
    backgroundColor: "#004d00",
    borderColor: "white",
  },
  userTypeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  userTypeButtonTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    width: "50%",
    backgroundColor: "#004d00",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextWithUnderline: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  switchText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
});
