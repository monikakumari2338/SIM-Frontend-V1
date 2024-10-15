import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";
import AsnItems from "../PurchaseOrder/AsnItems";

const Stack = createStackNavigator();

export default function PoNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="PO Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="PO Listing"
            children={() => <ListingPage type={"PO"} />}
            options={{ headerShown: false }}
         />
         <Stack.Screen name="ASN List" component={ItemListing} />
         <Stack.Screen name="Create ASN" component={AsnItems} />
         <Stack.Screen
            name="Add Items"
            component={AddItem}
            options={{
               title: "Add Items to ASN",
            }}
         />
      </Stack.Navigator>
   );
}