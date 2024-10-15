import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";

const Stack = createStackNavigator();

export default function DsdNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="DSD Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="DSD Listing"
            children={() => <ListingPage type={"DSD"} />}
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="DSD Items"
            component={ItemListing}
            options={{
               title: "Create DSD",
            }}
         />
         <Stack.Screen
            name="DSD Summary"
            component={ItemListing}
            options={{
               title: "DSD Summary",
            }}
         />
         <Stack.Screen name="Add Items" component={AddItem} />
      </Stack.Navigator>
   );
}

const styles = {
   headerTitle: {
      fontFamily: "Montserrat-Regular",
      fontSize: 16,
      color: "#000",
      marginLeft: -20,
   },
};
