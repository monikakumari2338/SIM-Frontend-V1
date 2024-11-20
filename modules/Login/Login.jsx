import { Button } from "@rneui/themed";
import React, { useContext, useState } from "react";
import {
   View,
   Text,
   TextInput,
   StyleSheet,
   Image,
   KeyboardAvoidingView,
   Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
   const { handleLogin } = useContext(AuthContext);

   // Only for the login page, handling input
   const [email, setEmail] = useState("monikakumari103@gmail.com");
   const [password, setPassword] = useState("abc123");
   const [store, setStore] = useState("Pacific Dwarka");

   async function attemptLogin() {
      try {
         await handleLogin(email, password, store);
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <KeyboardAvoidingView
         style={styles.loginPage}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
         <View style={styles.loginContainer}>
            {/* Logo Image */}
            <Image
               source={require("../../assets/kpmgLogo.png")}
               style={styles.logo}
            />

            {/* Heading */}
            <View>
               <Text style={styles.helperHeading}>Welcome to</Text>
               <Text style={styles.heading}>Store Inventory Management</Text>
            </View>

            <View>
               {/* user */}
               <View style={styles.infoContainer}>
                  <Text style={styles.label}>User</Text>
                  <TextInput
                     style={styles.input}
                     autoComplete="email"
                     placeholder={"Enter your email"}
                     placeholderTextColor={"#f0f0f0"}
                     onChangeText={setEmail}
                  />
               </View>

               {/* Password */}
               <View style={styles.infoContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                     style={styles.input}
                     placeholder={"Enter your password"}
                     placeholderTextColor={"#f0f0f0"}
                     onChangeText={setPassword}
                     secureTextEntry
                  />
               </View>

               {/* Store Dropdown */}
               <View style={styles.infoContainer}>
                  <Text style={styles.label}>Store</Text>
                  <TextInput
                     style={styles.input}
                     placeholder={"Select your store"}
                     placeholderTextColor={"#f0f0f0"}
                     onChangeText={setStore}
                  />
               </View>
            </View>
            {/* Login Button */}
            <Button
               buttonStyle={styles.loginButton}
               titleStyle={styles.loginButtonTitle}
               onPress={attemptLogin}
            >
               Login
            </Button>
         </View>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   loginPage: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "#112d4e",
   },
   logo: {
      resizeMode: "contain",
      height: 80,
   },
   loginContainer: {
      flex: 1,
      justifyContent: "space-evenly",
      alignItems: "center",
   },
   helperHeading: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Montserrat-Regular",
      color: "white",
   },
   heading: {
      textAlign: "center",
      fontSize: 20,
      fontFamily: "Montserrat-Bold",
      color: "white",
   },
   label: {
      fontSize: 17,
      fontFamily: "Montserrat-Regular",
      color: "white",
      marginBottom: 10,
      marginLeft: 5,
   },
   infoContainer: {
      marginVertical: 10,
   },
   input: {
      width: 250,
      height: 50,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: "silver",
      padding: 10,
      fontFamily: "Montserrat-Bold",
      fontSize: 15,
      textAlign: "center",
      color: "white",
   },
   loginButton: {
      width: 250,
      height: 50,
      borderRadius: 5,
      backgroundColor: "#4A99E2",
      justifyContent: "center",
      alignItems: "center",
   },
   loginButtonTitle: {
      fontFamily: "Montserrat-Bold",
      fontSize: 17,
      color: "#f0f0f0",
      textTransform: "uppercase",
   },
});
