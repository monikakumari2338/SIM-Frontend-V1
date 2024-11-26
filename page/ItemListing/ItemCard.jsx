import { useState } from "react";
import { View, Text, Image, Pressable, TextInput } from "react-native";
import { Button, Icon, Overlay, Input, Divider } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

/*
   COMPONENT MAP

   - ItemCard
      - QuantityUpdateOverlay
      - QuantityUpdateOverlay2
      - ProofImagesOverlay
*/
const completedStatuses = [
   "Completed",
   "Delivered",
   "New Request",
   "Accepted",
   "Rejected",
   "Shipped",
   "Dispatched",
];

export default function ItemCard({
   item,
   type,
   subType,
   status,
   recountStatus,
   deleteItem,
}) {
   // States and Constants
   const [quantityOverlay, setQuantityOverlay] = useState(false);
   const [proofImagesOverlay, setProofImagesOverlay] = useState(false);

   /*
   is the item complete (based on entryItems type and status)
   for all item.types except "SC" , item is complete if status is in completedStatuses
   for "SC", item is complete if status and recountStatus both are in completedStatuses

   note: for SC, we don't have the type in the item object, so we are using the type prop passed to the ItemCard component
   */
   const isComplete =
      type === "SC"
         ? completedStatuses.includes(status) &&
           completedStatuses.includes(recountStatus)
         : completedStatuses.includes(status);

   // for transfers
   const partiallyAccepted = status === "Partially Accepted";

   /* is the item deletable (based on entryItems type and subType)
      for all item.types except "SC" , item is deletable if status is not in completedStatuses
      
      for "SC", it depends if the subType is "AD" or "SC"
         if subType is "AD", item is deletable if status is not in completedStatuses
         if subType is also "SC, item is not deletable
   */
   const isDeletable =
      type === "SC"
         ? subType === "AD" && !completedStatuses.includes(status)
         : !completedStatuses.includes(status);

   // Functions
   function uploadProof() {
      ImagePicker.requestMediaLibraryPermissionsAsync()
         .then((res) => {
            if (res.status === "granted") {
               ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 1,
               })
                  .then((res) => {
                     if (
                        !res.canceled &&
                        res.assets &&
                        res.assets.length > 0 &&
                        res.assets[0].uri
                     ) {
                        // get image URI
                        const imageUri = res.assets[0].uri;
                        // set image URI to item.image
                        item.image = imageUri;
                        // show success message
                        Toast.show({
                           type: "success",
                           text1: "Success",
                           text2: "Proof uploaded successfully",
                        });
                     } else {
                        console.log("Image Picker canceled or no URI found");
                     }
                  })
                  .catch((error) => {
                     console.error("Error launching image library: ", error);
                  });
            } else {
               console.log("Media library permissions not granted");
            }
         })
         .catch((error) => {
            console.error(
               "Error requesting media library permissions: ",
               error
            );
         });
   }
   function showProof() {
      setProofImagesOverlay(true);
   }

   return (
      <>
         <View style={styles.card}>
            {isDeletable && !partiallyAccepted && (
               <View style={styles.deleteIconContainer}>
                  <Icon
                     onPress={() => {
                        deleteItem(item.sku);
                     }}
                     name="close-box"
                     type="material-community"
                     size={22}
                     color="crimson"
                  />
               </View>
            )}
            <View style={styles.imageContainer}>
               <Image src={item.imageData} style={styles.image} />
            </View>
            <View style={styles.detailsContainer}>
               <View style={styles.variantInfoContainer}>
                  <Text style={styles.idLabel}>SKU: </Text>
                  <Text style={styles.id}>{item.sku.toUpperCase()}</Text>
               </View>
               <Divider width={1} />
               <View>
                  <Text style={styles.name}>{item.itemName}</Text>
                  <View style={styles.variantInfoContainer}>
                     <Text style={styles.size}>{item.color}</Text>
                     <Text style={styles.size}> / </Text>
                     <Text style={styles.color}>{item.size}</Text>
                  </View>
               </View>
            </View>
            <View style={styles.qtyAndUploadContainer}>
               {/* Quantity Container */}
               <Pressable
                  style={
                     partiallyAccepted
                        ? [
                             styles.qtyContainer,
                             { borderWidth: 2, borderColor: "crimson" },
                          ]
                        : styles.qtyContainer
                  }
                  onPress={() => {
                     if (!isComplete) {
                        setQuantityOverlay(true);
                     }
                  }}
               >
                  <Text
                     style={[
                        styles.qty,
                        !isComplete && {
                           textDecorationLine: "underline",
                        },
                     ]}
                  >
                     {item.qty || item.shippedQty || item.requestedQty}
                  </Text>
               </Pressable>

               {type === "SC" ? (
                  // Variance in case of Stock Count items
                  <View
                     style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        paddingHorizontal: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                     }}
                  >
                     <Text
                        style={{
                           fontFamily: "Montserrat-Regular",
                           fontSize: 13,
                           marginRight: 5,
                        }}
                     >
                        Variance
                     </Text>
                     <Text
                        style={{
                           fontFamily: "Montserrat-Bold",
                           fontSize: 13,
                        }}
                     >
                        {item.variance || "N/A"}
                     </Text>
                  </View>
               ) : (
                  // Proof Upload/View Button for all other items
                  <Button
                     onPress={!isComplete ? uploadProof : showProof}
                     type="outline"
                     icon={{
                        name: !isComplete ? "upload" : "eye",
                        type: "material-community",
                        color: "white",
                        size: 14,
                     }}
                     iconContainerStyle={{
                        marginRight: 5,
                        marginLeft: 0,
                     }}
                     title={!isComplete ? "Upload Proof" : "View Proof"}
                     titleStyle={styles.uploadButtonTitle}
                     buttonStyle={styles.uploadButton}
                  />
               )}
            </View>
         </View>

         {/* Quantity Update Overlay */}
         {!isComplete && item.type === "PO" ? (
            <QuantityUpdateOverlay2
               {...{
                  item,
                  quantityOverlay,
                  setQuantityOverlay,
               }}
            />
         ) : (
            <QuantityUpdateOverlay
               {...{
                  item,
                  quantityOverlay,
                  setQuantityOverlay,
               }}
            />
         )}

         {/* Proof Images Overlay */}
         {isComplete && (
            <ProofImagesOverlay
               {...{
                  item,
                  proofImagesOverlay,
                  setProofImagesOverlay,
               }}
            />
         )}
      </>
   );
}

function QuantityUpdateOverlay({ item, quantityOverlay, setQuantityOverlay }) {
   const [newQty, setNewQty] = useState(""); // Keeping your original state initialization
   const [isSubmitting, setIsSubmitting] = useState(false); // For handling form submission state

   function isValidQty(qty) {
      const parsedQty = Number(qty); // Using Number for parsing
      return !isNaN(parsedQty) && parsedQty > 0;
   }

   function updateQuantity(item, newQty) {
      if (!isValidQty(newQty)) {
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Invalid quantity, numeric value required",
         });
         return;
      }

      const parsedQty = Number(newQty);
      if (item.expectedQty && parsedQty > item.expectedQty) {
         Toast.show({
            type: "info",
            text1: "OVER-RECEIVED",
            text2: "This item is being over-received",
         });
      }

      item.qty = parsedQty;
      Toast.show({
         type: "success",
         text1: "Quantity Updated",
         text2: `New quantity: ${parsedQty}`,
      });
   }

   const handleSubmit = () => {
      setIsSubmitting(true);
      updateQuantity(item, newQty);
      setQuantityOverlay(false);
      setIsSubmitting(false);
   };

   return (
      <Overlay
         isVisible={quantityOverlay}
         onBackdropPress={() => setQuantityOverlay(false)}
         overlayStyle={{
            width: "60%",
            padding: 20,
            justifyContent: "space-evenly",
         }}
      >
         {/* Heading */}
         <Text
            style={{
               fontFamily: "Montserrat-Bold",
               fontSize: 16,
               marginBottom: 10,
            }}
         >
            Update Quantity
         </Text>

         {/* Input field */}
         <Input
            value={newQty}
            inputStyle={{
               fontFamily: "Montserrat-Regular",
               fontSize: 20,
               textAlign: "center",
            }}
            placeholder="Quantity"
            onChangeText={(text) => setNewQty(text)}
            keyboardType="numeric"
            errorMessage={
               !isValidQty(newQty) && newQty !== ""
                  ? "Enter a valid quantity"
                  : ""
            }
         />

         {/* Buttons */}
         <View style={{ flexDirection: "row" }}>
            <Button
               type="outline"
               title="Cancel"
               titleStyle={{ fontFamily: "Montserrat-Bold", color: "crimson" }}
               buttonStyle={{ alignSelf: "center" }}
               containerStyle={{ margin: 10 }}
               onPress={() => setQuantityOverlay(false)}
            />
            <Button
               title={isSubmitting ? "Submitting..." : "Submit"}
               titleStyle={{ fontFamily: "Montserrat-Bold" }}
               buttonStyle={{ alignSelf: "center" }}
               containerStyle={{ margin: 10 }}
               onPress={handleSubmit}
               disabled={!isValidQty(newQty) || isSubmitting}
            />
         </View>
      </Overlay>
   );
}

function QuantityUpdateOverlay2({ item, quantityOverlay, setQuantityOverlay }) {
   const [newQty, setNewQty] = useState(0);
   const [damageQty, setDamageQty] = useState(0);
   const [damageImage, setDamageImage] = useState(null);

   function isValidQty(qty) {
      return !isNaN(qty) && parseInt(qty) >= 0;
   }

   function updateQuantity(item, newQty, damageQty) {
      if (!isValidQty(newQty) || !isValidQty(damageQty)) {
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Invalid quantities",
         });
         return;
      }

      if (item.expectedQty && newQty > item.expectedQty) {
         Toast.show({
            type: "info",
            text1: "Over-Received",
            text2: "This item is being over-received",
         });
      }

      item.qty = newQty;
      item.damageQty = damageQty;

      if (damageImage) {
         item.damageImage = damageImage;
      }
   }

   async function uploadDamageProof() {
      ImagePicker.requestMediaLibraryPermissionsAsync()
         .then((res) => {
            console.log("Permission response: ", res);
            if (res.status === "granted") {
               ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 1,
               })
                  .then((res) => {
                     console.log("Image Picker response: ", res);
                     if (
                        !res.canceled &&
                        res.assets &&
                        res.assets.length > 0 &&
                        res.assets[0].uri
                     ) {
                        const imageUri = res.assets[0].uri;
                        // append image to proofImages array
                        setDamageImage(imageUri);
                        // show success message
                        Toast.show({
                           type: "success",
                           text1: "Success",
                           text2: "Damage proof uploaded successfully",
                        });
                     } else {
                        console.log("Image Picker canceled or no URI found");
                     }
                  })
                  .catch((error) => {
                     console.error("Error launching image library: ", error);
                  });
            } else {
               console.log("Media library permissions not granted");
            }
         })
         .catch((error) => {
            console.error(
               "Error requesting media library permissions: ",
               error
            );
         });
   }

   return (
      <Overlay
         isVisible={quantityOverlay}
         onBackdropPress={() => setQuantityOverlay(false)}
         overlayStyle={{
            width: "80%",
            padding: 20,
            justifyContent: "space-evenly",
         }}
      >
         {/* Heading */}
         <Text
            style={{
               fontFamily: "Montserrat-Bold",
               fontSize: 17,
               marginBottom: 10,
               alignSelf: "center",
               marginBottom: 20,
            }}
         >
            Received & Damaged Quantity
         </Text>

         {/* Received Qty Input */}
         <Input
            value={newQty.toString()}
            onChangeText={(text) => setNewQty(Number(text))}
            keyboardType="numeric"
            placeholder="Received Quantity"
         />

         {/* Damage Qty Input */}
         <Input
            value={damageQty.toString()}
            onChangeText={(text) => setDamageQty(Number(text))}
            keyboardType="numeric"
            placeholder="Damaged Quantity"
         />

         {/* Button to add image proof for damage */}
         <Button
            title="Add Damage Proof"
            titleStyle={{ fontFamily: "Montserrat-Bold", fontSize: 12 }}
            buttonStyle={{ alignSelf: "center" }}
            onPress={uploadDamageProof}
         />

         {/*  */}
         <View
            style={{ flexDirection: "row", alignSelf: "center", marginTop: 10 }}
         >
            <Button
               type="outline"
               title="Cancel"
               titleStyle={{ fontFamily: "Montserrat-Bold", color: "crimson" }}
               buttonStyle={{ alignSelf: "center" }}
               containerStyle={{ margin: 10 }}
               onPress={() => setQuantityOverlay(false)}
            />
            <Button
               title="Submit"
               titleStyle={{ fontFamily: "Montserrat-Bold" }}
               buttonStyle={{ alignSelf: "center" }}
               containerStyle={{ margin: 10 }}
               onPress={() => {
                  updateQuantity(item, newQty, damageQty);
                  setQuantityOverlay(false);
               }}
            />
         </View>
      </Overlay>
   );
}

function ProofImagesOverlay({
   item,
   proofImagesOverlay,
   setProofImagesOverlay,
}) {
   return (
      <Overlay
         isVisible={proofImagesOverlay}
         onBackdropPress={() => setProofImagesOverlay(false)}
         overlayStyle={{
            width: 400,
            height: 400,
            padding: 10,
            justifyContent: "space-evenly",
         }}
      >
         <Image src={item.image} style={{ width: "100%", height: "100%" }} />
         {/* <Image src={item.damageImage} style={{ width: 200, height: 200 }} /> */}
      </Overlay>
   );
}

const styles = {
   deleteIconContainer: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: "white",
      padding: 0,
      borderRadius: 5,
   },

   card: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "silver",
      backgroundColor: "#112d4eBB",
      marginTop: 10,
      marginHorizontal: 0,
      borderRadius: 10,
   },

   imageContainer: {
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
      // margin: 10,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
   },
   image: {
      width: 80,
      height: 80,
   },

   detailsContainer: {
      flex: 2,
      justifyContent: "center",
      paddingVertical: 10,
      justifyContent: "space-around",
      marginLeft: 10,
   },
   name: {
      fontFamily: "Montserrat-Medium",
      fontSize: 14,
      color: "white",
   },
   idLabel: {
      fontFamily: "Montserrat-Regular",
      color: "white",
      fontSize: 12,
   },
   id: {
      fontFamily: "Montserrat-Bold",
      color: "white",
      fontSize: 12,
   },
   size: {
      fontFamily: "Montserrat-Regular",
      color: "white",
      fontSize: 12,
      marginRight: 3,
   },
   color: {
      fontFamily: "Montserrat-Regular",
      color: "white",
      fontSize: 12,
   },

   variantInfoContainer: {
      flexDirection: "row",
   },

   qtyAndUploadContainer: {
      flex: 1.5,
      paddingHorizontal: 10,
      justifyContent: "space-evenly",
      alignItems: "center",
   },
   qtyContainer: {
      backgroundColor: "silver",
      minWidth: 40,
      minHeight: 40,
      borderRadius: 10,
      paddingHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
   },
   qty: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: "white",
   },
   uploadContainer: {
      justifyContent: "center",
      alignItems: "center",
   },
   uploadButton: {
      borderRadius: 5,
      padding: 3,
      borderColor: "white",
   },
   uploadButtonTitle: {
      fontFamily: "Montserrat-Regular",
      fontSize: 10,
      color: "white",
   },
};
