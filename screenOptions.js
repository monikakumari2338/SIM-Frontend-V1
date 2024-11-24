// screenOptions.js
import { Icon } from "@rneui/themed";
import { Text, StyleSheet, View } from "react-native";

export const screenOptions = {
   headerStyle: {
      backgroundColor: "rgb(225,225,225)",
      elevation: 0,
      height: 35,
   },
   headerBackImage: () => (
      <Icon
         name="arrow-left-circle"
         type="material-community"
         size={20}
         color="white"
      />
   ),
   headerTitle: ({ children }) => (
      <Text style={styles.headerTitle}>{children}</Text>
   ),
   headerBackground: () => (
      <View
         style={{
            backgroundColor: "#3e2f84",
            height: 35,
         }}
      />
   ),
   headerTitleAlign: "center",
};

const styles = StyleSheet.create({
   headerTitle: {
      fontFamily: "Montserrat-Medium",
      fontSize: 15,
      color: "#fff",
   },
});
