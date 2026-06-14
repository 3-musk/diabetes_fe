import { SvgIcon } from '@/utils/icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fontSize, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { Input } from './Input';

interface DateInputProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  containerStyle?: ViewStyle;
  required?: boolean;
  error?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime' | 'countdown';
  display?: 'default' | 'spinner' | 'calendar';
  dateFormat?: 'full' | 'yy/mm/dd' | 'yy/mm' | 'mm/dd' | 'year' | ((date: Date) => string);
  [key: string]: any;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  containerStyle,
  required,
  error,
  mode = 'date',
  display = 'default',
  dateFormat = 'full',
  placeholder = undefined,
  ...rest
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const closePicker = () => setShowPicker(false);

  const handleAndroidChange = (_event: unknown, selectedDate?: Date) => {
    closePicker();
    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
  };

  const handleInputPress = () => {
    setTempDate(value || new Date());
    setShowPicker(true);
  };

  const handleDone = () => {
    onChange?.(tempDate);
    closePicker();
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';

    if (typeof dateFormat === 'function') {
      return dateFormat(date);
    }

    switch (dateFormat) {
      case 'year':
        return date.getFullYear().toString();
      case 'yy/mm/dd':
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      case 'yy/mm':
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'mm/dd':
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      case 'full':
      default:
        return date.toLocaleDateString();
    }
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={handleInputPress}>
        <Input
          label={label}
          value={formatDate(value)}
          required={required}
          error={error}
          editable={false}
          placeholder={placeholder}
          rightIcon={
            <SvgIcon
              source={require('../../../assets/svgs/calender.svg')}
              size={20}
              color={colors.primaryForeground}
            />
          }
          {...rest}
        />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <Pressable style={styles.overlay} onPress={closePicker}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.header}>
                <TouchableOpacity onPress={closePicker} hitSlop={8}>
                  <AppText variant="medium" style={styles.cancelText}>
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDone} hitSlop={8}>
                  <AppText variant="semibold" style={styles.doneText}>
                    Done
                  </AppText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display={display === 'default' ? 'spinner' : display}
                onValueChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display={display}
            onValueChange={handleAndroidChange}
            onDismiss={closePicker}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  doneText: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
});

export default DateInput;
