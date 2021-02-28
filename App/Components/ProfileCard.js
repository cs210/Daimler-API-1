import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Metrics } from '../Themes';

export default function ProfileCard( {profileImage, name, age, occupation} ) {
  return (
    <View style={styles.profileCard}> 
      <View>
        <Image style={styles.profilePic} source={profileImage} />
      </View>
      <View style={styles.profileDetails}>
        <Text style={ {fontSize: Metrics.profileDetailsBigFontSize} }>
          <Text style={ {fontWeight: 'bold'} }>{name},</Text>
          <Text>{age}</Text> 
        </Text>
        <Text style={ {fontSize: Metrics.profileDetailsSmallFontSize, color: Metrics.darkGray} }>
          {occupation}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    width: Metrics.screenWidth * 0.9,
    borderColor: Metrics.darkGray,
    borderWidth: Metrics.borderWidth,
    borderBottomLeftRadius: Metrics.profileCardRadius,
    borderBottomRightRadius: Metrics.profileCardRadius,
  },
  profilePic: {
    width: (Metrics.screenWidth * 0.9) - (2 * Metrics.borderWidth),
    height: (Metrics.screenWidth * 0.9) - (2 * Metrics.borderWidth),
  },
  profileDetails: {
    marginHorizontal: 15,
    marginVertical: 7.5,
  },
});