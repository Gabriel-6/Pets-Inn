import React from 'react';
import { Text, Input } from 'react-native';

const CustomInput = ({ title, placeholder, onChangeText, value }) => {
    return (
      <>
        <Text style={styles.title}>{title}</Text>
        <Input
          placeholder={placeholder}
          onChangeText={onChangeText}
          value={value}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          inputStyle={{
            borderBottomWidth: 1,
            borderColor: '#333',
            paddingVertical: 10,
            paddingHorizontal: 0
          }}
        />
      </>
    );
  };
  
  export default CustomInput;