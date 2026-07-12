import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';

import { SvgIcon } from '@/utils/icon';
import {
  AppText,
  BackButton,
  Button,
  ScreenContainer,
  SegmentedControl,
} from '../../components';
import { mealImpactTexts } from '../../constants/mealImpact';
import {
  MEAL_SLOT_META,
  MealPortionType,
  MealSearchResult,
  MealSearchSuggestion,
  MealSelectionItem,
  MealSlotId,
  addMealTexts,
  getDefaultMealSlotByTime,
} from '../../constants/meals';
import { ROUTES } from '../../constants/routes';
import {
  addMealItem,
  getMealSelection,
  removeMealSelectionItem,
  saveMealSession,
  searchMealFinal,
  searchMealsContinuous,
  uploadMealImage,
} from '../../services/mealService';
import { borderRadius, colors, fontSize, spacing } from '../../theme';

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Pressable style={[styles.stepperBtn, styles.stepperBtnAdd]} onPress={() => onChange(Math.max(0, value - 1))}>
        <FontAwesome name="minus" size={14} color={colors.secondaryForeground} />
      </Pressable>
      <AppText variant="medium" style={styles.stepperValue}>
        {value}
      </AppText>
      <Pressable style={[styles.stepperBtn, styles.stepperBtnAdd]} onPress={() => onChange(value + 1)}>
        <FontAwesome name="plus" size={14} color={colors.secondaryForeground} />
      </Pressable>
    </View>
  );
}

export default function AddMealScreen() {
  const router = useRouter();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();
  const { slotId, date } = useLocalSearchParams<{ slotId: MealSlotId; date: string }>();

  const activeSlotId = (slotId ?? getDefaultMealSlotByTime()) as MealSlotId;
  const activeDate = date ?? new Date().toISOString().split('T')[0];
  const slotLabel = MEAL_SLOT_META[activeSlotId]?.label ?? 'Meal';

  const [selection, setSelection] = useState<MealSelectionItem[]>([]);
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<MealSearchSuggestion[]>([]);
  const [searchResult, setSearchResult] = useState<MealSearchResult | null>(null);
  const [portionType, setPortionType] = useState<MealPortionType>('count');
  const [quantityInput, setQuantityInput] = useState('');
  const [pieces, setPieces] = useState(0);
  const [loadingSelection, setLoadingSelection] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searching, setSearching] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  const estimatedTotal = useMemo(
    () => selection.reduce((sum, item) => sum + item.calories, 0),
    [selection]
  );

  const handleQuantityChange = (text: string) => {
    const sanitized = text.replace(/\D/g, '');
    setQuantityInput(sanitized);
    setPieces(sanitized ? parseInt(sanitized, 10) : 0);
  };

  const handlePortionTypeChange = (value: string) => {
    const nextType = value as MealPortionType;
    if (nextType === 'volume') {
      setQuantityInput(pieces > 0 ? String(pieces) : '');
    } else {
      setPieces(quantityInput ? parseInt(quantityInput, 10) : pieces);
    }
    setPortionType(nextType);
  };

  const loadSelection = useCallback(async () => {
    setLoadingSelection(true);
    const items = await getMealSelection(activeDate, activeSlotId);
    setSelection(items);
    setLoadingSelection(false);
  }, [activeDate, activeSlotId]);

  useEffect(() => {
    loadSelection();
  }, [loadSelection]);

  useEffect(() => {
    if (!suggestionsEnabled) {
      return;
    }

    if (!description.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchMealsContinuous(description);
      setSuggestions(results);
    }, 300);

    return () => clearTimeout(timeout);
  }, [description, suggestionsEnabled]);

  const processImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const items = await uploadMealImage(uri, activeDate, activeSlotId);
      setSelection(items);
    } catch (e) {
      console.warn('Image processing failed', e);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTakePicture = async () => {
    Alert.alert(
      'Upload Meal Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              alert(addMealTexts.missingDetailsAlertTitle, 'You need to allow camera access to take a picture.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              await processImage(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              alert(addMealTexts.missingDetailsAlertTitle, 'You need to allow gallery access to choose a picture.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              await processImage(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const applySearchResult = (result: MealSearchResult) => {
    setSearchResult(result);
    setPortionType(result.portionType);
    setQuantityInput(String(result.pieces));
    setPieces(result.pieces);
    setSuggestionsEnabled(false);
    setDescription(result.name);
    setSuggestions([]);
  };

  const handleSuggestionSelect = async (suggestion: MealSearchSuggestion) => {
    setSearching(true);
    try {
      const result = await searchMealFinal(suggestion.name);
      if (result) applySearchResult(result);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchFinal = async () => {
    if (!description.trim()) return;

    setSearching(true);
    try {
      const result = await searchMealFinal(description);
      if (!result) {
        alert(addMealTexts.notFoundAlertTitle, addMealTexts.notFoundAlertBody);
        return;
      }
      applySearchResult(result);
    } finally {
      setSearching(false);
    }
  };

  const handleAddItem = async () => {
    if (!searchResult || pieces <= 0) {
      alert(addMealTexts.missingDetailsAlertTitle, addMealTexts.missingDetailsAlertBody);
      return;
    }

    setAddingItem(true);
    try {
      const calories = Math.round(searchResult.calories * pieces / Math.max(searchResult.pieces, 1));
      const currentMealId = selection.length > 0 ? selection[0].mealId : undefined;
      const items = await addMealItem(activeDate, activeSlotId, {
        name: searchResult.name,
        calories,
        imageUri: searchResult.imageUri,
        portionType,
        pieces,
        foodMasterId: searchResult.id,
      }, currentMealId);
      setSelection(items);
      setDescription('');
      setSearchResult(null);
      setQuantityInput('');
      setPieces(0);
      setSuggestions([]);
      setSuggestionsEnabled(true);
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const items = await removeMealSelectionItem(activeDate, activeSlotId, itemId);
    setSelection(items);
  };

  const handleSeePredictedImpact = () => {
    if (selection.length === 0) {
      alert(addMealTexts.seePredictedImpact, mealImpactTexts.emptySelection);
      return;
    }

    router.push({
      pathname: ROUTES.appMealImpact as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
      },
    });
  };

  const goBackToMeals = useCallback(() => {
    router.replace({
      pathname: ROUTES.appMeals as any,
      params: { date: activeDate },
    });
  }, [router, activeDate]);

  const handleSaveMeal = async () => {
    if (selection.length === 0) {
      alert(addMealTexts.noItemsAlertTitle, addMealTexts.noSelection);
      return;
    }

    setSaving(true);
    try {
      await saveMealSession(activeDate, activeSlotId);
      goBackToMeals();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} onPress={goBackToMeals} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {slotLabel}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.card}>
          <AppText variant="regular" style={styles.cardTitle}>
            {addMealTexts.uploadLabel}
          </AppText>

          <Pressable style={styles.uploadBox} onPress={handleTakePicture} disabled={uploadingImage}>
            {uploadingImage ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <AppText style={styles.uploadText}>
                  {addMealTexts.takePicture}
                </AppText>
                <SvgIcon source={require('../../../assets/svgs/meals/camera.svg')}/>
              </>
            )}
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <View style={styles.orBadge}>
              <AppText variant="regular" style={styles.orText}>{addMealTexts.or}</AppText>
            </View>
            <View style={styles.orLine} />
          </View>

          <View style={styles.fieldWrap}>
            <AppText variant="medium" style={styles.fieldLabel}>
              {addMealTexts.mealDescription} <AppText style={styles.required}>*</AppText>
            </AppText>
            <TextInput
              style={styles.textInput}
              placeholder={addMealTexts.enterDetails}
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={text => {
                setSuggestionsEnabled(true);
                setDescription(text);
                setSearchResult(null);
              }}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {suggestions.map(item => (
                  <Pressable
                    key={item.id}
                    style={styles.suggestionRow}
                    onPress={() => handleSuggestionSelect(item)}
                  >
                    <AppText style={styles.suggestionText}>{item.name}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {searchResult && (
            <>
              <View style={styles.fieldRow}>
                <AppText variant="medium" style={styles.fieldLabel}>
                  {addMealTexts.mealPortion} <AppText style={styles.required}>*</AppText>
                </AppText>
                <SegmentedControl
                  value={portionType}
                  options={['count', 'volume']}
                  onChange={handlePortionTypeChange}
                />
              </View>

              {portionType === 'count' ? (
                <View style={styles.fieldRow}>
                  <AppText variant="medium" style={styles.fieldLabel}>
                    {addMealTexts.pieces} <AppText style={styles.required}>*</AppText>
                  </AppText>
                  <Stepper value={pieces} onChange={setPieces} />
                </View>
              ) : (
                <View style={styles.fieldWrap}>
                  <AppText variant="medium" style={styles.fieldLabel}>
                    {addMealTexts.quantityGrams} <AppText style={styles.required}>*</AppText>
                  </AppText>
                  <TextInput
                    style={styles.textInput}
                    value={quantityInput}
                    onChangeText={handleQuantityChange}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              )}
            </>
          )}

          <Button
            title={searchResult ? addMealTexts.add : addMealTexts.search}
            variant="outline"
            onPress={searchResult ? handleAddItem : handleSearchFinal}
            loading={searching || addingItem}
            style={styles.addBtn}
          />

          <View style={{marginVertical:20}}/>

          <AppText variant="medium" style={styles.sectionTitle}>
            {addMealTexts.todaysSelection}
          </AppText>

          {loadingSelection ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : selection.length === 0 ? (
            <AppText style={styles.emptyText}>{addMealTexts.noSelection}</AppText>
          ) : (
            <View style={styles.selectionList}>
              {selection.map(item => (
                <View key={item.id} style={styles.selectionCard}>
                  <Image
                    source={{ uri: item.imageUri ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop' }}
                    style={styles.selectionImage}
                    contentFit="cover"
                  />
                  <View style={styles.selectionContent}>
                    <AppText variant="regular" style={styles.selectionName}>{item.name}</AppText>
                    <AppText style={styles.selectionCalories}>{item.calories} {addMealTexts.calUnit}</AppText>
                  </View>
                  <Pressable onPress={() => handleRemoveItem(item.id)} hitSlop={8}>
                    <SvgIcon size={20} source={require('../../../assets/svgs/delete.svg')} />
                  </Pressable>
                </View>
              ))}

              <View style={styles.totalRow}>
                <AppText variant="semibold" style={styles.totalLabel}>
                  {addMealTexts.estimatedTotal}
                </AppText>
                <AppText variant="regular" style={styles.totalValue}>
                  {estimatedTotal} {addMealTexts.calUnit}
                </AppText>
              </View>
            </View>
          )}

          <Button
            title={addMealTexts.seePredictedImpact}
            variant="outline"
            icon={
            <SvgIcon source={require('../../../assets/svgs/meals/prediction.svg')} />
          }
            style={styles.impactBtn}
            onPress={handleSeePredictedImpact}
          />

          <Button
            title={addMealTexts.saveMeal}
            onPress={handleSaveMeal}
            loading={saving}
            size="lg"
            style={styles.saveBtn}
          />
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  uploadBox: {
    minHeight: 88,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondarybackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  uploadText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: 0,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: {
    fontSize: fontSize.sm,
    color: colors.secondaryForeground,
  },
  fieldWrap: {
    marginBottom: spacing.lg,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textInput,
    marginTop: spacing.xs,
  },
  suggestionsBox: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  suggestionRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: borderRadius.full
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 17,
    backgroundColor: colors.secondarybackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBtnAdd: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  addBtn: {
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  selectionList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  selectionImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
  },
  selectionContent: {
    flex: 1,
    gap: spacing.xl,
    flexDirection: 'column',
    justifyContent: "space-between"
  },
  selectionName: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  selectionCalories: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  impactBtn: {
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    flex: 1,
    flexDirection: 'row-reverse'
  },
  saveBtn: {
    borderRadius: borderRadius.full,
  },
});
