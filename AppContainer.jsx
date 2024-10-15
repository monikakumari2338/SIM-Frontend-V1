import { createDrawerNavigator } from "@react-navigation/drawer";
import DsdNavigator from "./modules/DirectStoreDelivery/DsdNavigator";
import IaNavigator from "./modules/InventoryAdjustment/IaNavigator";
import GsNavigator from "./modules/GlobalSearch/GsNavigator";
import PoNavigator from "./modules/PurchaseOrder/PoNavigator";
import TransferNavigator from "./modules/Transfer/TransferNavigator";
import ScNavigator from "./modules/StockCount/ScNavigator";
import Footer from "./globalComps/Footer";
import Header from "./globalComps/Header";
import Dashboard from "./modules/Dashboard/Dashboard";
import RtvNavigator from "./modules/ReturnToVendor/RtvNavigator";
const Drawer = createDrawerNavigator();

export default function AppContainer() {
   return (
      <>
         {/* Header */}
         <Header />

         {/* Drawer Navigator */}
         <Drawer.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
               drawerStyle: {
                  backgroundColor: "#112d4e",
               },
               drawerActiveTintColor: "white",
               drawerInactiveTintColor: "white",
               drawerLabelStyle: {
                  fontFamily: "Montserrat-Regular",
                  fontSize: 16,
               },
               headerStyle: {
                  backgroundColor: "#112d4e",
               },
               headerTitleAlign: "center",
               headerTintColor: "white",
               headerTitleStyle: {
                  fontFamily: "Montserrat-Regular",
               },
               drawerType: "slide",
            }}
         >
            <Drawer.Screen name="Dashboard" component={Dashboard} />
            <Drawer.Screen
               name="Inventory Adjustment"
               component={IaNavigator}
            />
            <Drawer.Screen
               name="Direct Store Delivery"
               component={DsdNavigator}
            />
            <Drawer.Screen name="Item Lookup" component={GsNavigator} />
            <Drawer.Screen name="Purchase Order" component={PoNavigator} />
            <Drawer.Screen name="Transfer" component={TransferNavigator} />
            <Drawer.Screen name="Stock Count" component={ScNavigator} />
            <Drawer.Screen name="Return To Vendor" component={RtvNavigator} />
         </Drawer.Navigator>

         {/* Footer */}
         <Footer />
      </>
   );
}
