import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ListingPage from "../../page/Listing/Listing";

const Tab = createMaterialTopTabNavigator();

export default function TransferLandingPage() {
   return (
      <Tab.Navigator
         screenOptions={{
            tabBarLabelStyle: {
               fontFamily: "Montserrat-Bold",
               fontSize: 15,
            },
            tabBarIndicatorStyle: {
               height: "100%",
            },
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "silver",
         }}
      >
         <Tab.Screen name="IN" children={() => <ListingPage type="TSFIN" />} />
         <Tab.Screen
            name="OUT"
            children={() => <ListingPage type="TSFOUT" />}
         />
      </Tab.Navigator>
   );
}
