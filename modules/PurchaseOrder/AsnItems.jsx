import {
   compareStructure,
   getData,
   postData,
   storeName,
} from "../../context/auth";
import { FlatList } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground, View } from "react-native";
import backgroundImg from "../../assets/bg3.jpg";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";

// Custom Components
import { endpoints } from "../../context/endpoints";
import { Button } from "@rneui/themed";
import { FAB, Portal } from "react-native-paper";
import EmptyPageComponent from "../../globalComps/EmptyPageComp";
import ItemCard from "../../page/ItemListing/ItemCard";
import Toast from "react-native-toast-message";

export default function AsnItems({ route }) {
   // States and consts
   const { poItem, asnItem } = route.params;
   let asnId, asnStatus;
   // if asnItem is not null, then load the asnId and asnStatus
   if (asnItem) {
      asnId = asnItem.asnNumber;
      asnStatus = asnItem.status;
   }
   const [tempItems, setTempItems] = useState([]);
   const navigation = useNavigation();

   // Functions
   async function getAsnItems() {
      try {
         const response = await getData(endpoints.fetchAsnItems + asnId);
         setTempItems(response);
      } catch (error) {
         console.error("Failed to fetch ASN items.", error);
      }
   }
   async function saveAsnItems() {
      function convertItemToSaveAsnDto(item) {
         const asnDetails = {
            itemNumber: "string",
            itemName: "string",
            expectedQty: 0,
            shippedQty: 0,
            remainingQty: 0,
            category: "string",
            color: "string",
            price: "string",
            size: "string",
            image: null,
            imageData: "string",
            upc: "string",
            sku: "string",
            taxPercentage: "string",
            taxCode: "string",
            receivedDate: new Date().toISOString().split("T")[0],
         };

         const convertedData = { ...asnDetails, ...item };

         if (item.qty) {
            convertedData.expectedQty = Number(item.qty);
            convertedData.receivedQty = Number(item.qty);
            convertedData.shippedQty = Number(item.qty);
            convertedData.remainingQty = 0;
            delete convertedData.qty;
         }

         return convertedData;
      }

      const convertedItems = tempItems.map(convertItemToSaveAsnDto);

      const requestBody = {
         asn: {
            creationDate: new Date().toISOString().split("T")[0],
            receivingDate: null,
            status: "Saved",
            supplier: poItem.supplierName,
            totalQty: convertedItems.reduce(
               (total, item) => total + Number(item.expectedQty),
               0
            ),
            totalSku: convertedItems.length,
            poNumber: poItem.id,
         },
         asnDetails: convertedItems,
      };

      console.log("Saving this info:", requestBody);

      try {
         let asnId = asnItem?.asnNumber;
         if (!asnId) {
            asnId = await postData(endpoints.createAsn, requestBody);
         }
         await postData(
            endpoints.saveAsnItems + `?asnNumber=${asnId}`,
            requestBody
         );
         navigation.goBack();
      } catch (error) {
         console.error("Failed to save ASN items.", error);
         throw error;
      }
   }
   async function submitAsnItems() {
      function convertToSubmitAsnDto(item) {
         const template = {
            itemNumber: "string",
            itemName: "string",
            expectedQty: 0,
            receivedQty: 0,
            remainingQty: 0,
            damageQty: 0,
            damageImage: "string",
            category: "string",
            color: "string",
            price: "string",
            size: "string",
            image: null,
            imageData: "string",
            upc: "string",
            taxPercentage: "string",
            taxCode: "string",
            poNumber: poItem.id,
         };

         const convertedData = { ...template, ...item };
         // item received from PO-specific search
         if (item.qty) {
            convertedData.expectedQty = Number(item.qty);
            convertedData.receivedQty = Number(item.qty);
            delete convertedData.qty;
         }
         // pre-saved ASN item
         if (item.shippedQty) {
            convertedData.receivedQty = Number(item.shippedQty);
            delete convertedData.shippedQty;
         }

         return convertedData;
      }
      function convertItemToCreateAsnDto(item) {
         const asnDetails = {
            itemNumber: "string",
            itemName: "string",
            expectedQty: 0,
            shippedQty: 0,
            remainingQty: 0,
            receivedQty: 0,
            damageQty: 0,
            damageImage: "string",
            category: "string",
            color: "string",
            price: "string",
            size: "string",
            imageData: "string",
            image: "string",
            upc: "string",
            sku: "string",
            taxPercentage: "string",
            taxCode: "string",
            receivedDate: new Date().toISOString().split("T")[0],
         };

         const convertedData = { ...asnDetails, ...item };
         // if for an item qty exists, set expectedQty and receivedQty, delete qty
         if (item.qty) {
            convertedData.expectedQty = Number(item.qty);
            convertedData.shippedQty = Number(item.qty);
            delete convertedData.qty;
         }
         return convertedData;
      }

      try {
         // Create ASN
         if (!asnId) {
            const createRequestBody = {
               asn: {
                  creationDate: new Date().toISOString().split("T")[0],
                  receivingDate: new Date().toISOString().split("T")[0],
                  status: "Pending",
                  supplier: poItem.supplierId,
                  totalQty: 0,
                  totalSku: 0,
                  poNumber: poItem.id,
               },
               asnDetails: tempItems.map(convertItemToCreateAsnDto),
            };
            const createRequestTemplate = {
               asn: {
                  creationDate: "2024-08-06",
                  receivingDate: "2024-08-06",
                  status: "string",
                  supplier: "string",
                  totalQty: 0,
                  totalSku: 0,
                  poNumber: "string",
               },
               asnDetails: [
                  {
                     itemNumber: "string",
                     itemName: "string",
                     expectedQty: 0,
                     shippedQty: 0,
                     remainingQty: 0,
                     receivedQty: 0,
                     damageQty: 0,
                     damageImage: "string",
                     category: "string",
                     color: "string",
                     price: "string",
                     size: "string",
                     imageData: "string",
                     image: "string",
                     upc: "string",
                     sku: "string",
                     taxPercentage: "string",
                     taxCode: "string",
                     type: "string",
                     receivedDate: "2024-08-06",
                  },
               ],
            };

            // if the compareStructure function returns true for createRequestBody and saveRequestBody
            if (compareStructure(createRequestBody, createRequestTemplate)) {
               asnId = await postData(endpoints.createAsn, createRequestBody);
            } else {
               throw new Error("Request body structure mismatch");
            }
         }

         // Submit ASN
         const submitRequestBody = {
            attachedImage: "string",
            asnNumber: asnId,
            purchaseOrderItemsdto: tempItems.map(convertToSubmitAsnDto),
         };
         console.log(
            "Submitting this info:",
            JSON.stringify(submitRequestBody, null, 2)
         );
         await postData(
            endpoints.submitAsnItems + storeName,
            submitRequestBody
         );
         Toast.show({
            type: "success",
            text1: "ASN Submitted",
            text2: "ASN has been successfully submitted.",
         });
      } catch (error) {
         console.error("Failed to save ASN items.", error);
         throw error;
      }

      navigation.goBack();
   }
   function deleteItem(sku) {
      setTempItems(tempItems.filter((item) => item.sku !== sku));
   }
   async function handleExcelUpload() {
      try {
         console.log("Opening document picker...");

         const res = await DocumentPicker.getDocumentAsync({
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
         });

         if (!res.canceled && res.assets && res.assets.length > 0) {
            const fileUri = res.assets[0].uri;

            // Read the file as a base64 string
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
               encoding: FileSystem.EncodingType.Base64,
            });

            // Parse the file using XLSX
            const wb = XLSX.read(fileContent, {
               type: "base64",
               cellDates: true,
            });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);

            const items = [];
            const errors = [];

            for (const [index, item] of data.entries()) {
               // Data validation
               if (!item.SKU || !item.Quantity) {
                  errors.push(
                     `Row ${index + 1}: Missing item SKU or quantity.`
                  );
                  continue;
               }
               if (!item.SKU.startsWith("sku")) {
                  errors.push(
                     `Row ${index + 1}: Item ID must start with "sku".`
                  );
                  continue;
               }
               if (item.Quantity <= 0) {
                  errors.push(
                     `Row ${index + 1}: Quantity must be greater than 0.`
                  );
                  continue;
               }

               try {
                  const response = await getData(
                     `/product/findbysku/${item.SKU}/${storeName}`
                  );
                  const foundItem = response.items ? response.items[0] : null;

                  if (!foundItem) {
                     errors.push(`Row ${index + 1}: Item not found.`);
                     continue;
                  }

                  // if item already exists, update the quantity
                  // else push the item to the tempItems with

                  const existingItem = tempItems.find(
                     (i) => i.sku === foundItem.sku
                  );
                  if (existingItem) {
                     existingItem.qty += item.Quantity;
                  } else {
                     items.push({
                        ...foundItem,
                        qty: item.Quantity,
                     });
                  }
               } catch (e) {
                  errors.push(`Row ${index + 1}: Error fetching item.`);
                  continue;
               }
            }

            // If errors exist, console.log and return
            if (errors.length > 0) {
               Alert.alert("Invalid data found", errors.join("\n"));
               Toast.show({
                  type: "error",
                  text1: "Error!",
                  text2: "There were errors in the data!",
               });
               return;
            }

            // Add the items to the tempItems
            setTempItems([...tempItems, ...items]);

            // Show a success toast
            Toast.show({
               type: "success",
               text1: "Success",
               text2: "Items added successfully",
            });
         }
      } catch (error) {
         console.log("Error reading file:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error reading the file",
         });
      }
   }

   // UseEffect: if asnId exists, get the asn items
   useEffect(() => {
      asnId && getAsnItems();
   }, []);

   // FAB
   const fabActions = [
      {
         icon: "qrcode-scan",
         label: "Scan",
         onPress: () =>
            navigation.navigate("Add Items", {
               type: "PO",
               tempItems,
               setTempItems,
               tempSupplier: null,
               poItem,
            }),
      },
      {
         icon: "file-excel",
         label: "Upload Excel Data",
         onPress: () => {
            handleExcelUpload();
            setState({ open: false });
         },
      },
   ];
   // FAB Group States and Properties
   const [state, setState] = useState({ open: false });
   const { open } = state;
   function onStateChange({ open }) {
      setState({ open });
   }

   return (
      <ImageBackground source={backgroundImg} style={{ flex: 1 }}>
         <FlatList
            data={tempItems}
            keyExtractor={(item) => item.sku}
            renderItem={({ item }) => (
               <ItemCard {...{ item, status: asnStatus, deleteItem }} />
            )}
            ListHeaderComponent={
               asnStatus !== "Complete" && (
                  <View
                     style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        alignSelf: "center",
                        marginBottom: 20,
                     }}
                  >
                     <Button
                        disabled={tempItems.length === 0}
                        title={"SAVE"}
                        titleStyle={{ fontFamily: "Montserrat-Medium" }}
                        buttonStyle={{
                           marginRight: 40,
                           borderRadius: 20,
                           width: 100,
                        }}
                        onPress={saveAsnItems}
                     />
                     <Button
                        disabled={tempItems.length === 0}
                        title={"SUBMIT"}
                        titleStyle={{ fontFamily: "Montserrat-Medium" }}
                        buttonStyle={{
                           borderRadius: 20,
                           width: 100,
                        }}
                        onPress={submitAsnItems}
                     />
                  </View>
               )
            }
            ListEmptyComponent={<EmptyPageComponent />}
            contentContainerStyle={{
               paddingTop: 10,
               paddingBottom: 100,
               paddingHorizontal: 15,
            }}
         />

         {/* FAB to add items */}
         {asnStatus !== "Complete" && (
            <Portal>
               <FAB.Group
                  style={{ marginBottom: 70 }}
                  open={open}
                  visible
                  icon={open ? "close" : "plus"}
                  iconColor="white"
                  actions={fabActions}
                  onStateChange={onStateChange}
               />
            </Portal>
         )}
      </ImageBackground>
   );
}
