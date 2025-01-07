import React from "react";
import { StatusBar } from "react-native";
import {NavigationContainer} from '@react-navigation/native'
import './src/utils/IgnoreWarnings'

import { Provider } from 'react-redux';
import store from "./redux/store";
import Router from "./src/routes";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar backgroundColor="#FCFCF2" barStyle={"dark-content"}/>
        <Router/>
      </NavigationContainer>
    </Provider>
  );
}

