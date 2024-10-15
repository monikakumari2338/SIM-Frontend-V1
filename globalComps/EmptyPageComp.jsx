import React from "react";
import { View, Text } from "react-native";
import { useTheme, Icon } from "@rneui/themed";

export default function EmptyPageComponent() {
   return (
      // Empty DSD Listing
      <View
         style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 100,
         }}
      >
         <View style={{ opacity: 0.7 }}>
            <Icon
               name="playlist-remove"
               type="material-community"
               size={100}
               color={"#112d4e"}
            />
            <Text
               style={{
                  fontFamily: "Montserrat-Medium",
                  fontSize: 16,
                  color: "#112d4e",
               }}
            >
               No entries exist
            </Text>
         </View>
      </View>
   );
}
