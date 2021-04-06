import "react-native-gesture-handler";

import * as React from "react";

import { Home } from "./screens/Home";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import PastTrips from "./screens/PastTrips";
import TripMap from "./screens/TripMap";
import TripOverview from "./screens/TripOverview";
import TripViewer from "./screens/TripViewer";
import Login from "./screens/Login";
import Signup from "./screens/Signup";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// const useMount = func => useEffect(() => func(), []);

// const useInitialURL = () => {
//   const [url, setUrl] = useState(null);
//   const [processing, setProcessing] = useState(true);

//   useMount(() => {
//     const getUrlAsync = async () => {
//       // Get the deep link used to open the app
//       const initialUrl = await Linking.getInitialURL();

//       // The setTimeout is just for testing purpose
//       setTimeout(() => {
//         setUrl(initialUrl);
//         setProcessing(false);
//       }, 1000);
//     };

//     getUrlAsync();
//   });

//   return { url, processing };
// };

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function getHeaderTitle(route) {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Road Trip Buddy";

  switch (routeName) {
    case "Home":
      return "Home";
    case "Record Trip":
      return "Record Trip";
    case "Profile":
      return "Profile";
  }
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "#00A398",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Record Trip"
        component={TripMap}
        options={{
          tabBarLabel: "Record Trip",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="circle-slice-8"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PastTrips}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Road Trip Buddy"
          component={Tabs}
          options={({ route }) => ({
            headerTitle: getHeaderTitle(route),
          })}
        />
        <Stack.Screen name="Trip Map" component={TripMap} />
        <Stack.Screen name="Past Trips" component={PastTrips} />
        <Stack.Screen name="Trip Overview" component={TripOverview} />
        <Stack.Screen name="Trip Viewer" component={TripViewer} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
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
