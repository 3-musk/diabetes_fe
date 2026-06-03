import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { Input } from './Input';

interface DateInputProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  containerStyle?: ViewStyle;
  required?: boolean;
  error?: string;
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
  ...rest
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    
    // If dateFormat is a function, use it
    if (typeof dateFormat === 'function') {
      return dateFormat(date);
    }
    
    // Handle predefined formats
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

  const handleInputPress = () => {
    setShowPicker(true);
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
          rightIcon={<FontAwesome name="calendar" size={20} color={colors.textLight} />}
          {...rest}
        />
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={display}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default DateInput;