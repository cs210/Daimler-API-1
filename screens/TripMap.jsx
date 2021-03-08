import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import DialogInput from 'react-native-dialog-input';
import db from '../firebase';

export default function TripMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [pins, setPins] = useState([]); 
  const [dialog, setDialog] = useState(false);
  //Pin currently being editted
  const [currentPin, setCurrentPin] = useState([]); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let watchLocation = await Location.watchPositionAsync({
        accuracy:Location.Accuracy.High,
        timeInterval: 60000,
        distanceInterval: 10 // meters
      }, location => {
          setLocation(location);
          setRegion({latitude: location.coords.latitude,
             longitude: location.coords.longitude,
             latitudeDelta: 0.5,
             longitudeDelta: 0.5});
          let keys = {
             latitude : location.coords.latitude,
             longitude : location.coords.longitude
          }
          const newcoordinates = [...coordinates, keys]; //fix key
          setCoordinates(newcoordinates);
        }
      )
      setLocation(location);
      setRegion({latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5});
    })();
  }, []);

  const onMapPress = (e) => {
    const newPins = [...pins, {
      key: pins.length, 
      coordinate: e.nativeEvent.coordinate,
      title: ''}];
    setPins(newPins);
  }

  const onMarkerPress = (e) => {
    const marker = pins.find(
      m => m.coordinate.latitude === e.nativeEvent.coordinate.latitude 
        && m.coordinate.longitude === e.nativeEvent.coordinate.longitude
    );
    setDialog(true);
    setCurrentPin(marker);
  }

  const onNewTitleSubmit = (newTitle) => {
     const newPins = pins.map((pin) => {
      if (pin === currentPin) {
        const updatedPin = {
          ...pin,
          title: newTitle,
        };
        return updatedPin;
      }
      return pin;
    });
    console.log("Pins", newPins);
    setPins(newPins);
    setDialog(false);
  }
   
  const onSaveTripPress = async () => {
    if (pins.length == 0) return; // do nothing if no pins are placed
    const data = {trip0: pins}; // hard-coding trip name as "trip0"
    const collRef = db.collection('trips');
    const newTripRef = await collRef.add(data);
    console.log(`Added trip to Firebase reference: ${newTripRef.id}`);
    setPins([]);
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onLongPress={onMapPress}
        draggable
        onMarkerPress={onMarkerPress}
      >
        {pins.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            // onPress={onMarkerPress(marker.key)}
          />
        ))}
        <Polyline
          coordinates={[
            { latitude: 37.42773007993738, longitude: -122.16972973155477 },
            { latitude: 37.3688, longitude: -122.0363 },
            { latitude: 37.4323, longitude: -121.8996 },
            { latitude: 37.5485, longitude: -121.9886 },
            { latitude: 37.6688, longitude: -122.0810 },
            { latitude: 37.8044, longitude: -122.2712 },
            { latitude: 37.872226652833305, longitude: -122.2585604834523 }
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
      <DialogInput isDialogVisible={dialog}
                  title={"Enter pin title"}
                  message={"Current pin title: " + currentPin.title}
                  hintInput ={"Pin title"}
                  submitInput={(inputText) => {onNewTitleSubmit(inputText)}}
                  closeDialog={() => {setDialog(false)}}>
      </DialogInput>
      <TouchableOpacity onPress={onSaveTripPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>Save Trip</Text>
      </TouchableOpacity>
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
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
});
