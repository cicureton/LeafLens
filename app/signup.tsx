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
  const [loading, setLoading] = useState(false);

  // In your SignupScreen component
  const handleSignup = async (formData: {
    name: string;
    email: string;
    password: string; // This comes from the form
    user_type?: string;
  }) => {
    try {
      console.log("🚀 Starting signup process...");

      // Transform to match backend expectations
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password_hash: formData.password, // Convert 'password' to 'password_hash'
        user_type: formData.user_type || "user",
      };

      console.log("🟡 Transformed data for backend:", {
        ...registrationData,
        password_hash: "[HIDDEN]",
      });

      const result = await authAPI.register(registrationData);

      console.log("🟢 Signup successful!", result);

      // Store user data and token
      if (result.user && result.access_token) {
        await AsyncStorage.setItem("user_token", result.access_token);
        await AsyncStorage.setItem("user_data", JSON.stringify(result.user));

        // Navigate to app
        router.replace("/tabs/home");
      }
    } catch (error: any) {
      console.log("❌ Signup error:", error);

      // Show user-friendly error message
      let errorMessage = "Signup failed. Please try again.";

      if (error.status === 422) {
        errorMessage = "Invalid data. Please check your information.";
      } else if (error.status === 409) {
        errorMessage = "Email already exists. Please use a different email.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Signup Failed", errorMessage);
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
