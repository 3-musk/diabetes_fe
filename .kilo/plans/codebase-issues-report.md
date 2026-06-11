# Codebase Issues & Improvements Report

## Project Overview
A diabetes management mobile app built with Expo/React Native, TypeScript, and Expo Router. The app includes features for tracking glucose, weight, activity, medications, care plans, and subscription management.

---

## 🔴 Critical Issues

### 1. Type Safety Issues

| File | Line | Issue |
|------|------|-------|
| `src/services/glucoseService.ts` | 30 | Uses `any` type for `saveGlucoseReading` parameter: `async (data: any)` |
| `src/services/activityService.ts` | 14 | `addActivity` uses string for `exerciseType` but component expects `NewActivityData` with specific fields |
| `src/app/login.tsx` | 66 | Uses `router.replace(ROUTES.register)` for OTP verification - wrong route for existing users |
| `src/app/(app)/care-plan.tsx` | 336 | `ROUTES.appLifestyleQuestions as any` - unsafe cast to `any` |
| `src/app/(app)/care-plan.tsx` | 346 | `ROUTES.appProfile as any` - unsafe cast to `any` |
| `src/app/profile.tsx` | 20 | `router.navigate(returnTo as any)` - unsafe cast |
| `src/app/(app)/log-glucose.tsx` | 211 | Uses `router.push('/home' as any)` instead of proper ROUTES constant |
| `src/components/inputs/DateInput.tsx` | 19 | `[key: string]: any` spreads all props to Input - type safety concern |
| `src/app/register.tsx` | 98 | `display="spinner"` passed via spread but DateInput may not support it properly |

### 2. Error Handling Issues

| File | Line | Issue |
|------|------|-------|
| `src/services/carePlanService.ts` | 61-64 | `submitLifestyleAnswers` swallows errors silently - no try/catch |
| `src/app/login.tsx` | 47-52 | `login` error handling throws but doesn't set loading state on error path |
| `src/app/(app)/home.tsx` | 35-54 | `fetchHomeData` - no loading state reset on error, may get stuck in loading |
| `src/app/(app)/home.tsx` | 74-81 | `refreshMedication` - error handling but no UI feedback for user |
| `src/app/(app)/reminders.tsx` | 30-35 | `fetchReminders` has no error handling |
| `src/app/(app)/hba1c-tracker.tsx` | 132-138 | No error handling for `getHba1cHistory` call |
| `src/app/(app)/activity-tracker.tsx` | 37-44 | `loadActivities` has no error handling |
| `src/services/reminderService.ts` | 28-46 | No error handling - functions can throw without recovery |

### 3. Missing Form Validation

| File | Line | Issue |
|------|------|-------|
| `src/app/register.tsx` | 28-32 | Only checks `name.trim()`, doesn't validate email, gender, diagnosis year, consents |
| `src/app/login.tsx` | 33-43 | Validates phone digits but doesn't validate format properly |
| `src/app/add-medication.tsx` | 41-47 | No validation for `medName` and `strength` before save |
| `src/app/add-medication.tsx` | 41-47 | `frequency` can be 0 but that's likely invalid |
| `src/app/log-glucose.tsx` | 189-200 | No validation that `glucoseValue` is within acceptable range before save |

---

## 🟠 High Priority Issues

### 4. Unused/Missing Dependencies in useEffect

| File | Line | Issue |
|------|------|-------|
| `src/app/(app)/home.tsx` | 33-54 | `useFocusEffect` has empty dependency array but uses `fetchHomeData` which is recreated each render |
| `src/app/(app)/reminders.tsx` | 26-28 | `fetchReminders` is not in dependency array of `useEffect` |
| `src/app/(app)/lifestyle-questions.tsx` | 23-29 | `accessToken` is used but not in dependency array |
| `src/app/(app)/hba1c-tracker.tsx` | 132-138 | Empty dependency array but no cleanup, potential memory leak |
| `src/app/(app)/activity-tracker.tsx` | 33-35 | `loadActivities` not in deps, but `selectedDate` changes don't trigger reload properly |

### 5. State Management Issues

| File | Line | Issue |
|------|------|-------|
| `src/app/(app)/home.tsx` | 28-30 | State initialized as `null` but components expect arrays/objects - potential null pointer |
| `src/app/(app)/home.tsx` | 105 | `MedicationSection data={medication \|\| []}` - inconsistent types |
| `src/app/(app)/log-glucose.tsx` | 171 | `symptoms` is `Set<string>` but should be array for consistency |
| `src/app/(app)/weight-tracker.tsx` | 37-39 | Hardcoded default values for `targetWeight`, `currentWeight`, `bmi` should come from service |
| `src/app/register.tsx` | 20-21 | `dataConsent` and `aiConsent` not validated before registration |
| `src/app/(app)/more.tsx` | 77 | Hardcoded avatar URL `https://i.pravatar.cc/150?img=8` - should come from user profile |

### 6. Incomplete Features / Placeholder Code

| File | Line | Issue |
|------|------|-------|
| `src/app/(app)/trends.tsx` | 1-28 | Entire screen is placeholder - just shows text |
| `src/app/(app)/settings.tsx` | 1-33 | Entire screen is placeholder |
| `src/app/(app)/chat.tsx` | 1-28 | Entire screen is placeholder |
| `src/app/profile.tsx` | 1-212 | Modal-based profile - but inputs don't actually save anywhere |
| `src/app/(app)/reminders.tsx` | 121 | Uses `Math.random().toString()` as key extractor - unstable keys |

---

## 🟡 Medium Priority Issues

### 7. API/Services Issues

| File | Line | Issue |
|------|------|-------|
| `src/services/carePlanService.ts` | 84-122 | `getLifestyleQuestions` ignores `accessToken` parameter |
| `src/services/hompage.ts` | 1 | Filename typo: `hompage.ts` should be `homepage.ts` |
| `src/services/activityService.ts` | 14 | `addActivity` parameter doesn't match `NewActivityData` type |
| `src/services/authService.ts` | 222-223 | `login` is alias for `sendOtp`, `registerUser` is alias for `createUser` - confusing naming |
| `src/services/mockDb.ts` | 145 | `lifestyleAnswers` typed as `Record<string, string>` but should be `Record<string, string[]>` to match usage |

### 8. Memory Leaks / Performance Issues

| File | Line | Issue |
|------|------|-------|
| `src/app/(app)/lifestyle-questions.tsx` | 63-71 | `submitLifestyleAnswers` doesn't await properly before navigation |
| `src/app/(app)/care-plan.tsx` | 317-329 | `setTimeout` in `useEffect` without proper cleanup on unmount |
| `src/app/login.tsx` | 92-95 | Video player created but never cleaned up |
| `src/components/ui/Carousel.tsx` | 56-74 | `setInterval` in useEffect without cleanup |

### 9. UI/UX Issues

| File | Line | Issue |
|------|------|-------|
| `src/app/login.tsx` | 191 | Phone number display shows `+91{phoneNumber}` but `phoneNumber` already includes digits |
| `src/app/register.tsx` | 143 | `autoCapitalize="words"` on referral code is wrong |
| `src/app/(app)/add-medication.tsx` | 145-156 | Date format shown as `yy/mm/dd` but placeholder uses `Select Date` which is ambiguous |
| `src/app/(app)/log-glucose.tsx` | 32-37 | `handleScroll` could fire rapidly causing performance issues |
| `src/app/subscription.tsx` | 215 | `colors.secondarybackground` should be `colors.secondaryBackground` (camelCase) |

### 10. Theme/Consistency Issues

| File | Line | Issue |
|------|------|-------|
| `src/app/subscription.tsx` | 215 | Uses non-existent `colors.secondarybackground` instead of `colors.secondaryBackground` |
| Multiple files | - | Hardcoded color values like `#F9F6F0`, `#4E3A32`, `#F5DAAA` instead of theme colors |
| Multiple files | - | Hardcoded font sizes like `22`, `24`, `52` instead of theme `fontSize` |
| Multiple files | - | Inconsistent border radius usage (some use theme, some hardcoded) |

---

## 🟢 Low Priority Issues / Improvements

### 11. Code Duplication

| File | Issue |
|------|-------|
| `src/app/(app)/hba1c-tracker.tsx` and `src/app/(app)/weight-tracker.tsx` | Similar card/section structure duplicated |
| `src/components/features/AddWeightModal.tsx` and `src/components/features/AddActivityModal.tsx` | Similar modal patterns |
| Multiple screen headers | Repeated header pattern with BackButton |

### 12. Accessibility Issues

| File | Line | Issue |
|------|------|-------|
| `src/app/(app)/more.tsx` | 78 | Avatar image has no accessibility label |
| `src/app/(app)/add-medication.tsx` | 66-82 | Category selection has no proper labels for screen readers |
| Multiple | - | Touchable elements should have `accessibilityRole` |

### 13. Missing Features

| File | Issue |
|------|-------|
| `src/app/(app)/trends.tsx` | Not implemented |
| `src/app/(app)/settings.tsx` | Not implemented |
| `src/app/(app)/chat.tsx` | Not implemented |
| `src/app/profile.tsx` | Profile editing doesn't persist data |

### 14. File Organization Issues

| File | Issue |
|------|-------|
| `src/services/hompage.ts` | Typo in filename - should be `homepage.ts` |
| `src/components/inputs/` | Missing barrel export file |
| `src/components/ui/` | Some UI components not exported from main index |

---

## 📋 Summary by Category

| Category | Count |
|----------|-------|
| Type Safety Issues | 9 |
| Error Handling Issues | 8 |
| Missing Validation | 5 |
| State Management Issues | 6 |
| Placeholder/Incomplete | 6 |
| API/Services Issues | 5 |
| Performance/Memory | 4 |
| UI/UX Issues | 5 |
| Theme Consistency | 6 |
| Code Duplication | 3 |
| Accessibility | 3 |
| File Organization | 3 |

**Total Issues Identified: 60+**