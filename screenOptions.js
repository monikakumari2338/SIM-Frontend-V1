// screenOptions.js
import { Icon } from "@rneui/themed";
import { Text, StyleSheet, View } from "react-native";

export const screenOptions = {
   headerStyle: {
      backgroundColor: "rgb(225,225,225)",
      elevation: 0,
      height: 30,
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
      <View style={{ backgroundColor: "#0492c2", height: 30 }} />
   ),
   headerTitleAlign: "center",
};

const styles = StyleSheet.create({
   headerTitle: {
      fontFamily: "Montserrat-Bold",
      fontSize: 14,
      color: "#fff",
      // marginLeft: -20,  ---> for left align
      marginBottom: 3,
   },
});
