import {
   View,
   Text,
   TouchableOpacity,
   StyleSheet,
   ImageBackground,
} from "react-native";
import { Icon } from "@rneui/base";
import { useTheme } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

export default function Footer() {
   const { theme } = useTheme();
   const navigation = useNavigation();
   const footerItems = [
      {
         icon: {
            name: "transfer",
            type: "material-community",
         },
         title: "TSF",
         redirectTo: "Transfer",
      },
      {
         icon: {
            name: "book-settings",
            type: "material-community",
         },
         title: "IA",
         redirectTo: "Inventory Adjustment",
      },
      {
         icon: {
            name: "qrcode-scan",
            type: "material-community",
         },
         redirectTo: "Item Lookup",
      },
      {
         icon: {
            name: "cart-arrow-down",
            type: "material-community",
         },
         title: "PO",
         redirectTo: "Purchase Order",
      },
      {
         icon: {
            name: "truck-delivery",
            type: "material-community",
         },
         title: "DSD",
         redirectTo: "Direct Store Delivery",
      },
   ];

   return (
      <ImageBackground
         source={require("./footerBg.png")}
         style={{
            position: "absolute",
            bottom: -10,
            width: "100%",
         }}
      >
         <View
            style={{
               ...styles.footer,
            }}
         >
            {footerItems.map((item, index) => (
               <TouchableOpacity
                  key={index}
                  style={[
                     styles.footerButton,
                     index === 2 && styles.centerButton, // Apply special style for the center button
                  ]}
                  onPress={() => navigation.navigate(item.redirectTo)}
               >
                  <Icon
                     color="white"
                     size={item.icon.name === "qrcode-scan" ? 35 : 25}
                     {...item.icon}
                     iconStyle={{
                        marginBottom: 5,
                     }}
                  />
                  <Text style={styles.footerContent}>{item.title}</Text>
               </TouchableOpacity>
            ))}
         </View>

         {/* Central Floating Button */}
         <View
            style={{
               position: "absolute",
               width: 70,
               height: 70,
               backgroundColor: "#112d4e",
               borderRadius: 100,
               left: "50%", // Center horizontally
               marginLeft: -34.5, // Half of the width to truly center it
               bottom: 38, // Adjust position above the footer
               zIndex: 1000, // Ensure it stays on top
            }}
         />
      </ImageBackground>
   );
}

const styles = StyleSheet.create({
   footer: {
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-around",
   },
   footerContent: {
      fontFamily: "Montserrat-Medium",
      color: "white",
      fontSize: 10,
   },
   footerButton: {
      minWidth: 60,
      marginTop: 5,
      alignItems: "center",
      zIndex: 999,
   },
   centerButton: {
      marginTop: -22,
      zIndex: 1001,
   },
});
