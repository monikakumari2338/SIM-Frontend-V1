import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";

const Stack = createStackNavigator();

function IaNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="IA Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="IA Listing"
            children={() => <ListingPage type={"IA"} />}
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="IA Items"
            component={ItemListing}
            options={{
               title: "Create IA",
            }}
         />
         <Stack.Screen
            name="IA Summary"
            component={ItemListing}
            options={{
               title: "IA Summary",
            }}
         />
         <Stack.Screen
            name="Add Items"
            component={AddItem}
            options={{
               title: "Add Items to IA",
            }}
         />
      </Stack.Navigator>
   );
}

export default IaNavigator;
