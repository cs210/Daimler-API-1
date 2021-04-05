import "react-native-gesture-handler";

import * as React from "react";

import { Home } from "../screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import PastTrips from "../screens/PastTrips";
import TripMap from "../screens/TripMap";
import TripOverview from "../screens/TripOverview";
import TripViewer from "../screens/TripViewer";
import Login from "../screens/Login";
import Signup from "../screens/Signup";

import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();

const StackNavigator = () => {
  // const { url: initialUrl, processing } = useInitialURL();

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Trip Map" component={TripMap} />
      <Stack.Screen name="Past Trips" component={PastTrips} />
      <Stack.Screen name="Trip Overview" component={TripOverview} />
      <Stack.Screen name="Trip Viewer" component={TripViewer} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
};

export default StackNavigator;

// color scheme:
// black: #000
// white: #fff
// grey: #AEB8C1
// teal: #00A398
// purple: #8275BD
