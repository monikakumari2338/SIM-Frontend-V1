import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Divider, Icon } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

export function AsnCard({ item, entryItem }) {
   // Constants
   const navigation = useNavigation();
   const statusBg = {
      Pending: "crimson",
      Complete: "green",
      Saved: "orange",
   };

   // Functions
   function InfoContainer(label, value) {
      return (
         <View style={asnCard.infoContainer}>
            <Text style={asnCard.infoLabel}>{label}</Text>
            <Text style={asnCard.infoValue}>{value}</Text>
         </View>
      );
   }

   return (
      <View style={asnCard.card}>
         {/* Header */}
         <View style={asnCard.header}>
            {/* PO ID */}
            <Text style={{ fontFamily: "Montserrat-Bold", fontSize: 15 }}>
               {item.asnNumber}
            </Text>
            {/* Status */}
            <View
               style={[
                  asnCard.statusContainer,
                  {
                     backgroundColor:
                        statusBg[item.status] || "rgba(0, 0, 0, 0.2)",
                  },
               ]}
            >
               <Text style={asnCard.statusTitle}>{item.status}</Text>
            </View>
         </View>

         {/* Divider */}
         <Divider style={{ marginBottom: 10 }} />

         {/* Body */}
         <TouchableOpacity
            style={asnCard.bodyContainer}
            onPress={() =>
               navigation.navigate("Create ASN", {
                  poItem: entryItem,
                  asnItem: item,
               })
            }
         >
            {/* Body Left */}
            <View style={{ flex: 1 }}>
               {InfoContainer("Date of Creation", item.creationDate)}
               {InfoContainer(
                  "Date of Receiving",
                  item.receivingDate || "Yet To Receive"
               )}
            </View>
            {/* Body Right */}
            <View style={{ flex: 1 }}>
               {InfoContainer("Total SKU", item.totalSku)}
               {InfoContainer("Total Quantity", item.totalQty)}
            </View>

            <Icon name="chevron-right" size={50} />
         </TouchableOpacity>
      </View>
   );
}

const asnCard = StyleSheet.create({
   card: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 10,
      padding: 15,
      marginVertical: 5,
      elevation: 5,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
   },
   statusContainer: {
      paddingHorizontal: 10,
      paddingVertical: 2,
      alignItems: "center",
   },
   statusTitle: {
      fontFamily: "Montserrat-Regular",
      color: "white",
      textTransform: "uppercase",
   },
   bodyContainer: {
      flexDirection: "row",
      alignItems: "center",
   },
   infoContainer: {
      marginBottom: 10,
   },
   infoLabel: {
      fontFamily: "Montserrat-Regular",
      color: "grey",
   },
   infoValue: {
      fontFamily: "Montserrat-Bold",
   },
});

export function AsnCard2({ item, entryItem }) {
   // Constants
   const navigation = useNavigation();
   const statusColors = {
      Pending: {
         bg: "crimson",
         txt: "white",
      },
      Complete: {
         bg: "green",
         txt: "white",
      },
      Saved: {
         bg: "orange",
         txt: "black",
      },
      string: {
         bg: "silver",
         txt: "white",
      },
   };
   const values = [
      { label: "ASN Number", value: item.asnNumber },
      { label: "Status", value: item.status },
      { label: "Creation Date", value: item.creationDate },
      {
         label: "Receiving Date",
         value: item.receivingDate || "Yet To Receive",
      },
      { label: "Total SKU", value: item.totalSku },
   ];

   function InfoContainer({ label, value }) {
      return (
         <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
         </View>
      );
   }
   function StatusContainer({ status }) {
      return (
         <View
            style={{
               ...styles.statusContainer,
               backgroundColor: statusColors[status].bg,
            }}
         >
            <Text
               style={{
                  ...styles.statusTitle,
                  color: statusColors[status].txt,
               }}
            >
               {status}
            </Text>
         </View>
      );
   }

   // for all the fields in item, make a InfoContainer and show
   return (
      <View style={styles.card}>
         <View style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 5 }}>
            <View style={styles.infoRow}>
               <InfoContainer label="ID" value={item.asnNumber} />
               <StatusContainer status={item.status} />
            </View>
            <Divider width={1} />
            <View style={styles.infoRow}>
               <InfoContainer label="Creation On" value={item.creationDate} />
               <InfoContainer label="Expected Qty" value={item.totalQty} />
            </View>
            <View style={styles.infoRow}>
               <InfoContainer
                  label="Receiving On"
                  value={item.receivingDate || "YTR"}
               />
               <InfoContainer label="Received Qty" value={item.totalQty} />
            </View>
         </View>

         <TouchableOpacity
            style={styles.valueContainer}
            onPress={() =>
               navigation.navigate("Create ASN", {
                  poItem: entryItem,
                  asnItem: item,
               })
            }
         >
            <View style={{ alignItems: "center" }}>
               <Text
                  style={{
                     fontFamily: "Montserrat-Bold",
                     color: "white",
                  }}
               >
                  {item.totalSku}
               </Text>
               <Text
                  style={{
                     fontFamily: "Montserrat-Regular",
                     color: "white",
                  }}
               >
                  SKU
               </Text>
            </View>
            <Icon
               name="arrow-right-box"
               type="material-community"
               size={25}
               color={"white"}
            />
         </TouchableOpacity>
      </View>
   );
}

const styles = StyleSheet.create({
   card: {
      flexDirection: "row",
      backgroundColor: "white",
      borderColor: "silver",
      borderRadius: 20,
      elevation: 5,
      marginBottom: 10,
   },
   infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
   },
   infoLabel: {
      fontFamily: "Montserrat-Medium",
      fontSize: 12,
      color: "#112d4eaa",
      marginRight: 5,
   },
   infoValue: {
      fontFamily: "Montserrat-Bold",
      fontSize: 12,
      color: "#112d4eaa",
   },
   statusContainer: {
      paddingHorizontal: 10,
      paddingVertical: 2,
      alignItems: "center",
      marginBottom: 3,
   },
   statusTitle: {
      fontFamily: "Montserrat-Medium",
      fontSize: 12,
      color: "white",
      textTransform: "uppercase",
   },
   infoContainer: {
      flexDirection: "row",
   },
   valueContainer: {
      backgroundColor: "#112d4eaa",
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingHorizontal: 20,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
   },
   valueText: {
      fontFamily: "Montserrat-Bold",
      color: "white",
   },
});
