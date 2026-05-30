import { getApp } from '@react-native-firebase/app';
import { crash, getCrashlytics, log, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const crashAnalytics = getCrashlytics()

  useEffect(() => {
    console.log('Firebase App Name:', getApp().name); 

    // Force Crashlytics to track crashes even in local dev mode
    setCrashlyticsCollectionEnabled(crashAnalytics, true);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Firebase is ready!</Text>
      
      {/* Add this button */}
      <Button 
        title="Test Crash" 
        color="red"
        onPress={() => {
          log(crashAnalytics, "crash Button pressed");
          crash(crashAnalytics)}
        } 
      />
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
