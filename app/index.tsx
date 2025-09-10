import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient colors={["#043927", "#00A86B"]} style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Logo + App Title */}
          <View style={styles.upperContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>LeafLens</Text>
          </View>

          {/* Login form */}
          <View style={styles.innerContainer}>
            <Text style={styles.normalText}>Login</Text>

            <TextInput style={styles.input} placeholder="Username" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
            />

            {/* Go to Signup form */}
            <Text style={styles.normalText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text style={styles.buttonTextWithUnderline}>Sign Up</Text>
            </TouchableOpacity>

            {/* Go to homepages */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/tabs/home")}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // ensures gradient covers whole screen
  },
  upperContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  normalText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  imagesWithInput: {
    flexDirection: "row",
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
    marginTop: 25,
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
});
