import { StyleSheet, Text, TouchableOpacity, View, Linking } from "react-native";

import PastTrips from "./PastTrips";
import React, {useState, useEffect} from "react";
import TripMap from "./TripMap";

const useMount = func => useEffect(() => func(), []);

const useInitialURL = () => {
  const [url, setUrl] = useState(null);
  const [processing, setProcessing] = useState(true);

  useMount(() => {
    const getUrlAsync = async () => {
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();

      // The setTimeout is just for testing purpose
      setTimeout(() => {
        setUrl(initialUrl);
        setProcessing(false);
      }, 1000);
    };

    getUrlAsync();
  });

  return { url, processing };
};
// const base64 = require('base-64');

// const getAccessToken = async () => {
//   try {
//     let response = await fetch('https://id.mercedes-benz.com/as/token.oauth2', {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Basic ' + base64.encode('<insert_your_base64_encoded_client_id_and_client_secret_here>'),
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: JSON.stringify({

//       })
//     }

//     );
//   }
// }

export const Home = ({ navigation }) => {
  const { url: initialUrl } = useInitialURL();

  const onPressStart = () => {
    console.log("pressed start trip");
    console.log("inital url: ", initialUrl);
    navigation.navigate("Trip Map");
  };
  const onPressView = () => {
    console.log("pressed view past trips");
    navigation.navigate("Past Trips");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Road Trip Buddy</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://id.mercedes-benz.com/as/authorization.oauth2?response_type=code&client_id=142a054e-e379-4af0-92ee-4c896c8b4573&redirect_uri=https://localhost&scope=mb:vehicle:status:general mb:user:pool:reader offline_access&state=xyzABC123')}
        style={styles.loginButtonContainer}
      >
        <Text style={styles.loginButtonText}>
          Log In with Mercedes-Benz
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPressStart}
        style={styles.appButtonContainer}
      >
        <Text style={styles.appButtonText}>Start Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressView} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>View Past Trips</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", //"#aeb8c1"
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  loginButtonContainer: {
    elevation: 8,
    backgroundColor: "#AEB8C1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  loginButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },
});
