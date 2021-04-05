import "react-native-gesture-handler";

import * as React from "react";

// import { Home } from "./screens/Home";
// import { NavigationContainer } from "@react-navigation/native";
// import PastTrips from "./screens/PastTrips";
// import TripMap from "./screens/TripMap";
// import TripOverview from "./screens/TripOverview";
// import TripViewer from "./screens/TripViewer";
// import Login from "./screens/Login";
// import Signup from "./screens/Signup";

import { StackNavigator } from "./StackNavigator";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return(
    <Tab.Navigator>
      <Tab.Screen name="Home" component={StackNavigator} />
    </Tab.Navigator>
 );
}; 

export default TabNavigator;