// React Native Imports
import "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";

// React Native Elements UI Library
import { createTheme, ThemeProvider } from "@rneui/themed";

// Custom Components
import Toast, { BaseToast } from "react-native-toast-message";

// Contexts and Fonts
import { useFonts } from "expo-font";
import AppContainer from "./AppContainer";

// implement a loader for the app content

// Main App Component
export default function App() {
   // Loader for the app
   function Loader() {
      return (
         <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
         >
            <ActivityIndicator size="large" color="#0000ff" />
         </View>
      );
   }
   // Load Fonts
   const [loaded] = loadFonts();
   if (!loaded) {
      return <Loader />;
   }

   return (
      <ThemeProvider theme={theme}>
         <NavigationContainer>
            {/* APP CONTAINER */}
            <PaperProvider>
               <AppContainer />
               {/* <Login /> */}
            </PaperProvider>
            {/* TOAST */}
            <Toast config={toastConfig} />
         </NavigationContainer>
      </ThemeProvider>
   );
}

// Load Fonts
function loadFonts() {
   return useFonts({
      "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
      "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
      "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
   });
}

// Theme
const theme = createTheme({
   mode: "light",
   lightColors: {
      primary: "#112d4e",
      secondary: "#483698",
      tertiary: "#4A99E2",
      white: "#f0f0f0",
      text: "#000000",
   },
   fonts: {
      regular: "Montserrat-Regular",
      medium: "Montserrat-Medium",
      bold: "Montserrat-Bold",
   },
});

// Toast Config
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
