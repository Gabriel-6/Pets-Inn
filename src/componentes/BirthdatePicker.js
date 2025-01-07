import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

const BirthdatePicker = ( {onDateChange} ) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [current, setCurrent] = useState(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`);

  useEffect(() => {
    setCurrent(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`);
  }, [selectedYear, selectedMonth]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(false);
    onDateChange(day.dateString);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = currentYear; i >= 1900; i--) {
      years.push(i);
    }
    return years;
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <View style={styles.container}>
      <Button title="Selecionar Data" onPress={toggleModal} />
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {generateYears().map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {months.map((month, index) => (
                <Picker.Item key={index} label={month} value={index + 1} />
              ))}
            </Picker>
          </View>
          <Calendar
            key={current}
            current={current}
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: { selected: true, marked: true, selectedColor: 'FFA500' },
            }}
            theme={{
              todayTextColor: 'red',
              selectedDayTextColor: '#FFA500',
            }}
            hideExtraDays
            disableMonthChange
            renderHeader={() => null}
            disableArrowLeft
            disableArrowRight
          />
          <Button title="Fechar" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    width: 150,
    height: 50,
  },
});

export default BirthdatePicker;
