import {
   useContext,
   useState,
   useEffect,
} from "react";
import {
   View,
   Text,
   StyleSheet,
   Image,
   FlatList,
   Alert,
   TouchableOpacity,
} from "react-native";
import {
   Button,
   Icon,
   Input,
   Overlay,
} from "@rneui/themed";
import {
   CameraView,
   useCameraPermissions,
} from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { endpoints } from "../../context/endpoints";

export default function AddItem({ route }) {
   // States and vars
   const {
      type,
      tempItems,
      setTempItems,
      tempSupplier,
      poItem,
      tsfStore,
   } = route.params;
   const [suggestions, setSuggestions] = useState(
      [],
   );
   const { getData, storeName } =
      useContext(AuthContext);

   // Primary Search Function
   async function searchItems(searchStr) {
      // Handle empty search string
      if (searchStr === "") {
         setSuggestions([]);
         return;
      }

      // Handle search based on module TYPE
      const searchFunctions = {
         IA: generalItemSearch,
         DSD: supplierItemSearch,
         PO: poItemSearch,
         RTV: supplierItemSearch,
         TSFIN: generalItemSearch,
         TSFOUT: generalItemSearch,
         SC: catItemSearch,
      };

      // Set suggestions array based on search results from functions
      try {
         setSuggestions(
            await searchFunctions[type](
               searchStr,
            ),
         );
      } catch (error) {
         console.log(error);
      }
   }
   // Search Function for All Items
   async function generalItemSearch(searchStr) {
      const store = tsfStore
         ? tsfStore
         : storeName;
      const searchResult = await getData(
         endpoints.generalItemSearch +
            `${searchStr}/${store}/IA`,
      );

      if (searchResult.items.length > 0) {
         return searchResult.items;
      } else {
         Alert.alert(
            "No items found",
            `No valid items found for the searched SKU "${searchStr}" in the store "${storeName}"`,
         );
         return [];
      }
   }
   // Search Function for DSD
   async function supplierItemSearch(searchStr) {
      const searchResult = await getData(
         endpoints.fetchItemsBySupplier +
            `${tempSupplier}/${searchStr}/${storeName}/DSD`,
      );

      if (searchResult.items.length > 0) {
         return searchResult.items;
      } else {
         Alert.alert(
            "No items found",
            `No valid items found for the searched SKU ${searchStr} for the supplier ${tempSupplier}`,
         );
         return [];
      }
   }
   // Search function for PO
   async function poItemSearch(searchStr) {
      const searchResult = await getData(
         endpoints.fetchPoItems +
            `${poItem.id}/${searchStr}/PO`,
      );

      if (searchResult.items.length > 0) {
         return searchResult.items;
      } else {
         Alert.alert(
            "No items found",
            `No valid items found for the searched SKU ${searchStr} for the PO ${poItem.poNumber}`,
         );
         return [];
      }
   }
   // Search cat-specific items for Stock Count
   async function catItemSearch(searchStr) {
      const searchResult = await getData(
         endpoints.searchCatItems +
            `${searchStr}/${storeName}/Sportswear`,
      );

      if (searchResult.items.length > 0) {
         // for all items, set type to "SC"
         searchResult.items.forEach(
            (item) => (item.type = "SC"),
         );
         return searchResult.items;
      } else {
         Alert.alert(
            "Is the SKU correct?",
            `No valid items found for the searched SKU "${searchStr}" in the store "${storeName}"`,
         );
         return [];
      }
   }

   return (
      <View
         style={{
            flex: 0.89,
         }}
      >
         <View
            style={{
               flex: 1,
               backgroundColor: "black",
            }}
         >
            <Scanner
               {...{ suggestions, searchItems }}
            />
         </View>

         {/* Manual Item Search section */}
         <View
            style={{
               flex: 1.5,
               justifyContent: "space-evenly",
               alignItems: "center",
            }}
         >
            {/* Input for Item ID */}
            <Input
               placeholder="Enter an SKU to search"
               onChangeText={(text) =>
                  searchItems(text)
               }
               style={{
                  padding: 10,
                  margin: 20,
               }}
            />
            <FlatList
               data={suggestions}
               renderItem={({ item }) => (
                  <ItemSuggestion
                     {...{
                        type,
                        item,
                        tempItems,
                        setTempItems,
                     }}
                  />
               )}
               keyExtractor={(item) => item.sku}
               style={{
                  width: "100%",
               }}
            />
         </View>
      </View>
   );
}

function ItemSuggestion({
   type,
   item,
   tempItems,
   setTempItems,
}) {
   // States and vars
   const navigation = useNavigation();
   const [
      expectedQtyOverlay,
      setExpectedQtyOverlay,
   ] = useState(false);

   // Functions
   function handleAddItem(item) {
      const tempItemsCopy = [...tempItems];
      const index = tempItemsCopy.findIndex(
         (i) => i.sku === item.sku,
      );
      // if item already exists in tempItems, increase quantity
      if (index !== -1) {
         tempItemsCopy[index].qty++;
      }
      // else add item to tempItems with quantity 1
      else {
         tempItemsCopy.push({
            ...item,
            qty: 1,
         });
      }
      setTempItems(tempItemsCopy);
      navigation.goBack();
   }

   return (
      <>
         {/* Suggestion Card */}
         <View style={styles.suggestionCard}>
            <View
               style={{
                  flexDirection: "row",
                  alignItems: "center",
               }}
            >
               <Image
                  style={
                     styles.suggestionCardImage
                  }
                  src={item.imageData}
               />
               <View>
                  <View
                     style={{
                        marginBottom: 5,
                     }}
                  >
                     <Text
                        style={styles.text2Bold}
                     >
                        SKU: {item.sku}
                     </Text>
                  </View>

                  <Text style={styles.text2Name}>
                     {item.itemName}
                  </Text>
                  <Text style={styles.text2}>
                     {item.color} / {item.size}
                  </Text>
               </View>
            </View>

            <Button
               title="Add"
               titleStyle={{
                  fontFamily: "Montserrat-Medium",
               }}
               buttonStyle={{
                  borderRadius: 10,
               }}
               onPress={() => {
                  handleAddItem(item, type);
               }}
            />
         </View>

         {/* Expected Quantity Overlay */}
         <ExpectedQtyOverlay
            {...{
               item,
               tempItems,
               setTempItems,
               expectedQtyOverlay,
               setExpectedQtyOverlay,
            }}
         />
      </>
   );
}

function ExpectedQtyOverlay({
   item,
   tempItems,
   setTempItems,
   expectedQtyOverlay,
   setExpectedQtyOverlay,
}) {
   // Functions
   function validateQty(qty) {
      // validate the qty
      const qtyInt = parseInt(qty);
      if (qtyInt < 1) {
         Alert.alert(
            "Invalid quantity",
            "Quantity must be greater than 0",
         );
         return false;
      }
      return true;
   }
   function createItem(item, qty) {
      // if qty is valid, add the item to tempItems like this
      if (validateQty(qty)) {
         const tempItemsCopy = [...tempItems];
         tempItemsCopy.push({
            ...item,
            shippedQty: parseInt(qty),
         });
         setTempItems(tempItemsCopy);
         setExpectedQtyOverlay(false);
         navigation.goBack();
      } else {
         setExpectedQtyOverlay(false);
      }
   }

   const navigation = useNavigation();
   const [expectedQty, setExpectedQty] =
      useState(0);

   return (
      <Overlay
         isVisible={expectedQtyOverlay}
         onBackdropPress={() =>
            setExpectedQtyOverlay(false)
         }
         overlayStyle={{
            width: "80%",
            padding: 20,
            borderRadius: 20,
         }}
      >
         <Text
            style={{
               fontFamily: "Montserrat-Medium",
               fontSize: 16,
               marginBottom: 20,
            }}
         >
            Received Quantity for {item.itemName}
         </Text>
         <Input
            placeholder="Enter the received quantity"
            onChangeText={(text) =>
               setExpectedQty(text)
            }
            keyboardType="number-pad"
         />
         <Button
            title="Add"
            titleStyle={{
               fontFamily: "Montserrat-Bold",
            }}
            onPress={() =>
               createItem(item, expectedQty)
            }
            buttonStyle={{
               alignSelf: "center",
               paddingHorizontal: 20,
            }}
         />
      </Overlay>
   );
}

function Scanner({ suggestions, searchItems }) {
   const [facing, setFacing] = useState("back");
   const [permission, requestPermission] =
      useCameraPermissions();

   // ask for permission on render
   useEffect(() => {
      requestPermission();
   }, []);

   if (!permission) {
      // Camera permissions are still loading.
      return <View />;
   }

   if (!permission.granted) {
      // Camera permissions are not granted yet.
      return (
         <View style={styles.container}>
            <Text
               style={{
                  textAlign: "center",
               }}
            >
               We need your permission to show the
               camera
            </Text>
         </View>
      );
   }

   function toggleCameraFacing() {
      setFacing((current) =>
         current === "back" ? "front" : "back",
      );
   }

   return (
      <View style={styles.container}>
         <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={(data) => {
               if (suggestions.length === 0) {
                  searchItems(data.data);
               }
            }}
         >
            <View style={styles.buttonContainer}>
               <TouchableOpacity
                  style={styles.button}
                  onPress={toggleCameraFacing}
               >
                  <Icon
                     name="camera-flip"
                     type="material-community"
                     size={32}
                     color="white"
                  />
               </TouchableOpacity>
            </View>
         </CameraView>
      </View>
   );
}

const styles = StyleSheet.create({
   suggestionCard: {
      width: "100%",
      backgroundColor: "white",
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   suggestionCardImage: {
      width: 80,
      height: 80,
      marginRight: 20,
   },
   text2: {
      fontFamily: "Montserrat-Regular",
   },
   text2Name: {
      fontFamily: "Montserrat-Medium",
      fontSize: 16,
   },
   text2Bold: {
      fontFamily: "Montserrat-Bold",
      color: "grey",
      textTransform: "uppercase",
   },

   container: {
      flex: 1,
      justifyContent: "center",
   },
   camera: {
      flex: 1,
   },
   buttonContainer: {
      flex: 1,
      backgroundColor: "transparent",
      flexDirection: "row",
      margin: 20,
   },
   button: {
      flex: 1,
      alignSelf: "flex-end",
      alignItems: "center",
   },
   text: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
   },
});
