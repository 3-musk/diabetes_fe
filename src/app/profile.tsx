import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppModal, AppText, Button, Input } from "../components";
import { markProfileComplete } from "../services/carePlanService";
import { colors, fontSize } from "../theme";

export default function Profile() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets = useSafeAreaInsets();
  
  const [gender, setGender] = useState('');
  const [showGender, setShowGender] = useState(false);

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.navigate(returnTo as any);
      return true;
    } else {
      router.back();
      return true;
    }
  }, [router, returnTo]);

  const handleSave = () => {
    // Mark profile complete
    markProfileComplete();
    handleBack();
  };

  useEffect(() => {
    const onBackPress = () => {
      if (returnTo) {
        handleBack();
        return true; // prevent default behavior
      }
      return false; // let default behavior happen
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      subscription.remove();
    };
  }, [returnTo, handleBack]);

  const renderChevron = () => (
    <FontAwesome name="chevron-down" size={20} color="#BDBDBD" />
  );

  return (
    <View style={styles.safe}>
      <AppModal
        visible={true}
        onClose={handleBack}
        closeOnOverlayPress={true}
        maxHeight={'100%'}
        containerStyle={{
          justifyContent: 'flex-end',
          paddingHorizontal: 0,
          marginTop: 40,
        }}
        cardStyle={{
        }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
          showsVerticalScrollIndicator={false}
        >

          <AppText variant="semibold" style={styles.title}>User Profile</AppText>

          <Input 
            label="Full Name" 
            placeholder="Enter Details" 
            required 
            containerStyle={styles.inputContainer}
          />
          <Input 
            label="Email address" 
            placeholder="Enter Details" 
            required 
            containerStyle={styles.inputContainer}
          />
          <Input 
            label="Year of Birth" 
            placeholder="Enter Details" 
            required 
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          <Input 
            label="Height" 
            placeholder="Enter Details" 
            required 
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          <Input 
            label="Weight" 
            placeholder="Enter Details" 
            required 
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          <Input 
            label="BMI" 
            placeholder="Enter Details" 
            required 
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />

          <View style={{ zIndex: 10 }}>
            <TouchableOpacity onPress={() => setShowGender(!showGender)} activeOpacity={1}>
              <View pointerEvents="none">
                <Input 
                  label="Gender" 
                  placeholder="Select Gender" 
                  value={gender}
                  required 
                  rightIcon={<FontAwesome name={showGender ? "chevron-up" : "chevron-down"} size={20} color="#BDBDBD" />}
                  containerStyle={styles.inputContainer}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {showGender && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => { setGender('Male'); setShowGender(false); }}>
                  <AppText style={styles.dropdownText}>Male</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => { setGender('Female'); setShowGender(false); }}>
                  <AppText style={styles.dropdownText}>Female</AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Button style={styles.saveBtn} onPress={handleSave}>
            <AppText variant="semibold" style={styles.saveBtnText}>Save</AppText>
          </Button>
        </ScrollView>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    color: '#000',
    marginBottom: 24,
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
});
