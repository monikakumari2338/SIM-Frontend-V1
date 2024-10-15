import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";

const Stack = createStackNavigator();

export default function PoNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="SC Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="SC Listing"
            children={() => <ListingPage type={"SC"} />}
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="SC Items"
            component={ItemListing}
            options={{
               title: "Add items to count",
            }}
         />
         <Stack.Screen
            name="Add Items"
            component={AddItem}
            options={{
               title: "Scan items to update count",
            }}
         />
      </Stack.Navigator>
   );
}
