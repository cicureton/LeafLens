import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
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
import { auth } from '../app/firebase';

export default function LoginScreen() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0]
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      Alert.alert("Success", `Welcome back!`);
      router.replace("/tabs/home");
    } catch (error: any) {
      // Handle Firebase errors
      if (error.code === 'auth/user-not-found') {
        Alert.alert("Login Failed", "No account found. Please sign up.");
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert("Login Failed", "Incorrect password.");
      } else {
        Alert.alert("Login Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient colors={["#043927", "#00A86B"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo + App Title */}
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>LeafLens</Text>

          {/* Login form */}
          <Text style={styles.normalText}>Login</Text>

          <View style={styles.inputContainer}>
            <Image
              source={require("../assets/images/login.png")}
              style={styles.inputIcon}
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
          </View>

          <View style={styles.inputContainer}>
            <Image
              source={require("../assets/images/password.png")}
              style={styles.inputIcon}
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
          </View>

          {/* Signup link */}
          <Text style={styles.normalText}>Don't have an account?</Text>
          <TouchableOpacity 
            onPress={() => router.replace("/signup")}
            disabled={loading}
          >
            <Text style={[
              styles.buttonTextWithUnderline,
              loading && styles.disabledText
            ]}>Sign Up</Text>
          </TouchableOpacity>


          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    width: "90%",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    alignSelf: "center",
  },
  inputIcon: {
    width: 40,
    height: 40,
  },
  normalText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignSelf: "center",
  },
  button: {
    width: "50%",
    backgroundColor: "#004d00",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
    alignSelf: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
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
    textAlign: "center",
  },
  disabledText: {
    opacity: 0.5,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
});
