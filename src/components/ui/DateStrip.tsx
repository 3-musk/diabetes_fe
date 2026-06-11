import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors, fontSize, spacing } from '../../theme';
import AppText from './AppText';

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const [dates] = useState<Date[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDates = [];
    for (let i = -7; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      newDates.push(d);
    }
    return newDates;
  });
  
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  useEffect(() => {
    // Try to scroll to center the selected date (or today) after a short delay
    setTimeout(() => {
      if (scrollRef.current) {
        const index = dates.findIndex(d => isSameDay(d, selectedDate));
        const targetIndex = index >= 0 ? index : 7;
        
        // paddingHorizontal is spacing.md (12)
        // gap is spacing.sm (8)
        // item width is 60
        const itemCenter = spacing.md + targetIndex * (60 + spacing.sm) + 30;
        const scrollX = Math.max(0, itemCenter - width / 2);
        
        scrollRef.current.scrollTo({ x: scrollX, animated: true });
      }
    }, 100);
  }, [width, selectedDate, dates]);



  const formattedMonthYear = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <AppText variant="semibold" style={styles.monthYear}>
        {formattedMonthYear}
      </AppText>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = date.getDate().toString().padStart(2, '0');

          return (
            <Pressable
              key={index}
              style={[styles.dateItem, isSelected && styles.dateItemSelected]}
              onPress={() => onSelectDate(date)}
            >
              <AppText
              variant='semibold'
                style={[styles.dayName, isSelected && styles.textSelected]}
              >
                {dayName}
              </AppText>
              <AppText
                variant="semibold"
                style={[styles.dayNum, isSelected && styles.textSelected]}
              >
                {dayNum}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xl,
  },
  monthYear: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  dateItem: {
    width: 60,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.primaryBackground,
  },
});
