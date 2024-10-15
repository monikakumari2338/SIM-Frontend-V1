import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SearchBar, Button, Icon } from "@rneui/themed";
import { endpoints } from "../../context/endpoints";
import { storeName, getData } from "../../context/auth";
import { useNavigation } from "@react-navigation/native";

export default function GlobalSearch() {
   // Constants and Variables
   const [sku, setSku] = useState("");
   const [item, setItem] = useState(null);

   // Search Function
   async function searchSku(sku) {
      if (sku === "") {
         setItem(null);
         return;
      }

      try {
         const response = await getData(
            `${endpoints.storeItemDetails}${sku}/${storeName}`
         );
         setItem(response);
      } catch (error) {
         setItem(null);
      }
   }

   // UseEffect: Search on SKU modification
   useEffect(() => {
      searchSku(sku);
   }, [sku]);

   return (
      <View style={styles.page}>
         <Scanner {...{ setSku }} />
         <ManualSearch {...{ sku, setSku, item }} />
      </View>
   );
}

function Scanner({ setSku }) {
   return (
      <View style={styles.scannerContainer}>
         <Icon
            name="camera"
            type="material-community"
            size={100}
            color="#f0f0f0"
         />
      </View>
   );
}

function ManualSearch({ sku, setSku, item }) {
   return (
      <View style={styles.manualContainer}>
         {/* Search Bar */}
         <SearchBar
            placeholder="Search an item SKU here..."
            value={sku}
            onChangeText={setSku}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
         />

         {/* Item Card */}
         {item && <ItemCard {...{ item }} />}
      </View>
   );
}

function ItemCard({ item }) {
   const navigation = useNavigation();

   function InfoSection({ label, value }) {
      return (
         <View style={{ flexDirection: "column" }}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
         </View>
      );
   }
   function selectItem() {
      navigation.navigate("Item Stock", { item });
   }

   return (
      <View style={styles.itemCard}>
         <Image source={{ uri: item.imageData }} style={styles.itemImage} />
         <View
            style={{
               flexDirection: "column",
               justifyContent: "space-between",
            }}
         >
            <InfoSection label="SKU" value={item.sku} />
            <View>
               <Text
                  style={{
                     fontFamily: "Montserrat-Bold",
                     fontSize: 16,
                     color: "#f0f0f0",
                  }}
               >
                  {item.itemName}
               </Text>
               <Text
                  style={{
                     fontFamily: "Montserrat-Regular",
                     fontSize: 12,
                     color: "#f0f0f0",
                  }}
               >
                  {item.size} / {item.color}
               </Text>
            </View>
         </View>
         <Button
            title="Select"
            titleStyle={{ fontFamily: "Montserrat-Regular", color: "#000" }}
            buttonStyle={{
               backgroundColor: "#f0f0f0",
               borderRadius: 10,
            }}
            onPress={selectItem}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   page: {
      flex: 0.9,
      justifyContent: "space-evenly",
      alignItems: "center",
   },
   scannerContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
   },
   manualContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "space-evenly",
      alignItems: "center",
   },
   searchContainer: {
      width: "90%",
      backgroundColor: "transparent",
      borderTopWidth: 0,
      borderBottomWidth: 0,
   },
   searchInput: {
      backgroundColor: "#fff",
      borderRadius: 10,
   },
   itemCard: {
      width: "80%",
      padding: 20,
      borderWidth: 1,
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#112d4e",
   },
   itemImage: {
      width: 100,
      height: 100,
      backgroundColor: "#f0f0f0",
      borderRadius: 10,
   },
   label: {
      fontFamily: "Montserrat-Regular",
      fontSize: 12,
      color: "#f0f0f0",
      textTransform: "uppercase",
   },
   value: {
      fontFamily: "Montserrat-Bold",
      fontSize: 15,
      color: "#fff",
   },
});
