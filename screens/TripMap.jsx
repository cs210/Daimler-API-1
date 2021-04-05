import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React, { useEffect, useState } from "react";
import PinPopup from "./PinPopup";
import { v4 as uuidv4 } from "uuid";

/**
 * This component shows the user's current location and route. By doing a long
 * press on the screen, the user can add a pin. When the user taps on the pin,
 * a pin marker is shown. When they press on the marker, they are shown the 
 * pin popup, allowing them to edit information about the pin.
 */
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
  const [isStartPinCreated, setIsStartPinCreated] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    if (!isStartPinCreated && location && pins.length == 0) {
      const marker = {
        key: uuidv4(),
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
      setIsStartPinCreated(true);
    }
  }, []);

  useEffect(() => {
    updateUsersLocation();
    let timer = setInterval(updateUsersLocation, 5000);
    // clean-up interval timer on un-mount
    return () => {
      clearInterval(timer);
    }
  }, []);

  const updateUsersLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    let locationAccuracy = { accuracy: Location.Accuracy.Balanced }
    let location = await Location.getCurrentPositionAsync(locationAccuracy);
    updateLocationInfo(location);
  };

  const updateLocationInfo = (location) => {
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
    setCoordinates(coords => [...coords, keys]);
  }

  const onMapPress = (e) => {
    const newPins = [
      ...pins,
      {
        key: uuidv4(),
        coordinate: e.nativeEvent.coordinate,
        title: "Stop " + (pins.length + 1),
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
    if (pins.length == 0) {
      navigation.navigate("Home");
      return;
    }
    const data = { tripTitleText: "", pins: pins };
    navigation.navigate("Trip Overview", data);
  };

  const onPauseTripPress = async () => {
    setIsTripPaused(!isTripPaused);
  };

  const getUpdatedPin = (newPin) => {
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
    const newPins = pins.filter((pin) => pin.key != pinToDelete.key);
    setPins(newPins);
    setIsPinPopupVisible(false);
  };


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
            ref={(ref) => {
              markers[marker.key] = ref;
            }}
            stopPropagation={true}
            onCalloutPress={() => onMarkerPress(marker)}
          />
        ))}
        <Polyline
          strokeColor="#FF0000"
          strokeWidth={2}
          coordinates={pins.map((pin) => ({
            latitude: pin.coordinate.latitude,
            longitude: pin.coordinate.longitude,
          }))}
        />
      </MapView>
      {isPinPopupVisible && (
        <PinPopup
          pin={currentPin}
          getUpdatedPin={getUpdatedPin}
          deletePin={deletePin}
        />
      )}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={onPauseTripPress}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>
            {isTripPaused ? "Resume Trip" : "Pause Trip"}{" "}
          </Text>
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
