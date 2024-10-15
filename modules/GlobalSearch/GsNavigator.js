import { createStackNavigator } from "@react-navigation/stack";
import GlobalSearch from "./GlobalSearch";
import ItemStock from "./ItemStock";
import BuddyStock from "./BuddyStock";
import { screenOptions } from "../../screenOptions";

const Stack = createStackNavigator();

export default function GsNavigator() {
   return (
      <Stack.Navigator
         initialRouteName="Global Search"
         screenOptions={screenOptions}
      >
         <Stack.Screen
            name="Global Search"
            component={GlobalSearch}
            options={{
               title: "Search for an item",
            }}
         />
         <Stack.Screen name="Item Stock" component={ItemStock} />
         <Stack.Screen name="Buddy Store Stock" component={BuddyStock} />
      </Stack.Navigator>
   );
}
