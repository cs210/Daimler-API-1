import * as Location from "expo-location";

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React, { useEffect, useState, createContext } from "react";
import PinPopup from './PinPopup';

export default function TripMap({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [pins, setPins] = useState([]);
  const [isPinPopupVisible, setIsPinPopupVisible] = useState(false);
  //Pin currently being editted
  const [currentPin, setCurrentPin] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [isTripPaused, setIsTripPaused] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let watchLocation = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 60000,
          distanceInterval: 10, // meters
        },
        (location) => {
          setLocation(location);
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
          let keys = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          const newcoordinates = [...coordinates, keys];
          setCoordinates(newcoordinates);
        }
      );
    })();
  }, []);

  useEffect(() => {
    if (location && pins.length == 0) { // will cause an issue if user tries to delete starting pin
      const marker = {
        key: 0,
        coordinate: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        title: "Started Trip",
        description: "",
      };
      setPins([marker]);
      setCurrentPin(marker);
      setIsPinPopupVisible(true);
    }
  });

  const onMapPress = (e) => {
    const newPins = [
      ...pins,
      {
        key: pins.length, //will become problematic when array size changes
        coordinate: e.nativeEvent.coordinate,
        title: "Stop " + (pins.length + 1), //will become problematic when array size changes
        description: "",
      },
    ];
    setPins(newPins);
  };

  const onMarkerPress = (marker) => {
    setIsPinPopupVisible(true);
    setCurrentPin(marker);
    markers[marker.key].hideCallout();
  };

  const onFinishTripPress = async () => {
    if (pins.length == 0) return; // do nothing if no pins are placed
    const data = { tripTitleText: "", pins: pins }; 
    navigation.navigate("Trip Overview", data);
  };

  const onPauseTripPress = async () => {
    setIsTripPaused(!isTripPaused);
  };

  const getUpdatedPin = (newPin) => {
    // Callback to set pin with updated pin
    const newPins = pins.map((pin) => {
      if (pin.key === newPin.key) {
        return newPin;
      }
      return pin;
    });
    setPins(newPins);
    setIsPinPopupVisible(false);
  };

  const deletePin = (pinToDelete) => {
    console.log("pin to delete", pinToDelete.key);
    // const newPins = pins.map((pin) => {
    //   console.log("pin.key", pin.key);
    //   if (pin.key != pinToDelete.key) {
    //     console.log("not equal");
    //     return pin;
    //   }
    // });
    newPins = pins.filter(pin => pin.key != pinToDelete.key);
    console.log("new pins", newPins);
    setPins(newPins);
    setIsPinPopupVisible(false);
  }
 
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onLongPress={onMapPress}
      >
        {pins.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            draggable
            ref={ref => {
              markers[marker.key] = ref;}}
            stopPropagation={true}
            onCalloutPress={() => onMarkerPress(marker)}
          />
        ))}
        <Polyline
          coordinates={[
            { latitude: 37.42773007993738, longitude: -122.16972973155477 },
            { latitude: 37.3688, longitude: -122.0363 },
            { latitude: 37.4323, longitude: -121.8996 },
            { latitude: 37.5485, longitude: -121.9886 },
            { latitude: 37.6688, longitude: -122.081 },
            { latitude: 37.8044, longitude: -122.2712 },
            { latitude: 37.872226652833305, longitude: -122.2585604834523 },
          ]}
          strokeColor="#FF0000"
          strokeWidth={2}
        />
        <Polyline
          coordinates={coordinates}
          strokeColor="#FF0000"
          strokeWidth={2}
        />
      </MapView>
      {isPinPopupVisible && <PinPopup
        pin={currentPin}
        getUpdatedPin={getUpdatedPin}
        deletePin={deletePin} />}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={onPauseTripPress}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>{isTripPaused ? 'Resume Trip' : 'Pause Trip'} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFinishTripPress}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>Finish Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15,
  },
  header: {
    fontSize: 30,
    color: "#8275BD",
    fontWeight: "bold",
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 5,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
});
