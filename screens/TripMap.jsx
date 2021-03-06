import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';

export default function TripMap() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const initialRegion = {latitude: 37.42773007993738,
  longitude: -122.16972973155477,
  latitudeDelta: 0.922,
  longitudeDelta: 0.922};
  const [region, setRegion] = useState(null);

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestPermissionsAsync();
  //     if (status !== 'granted') {
  //       setErrorMsg('Permission to access location was denied');
  //       return;
  //     }
  //
  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location);
  //     setRegion({latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //       latitudeDelta: 0.5,
  //       longitudeDelta: 0.5});
  //   })();
  // }, []);

  useEffect(() => {
   async function startWatching() {
     // locationService.subscribe(onLocationUpdate)
     try {
       let { status } = await Location.requestPermissionsAsync();
       if (status !== 'granted') {
         setErrorMsg('Permission to access location was denied');
         return;
       }
       let isRegistered = await TaskManager.isTaskRegisteredAsync('firstTask');
       if (isRegistered) {
         TaskManager.unregisterTaskAsync('firstTask')
       }
       let location = await Location.startLocationUpdatesAsync('firstTask', {
         accuracy: Location.Accuracy.BestForNavigation,
         timeInterval: 60000,
         activityType: Location.ActivityType.AutomotiveNavigation,
         deferredUpdatesInterval: 90000
       });
     } catch (e) {
       setErrMsg(e);
       return;
     }
   };
   // startWatching()
 }, []);

 TaskManager.defineTask('firstTask', ({ data, error }) => {
   if (error) {
     // Error occurred - check `error.message` for more details.
     return;
   }
   if (data) {
     const { latitude, longitude } = data.locations[0].coords
     locationService.setLocation({latitude, longitude})
     // console.log('locations', locations);
     locationService.setRegion({latitude: location.coords.latitude,
       longitude: location.coords.longitude,
       latitudeDelta: 0.5,
       longitudeDelta: 0.5});
   }
 });

  // let text = 'Waiting..';
  // if (errorMsg) {
  //   text = errorMsg;
  // } else if (location) {
  //   text = location.coords.latitude;
  // }


  // const onRegionChange = (region) {
  //   setRegion
  // }

  const pins = [
    {
      latlng: { latitude: 37.42773007993738, longitude: -122.16972973155477 },
      title: "Stanford",
      description: "Started our road trip 🎉",
    },
    {
      latlng: { latitude: 37.872226652833305, longitude: -122.2585604834523 },
      title: "Berkeley",
      description: "Stopped here to visit friends ☺️",
    },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map of Trip</Text>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        showsUserLocation={true}
      >
        {pins.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.description}
          />
        ))}
        <Polyline
          coordinates={[
  			       { latitude: 37.42773007993738, longitude: -122.16972973155477 },
  			       { latitude: 37.872226652833305, longitude: -122.2585604834523 }
  		    ]}
          strokeColor="#FF0000"
		      strokeWidth={2}
        />
      </MapView>
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
    height: Dimensions.get("window").height * 0.8,
  },
});
