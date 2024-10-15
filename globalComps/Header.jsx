import { StyleSheet, View, Image, Text } from "react-native";
import { Icon } from "@rneui/themed";
import { storeName } from "../context/auth";

export default function Header() {
   const details = [
      {
         icon: "storefront",
         iconType: "ionicons",
         label:
            "Store: " +
            storeName
               .split(" ")
               .map((word) => word.charAt(0))
               .join(""),
      },
      {
         icon: "user",
         iconType: "feather",
         label: "swastik-r",
      },
   ];

   return (
      <View style={styles.header}>
         <Image
            source={require("../assets/kpmgLogo.png")}
            style={{
               width: 80,
               height: 30,
            }}
         />
         <View style={styles.storeInfoContainer}>
            {details.map((detail, index) => (
               <View key={index} style={{ flexDirection: "row" }}>
                  <Icon
                     name={detail.icon}
                     type={detail.iconType}
                     size={20}
                     color="white"
                  />
                  <Text style={styles.storeId}>{detail.label}</Text>
               </View>
            ))}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   header: {
      backgroundColor: "#112d4e",
      paddingHorizontal: 20,
      paddingTop: 30,
      // marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
   },
   storeId: {
      fontFamily: "Montserrat-Medium",
      color: "white",
      fontSize: 12,
   },
});
