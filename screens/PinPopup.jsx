import React, { useState } from "react";
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";

export default function PinPopup(props) {
    const [pinTitle, setPinTitle] = useState(props.pin.title);
    const [pinDescrip, setPinDescrip] = useState('');
    // potentailly add feature to allow user to set new location

    return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.flexView}>
              <Text style={styles.text}> Pin title </Text>
              <TextInput style={styles.titleInput}
                placeholder="Pin title"
                onChangeText={(text) => setPinTitle(text)}
                defaultValue={pinTitle}
              />
            </View>
            <View style={styles.flexView}>
              <Text style={styles.text}> Pin description </Text>
              <TextInput style={styles.titleInput}
                placeholder="Pin description"
                onChangeText={(text) => setPinDescrip(text)}
                defaultValue={pinDescrip}
              />
            </View>
            <TouchableOpacity
              style={styles.appButtonContainer}
              onPress={() => {
                props.getUpdatedPin({
                    ...props.pin,
                    title: pinTitle,
                    description: pinDescrip,
                  });
                }
              }>
              <Text style={styles.appButtonText}> Save pin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  flexView: {
    marginBottom: 15,
    alignItems: 'stretch',
    height: 40,
    flexDirection:'row'
   },
  text: {
     marginTop: 10,
     marginRight: 10,
     fontWeight: "bold", 
   },
  titleInput: {
    borderWidth: 1,
    flex: 2,
    borderColor: '#00A398',
    padding: 5
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
