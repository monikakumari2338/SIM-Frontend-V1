import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, FlatList, Pressable } from "react-native";
import { Divider, Icon, Image } from "@rneui/themed";
import { storeName, getData } from "../../context/auth";
import { endpoints } from "../../context/endpoints";
import { SearchBar } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

export default function BuddyStock({ route }) {
   const { currentItem, setSelectedStore } = route.params;
   const sku = currentItem.sku;
   const [fullStores, setFullStores] = useState([]);
   const [filteredStores, setFilteredStores] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");

   async function fetchAllBuddyStores() {
      try {
         const response = await getData(
            `${endpoints.getAllBuddyStores}${sku}/${storeName}`
         );
         const stores = response.filter(
            (store) => store.storeName !== storeName
         );
         setFullStores(stores);
         setFilteredStores(stores);
      } catch (error) {
         console.error(error);
      }
   }

   function filterStores(term) {
      // filter for storeName or storeId
      return fullStores.filter((store) =>
         store.storeName.toLowerCase().includes(term.toLowerCase())
      );
   }

   useEffect(() => {
      fetchAllBuddyStores();
   }, []);

   useEffect(() => {
      setFilteredStores(filterStores(searchTerm));
   }, [searchTerm, fullStores]);

   return (
      <View style={styles.page}>
         {/* Display the current item */}
         <ItemDisplay {...{ currentItem }} />

         {/* Search bar */}
         <SearchBar
            placeholder="Search a store here..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
         />

         {/* Display the stores */}
         <FlatList
            data={filteredStores}
            renderItem={({ item }) => (
               <StoreCard
                  {...{
                     store: item,
                     setSelectedStore,
                  }}
               />
            )}
            keyExtractor={(item) => item.storeId}
            style={{ width: "100%" }}
            contentContainerStyle={{ alignItems: "center", flexGrow: 1 }}
            ListEmptyComponent={
               <View style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name="store" size={50} color="grey" />
                  <Text
                     style={{
                        fontFamily: "Montserrat-Regular",
                        fontSize: 20,
                        color: "grey",
                     }}
                  >
                     No stores found
                  </Text>
               </View>
            }
         />
      </View>
   );
}

function ItemDisplay({ currentItem }) {
   return (
      <>
         <Image
            source={{ uri: currentItem.imageData }}
            style={styles.productImage}
         />

         <Text style={styles.productName}>{currentItem.itemName}</Text>
         <Text style={styles.productIdSku}>
            {currentItem.itemNumber} / {currentItem.sku}
         </Text>
      </>
   );
}

function StoreCard({ store, setSelectedStore }) {
   const labels = ["Store ID", "Address", "Distance"];
   const values = [
      store.storeId,
      store.storeAddress,
      `${store.distance.toFixed(2)} KM`,
   ];
   const navigation = useNavigation();

   function handleStoreSelection() {
      setSelectedStore(store);
      navigation.goBack();
   }

   return (
      <Pressable style={styles.storeCard} onPress={handleStoreSelection}>
         <View style={styles.cardLeft}>
            <Text style={styles.storeName}>{store.storeName}</Text>
            <Divider style={{ marginBottom: 10 }} />
            <View style={{ flexDirection: "column" }}>
               {labels.map((label, index) => (
                  <View key={index} style={{ flexDirection: "row" }}>
                     <Text
                        style={[
                           styles.label,
                           { marginRight: label === "Distance" ? 14 : 20 },
                        ]}
                     >
                        {label}
                     </Text>
                     <Text style={styles.value}>{values[index]}</Text>
                  </View>
               ))}
            </View>
         </View>
         <View style={styles.qtyContainer}>
            <Text style={styles.qty}>{store.storeStock}</Text>
         </View>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   page: {
      flex: 0.9,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "flex-start",
   },
   productImage: {
      width: 200,
      height: 200,
   },
   productIdSku: {
      fontFamily: "Montserrat-Bold",
      fontSize: 14,
      color: "#112d4e",
      opacity: 0.3,
      textAlign: "center",
      marginBottom: 20,
   },
   productName: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: "#112d4e",
      textAlign: "center",
   },
   searchContainer: {
      width: "90%",
      backgroundColor: "transparent",
      borderTopWidth: 0,
      borderBottomWidth: 0,
      marginBottom: 10,
   },
   searchInput: {
      borderRadius: 50,
   },
   storeCard: {
      backgroundColor: "#112d4e",
      opacity: 0.8,
      borderRadius: 20,
      padding: 20,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
   },
   storeName: {
      fontFamily: "Montserrat-Bold",
      fontSize: 16,
      color: "white",
      marginBottom: 10,
   },
   label: {
      fontFamily: "Montserrat-Regular",
      fontSize: 14,
      color: "white",
      opacity: 0.5,
      marginRight: 20,
   },
   value: {
      fontFamily: "Montserrat-Bold",
      fontSize: 14,
      color: "white",
      marginBottom: 5,
   },
   cardLeft: {
      width: "75%",
   },
   qtyContainer: {
      minWidth: 50,
      marginLeft: 10,
      borderRadius: 5,
      alignSelf: "flex-start",
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
   },
   qty: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: "#112d4e",
   },
});
