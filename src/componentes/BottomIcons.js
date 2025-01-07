import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const BottomIcons = ({ onPress, activeScreen }) => {
  const [isCompany, setIsCompany] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkUserType = async () => {
      const userType = await AsyncStorage.getItem('UserType');
      setIsCompany(userType === 'empresa');
    };

    if(isFocused) {
      checkUserType();
    }
    
  }, [isFocused]);

  const handlePress = async (iconName) => {
    onPress(iconName);
    await AsyncStorage.setItem('activeIcon', iconName);
  };

  return (
    <>
      {!isCompany && (
        <>
          <TouchableOpacity style={styles.iconContainer} onPress={() => handlePress('search')}>
            <Icon name="search" size={30} color={activeScreen === 'search' ? '#FB7B19' : '#333'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconContainer} onPress={() => handlePress('heart')}>
            <Icon name="heart" size={30} color={activeScreen === 'heart' ? '#FB7B19' : '#333'} />
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity style={styles.iconContainer} onPress={() => handlePress('calendar')}>
        <Icon name="calendar" size={30} color={activeScreen === 'calendar' ? '#FB7B19' : '#333'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconContainer} onPress={() => handlePress('envelope')}>
        <Icon name="envelope" size={30} color={activeScreen === 'envelope' ? '#FB7B19' : '#333'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconContainer} onPress={() => handlePress('user')}>
        <Icon name="user" size={30} color={activeScreen === 'user' ? '#FB7B19' : '#333'} />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
  },
});

export default BottomIcons;
