import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/pt-br';

const CustomCalendar = forwardRef(({ title, onDayPress }, ref) => {
  const [markedDates, setMarkedDates] = useState({});
  const today = moment();

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    if (moment(selectedDate).isBefore(today, 'day')) {
      return;
    }

    if (markedDates[selectedDate]) {
      const updatedMarkedDates = { ...markedDates };
      delete updatedMarkedDates[selectedDate];
      setMarkedDates(updatedMarkedDates);
    } else {
      const updatedMarkedDates = {
        ...markedDates,
        [selectedDate]: { selected: true, selectedColor: '#FFA500' },
      };
      setMarkedDates(updatedMarkedDates);
    }

    onDayPress(selectedDate);
  };

  useImperativeHandle(ref, () => ({
    getMarkedDates: () => markedDates,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Calendar
        style={styles.calendar}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#FFA500',
          todayTextColor: '#007BFF',
          arrowColor: '#FFA500',
        }}
        locale={'pt-br'}
        minDate={today.format('YYYY-MM-DD')}
        markingType={'multi-dot'}
        disabledDatesIndexes={[0]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
});

export default CustomCalendar;
