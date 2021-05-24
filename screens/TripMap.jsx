import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React, { useEffect, useState } from "react";

import PinPopup from "./PinPopup";
import { useFocusEffect } from "@react-navigation/native";
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
  const [isTripPaused, setIsTripPaused] = useState(true);
  const [isTripRecording, setIsTripRecording] = useState(false);
  const [isTripStarted, setIsTripStarted] = useState(false);
  const [time, setTime] = useState("");
  const LOCATION_TASK_NAME = 'background-location-task';

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const {
          status,
        } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      })();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!isTripStarted) {
        setPins([]);
        console.log("setcoordinates called in usefocuseffect");
        setCoordinates([]);
      }
    }, [isTripRecording, isTripStarted])
  );

  useEffect(() => {
    updateUsersLocation();
    // let timer = setInterval(updateUsersLocation, 4000);
    // clean-up interval timer on un-mount
    // return () => {
    //   clearInterval(timer);
    // };
  }, [isTripRecording]);

  const updateUsersLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    console.log("updateUsersLocationcalled");
    // let locationAccuracy = { accuracy: Location.Accuracy.Balanced };
    // let location = await Location.getCurrentPositionAsync(locationAccuracy);
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
    });
  };

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
    if (error) {
      // check `error.message` for more details.
      return;
    }
    console.log('Received new locations', locations);
    const randomNumb = Math.floor(Math.random() * 10) + 1 ;
    console.log("randomNumb", randomNumb);
    console.log("coordinates", coordinates);
    // if (randomNumb == 8 || randomNumb == 4) {
    updateLocationInfo(locations[0]);
    //}
    // setInterval(() => {
    //   console.log('This will run every 1 second!');
    //   console.log("coordinates", coordinates);
    //   updateLocationInfo(locations[0]);
    // }, 10000);
  });

  const updateLocationInfo = (location) => {
    // const location = locations[0];
    setLocation(location);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.125,
      longitudeDelta: 0.125,
    });
    let keys = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    if (isTripRecording) {
      console.log("setcoordinates called in updateInfo with coordinates", keys);
      setCoordinates(coordinates => ([...coordinates, keys]));
    }
  };

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

  const onFinishTripPress = () => {
    if ((pins.length == 0 && coordinates.length == 0) || !isTripStarted) {
      navigation.navigate("Feed");
      return;
    }
    const data = {
      tripTitleText: "",
      pins: pins,
      coordinates: coordinates,
      time: time,
      isNewTrip: true,
    };
    setIsTripRecording(false);
    setIsTripStarted(false);
    navigation.navigate("Trip Overview", data);
  };

  const onPauseTripPress = async () => {
    if (!isTripStarted) {
      setIsTripStarted(true);
      setIsTripRecording(true);
      setIsTripPaused(false);
      setTime(new Date().toISOString());
    } else {
      if (isTripPaused) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      setIsTripPaused(!isTripPaused);
      setIsTripRecording(!isTripRecording);
    }
  };

  const exitEditPin = () => {
    setIsPinPopupVisible(false);
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

  const tripButtonText = () => {
    if (!isTripStarted) {
      return "Start trip";
    } else if (!isTripPaused) {
      return "Pause trip";
    } else {
      return "Resume trip";
    }
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
            draggable
            ref={(ref) => {
              markers[marker.key] = ref;
            }}
            stopPropagation={true}
            onCalloutPress={() => onMarkerPress(marker)}
          >
            <MapView.Callout>
              <View>
                <Text>{marker.title}</Text>
                <Text>{marker.description}</Text>
                <ScrollView horizontal={true}>
                  {marker.photos &&
                    marker.photos.map((photo) => (
                      <Image
                        key={photo.key}
                        source={{ uri: photo.uri }}
                        style={styles.image}
                      />
                    ))}
                </ScrollView>
              </View>
            </MapView.Callout>
          </Marker>
        ))}
        {coordinates.length > 0 && (
          <Polyline
            strokeColor="#FF0000"
            strokeWidth={2}
            coordinates={coordinates.map((coord) => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            }))}
          />
        )}
      </MapView>
      {isPinPopupVisible && (
        <PinPopup
          pin={currentPin}
          getUpdatedPin={getUpdatedPin}
          deletePin={deletePin}
          exitEditPin={exitEditPin}
        />
      )}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={onPauseTripPress}
          style={styles.appButtonContainer}
        >
          <Text style={styles.appButtonText}>{tripButtonText()}</Text>
        </TouchableOpacity>
        {isTripStarted && (
          <TouchableOpacity
            onPress={onFinishTripPress}
            style={styles.appButtonContainer}
          >
            <Text style={styles.appButtonText}>Finish Trip</Text>
          </TouchableOpacity>
        )}
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
    padding: 10,
  },
  header: {
    fontSize: 30,
    color: "#000000",
    fontWeight: "bold",
    margin: 15,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.68,
    margin: 35,
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#00A398",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 5,
    marginBottom: 20,
    marginTop: 15,
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  image: {
    width: Dimensions.get("window").width * 0.28,
    height: Dimensions.get("window").width * 0.28,
    margin: 5,
  },
});
