import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";
import TransferLandingPage from "./TransferLandingPage";

const Stack = createStackNavigator();

export default function TransferNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="Transfers Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="Transfers Listing"
            children={() => <TransferLandingPage />}
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="Transfer Items"
            component={ItemListing}
            options={{
               title: "Items to be transferred",
            }}
         />
         <Stack.Screen
            name="Transfer Summary"
            component={ItemListing}
            options={{
               title: "Transfer Summary",
            }}
         />
         <Stack.Screen
            name="Add Items"
            component={AddItem}
            options={{
               title: "Add Items to be transferred",
            }}
         />
      </Stack.Navigator>
   );
}
