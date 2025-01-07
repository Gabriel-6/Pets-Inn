import React, { useEffect, useState } from 'react';
import {View, 
        StyleSheet,
        ActivityIndicator
    } from 'react-native';

import * as Animatable from 'react-native-animatable'
import {useNavigation} from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'


export default function Welcome(){
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout( async ()=>{
            const isValidToken = await checkeToken();

        setLoading(false);
        
        navigation.navigate('Home');        
    }, 2000);

        return () => clearTimeout(timeout);
    }, [])

    const checkeToken = async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token;

    }
    return(
       <View style={styles.container}>
        <View style={styles.containerLogo}>
            <Animatable.Image 
                animation={"flipInY"}
                source={require('../../assets/logo.jpeg')}
                style={styles.logo}
            /> 
            {loading && <ActivityIndicator color="#000" size="large" />}   
        </View>
       </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor:"#fcfcf2",
        justifyContent:'center',
        alignItems:'center'
    },
    logo:{
        height: 250,
        width:250,
        resizeMode:'contain'
        
    }
})