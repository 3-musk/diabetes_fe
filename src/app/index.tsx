import { StyleSheet, View } from "react-native";
import { AppText } from '../components';

export default function Index() {
  return (
    <View style={styles.container}>
      <AppText>Loading...</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
