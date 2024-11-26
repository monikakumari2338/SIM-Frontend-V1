import { useContext } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { Icon } from "@rneui/themed";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
   const { storeName, user } = useContext(AuthContext);

   const details = [
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
      flexDirection: "row",
      justifyContent: "space-between",
   },
   storeId: {
      fontFamily: "Montserrat-Bold",
      color: "white",
      fontSize: 12,
   },
});
