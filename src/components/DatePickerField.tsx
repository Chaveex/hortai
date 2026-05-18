import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  onChange: (date: string) => void;
  optional?: boolean;
  maxDate?: Date;
}

export default function DatePickerField({ label, value, onChange, optional, maxDate }: Props) {
  const [show, setShow] = useState(false);

  const parsed = value ? parseISO(value) : null;
  const displayDate = parsed && isValid(parsed)
    ? format(parsed, 'dd MMMM yyyy', { locale: fr })
    : null;

  const currentDate = parsed && isValid(parsed) ? parsed : new Date();

  function handleChange(_: DateTimePickerEvent, selected?: Date) {
    setShow(Platform.OS === 'ios');
    if (selected) {
      onChange(format(selected, 'yyyy-MM-dd'));
    }
  }

  function handleClear() {
    onChange('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}{optional ? '' : ' *'}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, !displayDate && styles.btnEmpty]}
          onPress={() => setShow(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>📅</Text>
          <Text style={[styles.btnText, !displayDate && styles.btnTextEmpty]}>
            {displayDate ?? 'Choisir une date…'}
          </Text>
        </TouchableOpacity>
        {optional && displayDate && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          maximumDate={maxDate ?? new Date()}
          locale="fr-FR"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  btnEmpty: {
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  icon: {
    fontSize: 18,
  },
  btnText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  btnTextEmpty: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
