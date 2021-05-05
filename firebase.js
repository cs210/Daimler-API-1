import "firebase/firestore";

import * as firebase from "firebase";

import {
  firebaseApiKey,
  firebaseAppId,
  firebaseMeasurementId,
  firebaseProjectName,
  firebaseSenderId,
  firebaseStorageUrl,
} from "./keys";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseProjectName + ".firebaseapp.com",
  projectId: firebaseProjectName,
  storageBucket: firebaseStorageUrl,
  messagingSenderId: firebaseSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// firebase.initializeApp(firebaseConfig);
var firestore = firebase.firestore();

// export const auth = firebase.auth();
export default firestore;
