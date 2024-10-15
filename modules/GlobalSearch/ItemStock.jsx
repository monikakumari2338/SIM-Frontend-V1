import { Button, Overlay, SearchBar } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, FlatList } from "react-native";
import { Divider } from "@rneui/themed";
import { getData, storeName } from "../../context/auth";
import { endpoints } from "../../context/endpoints";
import { useNavigation } from "@react-navigation/native";

export default function ItemStock({ route }) {
   const { item } = route.params;
   const [selectedStore, setSelectedStore] = useState(storeName);
   const [currentItem, setCurrentItem] = useState(item || {});
   const [selectedSize, setSelectedSize] = useState(item.size || "N/A");
   const [selectedColor, setSelectedColor] = useState(item.color || "N/A");
   const [sizes, setSizes] = useState([]);
   const [colors, setColors] = useState([]);
   const navigation = useNavigation();
   const isFocused = navigation.isFocused();
   // overlay visibility states
   const [sizesOverlay, setSizesOverlay] = useState(false);
   const [colorsOverlay, setColorsOverlay] = useState(false);
   // is a different store selected?
   const diffStore = selectedStore !== storeName;
   const [searchTerm, setSearchTerm] = useState("");

   // Sync Functions
   function changeSize(size) {
      setSelectedSize(size);
      setSizesOverlay(false);
      fetchCurrentDetails(size, selectedColor);
   }
   function changeColor(color) {
      setSelectedColor(color);
      setColorsOverlay(false);
      fetchCurrentDetails(selectedSize, color);
   }

   // Async Functions
   async function getVariants() {
      try {
         const response = await getData(
            `${endpoints.fetchVariants}${item.itemNumber}`
         );
         setSizes(response.sizes || []);
         setColors(response.colors || []);
      } catch (error) {
         console.error("Error fetching variants:", error);
      }
   }
   async function fetchCurrentDetails(size, color) {
      try {
         let response;
         if (diffStore) {
            response = await getData(
               `${endpoints.fetchCurrentDetails}/${size}/${color}/${item.itemNumber}/${selectedStore.storeName}`
            );
         } else {
            response = await getData(
               `${endpoints.fetchCurrentDetails}/${size}/${color}/${item.itemNumber}/${storeName}`
            );
         }

         setCurrentItem(response || {});
      } catch (error) {
         console.error("Error fetching current details:", error);
      }
   }
   async function searchSku(sku) {
      if (sku === "") {
         return;
      }

      try {
         const response = await getData(
            `${endpoints.storeItemDetails}${sku}/${selectedStore.storeName}`
         );
         if (response) {
            setCurrentItem(response);
         }
      } catch (error) {
         console.error("Error fetching item details:", error);
      }
   }

   // useEffect: Fetch Variants
   useEffect(() => {
      if (isFocused) {
         getVariants();
      }
   }, [isFocused]);

   // useEffect: Fetch Current Details
   useEffect(() => {
      if (isFocused) {
         fetchCurrentDetails(selectedSize, selectedColor);
      }
   }, [selectedSize, selectedColor, isFocused]);

   // useEffect: Search on SKU modification
   useEffect(() => {
      searchSku(searchTerm);
   }, [searchTerm]);

   return (
      <View style={styles.page}>
         {/* Store name */}
         {diffStore && (
            <>
               <StoreHeader store={selectedStore} />
               <SearchBar
                  containerStyle={{
                     width: "90%",
                     backgroundColor: "transparent",
                     borderTopWidth: 0,
                     borderBottomWidth: 0,
                  }}
                  placeholder={`Search ${selectedStore.storeName} items`}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
               />
            </>
         )}

         {/* Product Name */}
         <Text style={styles.productName}>{currentItem.itemName}</Text>

         {/* Product Image */}
         <Image
            // if diffStore, make the image smaller
            style={[
               styles.productImage,
               diffStore && { width: 150, height: 150 },
            ]}
            source={{ uri: currentItem.imageData }}
         />

         {/* Product Detail Card */}
         <DetailCard
            {...{
               item: currentItem,
               selectedSize,
               setSizesOverlay,
               selectedColor,
               setColorsOverlay,
            }}
         />

         {/* Buddy Stock Check Button */}
         {!diffStore && (
            <Button
               icon={{
                  name: "text-box-search",
                  type: "material-community",
                  color: "white",
                  size: 20,
               }}
               title="Check Buddy Stock"
               titleStyle={{ fontFamily: "Montserrat-Regular" }}
               onPress={() => {
                  navigation.navigate("Buddy Store Stock", {
                     currentItem,
                     setSelectedStore,
                  });
               }}
            />
         )}

         {/* Sizes Overlay */}
         <SizesOverlay
            {...{
               selectedSize,
               changeSize,
               sizes,
               sizesOverlay,
               setSizesOverlay,
            }}
         />

         {/* Colors Overlay */}
         <ColorsOverlay
            {...{
               selectedColor,
               changeColor,
               colors,
               colorsOverlay,
               setColorsOverlay,
            }}
         />
      </View>
   );
}

function StoreHeader({ store }) {
   const storeInfo = {
      "Store ID": store.storeId,
      Address: store.storeAddress,
      Distance: `${store.distance.toFixed(2)} KM`,
   };

   return (
      <View style={styles.storeHeaderContainer}>
         <Text style={styles.storeName}>{store.storeName}</Text>
         <View style={styles.storeHeader}>
            {Object.keys(storeInfo).map((key) => (
               <Text key={key} style={styles.storeInfo}>
                  {key}: {storeInfo[key]}
               </Text>
            ))}
         </View>
      </View>
   );
}

function DetailCard({
   item,
   selectedSize,
   setSizesOverlay,
   selectedColor,
   setColorsOverlay,
}) {
   // Components
   function ProductInfoContainer({ label, value }) {
      return (
         <View style={{ flexDirection: "row" }}>
            <Text style={styles.productInfoLabel}>{label}</Text>
            <Text style={styles.productInfoValue}>{value}</Text>
         </View>
      );
   }

   function VariantInfoContainer({ label, value }) {
      return (
         <View>
            <Text style={styles.variantInfoLabel}>{label}</Text>
            <Text style={styles.variantInfoValue}>{value}</Text>
         </View>
      );
   }

   // Ensure fallback values for productInfo and variantInfo
   const productInfo = [
      {
         label: "ID",
         value: item.itemNumber || "N/A",
      },
      {
         label: "SKU",
         value: item.sku || "N/A",
      },
   ];
   const variantInfo = [
      {
         label: "color",
         value: item.color || "N/A",
      },
      {
         label: "price",
         value: `₹ ${item.price || "N/A"}`,
      },
      {
         label: "size",
         value: item.size || "N/A",
      },
      {
         label: "promo price",
         value: "N/A",
      },
   ];

   // Avoid rendering if currentItem is undefined
   if (!item) {
      return <Text>Loading...</Text>;
   } else {
      return (
         <View style={styles.cardContainer}>
            <View style={styles.cardLeft}>
               {/* ID and Supplier */}
               <View style={styles.cardLeftTop}>
                  <ProductInfoContainer {...productInfo[0]} />
                  <ProductInfoContainer {...productInfo[1]} />
               </View>

               {/* Divider */}
               <Divider width={2} />

               {/* Variant Info */}
               <View style={styles.cardLeftBottom}>
                  <View style={styles.variantLeft}>
                     <VariantInfoContainer {...variantInfo[0]} />
                     <VariantInfoContainer {...variantInfo[1]} />
                  </View>
                  <View style={styles.variantRight}>
                     <VariantInfoContainer {...variantInfo[2]} />
                     <VariantInfoContainer {...variantInfo[3]} />
                  </View>
               </View>
            </View>

            <View style={styles.cardRight}>
               <View style={styles.qtyContainer}>
                  <Text style={styles.qty}>{item.sellableStock || "N/A"}</Text>
               </View>

               <View>
                  <Button
                     title={selectedSize}
                     titleStyle={{
                        fontFamily: "Montserrat-Regular",
                        fontSize: 14,
                        color: "#112d4e",
                        textTransform: "uppercase",
                     }}
                     icon={{
                        name: "chevron-right",
                        type: "material-community",
                        color: "#112d4e",
                        size: 20,
                     }}
                     iconRight={true}
                     buttonStyle={{
                        backgroundColor: "white",
                        borderRadius: 5,
                     }}
                     onPress={() => setSizesOverlay(true)}
                  />
                  <Button
                     title={selectedColor}
                     titleStyle={{
                        fontFamily: "Montserrat-Regular",
                        fontSize: 14,
                        color: "#112d4e",
                        textTransform: "uppercase",
                     }}
                     icon={{
                        name: "chevron-right",
                        type: "material-community",
                        color: "#112d4e",
                        size: 20,
                     }}
                     iconRight={true}
                     buttonStyle={{
                        backgroundColor: "white",
                        borderRadius: 5,
                        marginTop: 10,
                     }}
                     onPress={() => setColorsOverlay(true)}
                  />
               </View>
            </View>
         </View>
      );
   }
}

function SizesOverlay({
   selectedSize,
   changeSize,
   sizes,
   sizesOverlay,
   setSizesOverlay,
}) {
   return (
      <Overlay
         isVisible={sizesOverlay}
         overlayStyle={{ width: "50%" }}
         onBackdropPress={() => setSizesOverlay(false)}
      >
         <FlatList
            data={sizes}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
               <Button
                  disabled={item === selectedSize}
                  title={item}
                  titleStyle={{
                     fontFamily: "Montserrat-Regular",
                     color: "#112d4e",
                  }}
                  buttonStyle={{
                     backgroundColor: "white",
                     borderRadius: 10,
                     marginBottom: 10,
                  }}
                  onPress={() => changeSize(item)}
               />
            )}
            ListHeaderComponent={
               <Text
                  style={{
                     fontFamily: "Montserrat-Bold",
                     fontSize: 18,
                     color: "#112d4e",
                     opacity: 0.8,
                     marginVertical: 20,
                     textAlign: "center",
                  }}
               >
                  Select a Size
               </Text>
            }
            ListFooterComponent={<CloseButton setState={setSizesOverlay} />}
         />
      </Overlay>
   );
}

function ColorsOverlay({
   selectedColor,
   changeColor,
   colors,
   colorsOverlay,
   setColorsOverlay,
}) {
   return (
      <Overlay
         isVisible={colorsOverlay}
         overlayStyle={{ width: "50%" }}
         onBackdropPress={() => setColorsOverlay(false)}
      >
         <FlatList
            data={colors}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
               <Button
                  title={item}
                  disabled={item === selectedColor}
                  titleStyle={{
                     fontFamily: "Montserrat-Regular",
                     color: "#112d4e",
                  }}
                  buttonStyle={{
                     backgroundColor: "white",
                     borderRadius: 10,
                     marginBottom: 10,
                  }}
                  onPress={() => changeColor(item)}
               />
            )}
            ListHeaderComponent={
               <Text
                  style={{
                     fontFamily: "Montserrat-Bold",
                     fontSize: 18,
                     color: "#112d4e",
                     opacity: 0.8,
                     marginVertical: 20,
                     textAlign: "center",
                  }}
               >
                  Select a Color
               </Text>
            }
            ListFooterComponent={<CloseButton setState={setColorsOverlay} />}
         />
      </Overlay>
   );
}

function CloseButton({ setState }) {
   return (
      <Button
         type="clear"
         title="Close"
         titleStyle={{
            fontFamily: "Montserrat-Regular",
            color: "crimson",
         }}
         icon={{
            name: "close",
            type: "material-community",
            color: "crimson",
            size: 20,
         }}
         buttonStyle={{ marginVertical: 20 }}
         onPress={() => setState(false)}
      />
   );
}

const styles = StyleSheet.create({
   page: {
      flex: 0.9,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "space-evenly",
   },
   productName: {
      fontFamily: "Montserrat-Medium",
      fontSize: 20,
      color: "#112d4e",
      textTransform: "uppercase",
   },
   storeName: {
      fontFamily: "Montserrat-Regular",
      fontSize: 15,
      color: "crimson",
   },
   imageCarousel: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   imageContainer: {
      width: 280,
      height: 280,
      justifyContent: "center",
      alignItems: "center",
   },
   productImage: {
      width: 200,
      height: 200,
   },
   cardContainer: {
      width: "90%",
      height: "30%",
      backgroundColor: "#112d4e",
      opacity: 0.8,
      borderRadius: 25,
      padding: 20,
      flexDirection: "row",
   },
   cardLeft: {
      flex: 0.65,
      justifyContent: "space-between",
   },
   cardLeftTop: {
      flex: 0.35,
      justifyContent: "space-evenly",
   },
   cardLeftBottom: {
      flex: 0.6,
      flexDirection: "row",
   },
   cardRight: {
      flex: 0.35,
      justifyContent: "space-between",
      alignItems: "flex-end",
   },
   variantLeft: {
      flex: 0.5,
      justifyContent: "space-evenly",
   },
   variantRight: {
      flex: 0.5,
      justifyContent: "space-evenly",
   },
   productInfoLabel: {
      fontFamily: "Montserrat-Regular",
      fontSize: 14,
      color: "white",
      marginRight: 10,
   },
   productInfoValue: {
      fontFamily: "Montserrat-Bold",
      fontSize: 14,
      color: "white",
   },
   variantInfoLabel: {
      fontFamily: "Montserrat-Bold",
      fontSize: 10,
      color: "white",
      opacity: 0.5,
      textTransform: "uppercase",
   },
   variantInfoValue: {
      fontFamily: "Montserrat-Bold",
      fontSize: 16,
      color: "white",
   },
   qty: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: "#112d4e",
   },
   qtyContainer: {
      width: 50,
      height: 50,
      backgroundColor: "white",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
   },
   storeHeaderContainer: {
      width: "90%",
      backgroundColor: "#112d4e88",
      justifyContent: "center",
      padding: 10,
      borderRadius: 10,
   },
   storeName: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: "white",
      marginBottom: 10,
      alignSelf: "center",
   },
   storeInfo: {
      fontFamily: "Montserrat-Bold",
      fontSize: 14,
      color: "white",
      marginBottom: 5,
   },
});
