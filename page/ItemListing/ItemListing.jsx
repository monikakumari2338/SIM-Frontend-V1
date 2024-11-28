import { useContext, useEffect, useState } from "react";
import {
   FlatList,
   View,
   ImageBackground,
   Text,
   StyleSheet,
   Alert,
} from "react-native";
import backgroundImg from "../../assets/bg3.jpg";
import ItemCard from "./ItemCard";
import { useNavigation } from "@react-navigation/native";
import {
   Button,
   Overlay,
   Input,
   Image,
   Icon,
   BottomSheet,
} from "@rneui/themed";
import { PaperProvider, Portal, FAB, AnimatedFAB } from "react-native-paper";
import SearchBar from "./SearchBar_FS";
import EmptyPageComponent from "../../globalComps/EmptyPageComp";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import uploadImage from "../../assets/uploadImage.png";
import { endpoints } from "../../context/endpoints";
import { useIsFocused } from "@react-navigation/native";
import { AsnCard2 } from "../../modules/PurchaseOrder/AsnCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Sharing from "expo-sharing";
import { AuthContext } from "../../context/AuthContext";

export default function EntryItemDetailPage({ route }) {
   const navigation = useNavigation();

   // Creds
   const { getData, postData, storeName } = useContext(AuthContext);

   // Extract the entryItem from the route params
   const { entryItem } = route.params;
   const { type, status } = entryItem;

   // Temporary states for items, reason and supplier
   const [tempItems, setTempItems] = useState([]);
   const [tempReason, setTempReason] = useState(null);
   const [tempSupplier, setTempSupplier] = useState(null);
   const [headerItem, setHeaderItem] = useState({});
   const completedStatuses = [
      "Completed",
      "Delivered",
      "New Request",
      "Accepted",
      "Rejected",
      "Shipped",
      "Dispatched",
   ];
   const isComplete = completedStatuses.includes(status);
   const isRecounted = entryItem.recountStatus === "Completed";
   /*
      the button group is not for PO, TSFIN and TSFOUT
      in case of IA, DSD and RTV, the button group is visible when status is not in completedStatuses
      in case of SC, the button group is visible when status is in completedStatuses and recountStatus is not in completedStatuses
   */
   const moduleBtnGrp = {
      PO: false,
      TSFIN: false,
      TSFOUT: false,
      IA: !isComplete,
      DSD: !isComplete,
      RTV: !isComplete,
      SC: !isComplete || (isComplete && !isRecounted),
   };
   const showButtonGroup =
      moduleBtnGrp[type] !== undefined ? moduleBtnGrp[type] : true;

   // fetch the PO header, needs to be updated on FOCUS
   async function getPoHeader() {
      const response = await getData(endpoints.fetchPo);
      setHeaderItem(response.find((po) => po.id === entryItem.id));
   }
   // fetch the items, reason, supplier and other details for IA, DSD and TSF
   async function getItemsReasonSupplier() {
      let response;

      switch (type) {
         case "IA":
            response = await getData(endpoints.fetchItemsIA + entryItem.id);
            setTempItems(response.items);
            setTempReason(response.reason);
            break;
         case "DSD":
            response = await getData(endpoints.fetchItemsDSD + entryItem.id);
            setTempItems(response.items);
            setTempSupplier(response.supplierId);
            break;
         case "SC":
            response = await getData(endpoints.fetchScItems + entryItem.id);
            setTempItems(response.items);
            setTempReason(response.reason);
            break;
         case "RTV":
            response = await getData(
               endpoints.fetchItemsRTV + `${entryItem.id}` + `/${storeName}`
            );
            setTempItems(response.items);
            setTempReason(response.reason);
            setTempSupplier(response.supplierId);
            break;
         case "TSFIN":
         case "TSFOUT":
            response = await getData(endpoints.fetchItemsTsf + entryItem.id);
            setTempItems(
               response.tsfDetailsDto.map((item) => ({
                  ...item,
                  qty: item.requestedQty,
               }))
            );
            setTempReason(response.reason);
            break;
         default:
            console.error("Unknown type:", type);
      }
   }
   // fetch items that are under an ASN
   async function getASNItems() {
      const response = await getData(endpoints.fetchASNForPO + entryItem.id);
      setTempItems(response);
   }
   async function getTsfDetails() {
      const tsfItems = await getData(endpoints.fetchItemsTsf + entryItem.id);
      setTempReason(tsfItems.reason);
      setTempItems(tsfItems.tsfDetailsDto);
   }
   // delete an item based on the SKU
   function deleteItem(sku) {
      setTempItems(tempItems.filter((item) => item.sku !== sku));
   }
   async function handleShip() {
      // Example Request Body
      /*
         {
            "tsfId": "string",
            "status": "string",
            "tsfDetailsUpdationDto": [
               {
                  "qty": 0,
                  "sku": "string"
               }
            ]
         }
      */

      // const navigation = useNavigation();
      const requestBody = {
         tsfId: entryItem.id,
         status: "Shipped",
         tsfDetailsUpdationDto: tempItems.map((item) => ({
            qty: item.qty,
            sku: item.sku,
         })),
      };

      try {
         await postData(endpoints.shipTsf + storeName, requestBody);
         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Items shipped successfully",
         });
         navigation.goBack();
      } catch (error) {
         console.error("Error shipping items:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error shipping the items",
         });
      }
   }

   const isFocused = useIsFocused();
   // ––--––--––--––-- (useEffect) ––--––--––--––-- //
   // refresh the data for PO based on FOCUS
   useEffect(() => {
      if (type === "PO") {
         getPoHeader();
         getASNItems();
      }
   }, [isFocused]);

   // refresh the data for IA/DSD/SC/TSF on RENDER
   useEffect(() => {
      switch (type) {
         case "IA":
         case "DSD":
         case "SC":
         case "RTV":
            getItemsReasonSupplier();
            break;
         case "TSFIN":
         case "TSFOUT":
            getTsfDetails();
            break;
      }
   }, []);

   // Close the reasons overlay when the reason is selected
   useEffect(() => {
      if (tempReason || entryItem.reason) {
         setReasonsOverlay(false);
      }
   }, [tempReason, entryItem.reason]);

   // reason selection overlay, opens on FOCUS
   const [reasonsOverlay, setReasonsOverlay] = useState(false);
   useEffect(() => {
      // Update reasonsOverlay based on the availability of reasons
      if (isFocused) {
         if (
            (type === "IA" ||
               type === "TSFIN" ||
               type === "TSFOUT" ||
               type === "SC") &&
            !tempReason &&
            !entryItem.reason
         ) {
            setReasonsOverlay(true);
         } else {
            setReasonsOverlay(false);
         }
      }
   }, [isFocused, tempReason, entryItem.reason, type]);

   // supplier selection overlay, opens on FOCUS
   const [supplierOverlay, setSupplierOverlay] = useState(
      isFocused &&
         (type === "DSD" || type === "RTV") &&
         !entryItem.supplierId &&
         !tempSupplier
   );

   return (
      <ImageBackground source={backgroundImg} style={{ flex: 0.9 }}>
         <PaperProvider>
            <FlatList
               data={tempItems}
               keyExtractor={
                  // if type is IA or DSD, use sku as key
                  // if type is PO, use asnNumber as key
                  ({ sku, asnNumber }) =>
                     ({
                        IA: sku,
                        DSD: sku,
                        PO: asnNumber,
                        RTV: sku,
                        TSFIN: sku,
                        TSFOUT: sku,
                        SC: sku,
                     }[type])
               }
               renderItem={({ item }) => {
                  switch (type) {
                     case "PO":
                        return <AsnCard2 {...{ item, entryItem }} />;
                     case "RTV":
                        return <ItemCard {...{ item, status, deleteItem }} />;
                     case "SC":
                        return (
                           <ItemCard
                              {...{
                                 item,
                                 type: entryItem.type,
                                 subType: entryItem.subType,
                                 status,
                                 recountStatus: entryItem.recountStatus,
                                 deleteItem,
                              }}
                           />
                        );
                     default:
                        return (
                           <ItemCard
                              {...{
                                 item,
                                 subType: null,
                                 status,
                                 recountStatus: null,
                                 deleteItem,
                              }}
                           />
                        );
                  }
               }}
               ListHeaderComponent={() => (
                  <>
                     {/* Header Table */}
                     <DetailsTab
                        {...{
                           type,
                           entryItem,
                           tempItems,
                           tempReason,
                           tempSupplier,
                           headerItem,
                        }}
                     />

                     {/* Search Bar for completed entries */}
                     {type !== "PO" && isComplete && (
                        <SearchBar
                           {...{ entryItem, tempItems, setTempItems }}
                        />
                     )}

                     {/* IA/DSD/SC/RTV: Button Group */}
                     {showButtonGroup && (
                        <ButtonGroup
                           {...{
                              entryItem,
                              tempItems,
                              tempReason,
                              setTempReason,
                              tempSupplier,
                              setTempSupplier,
                           }}
                        />
                     )}

                     {/* TSF: Button Group */}
                     {(type === "TSFIN" || type === "TSFOUT") && (
                        <TsfButtonGroup
                           {...{
                              entryItem,
                              tempItems,
                              tempReason,
                           }}
                        />
                     )}

                     {/* TSF: Partially-Accepted Transfers Helper Text */}
                     {status === "Partially Accepted" && (
                        <Text
                           style={{
                              fontFamily: "Montserrat-Bold",
                              fontSize: 12,
                              color: "black",
                              opacity: 0.5,
                              textAlign: "center",
                           }}
                        >
                           This is a partially accepted transfer. Please modify
                           the item quantities as required.
                        </Text>
                     )}

                     {/* SC: Re-counted Helper Text */}
                     {isRecounted && (
                        <Text
                           style={{
                              fontFamily: "Montserrat-Bold",
                              fontSize: 12,
                              color: "grey",
                              textAlign: "center",
                              marginVertical: 10,
                           }}
                        >
                           This stock count has been re-counted.
                        </Text>
                     )}

                     <ReasonsOverlay
                        {...{
                           type,
                           setTempReason,
                           reasonsOverlay,
                           setReasonsOverlay,
                        }}
                     />

                     <SupplierOverlay
                        {...{
                           setTempSupplier,
                           supplierOverlay,
                           setSupplierOverlay,
                           setReasonsOverlay,
                           type,
                        }}
                     />
                  </>
               )}
               ListFooterComponent={
                  <>
                     {/* FAB Group */}
                     {!isComplete &&
                        ![
                           "Accepted",
                           "Partially Accepted",
                           "Rejected",
                        ].includes(status) && (
                           <MyFabGroup
                              {...{
                                 entryItem,
                                 tempItems,
                                 setTempItems,
                                 tempSupplier,
                                 getASNItems,
                              }}
                           />
                        )}

                     {/* Ship Button for TSFOUT */}
                     {type === "TSFOUT" && (
                        <Portal>
                           <FAB
                              onPress={handleShip}
                              disabled={
                                 !["Accepted", "Partially Accepted"].includes(
                                    status
                                 )
                              }
                              label="SHIP"
                              icon="truck-delivery"
                              style={{
                                 position: "absolute",
                                 margin: 16,
                                 right: 10,
                                 bottom: 10,
                              }}
                           />
                        </Portal>
                     )}
                  </>
               }
               ListEmptyComponent={<EmptyPageComponent />}
               contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: 100,
                  paddingHorizontal: 15,
               }}
            />
         </PaperProvider>
      </ImageBackground>
   );
}

export function DetailsTab({
   type,
   entryItem,
   tempItems,
   tempReason,
   tempSupplier,
   headerItem,
}) {
   // Function for fetching the TSF header
   const [tsfHeader, setTsfHeader] = useState([]);
   const { getData } = useContext(AuthContext);

   // For transfers, we need to fetch the header details separately
   useEffect(() => {
      async function fetchTsfHeader() {
         const response = await getData(endpoints.fetchItemsTsf + entryItem.id);
         return [
            { label: "ID", value: response.tsfId },
            { label: "From", value: response.storeFrom },
            { label: "To", value: response.storeTo },
            { label: "Reason", value: response.reason || tempReason },
            {
               label: "Start Date",
               value: response.notAfter || "Not Specified",
            },
            { label: "End Date", value: response.notBefore || "Not Specified" },
            {
               label: "Total SKU",
               value: tempItems.length || response.tsfDetailsDto.length,
            },
         ];
      }

      if (type === "TSFIN" || type === "TSFOUT") {
         fetchTsfHeader().then(setTsfHeader);
      }
   }, [type]);

   // Component for the label and value of each detail
   function Detail({ label, value }) {
      return (
         <View
            style={{
               marginVertical: 5,
               flexDirection: "row",
            }}
         >
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
         </View>
      );
   }
   // Conditionally add the supplier or reason based on the entryItem type
   const details = {
      IA: [
         { label: "ID", value: entryItem.id },
         {
            label: "Reason",
            value: entryItem.reason || tempReason,
         },
         { label: "Date", value: entryItem.date },
         { label: "Total SKU", value: tempItems.length || entryItem.totalSku },
      ],
      DSD: [
         { label: "ID", value: entryItem.id },
         {
            label: "Supplier",
            value: entryItem.reason || tempSupplier,
         },
         { label: "Date", value: entryItem.date },
         { label: "Total SKU", value: tempItems.length || entryItem.totalSku },
      ],
      PO: [
         { label: "ID", value: headerItem.id },
         { label: "Date", value: headerItem.date },
         { label: "Total SKU", value: headerItem.totalSku },
         { label: "Supplier", value: headerItem.supplierId },
         { label: "Ordered Quantity", value: headerItem.expectedQty },
         { label: "Received Quantity", value: headerItem.receivedQty },
         {
            label: "Pending Quantity",
            value: headerItem.pendingQty,
         },
         {
            label: "Damaged Quantity",
            value: headerItem.damageQty,
         },
      ],
      TSFIN: tsfHeader,
      TSFOUT: tsfHeader,
      SC: [
         { label: "ID", value: entryItem.id },
         { label: "Created On", value: entryItem.creationDate },
         { label: "Start Date", value: entryItem.startDate },
         { label: "End Date", value: entryItem.endDate },
         {
            label: "Reason",
            value: entryItem.reason || tempReason,
         },
         { label: "Total SKU", value: tempItems.length },
         {
            label: "Category",
            value: entryItem.category || "Sportswear",
         },
         {
            label: "Sub-Category",
            value: entryItem.category || "Sportswear",
         },
         {
            label: "Variance",
            value: entryItem.varianceQty || "Not Specified",
         },
      ],
      RTV: [
         { label: "ID", value: entryItem.id },
         {
            label: "Supplier",
            value: entryItem.reason || tempSupplier,
         },
         { label: "Date", value: entryItem.date },
         { label: "Total SKU", value: entryItem.totalSku || tempItems.length },
         {
            label: "Reason",
            value: entryItem.reason || tempReason,
         },
      ],
   };

   return (
      <>
         <View style={styles.detailCard}>
            {/* if there are odd number of baseDetails items, center the last one vertically */}
            <View style={{ flexDirection: "row" }}>
               <View style={{ flex: 1 }}>
                  {details[type]
                     .slice(0, Math.ceil(details[type].length / 2))
                     .map((detail) => (
                        <Detail key={detail.label} {...detail} />
                     ))}
               </View>
               <View style={{ flex: 1 }}>
                  {details[type]
                     .slice(Math.ceil(details[type].length / 2))
                     .map((detail) => (
                        <Detail key={detail.label} {...detail} />
                     ))}
               </View>
            </View>
         </View>

         {/* ASN Count for PO */}
         {type === "PO" && (
            <View style={styles.asnCountContainer}>
               <View style={{ flexDirection: "row" }}>
                  <Text style={styles.asnCountLabel}>ASN Count:</Text>
                  <Text style={styles.asnCount}>{headerItem.asnCount}</Text>
               </View>
               <Text style={styles.helperText}>YTR: Yet to Receive</Text>
            </View>
         )}
      </>
   );
}

function ButtonGroup({ entryItem, tempItems, tempReason, tempSupplier }) {
   // States and vars
   const hasItems = tempItems.length > 0;
   const isStockCount = entryItem.type === "SC";
   const isRecounted = entryItem.recountStatus === "Completed";
   const [proofOverlay, setProofOverlay] = useState(false);
   const navigation = useNavigation();
   const { postData } = useContext(AuthContext);

   // Functions
   async function handleSave() {
      const requestBody = {
         id: entryItem.id,
         imageData: "",
         totalSku: tempItems.reduce((acc, item) => acc + Number(item.qty), 0),
         status: "Saved",
         items: tempItems,
      };

      try {
         if (entryItem.type === "IA") {
            requestBody.reason = tempReason;
            await postData(endpoints.saveAsDraftIA, requestBody);
         } else if (entryItem.type === "DSD") {
            requestBody.supplierId = tempSupplier;
            await postData(endpoints.saveAsDraftDSD, requestBody);
         } else if (entryItem.type === "RTV") {
            requestBody.supplierId = tempSupplier;
            requestBody.reason = tempReason;
            await postData(endpoints.saveAsDraftRTV, requestBody);
         }

         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data saved successfully",
         });

         navigation.goBack();
      } catch (error) {
         console.error("Error saving data:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error saving the data",
         });
      }
   }
   async function draftSc() {
      // Example Request Body
      /*
         {
            "id": "string",
            "reason": "string",
            "category": "string",
            "items": [
               {
                  "sku": "string",
                  "upc": "string",
                  "qty": 0
               }
            ]
         }
      */

      const requestBody = {
         id: entryItem.id,
         reason: tempReason,
         category: "Sportswear",
         items: tempItems.map(({ sku, upc, qty }) => ({ sku, upc, qty })),
      };

      try {
         if (entryItem.subType === "AD") {
            await postData(endpoints.draftSc + "adhoc", requestBody);
         } else {
            await postData(endpoints.draftSc + "system", requestBody);
         }
         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data saved successfully",
         });

         navigation.goBack();
      } catch (error) {
         console.error("Error saving data:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error saving the data",
         });
      }
   }
   async function addItemsToSc() {
      const requestBodyAd = {
         id: entryItem.id,
         reason: tempReason,
         category: "Sportswear",
         items: tempItems.map(({ sku, upc, qty }) => ({ sku, upc, qty })),
      };
      // remove the qty from each item, otherwise same as requestBodyAd
      const requestBodySc = {
         id: entryItem.id,
         items: tempItems.map(({ sku, upc, qty }) => ({ sku, upc, qty })),
      };

      try {
         if (entryItem.subType === "AD") {
            await postData(endpoints.addItemsToAd, requestBodyAd);
         } else {
            await postData(endpoints.addItemsToSc, requestBodySc);
         }
         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Items added successfully",
         });
         navigation.goBack();
      } catch (error) {
         console.error("Error adding items:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error adding the items",
         });
      }
   }
   async function handleExcelDownload() {
      try {
         const items = tempItems;

         const sheetData = items.map((item) => ({
            ID: item.id,
            Name: item.name,
            Color: item.color,
            Size: item.size,
            Quantity: item.quantity,
            Variance: item.variance,
         }));

         const wb = XLSX.utils.book_new();
         const ws = XLSX.utils.json_to_sheet(sheetData);
         XLSX.utils.book_append_sheet(wb, ws, "Items");
         const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

         const uri =
            FileSystem.documentDirectory + `Variance_${entryItem.id}.xlsx`;
         await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
         });
         console.log("Excel file written successfully.");

         Toast.show({
            type: "success",
            text1: "Success!",
            text2: "Excel file created successfully.",
         });
         // download the excel file
         if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
         } else {
            Alert.alert("Error", "Sharing is not available on this device");
         }
         console.log("Sharing dialog closed.");
      } catch (err) {
         console.error("Error handling Excel download:", err);
         Toast.show({
            type: "error",
            text1: "Error!",
            text2: "Failed to create Excel file.",
         });
      }
   }

   return (
      <View
         style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginVertical: 10,
         }}
      >
         {/* STOCK COUNT - Add & Save Button */}
         {isStockCount ? (
            <>
               {/* Draft */}
               <Button
                  disabled={!hasItems || entryItem.status === "Completed"}
                  title="Draft"
                  titleStyle={styles.buttonTitle}
                  icon={{
                     name: "content-save-outline",
                     type: "material-community",
                     color: "white",
                  }}
                  buttonStyle={[styles.button, { width: 100 }]}
                  onPress={draftSc}
               />
               {/* Add */}
               <Button
                  disabled={!hasItems || isRecounted}
                  title={entryItem.status === "Completed" ? "Re-Count" : "Add"}
                  titleStyle={styles.buttonTitle}
                  icon={{
                     name: "content-save-outline",
                     type: "material-community",
                     color: "white",
                  }}
                  buttonStyle={[styles.button, { width: 100 }]}
                  onPress={addItemsToSc}
               />
               {/* Variance */}
               <Button
                  disabled={!isRecounted}
                  title="Variance"
                  titleStyle={styles.buttonTitle}
                  icon={{
                     name: "download",
                     type: "material-community",
                     color: "white",
                  }}
                  buttonStyle={[styles.button, { width: 100 }]}
                  onPress={handleExcelDownload}
               />
            </>
         ) : (
            <>
               {/* Save Button */}
               <Button
                  disabled={!hasItems || entryItem.status === "Dispatched"}
                  title="Save"
                  titleStyle={styles.buttonTitle}
                  icon={{
                     name: "content-save-outline",
                     type: "material-community",
                     color: "white",
                  }}
                  buttonStyle={[styles.button, { width: 100 }]}
                  onPress={handleSave}
               />
               {/* Submit Button */}
               <Button
                  disabled={!hasItems || entryItem.status === "Dispatched"}
                  title="Submit"
                  titleStyle={styles.buttonTitle}
                  icon={{
                     name: "save-alt",
                     color: "white",
                  }}
                  buttonStyle={[styles.button, { width: 100 }]}
                  onPress={() => setProofOverlay(true)}
               />
            </>
         )}

         {/* Proof Overlay */}
         <ProofOverlay
            {...{
               entryItem,
               tempReason,
               tempSupplier,
               tempItems,

               proofOverlay,
               setProofOverlay,
            }}
         />
      </View>
   );
}

function TsfButtonGroup({ entryItem, tempItems, tempReason }) {
   /*
      This is the button group for the TSF item listing.
      
      For Store 1 (TSFIN), it contains the Request and Receive buttons.
         Request: Create a transfer request that is sent to Store 2.
         Receive: Receive and report damage for the items that were sent by Store 2.

      For Store 2 (TSFOUT), it contains the Accept, Reject, Partially Accept and Ship buttons.
         Accept: Accept the transfer request.
         Reject: Reject the transfer request.
         Partially Accept: Accept some items and reject the rest.
         Ship: Ship the accepted items to Store 1.

      The buttons are conditionally rendered based on the basis of type which can be either TSFIN or TSFOUT.
      The buttons are also conditionally disabled based on the status of the entry item.
   */

   const { postData } = useContext(AuthContext);

   // Functions for Store 1
   async function handleRequest(startDate, endDate) {
      /*
      Example Request Body:
      {
         "storeTo": "string",
         "id": "string",
         "reason": "string",
         "image": "string",
         "notAfter": "2024-08-18",
         "notBefore": "2024-08-18",
         "tsfDetailsDto": [
            {
               "sku": "string",
               "upc": "string",
               "qty": 0,
               "image": "string",
               "type": "string"
            }
         ]
      }
      */

      const requestBody = {
         storeTo: "",
         id: entryItem.id,
         reason: tempReason,
         image: "",
         notAfter: startDate,
         notBefore: endDate,
         tsfDetailsDto: tempItems.map((item) => ({
            sku: item.sku,
            upc: item.upc,
            qty: item.qty,
            image: "",
            type: "TSFIN",
         })),
      };

      try {
         await postData(endpoints.requestTsf, requestBody);
         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Transfer Request sent successfully",
         });
         navigation.goBack();
      } catch (error) {
         console.error("Error sending request:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error sending the request",
         });
      }
   }
   async function handleReceive() {
      // Example Request Body
      /*
         {
            "tsfId": "string",
            "image": "string",
            "tsfDetailsSaveDto": [
               {
                  "receivedQty": 0,
                  "damageQty": 0,
                  "damageProof": "string",
                  "upc": "string",
                  "sku": "string"
               }
            ]
         }
      */

      console.log("HEHEHE", tempItems);
      const requestBody = {
         tsfId: entryItem.id,
         image: "",
         tsfDetailsSaveDto: tempItems.map((item) => ({
            receivedQty: item.shippedQty,
            damageQty: 0,
            damageProof: "",
            upc: item.upc,
            sku: item.sku,
         })),
      };

      try {
         await postData(endpoints.receiveTsf, requestBody);
         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Items received successfully",
         });
         navigation.goBack();
      } catch (error) {
         console.error("Error receiving items:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error receiving the items",
         });
      }
   }

   // Functions for Store 2
   async function handleAcceptance(acceptance) {
      /*
      Example Request Body:
      {
         "tsfId": "string",
         "status": "string",
         "tsfDetailsUpdationDto": [
            {
               "qty": 0,
               "sku": "string"
            }
         ]
      }
      */
      const requestBody = {
         tsfId: entryItem.id,
         status: acceptance,
         tsfDetailsUpdationDto: tempItems.map((item) => ({
            qty: item.qty,
            sku: item.sku,
         })),
      };

      try {
         await postData(endpoints.tsfAcceptance, requestBody);

         Toast.show({
            type: "success",
            text1: "Success",
            text2: "Transfer request processed successfully",
         });
         navigation.goBack();
      } catch (error) {
         console.error("Error processing request:", error);
         Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error processing the request",
         });
      }
   }

   // Constants
   const navigation = useNavigation();
   const [dateOverlay, setDateOverlay] = useState(false);
   const { status, type } = entryItem;
   const TsfInButtons = [
      {
         title: "Request",
         icon: "send",
         iconType: "material",
         onPress: () => setDateOverlay(true),
         enableStatus: ["In Progress"],
      },
      {
         title: "Receive",
         icon: "move-to-inbox",
         iconType: "material",
         onPress: handleReceive,
         enableStatus: ["Shipped"],
      },
   ];
   const TsfOutButtons = [
      {
         title: "Accept",
         icon: "check-all",
         iconType: "material-community",
         onPress: () => handleAcceptance("Accepted"),
         enableStatus: ["New Request"],
      },
      {
         title: "Reject",
         icon: "close",
         iconType: "material-community",
         onPress: () => handleAcceptance("Rejected"),
         enableStatus: ["New Request"],
      },
      {
         title: "Part. Accept",
         icon: "check",
         iconType: "material-community",
         onPress: () => handleAcceptance("Partially Accepted"),
         enableStatus: ["New Request"],
      },
   ];

   return (
      <>
         <View
            style={{
               flexDirection: "row",
               justifyContent: "space-evenly",
               marginVertical: 10,
            }}
         >
            {
               // Render the buttons based on the type
               {
                  TSFIN: TsfInButtons,
                  TSFOUT: TsfOutButtons,
               }[type].map(
                  ({ title, icon, iconType, onPress, enableStatus }) => (
                     <Button
                        key={title}
                        title={title}
                        titleStyle={
                           type === "TSFIN"
                              ? styles.buttonTitle
                              : [styles.buttonTitle, { fontSize: 9 }]
                        }
                        icon={{
                           name: icon,
                           type: iconType,
                           color: "white",
                        }}
                        buttonStyle={
                           // type === "TSFIN"
                           styles.button
                           // : [styles.button, { padding: 2 }]
                        }
                        onPress={onPress}
                        disabled={
                           !enableStatus.includes(status) ||
                           tempItems.length === 0
                        }
                     />
                  )
               )
            }
         </View>

         <DateFilterBottomSheet
            {...{
               handleRequest,
               dateOverlay,
               setDateOverlay,
            }}
         />
      </>
   );
}

function DateFilterBottomSheet({ handleRequest, dateOverlay, setDateOverlay }) {
   function DateRangePicker() {
      // States and Vars
      const [startDate, setStartDate] = useState(new Date());
      const [endDate, setEndDate] = useState(new Date());
      const [showStartPicker, setShowStartPicker] = useState(false);
      const [showEndPicker, setShowEndPicker] = useState(false);

      // Functions
      function onStartChange(event, selectedDate) {
         setShowStartPicker(false);
         if (selectedDate) {
            setStartDate(selectedDate);
         }
      }
      function onEndChange(event, selectedDate) {
         setShowEndPicker(false);
         if (selectedDate) {
            setEndDate(selectedDate);
         }
      }

      return (
         <View style={{ flexDirection: "row" }}>
            <View style={styles.container}>
               <View style={styles.picker}>
                  <Button
                     onPress={() => setShowStartPicker(true)}
                     title="Start Date"
                     titleStyle={{ fontFamily: "Montserrat-Bold" }}
                     icon={{
                        name: "calendar",
                        type: "material-community",
                        color: "white",
                     }}
                  />
                  {showStartPicker && (
                     <DateTimePicker
                        testID="startDateTimePicker"
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onStartChange}
                        minimumDate={new Date()}
                     />
                  )}
                  <Text style={styles.dateText}>
                     {startDate.toDateString()}
                  </Text>
               </View>
               <View style={styles.picker}>
                  <Button
                     onPress={() => setShowEndPicker(true)}
                     title="End Date"
                     titleStyle={{ fontFamily: "Montserrat-Bold" }}
                     icon={{
                        name: "calendar",
                        type: "material-community",
                        color: "white",
                     }}
                  />
                  {showEndPicker && (
                     <DateTimePicker
                        testID="endDateTimePicker"
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onEndChange}
                        minimumDate={new Date()}
                     />
                  )}

                  <Text style={styles.dateText}>{endDate.toDateString()}</Text>
               </View>
            </View>
            <View style={styles.container}>
               <Button
                  title="Create Request"
                  titleStyle={{ fontFamily: "Montserrat-Bold" }}
                  buttonStyle={{ backgroundColor: "green", borderRadius: 30 }}
                  onPress={() => handleRequest(startDate, endDate)}
               />
            </View>
         </View>
      );
   }

   return (
      <BottomSheet
         isVisible={dateOverlay}
         onBackdropPress={() => setDateOverlay(false)}
      >
         <View style={styles.bottomSheet}>
            <DateRangePicker />
         </View>
      </BottomSheet>
   );
}

function ReasonsOverlay({
   type,
   setTempReason,
   reasonsOverlay,
   setReasonsOverlay,
}) {
   // USEEFFECT: Fetch the reasons and set the overlay options
   useEffect(() => {
      fetchReasons().then((data) => setReasons(data));
   }, []);

   // States and vars
   const [reasons, setReasons] = useState([]);
   const navigation = useNavigation();
   const { getData } = useContext(AuthContext);

   // Functions
   async function fetchReasons() {
      switch (type) {
         case "IA":
            return await getData(endpoints.fetchReasons);
         case "RTV":
            return await getData(endpoints.fetchRTVReasons);
         case "TSFIN":
         case "TSFOUT":
            return await getData(endpoints.fetchTsfReasons);
         case "SC":
            return await getData(endpoints.fetchScReasons);
         default:
            return [];
      }
   }
   function setReason(item) {
      setTempReason(item);
      setReasonsOverlay(false);
      Toast.show({
         type: "success",
         text1: "Success",
         text2: "Reason selected successfully",
      });
   }
   function cancelSelection() {
      setReasonsOverlay(false);
      navigation.goBack();
   }

   // Render the overlay
   return (
      <Overlay
         isVisible={reasonsOverlay}
         overlayStyle={{ width: "75%", borderRadius: 20 }}
      >
         <FlatList
            data={reasons}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
               <Button
                  title={item}
                  titleStyle={styles.buttonTitle}
                  buttonStyle={styles.button}
                  containerStyle={{ margin: 10 }}
                  onPress={() => setReason(item)}
               />
            )}
            ListHeaderComponent={
               <Text
                  style={{
                     fontFamily: "Montserrat-Bold",
                     fontSize: 20,
                     marginVertical: 15,
                     alignSelf: "center",
                  }}
               >
                  Select a Reason
               </Text>
            }
            ListFooterComponent={
               <Button
                  type="clear"
                  title="CANCEL"
                  icon={{
                     name: "close",
                     type: "material-community",
                     color: "crimson",
                  }}
                  buttonStyle={[styles.button, { marginVertical: 10 }]}
                  titleStyle={[styles.buttonTitle, { color: "crimson" }]}
                  onPress={cancelSelection}
               />
            }
         />
      </Overlay>
   );
}

function SupplierOverlay({
   setTempSupplier,
   supplierOverlay,
   setSupplierOverlay,
   setReasonsOverlay,
   type,
}) {
   // States and vars
   const [suggestions, setSuggestions] = useState([]);
   const [supplierId, setSupplierId] = useState("");
   const navigation = useNavigation();
   const { getData } = useContext(AuthContext);

   async function handleSupplierIdChange(text) {
      try {
         // Trim the input text to remove any leading or trailing whitespace
         const trimmedText = text.trim();

         // Set the supplier ID state
         setSupplierId(trimmedText);

         // If the trimmed text is not empty, proceed with fetching data
         if (trimmedText) {
            const data = await getData(
               `${endpoints.fetchSupplierByNameOrId}${trimmedText}`
            );

            // Check if data is an object and convert it to an array of objects for FlatList
            if (data && typeof data === "object") {
               const formattedSuggestions = Object.entries(data).map(
                  ([key, value]) => ({ id: key, name: value })
               );
               setSuggestions(formattedSuggestions);
            } else {
               setSuggestions([]);
            }
         } else {
            // If the trimmed text is empty, reset suggestions
            setSuggestions([]);
         }
      } catch (error) {
         console.error("Error fetching suppliers:", error);

         // Display an alert to the user in case of an error
         Alert.alert(
            "Error",
            "An error occurred while fetching suppliers. Please try again."
         );

         // Reset suggestions in case of an error
         setSuggestions([]);
      }
   }

   return (
      <Overlay
         isVisible={supplierOverlay}
         overlayStyle={{ width: "70%", padding: 20 }}
      >
         <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <Icon
               name="person-search"
               type="material"
               size={30}
               iconStyle={{ marginRight: 10 }}
            />
            <Text
               style={{
                  fontFamily: "Montserrat-Bold",
                  fontSize: 20,
                  marginBottom: 15,
               }}
            >
               Search Supplier
            </Text>
         </View>
         <Input
            inputStyle={{
               fontFamily: "Montserrat-Regular",
               fontSize: 16,
               textAlign: "center",
            }}
            placeholder="Enter a Supplier Name/ID"
            value={supplierId}
            onChangeText={handleSupplierIdChange}
         />

         {/* Each suggestion should show the info like: Sup101: ABC Industries */}
         <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
               <Button
                  type="outline"
                  title={`${item.id}: ${item.name}`}
                  titleStyle={styles.buttonTitle}
                  buttonStyle={[styles.button, { width: "100%" }]}
                  containerStyle={{ margin: 10 }}
                  onPress={() => {
                     setTempSupplier(item.id);
                     setSupplierOverlay(false);
                     {
                        type === "RTV" ? setReasonsOverlay(true) : null;
                     }
                  }}
               />
            )}
            ListFooterComponent={
               <Button
                  type="clear"
                  title="Cancel"
                  icon={{
                     name: "close",
                     type: "material-community",
                     color: "crimson",
                  }}
                  buttonStyle={[styles.button, { alignSelf: "center" }]}
                  titleStyle={styles.buttonTitle}
                  onPress={() => {
                     setSupplierOverlay(false);
                     navigation.goBack();
                  }}
               />
            }
         />
      </Overlay>
   );
}

function ProofOverlay({
   entryItem,
   tempReason,
   tempSupplier,
   tempItems,
   proofOverlay,
   setProofOverlay,
}) {
   const navigation = useNavigation();
   const [image, setImage] = useState(null);
   const { postData } = useContext(AuthContext);

   // Functions
   async function pickImage() {
      try {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
         });
         if (!result.canceled) {
            return result.assets[0].uri;
         }
      } catch (error) {
         console.error("Error picking image:", error);
         return null;
      }
   }

   async function handleSubmit(imageUri = null) {
      const data = {
         id: entryItem.id,
         totalSku: tempItems.reduce((acc, item) => acc + Number(item.qty), 0),
         status: "Completed",
         items: tempItems,
         imageData: imageUri,
      };

      try {
         if (entryItem.type === "IA") {
            data.reason = tempReason;
            await postData(endpoints.submitIA, data);
         } else if (entryItem.type === "DSD") {
            data.supplierId = tempSupplier;
            await postData(endpoints.submitDSD, data);
         } else if (entryItem.type === "RTV") {
            data.reason = tempReason;
            data.supplierId = tempSupplier;
            await postData(endpoints.submitRTV, data);
         }

         // Navigate back to listing page
         navigation.goBack();
      } catch (error) {
         console.error("Error submitting data:", error);
      }
   }

   async function handlePickAndSubmit() {
      const selectedImage = await pickImage(); // Wait for the image to be picked
      await handleSubmit(selectedImage); // Pass the selected image URI to handleSubmit
   }

   return (
      <Overlay
         isVisible={proofOverlay}
         onBackdropPress={() => setProofOverlay(false)}
         overlayStyle={{
            width: "60%",
            alignItems: "center",
            borderRadius: 20,
            padding: 20,
         }}
      >
         <Text
            style={{
               fontFamily: "Montserrat-Bold",
               fontSize: 16,
            }}
         >
            Upload Proof
         </Text>

         <Image
            source={image ? { uri: image } : uploadImage} // Show selected image or placeholder
            style={{ width: 200, height: 200 }}
         />

         <View
            style={{
               width: "100%",
               flexDirection: "row",
               justifyContent: "space-evenly",
            }}
         >
            <Button
               title="Upload"
               buttonStyle={[styles.button, { width: 80 }]}
               titleStyle={styles.buttonTitle}
               onPress={handlePickAndSubmit}
            />
            <Button
               title="Skip"
               buttonStyle={[styles.button, { width: 80 }]}
               titleStyle={styles.buttonTitle}
               onPress={() => handleSubmit()} // Call handleSubmit without an image
            />
         </View>
      </Overlay>
   );
}

function MyFabGroup({ entryItem, tempItems, setTempItems, tempSupplier }) {
   // FAB Group States and Properties
   const [state, setState] = useState({ open: false });
   const { open } = state;
   const { getData } = useContext(AuthContext);

   // Additional States and Functions
   const navigation = useNavigation();
   const { type } = entryItem;

   function onStateChange({ open }) {
      setState({ open });
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

   async function handleRtvExcelUpload() {
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
                     `/dsd/get/supplier/product/${tempSupplier}/${item.SKU}/${storeName}`
                  );
                  const foundItem = response.items ? response.items[0] : null;

                  if (!foundItem) {
                     errors.push(`Row ${index + 1}: Item not found.`);
                     continue;
                  } else if (response.items) {
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
   function navigateToCreateASN() {
      navigation.navigate("Create ASN", {
         poItem: entryItem,
         asnId: null,
      });
   }

   const actionsIA = [
      {
         icon: "file-excel",
         label: "Upload Excel Data",
         onPress: () => {
            handleExcelUpload();
            setState({ open: false });
         },
      },
      {
         icon: "qrcode-scan",
         label: "Add Item",
         onPress: () =>
            navigation.navigate("Add Items", {
               type: entryItem.type,
               tempItems,
               setTempItems,
               tempSupplier,
            }),
      },
   ];
   const actionsDSD = [
      {
         icon: "qrcode-scan",
         label: "Add Item",
         onPress: () =>
            navigation.navigate("Add Items", {
               type: entryItem.type,
               tempItems,
               setTempItems,
               tempSupplier,
            }),
      },
   ];
   const actionsPO = [
      {
         icon: "plus",
         label: "Create ASN",
         onPress: navigateToCreateASN,
      },
   ];
   const actionsTSF = [
      // Add items
      {
         icon: "qrcode-scan",
         label: "Add Item",
         onPress: () => {
            navigation.navigate("Add Items", {
               type: entryItem.type,
               tempItems,
               setTempItems,
               tempSupplier,
               tsfStore: entryItem.storeTo,
            }),
               console.log(entryItem);
         },
      },
   ];

   const actionsRTV = [
      {
         icon: "file-excel",
         label: "Upload Excel Data",
         onPress: () => {
            handleRtvExcelUpload();
            setState({ open: false });
         },
      },
      {
         icon: "qrcode-scan",
         label: "Add Item",
         onPress: () =>
            navigation.navigate("Add Items", {
               type: entryItem.type,
               tempItems,
               setTempItems,
               tempSupplier,
            }),
      },
   ];

   // Select the actions based on the TYPE
   const selectedActions = {
      IA: actionsIA,
      DSD: actionsDSD,
      PO: actionsPO,
      RTV: actionsRTV,
      TSFIN: actionsTSF,
      TSFOUT: [],
      SC: [
         // Add items
         {
            icon: "qrcode-scan",
            label: "Add Item",
            onPress: () =>
               navigation.navigate("Add Items", {
                  type: entryItem.type,
                  tempItems,
                  setTempItems,
                  tempSupplier,
               }),
         },
      ],
   }[type];

   // use FAB for single action, FAB.Group for multiple actions
   return selectedActions.length === 1 ? (
      <Portal>
         <FAB
            style={{ position: "absolute", bottom: 10, right: 10 }}
            icon={selectedActions[0].icon}
            onPress={selectedActions[0].onPress}
         />
      </Portal>
   ) : (
      <Portal>
         <FAB.Group
            open={open}
            visible
            icon={open ? "close" : "plus"}
            iconColor="white"
            actions={selectedActions}
            onStateChange={onStateChange}
         />
      </Portal>
   );
}

const styles = StyleSheet.create({
   detailCard: {
      backgroundColor: "#465B73AA",
      marginTop: 10,
      marginBottom: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
   },
   label: {
      fontFamily: "Montserrat-Regular",
      fontSize: 13,
      color: "white",
      marginRight: 5,
   },
   value: {
      fontFamily: "Montserrat-Bold",
      fontSize: 13,
      color: "white",
   },

   button: {
      borderRadius: 20,
      alignSelf: "center",
   },
   buttonTitle: {
      fontFamily: "Montserrat-Bold",
      fontSize: 10,
      textTransform: "uppercase",
   },

   asnCountContainer: {
      flexDirection: "row",
      marginTop: 10,
      marginBottom: 20,
      paddingHorizontal: 5,
      justifyContent: "space-between",
      alignItems: "center",
   },
   asnCountLabel: {
      fontFamily: "Montserrat-Regular",
      fontSize: 17,
      color: "rgba(0,0,0,0.8)",
      marginRight: 5,
   },
   asnCount: {
      fontFamily: "Montserrat-Bold",
      fontSize: 17,
      color: "rgba(0,0,0,0.8)",
   },
   helperText: {
      fontFamily: "Montserrat-Bold",
      fontSize: 13,
      color: "rgba(0,0,0,0.5)",
   },

   // Date Picker Styles
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
   },
   picker: {
      marginVertical: 10,
      alignItems: "center",
   },
   dateText: {
      marginTop: 10,
      fontSize: 16,
      fontFamily: "Montserrat-Medium",
   },
   bottomSheet: {
      backgroundColor: "white",
      padding: 10,
   },
   buttonContainer: {
      paddingVertical: 5,
      paddingHorizontal: 6,
      marginHorizontal: 5,
      backgroundColor: "#112d4e",
      borderRadius: 10,
   },
});
