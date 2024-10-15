import { createStackNavigator } from "@react-navigation/stack";
import ListingPage from "../../page/Listing/Listing";
import ItemListing from "../../page/ItemListing/ItemListing";
import AddItem from "../../page/AddItem/AddItem";
import { screenOptions } from "../../screenOptions";

const Stack = createStackNavigator();

function RtvNavigator() {
   return (
      <Stack.Navigator
         initRTVlRouteName="RTV Listing"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="RTV Listing"
            children={() => <ListingPage type={"RTV"} />}
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="RTV Items"
            component={ItemListing}
            options={{
               title: "Create RTV",
            }}
         />
         <Stack.Screen
            name="RTV Summary"
            component={ItemListing}
            options={{
               title: "RTV Summary",
            }}
         />
         <Stack.Screen
            name="Add Items"
            component={AddItem}
            options={{
               title: "Add Items to RTV",
            }}
         />
      </Stack.Navigator>
   );
}

export default RtvNavigator;
