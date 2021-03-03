import "react-native-gesture-handler";

import * as React from "react";

import { Home } from "./screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import PastTrips from "./screens/PastTrips";
import TripMap from "./screens/TripMap";
import { createStackNavigator } from "@react-navigation/stack";

const App = () => {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Trip Map" component={TripMap} />
        <Stack.Screen name="Past Trips" component={PastTrips} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

// color scheme:
// black: #000
// white: #fff
// grey: #AEB8C1
// teal: #00A398
// purple: #8275BD
