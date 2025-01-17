import { useState, useEffect, useContext, useCallback } from "react";
import {
   View,
   Text,
   ActivityIndicator,
   StyleSheet,
   ScrollView,
   Dimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Icon } from "@rneui/themed";
import { interpolate } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { BarChart, PieChart, ProgressChart } from "react-native-chart-kit";
import { endpoints } from "../../context/endpoints";
import { AuthContext } from "../../context/AuthContext";

const PAGE_WIDTH = Dimensions.get("window").width * 0.6;
const PAGE_HEIGHT = Dimensions.get("window").height * 0.4;

export default function Dashboard() {
   // Creds
   const { getData, storeName } = useContext(AuthContext);

   // States and Vars
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch the data for Dashboard
   const [data, setData] = useState({});
   const isFocused = useIsFocused();
   useEffect(() => {
      async function fetchData() {
         try {
            const responses = await Promise.all([
               getData(endpoints.fetchMyTasks + storeName),
               getData(endpoints.fetchDiscrepancyTypeRatio + storeName),
               getData(endpoints.fetchVariance + storeName),
               getData(endpoints.fetchTransfersStatus + storeName),
            ]);

            setData({
               task: responses[0] || [],
               discrepancy: responses[1] || [],
               variance: responses[2] || [],
               transfer: responses[3] || [],
            });
         } catch (error) {
            console.error("Error fetching Task Card data:", error);
            setError(error);
         } finally {
            setIsLoading(false);
         }
      }

      fetchData();
   }, [isFocused]);

   // Render
   return (
      <View style={styles.container}>
         {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
         ) : error ? (
            <Text style={styles.textRegular}>Error: {error.message}</Text>
         ) : (
            <ScrollView
               showsVerticalScrollIndicator={false}
               style={{ flex: 0.9 }}
            >
               {/* Tasks Carousel */}
               <TasksCarousel data={data} />

               {/* Heading: My Dashboard */}
               <Text style={styles.sectionHeading}>Dashboard</Text>

               {/* 1. Stock Variance Stacked Graph */}
               <StockVarianceGraph data={data} />

               {/* 2. Inventory Discrepancy Pie Graph */}
               <DiscrepancyGraph data={data} />

               {/* 3. Transfers Bar Graph */}
               <TransferGraph data={data} />
            </ScrollView>
         )}
      </View>
   );
}

function TasksCarousel({ data }) {
   const taskCardDataStatic = [
      {
         module: "Stock Count",
         icon: "counter",
         iconType: "material-community",
         color: "dodgerblue",
      },
      {
         module: "Transfer Receive",
         icon: "transfer",
         iconType: "material-community",
         color: "orange",
      },
      {
         module: "PO Receive",
         icon: "cart-arrow-down",
         iconType: "material-community",
         color: "green",
      },
      {
         module: "Stock In Hand",
         icon: "counter",
         iconType: "material-community",
         color: "purple",
      },
      {
         module: "Return to Vendor",
         icon: "keyboard-backspace",
         iconType: "material",
         color: "pink",
      },
   ];
   const taskCardData = data.task.map((task) => {
      const matchingStatic = taskCardDataStatic.find(
         (item) => item.module === task.module
      );
      return matchingStatic ? { ...task, ...matchingStatic } : task;
   });
   const [currentIndex, setCurrentIndex] = useState(0);
   // Custom Animation Style
   const animationStyle = useCallback((value) => {
      "worklet";

      const zIndex = Math.round(interpolate(value, [-1, 0, 1], [1, 2, 1]));
      const rotateZ = `${interpolate(value, [-1, 0, 1], [-15, 0, 15])}deg`;
      const translateX = interpolate(
         value,
         [-1, 0, 1],
         [-PAGE_WIDTH, 0, PAGE_WIDTH]
      );
      const translateY = interpolate(value, [-1, 0, 1], [0, 50, 0]);
      const opacity = interpolate(value, [-1, 0, 1], [0.5, 1, 0.5]);
      const scale = interpolate(value, [-1, 0, 1], [0.8, 1, 0.8]);

      return {
         zIndex,
         transform: [{ translateX }, { translateY }, { scale }],
         // opacity,
      };
   }, []);

   function TaskCard({ info }) {
      function applyOpacity(color, opacity) {
         // Convert named color to rgba with reduced opacity
         switch (color.toLowerCase()) {
            case "dodgerblue":
               return `rgba(30, 144, 255, ${opacity})`;
            case "orange":
               return `rgba(255, 165, 0, ${opacity})`;
            case "green":
               return `rgba(0, 128, 0, ${opacity})`;
            case "purple":
               return `rgba(128, 0, 128, ${opacity})`;
            case "pink":
               return `rgba(255, 192, 203, ${opacity})`;
            default:
               return `rgba(0, 0, 0, ${opacity})`;
         }
      }

      // module name abbreviation
      const moduleNameAbbrev = {
         "Stock Count": "SC",
         "Return to Vendor": "RTV",
         "Transfer Receive": "TR",
         "Stock In Hand": "Stock",
         "PO Receive": "PO",
      };

      // icon container bg (utlizes applyOpacity)
      const iconContainerBg = applyOpacity(info.color, 0.2);

      return (
         <View style={styles.card}>
            {/* Left Container */}
            <View style={{ justifyContent: "space-between" }}>
               <View style={styles.moduleContainer}>
                  {/* Icon Container */}
                  <View
                     style={[
                        styles.iconContainer,
                        { backgroundColor: iconContainerBg },
                     ]}
                  >
                     {/* Icon */}
                     <Icon
                        name={info.icon}
                        type={info.iconType}
                        color={info.color}
                        size={40}
                     />
                  </View>

                  {/* Module Name */}
                  <Text style={styles.moduleName}>
                     {moduleNameAbbrev[info.module] || info.module}
                  </Text>
               </View>
               <Text style={styles.pendingCount}>
                  {info.pendingValue} {info.pendingLabel}
               </Text>
            </View>

            <View style={{ alignSelf: "center" }}>
               <ProgressChart
                  data={{
                     data: [info.percentageValue],
                  }}
                  width={100}
                  height={100}
                  strokeWidth={10}
                  radius={45}
                  chartConfig={{
                     backgroundGradientFrom: "#112d4e",
                     backgroundGradientTo: "#112d4e",
                     color: (opacity = 1) => applyOpacity(info.color, opacity),
                  }}
                  hideLegend={true}
               />
               <Text style={styles.progressPercentage}>
                  {(info.percentageValue * 100).toFixed(0)}%
               </Text>
            </View>
         </View>
      );
   }

   return (
      <>
         <Text style={styles.sectionHeading}>Tasks</Text>
         <Carousel
            loop
            style={{
               width: Dimensions.get("window").width,
               justifyContent: "center",
               alignItems: "center",
            }}
            width={PAGE_WIDTH * 1.3}
            height={PAGE_HEIGHT * 0.7}
            data={[...new Array(6).keys()]}
            renderItem={({ index }) => (
               <TaskCard info={taskCardData[index % taskCardData.length]} />
            )}
            autoPlay={true}
            autoPlayInterval={3000}
            customAnimation={animationStyle}
            onProgressChange={(_, absoluteProgress) =>
               setCurrentIndex(Math.round(absoluteProgress))
            }
         />
      </>
   );
}

function StockVarianceGraph({ data }) {
   const labels = data.variance.map((item) => item.category);

   const barChartData = {
      labels: labels,
      datasets: [
         {
            data: data.variance.map((item) => item.actualCount), // Actual counts
            color: () => "#74b900", // Green for actual
         },
         {
            data: data.variance.map((item) => item.systemCount), // System counts
            color: () => "#0984e3", // Blue for system
         },
      ],
   };

   return (
      <View style={styles.graphContainer}>
         <Text style={styles.graphHeading}>Category-wise Stock Variance</Text>
         <BarChart
            data={{
               labels: barChartData.labels,
               datasets: [
                  {
                     data: barChartData.datasets[0].data, // Actual counts
                  },
                  {
                     data: barChartData.datasets[1].data, // System counts
                  },
               ],
            }}
            width={380}
            height={300}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
            chartConfig={{
               backgroundGradientFrom: "#f0f0f0",
               backgroundGradientTo: "#f0f0f0",
               decimalPlaces: 0,
               barPercentage: 0.5,
               color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
               style: {
                  borderRadius: 16,
               },
            }}
            style={{
               marginVertical: 10,
               borderRadius: 16,
            }}
            showValuesOnTopOfBars={true}
         />
      </View>
   );
}

function DiscrepancyGraph({ data }) {
   const discrepancy = [
      {
         name: "Damage",
         value: data.discrepancy["damageStock"],
         color: "#a4b0be",
         legendFontColor: "dodgerblue",
         legendFontSize: 15,
      },
      {
         name: "Sellable",
         value: data.discrepancy["sellableStock"],
         color: "#747d8c",
         legendFontColor: "dodgerblue",
         legendFontSize: 15,
      },
      {
         name: "Non-sellable",
         value: data.discrepancy["nonsellableStock"],
         color: "#2f3542",
         legendFontColor: "dodgerblue",
         legendFontSize: 15,
      },
   ];

   return (
      <View style={styles.graphContainer}>
         <Text style={styles.graphHeading}>Inventory Health</Text>
         <Text style={styles.barChartLabel}>Sellable Vs Non-Sellable</Text>
         <PieChart
            data={discrepancy}
            width={380}
            height={250}
            chartConfig={{
               backgroundGradientFrom: "#f0f0f0",
               backgroundGradientTo: "#f0f0f0",
               color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
         />
      </View>
   );
}

function TransferGraph({ data }) {
   const transferRequestData = {
      labels: ["Requested", "Accepted", "Shipped", "Received"],
      datasets: [
         {
            data: data.transfer["transfersRequest"],
         },
      ],
   };
   const transferFulfillmentData = {
      labels: ["Requested", "Accepted", "Shipped", "Received"],
      datasets: [
         {
            data: data.transfer["transferFulfillment"],
         },
      ],
   };

   return (
      <View style={styles.graphContainer}>
         <Text style={styles.graphHeading}>Transfers Status</Text>
         <BarChart
            data={transferRequestData}
            width={380}
            height={250}
            chartConfig={{
               backgroundGradientFrom: "#f0f0f0",
               backgroundGradientTo: "#f0f0f0",
               color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            }}
            style={{ marginTop: 10 }}
         />
         <Text style={styles.barChartLabel}>Transfer Request</Text>
         <BarChart
            data={transferFulfillmentData}
            width={380}
            height={250}
            chartConfig={{
               backgroundGradientFrom: "#f0f0f0",
               backgroundGradientTo: "#f0f0f0",
               color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            }}
            style={{ marginTop: 10 }}
         />
         <Text style={styles.barChartLabel}>Transfer Fulfillment</Text>
      </View>
   );
}

const styles = StyleSheet.create({
   sectionHeading: {
      fontFamily: "Montserrat-Bold",
      fontSize: 20,
      color: "#112d4e",
      marginVertical: 20,
      marginHorizontal: 20,
   },
   graphHeading: {
      fontFamily: "Montserrat-Bold",
      fontSize: 15,
      color: "#112d4eaa",
      marginBottom: 10,
   },
   container: {
      flex: 0.89,
      justifyContent: "center",
      alignItems: "center",
   },
   card: {
      backgroundColor: "#112d4e",
      padding: 20,
      marginTop: 10,
      borderWidth: 3,
      borderColor: "white",
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      elevation: 10,
   },
   iconContainer: {
      width: 70,
      height: 70,
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
   },
   moduleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      marginRight: 40,
   },
   moduleName: {
      fontFamily: "Montserrat-Bold",
      fontSize: 17,
      color: "white",
   },
   pendingCount: {
      fontFamily: "Montserrat-Medium",
      fontSize: 17,
      color: "white",
   },
   progressPercentage: {
      position: "absolute",
      alignSelf: "center",
      top: 35,
      fontFamily: "Montserrat-Medium",
      fontSize: 22,
      color: "white",
   },
   graphContainer: {
      alignSelf: "center",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
   },
   barChartLabel: {
      fontFamily: "Montserrat-Medium",
      fontSize: 12,
      color: "#112d4e",
      marginBottom: 20,
   },
   graphContainer: {
      padding: 20,
      alignItems: "center",
   },
   graphHeading: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
   },
});
