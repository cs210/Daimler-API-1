import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Profiles, Metrics } from './App/Themes';
import { NavBar, ProfileCard, ActionBar } from './App/Components/';

export default function App() {
  const haroldProfile = Profiles.harold;
  const [prevProfile, setPreviousProfile] = useState(haroldProfile);
  const [currProfile, setCurrentProfile] = useState(haroldProfile);
  const [profileImage, setProfileImage] = useState(haroldProfile.image);
  const [name, setName] = useState(haroldProfile.name);
  const [age, setAge] = useState(haroldProfile.age);
  const [occupation, setOccupation] = useState(haroldProfile.occupation);

  let loadNextProfile = () => {
    setPreviousProfile(currProfile);
    const newProfile = Profiles.random();
    setCurrentProfile(newProfile);
    setProfileImage(newProfile.image);
    setName(newProfile.name);
    setAge(newProfile.age);
    setOccupation(newProfile.occupation);
  }

  let loadPreviousProfile = () => {
    if (currProfile === prevProfile) {
      Alert.alert("Can't load previous profile!")
    } else {
      setCurrentProfile(prevProfile);
      setProfileImage(prevProfile.image);
      setName(prevProfile.name);
      setAge(prevProfile.age);
      setOccupation(prevProfile.occupation);
    }
  }

  let boostProfile = () => {
    Alert.alert("Boosting your profile!");
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      <ProfileCard 
        profileImage={profileImage} 
        name={name} 
        age={age} 
        occupation={occupation}
      />
      <ActionBar 
        onPressNext={loadNextProfile} 
        onPressPrev={loadPreviousProfile}
        onPressBoost={boostProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Metrics.lightBackground,
  },
});