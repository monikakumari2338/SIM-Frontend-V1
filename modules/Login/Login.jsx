import { Button, Icon } from "@rneui/themed";
import React, { useContext, useState, useEffect } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { endpoints } from "../../context/endpoints";
import Toast from "react-native-toast-message";

export default function Login() {
   const { handleLogin, getData } = useContext(AuthContext);

   // Only for the login page, handling input
   const [email, setEmail] = useState("monikakumari103@gmail.com");
   const [password, setPassword] = useState("abc123");
   const [store, setStore] = useState("Pacific Dwarka");

   // useEffect for fetching ALL STORES
   const [allStores, setAllStores] = useState([]);
   useEffect(() => {
      async function fetchAllStores() {
         try {
            const response = await getData(endpoints.getAllStores);

            // Check if the response is an array before calling map
            if (Array.isArray(response)) {
               setAllStores(
                  response.map((store) => ({
                     label: store.storeName,
                     value: store.storeId,
                  }))
               );
            } else {
               console.error("Expected an array but got:", response);
               // Optionally, handle the error by showing a message or empty list
               setAllStores([]);
            }
         } catch (error) {
            console.log("Error fetching stores:", error);
            setAllStores([]); // Set empty stores if the fetch fails
         }
      }

      fetchAllStores();
   }, []);

   async function attemptLogin() {
      try {
         await handleLogin(email, password, store);
      } catch (error) {
         console.log(error);
      }
   }

   if (allStores.length === 0) {
      return (
         <View style={styles.loginPage}>
            <Text style={{ color: "white" }}>Loading...</Text>
         </View>
      );
   } else {
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
                     <DropdownComponent {...{ data: allStores, setStore }} />
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
}

function DropdownComponent({ data, setStore }) {
   const [value, setValue] = useState(null);

   const renderItem = (item) => {
      return (
         <View style={styles.item}>
            <Text style={styles.textItem}>
               Store {item.value}: {item.label}
            </Text>
         </View>
      );
   };

   return (
      <Dropdown
         style={styles.input}
         placeholderStyle={styles.placeholderStyle}
         selectedTextStyle={styles.selectedTextStyle}
         iconStyle={styles.iconStyle}
         data={data}
         maxHeight={300}
         labelField="label"
         valueField="value"
         placeholder="Select a store"
         searchPlaceholder="Search..."
         value={value}
         onChange={(item) => {
            {
               setValue(item.value);
               setStore(item.label);
            }
         }}
         renderItem={renderItem}
      />
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
      fontSize: 16,
      fontFamily: "Montserrat-Bold",
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
      fontFamily: "Montserrat-Regular",
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
      color: "#f0f0f0",
      textTransform: "uppercase",
   },
   icon: {
      marginRight: 10,
   },
   item: {
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   textItem: {
      flex: 1,
      fontFamily: "Montserrat-Regular",
   },
   placeholderStyle: {
      color: "#f0f0f0",
      fontFamily: "Montserrat-Regular",
      fontSize: 14,
   },
   selectedTextStyle: {
      color: "#f0f0f0",
      fontFamily: "Montserrat-Regular",
      fontSize: 14,
   },
   inputSearchStyle: {
      height: 40,
   },
});
