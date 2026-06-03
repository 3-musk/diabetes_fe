import { StyleSheet, View } from "react-native";
import { AppText } from "../../components";

export default function Chat() {
  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>Chat</AppText>
      <AppText style={styles.text}>This is the chat screen</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
});
