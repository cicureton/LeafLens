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

const Signup = () => {
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

          {/* Signup form */}
          <View style={styles.innerContainer}>
            <Text style={styles.subtitle}>Create Account</Text>

            <Text style={styles.normalText}>Username?</Text>
            <TextInput style={styles.input} placeholder="Username" />

            <Text style={styles.normalText}>Email?</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
            />

            <Text style={styles.normalText}>Password?</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
            />

            {/* Signup button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // After successful signup, go to login
                router.replace("/");
              }}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>

            {/* Already have account? */}
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.buttonTextWithUnderline}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScrollView>
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
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  normalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "left",
    width: "90%",
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
