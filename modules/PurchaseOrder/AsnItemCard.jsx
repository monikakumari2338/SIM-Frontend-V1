import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Divider, Icon } from "@rneui/themed";
import { Button } from "@rneui/themed";

export default function AsnItemCard({ item }) {
   const isComplete = item.expectedQty === item.shippedQty;

   return (
      <View style={asnCard.card}>
         <View
            style={{
               flexDirection: "row",
               justifyContent: "space-between",
               alignItems: "flex-start",
            }}
         >
            <View>
               <Text style={{ fontFamily: "Montserrat-Bold", fontSize: 12 }}>
                  Item Number: {item.itemNumber}
               </Text>
               <Text style={{ fontFamily: "Montserrat-Bold", fontSize: 12 }}>
                  SKU: {item.sku}
               </Text>
               <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <Text
                     style={{ fontFamily: "Montserrat-Medium", fontSize: 12 }}
                  >
                     {item.itemName} |
                  </Text>
                  <Text
                     style={{
                        fontFamily: "Montserrat-Medium",
                        marginLeft: 5,
                        fontSize: 12,
                     }}
                  >
                     {item.color} |
                  </Text>
                  <Text
                     style={{
                        fontFamily: "Montserrat-Medium",
                        marginLeft: 5,
                        fontSize: 12,
                     }}
                  >
                     {item.size}
                  </Text>
               </View>
            </View>

            <View>
               {isComplete ? (
                  <Icon
                     name="check-circle"
                     type="material-community"
                     color={"green"}
                     size={25}
                  />
               ) : (
                  <Icon
                     name="progress-clock"
                     type="material-community"
                     color={"orange"}
                     size={25}
                  />
               )}
            </View>
         </View>

         <Divider style={{ marginVertical: 15 }} />

         <View style={{ flexDirection: "row" }}>
            {/* Item Image */}
            <Image
               source={{ uri: item.imageData }}
               containerStyle={asnCard.imageContainer}
               style={{ width: 80, height: 80 }}
            />

            <View style={{ flex: 1 }}>
               {/* Item Info */}
               <View style={{ flexDirection: "row", flex: 1 }}>
                  <View
                     style={{
                        flex: 1,
                        alignItems: "center",
                     }}
                  >
                     <Text
                        style={{
                           fontFamily: "Montserrat-Medium",
                           fontSize: 15,
                        }}
                     >
                        Expected
                     </Text>
                     <Text
                        style={{ fontFamily: "Montserrat-Bold", fontSize: 17 }}
                     >
                        {item.expectedQty}
                     </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "center" }}>
                     <Text
                        style={{
                           fontFamily: "Montserrat-Medium",
                           fontSize: 15,
                        }}
                     >
                        Received
                     </Text>
                     <Text
                        style={{
                           fontFamily: "Montserrat-Bold",
                           fontSize: 17,
                           color: isComplete ? "green" : "orange",
                        }}
                     >
                        {item.shippedQty}
                     </Text>
                  </View>
               </View>

               {/* Proof Upload Button */}
               <Button
                  type="outline"
                  icon={{
                     name: "upload",
                     type: "font-awesome-5",
                     color: "black",
                     size: 12,
                  }}
                  title="Upload Proof"
                  titleStyle={{
                     color: "black",
                     fontFamily: "Montserrat-Bold",
                     fontSize: 10,
                  }}
                  onPress={() => console.log("Upload Proof")}
                  buttonStyle={{
                     alignSelf: "center",
                     backgroundColor: "#F5F5F5",
                     marginTop: 10,
                     borderRadius: 20,
                     paddingHorizontal: 10,
                     paddingVertical: 5,
                  }}
               />
            </View>
         </View>
      </View>
   );
}

const asnCard = StyleSheet.create({
   card: {
      backgroundColor: "white",
      borderWidth: 2,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
   },
   imageContainer: {
      marginRight: 10,
      padding: 5,
      borderWidth: 1,
      borderColor: "grey",
      borderRadius: 20,
   },
});
