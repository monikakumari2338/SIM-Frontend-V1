import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/base";

export default function PageTitle({ title }) {
   return (
      <View style={styles.pageTitleContainer}>
         <TouchableOpacity style={styles.backButton}>
            <Icon
               name="arrow-left-circle"
               type="feather"
               size={25}
               color="black"
            />
         </TouchableOpacity>
         <Text style={styles.subheaderText}>{title}</Text>
      </View>
   );
}

const styles = StyleSheet.create({
   subheaderText: {
      fontSize: 16,
      fontFamily: "Montserrat-Bold",
   },
   pageTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      elevation: 10,
      paddingVertical: 10,
   },
   backButton: {
      position: "absolute",
      left: 10,
   },
});
