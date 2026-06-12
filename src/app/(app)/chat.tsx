import { StyleSheet } from "react-native";
import { AppText, ScreenContainer } from "../../components";

export default function Chat() {
  return (
    <ScreenContainer edges={['top']} contentStyle={styles.container}>
      <AppText variant="bold" style={styles.title}>Chat</AppText>
      <AppText style={styles.text}>This is the chat screen</AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
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
