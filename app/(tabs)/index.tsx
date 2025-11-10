import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.view}>
      <Text>test test test</Text>
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
