import { useAuth } from "@/lib/auth-context";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const { singOut } = useAuth();

  return (
    <View style={styles.view}>
      <Text>test test test</Text>
      <Button mode="text" onPress={singOut} icon={"logout"}>
        {" "}
        Sign Out{" "}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  navLink: {
    width: 100,
    height: 20,
    backgroundColor: "red",
    borderRadius: "5px",
    textAlign: "center",
  },
});
