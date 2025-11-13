import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {
  const [isSingup, setIsSingup] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const { singIn, singUp } = useAuth();
  const router = useRouter();

  const theme = useTheme();
  const handleSwitchMode = () => {
    setIsSingup((prev) => !prev);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("please fill all the field");
      return;
    }

    if (password.length <= 6) {
      setError("password most be grater than 6 characters");
      return;
    }

    setError(null);

    if (isSingup) {
      const error = await singUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await singIn(email, password);
      if (error) {
        setError(error);
        return;
      }

      router.replace("/");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSingup ? "Create Account" : "Welcom Back"}
        </Text>

        <TextInput
          label="email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
          onChangeText={setEmail}
        />
        <TextInput
          label="password"
          autoCapitalize="none"
          secureTextEntry
          mode="outlined"
          style={styles.input}
          onChangeText={setPassword}
        />

        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

        <Button mode="contained" style={styles.button} onPress={handleAuth}>
          {isSingup ? "SingUp" : "SingIn"}
        </Button>

        <Button
          mode="text"
          style={styles.switchModeButton}
          onPress={handleSwitchMode}
        >
          {isSingup
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchModeButton: {
    marginTop: 16,
  },
});
