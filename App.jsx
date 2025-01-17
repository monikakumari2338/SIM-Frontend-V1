import React, { useContext } from "react";
import "react-native-gesture-handler";
import {
   ActivityIndicator,
   View,
   Text,
   TouchableOpacity,
   StyleSheet,
   StatusBar,
   Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
   createDrawerNavigator,
   DrawerItemList,
   useDrawerStatus,
} from "@react-navigation/drawer";
import { Provider as PaperProvider } from "react-native-paper";
import Toast, { BaseToast } from "react-native-toast-message";
import { createTheme, Icon, ThemeProvider } from "@rneui/themed";
import {
   configureReanimatedLogger,
   ReanimatedLogLevel,
} from "react-native-reanimated";

// Contexts
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { FunctionProvider } from "./context/FunctionContext";

// Screens
import Login from "./modules/Login/Login";
import Dashboard from "./modules/Dashboard/Dashboard";
import DsdNavigator from "./modules/DirectStoreDelivery/DsdNavigator";
import IaNavigator from "./modules/InventoryAdjustment/IaNavigator";
import GsNavigator from "./modules/GlobalSearch/GsNavigator";
import PoNavigator from "./modules/PurchaseOrder/PoNavigator";
import TransferNavigator from "./modules/Transfer/TsfNavigator";
import ScNavigator from "./modules/StockCount/ScNavigator";
import RtvNavigator from "./modules/ReturnToVendor/RtvNavigator";

// Fonts
import { useFonts } from "expo-font";
import Footer from "./globalComps/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

configureReanimatedLogger({
   level: ReanimatedLogLevel.warn,
   strict: false,
});

const Drawer = createDrawerNavigator();

export default function App() {
   const [loaded] = useFonts({
      "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
      "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
      "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
      "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Light": require("./assets/fonts/Montserrat-Light.ttf"),
   });
   if (!loaded) {
      return <ActivityIndicator size="large" color="#112d4e" />;
   }

   async function clearAsync() {
      try {
         await AsyncStorage.clear();
      } catch (error) {
         console.log(error);
      }
   }
   clearAsync();

   return (
      <AuthProvider>
         <ThemeProvider theme={theme}>
            <FunctionProvider>
               <PaperProvider>
                  <Toast config={toastConfig} />
                  <MainApp />
               </PaperProvider>
            </FunctionProvider>
         </ThemeProvider>
      </AuthProvider>
   );
}

// Comp: Main App
function MainApp() {
   const { isAuthenticated, user, storeName } = useContext(AuthContext);
   const userDetails = [
      {
         icon: "storefront",
         iconType: "ionicons",
         label: storeName,
      },
      {
         icon: "user",
         iconType: "feather",
         label: user.split(" ")[0],
      },
   ];

   return (
      <>
         <StatusBar barStyle="light-content" backgroundColor="#112d4e" />
         <NavigationContainer>
            <Drawer.Navigator
               drawerContent={(props) => (
                  <>
                     <View style={styles.header}>
                        <Image
                           source={require("../SIM-Frontend-V1/assets/kpmgLogo.png")}
                           style={{
                              width: 80,
                              height: 30,
                           }}
                        />

                        <View style={styles.storeInfoContainer}>
                           {userDetails.map((detail, index) => (
                              <View
                                 key={index}
                                 style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                 }}
                              >
                                 <Icon
                                    name={detail.icon}
                                    type={detail.iconType}
                                    size={15}
                                    color="white"
                                    style={{ marginRight: 5 }}
                                 />
                                 <Text style={styles.storeId}>
                                    {detail.label}
                                 </Text>
                              </View>
                           ))}
                        </View>
                     </View>

                     <LogoutButton {...props} />
                  </>
               )}
               initialRouteName="Dashboard"
               screenOptions={{
                  drawerStyle: {
                     backgroundColor: "#112d4e",
                     // paddingTop: 40,
                  },
                  drawerInactiveTintColor: "white",
                  drawerLabelStyle: {
                     fontFamily: "Montserrat-Regular",
                     fontSize: 16,
                  },
                  headerStyle: {
                     backgroundColor: "#112d4e",
                  },
                  headerTitleAlign: "center",
                  headerTintColor: "white",
                  headerTitleStyle: {
                     fontFamily: "Montserrat-Regular",
                  },
                  drawerType: "front",
                  headerShown: isAuthenticated ? true : false,
               }}
            >
               {isAuthenticated ? (
                  <>
                     <Drawer.Screen name="Dashboard" component={Dashboard} />
                     <Drawer.Screen
                        name="Inventory Adjustment"
                        component={IaNavigator}
                     />
                     <Drawer.Screen
                        name="Direct Store Delivery"
                        component={DsdNavigator}
                     />
                     <Drawer.Screen
                        name="Item Lookup"
                        component={GsNavigator}
                     />
                     <Drawer.Screen
                        name="Purchase Order"
                        component={PoNavigator}
                     />
                     <Drawer.Screen
                        name="Transfer"
                        component={TransferNavigator}
                     />
                     <Drawer.Screen
                        name="Stock Count"
                        component={ScNavigator}
                     />
                     <Drawer.Screen
                        name="Return To Vendor"
                        component={RtvNavigator}
                     />
                  </>
               ) : (
                  <Drawer.Screen name="Login" component={Login} />
               )}
            </Drawer.Navigator>
            {
               // If the user is authenticated, show the Footer
               isAuthenticated && <Footer />
            }
         </NavigationContainer>
      </>
   );
}

// Comp: Logout Button
function LogoutButton(props) {
   const { handleLogout } = useContext(AuthContext);

   // Styles for the Logout Button
   const styles = StyleSheet.create({
      logoutButton: {
         margin: 20,
         marginBottom: 100,
         paddingVertical: 10,
         paddingHorizontal: 15,
         borderRadius: 5,
         backgroundColor: "#483698",
         alignItems: "center",
         alignSelf: "flex-start",
         marginTop: "auto",
      },
      logoutText: {
         color: "white",
         fontSize: 16,
         fontFamily: "Montserrat-Bold",
      },
   });

   return (
      <View style={{ flex: 1 }}>
         <DrawerItemList {...props} />
         <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
               handleLogout();
               props.navigation.closeDrawer();
            }}
         >
            <Text style={styles.logoutText}>Logout</Text>
         </TouchableOpacity>
      </View>
   );
}

// Theme Configuration
const theme = createTheme({
   mode: "light",
   lightColors: {
      primary: "#112d4e",
      secondary: "#483698",
      tertiary: "#4A99E2",
      white: "#f0f0f0",
      text: "#000000",
   },
});

// Toast Configuration
const toastConfig = {
   success: (props) => (
      <BaseToast
         {...props}
         style={{ borderLeftColor: "green" }}
         text1Style={{
            fontFamily: "Montserrat-Bold",
            fontSize: 17,
         }}
         text2Style={{
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
         }}
      />
   ),
   error: (props) => (
      <BaseToast
         {...props}
         style={{ borderLeftColor: "red" }}
         text1Style={{
            fontFamily: "Montserrat-Bold",
            fontSize: 17,
         }}
         text2Style={{
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
         }}
      />
   ),
   info: (props) => (
      <BaseToast
         {...props}
         style={{ borderLeftColor: "blue" }}
         text1Style={{
            fontFamily: "Montserrat-Bold",
            fontSize: 17,
         }}
         text2Style={{
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
         }}
      />
   ),
};

// Styles
const styles = StyleSheet.create({
   header: {
      backgroundColor: "#112d4e",
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
   },
   storeId: {
      fontFamily: "Montserrat-Bold",
      color: "white",
      fontSize: 12,
   },
});
