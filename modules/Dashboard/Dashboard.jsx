import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Icon } from "@rneui/themed";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import {
  BarChart,
  PieChart,
  StackedBarChart,
  ProgressChart,
} from "react-native-chart-kit";
import { endpoints } from "../../context/endpoints";
import { storeName, getData } from "../../context/auth";

export default function Dashboard({ navigation }) {
  // States and Vars
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    taskCardData: [],
    varianceData: [],
    transferRequestDataArray: [],
    transferFulfillmentDataArray: [],
  });

  // Functions
  async function fetchData() {
    try {
      // Fetch Task Card data
      const response1 = await getData(endpoints.fetchMyTasks + storeName);
      // Update taskCardData with the fetched data
      const updatedTaskCardData = taskCardDataStatic.map((task) => {
        const matchingResponse = response1.find(
          (item) => item.module === task.module
        );
        return matchingResponse ? { ...matchingResponse, ...task } : task;
      });

      // Fetch Inventory Discrepancy Type Ratio
      const response2 = await getData(
        endpoints.fetchDiscrepancyTypeRatio + storeName
      );

      const response3 = await getData(
        endpoints.fetchTransfersStatus + storeName
      );

      console.log("Data fetched:");
      console.log(response1);
      console.log(response2);
      console.log(response3);

      setData({
        taskCardData: updatedTaskCardData,
        varianceData: response2,
        transferRequestDataArray: response3.transfersRequest,
        transferFulfillmentDataArray: response3.transferFulfillment,
      });
    } catch (error) {
      console.error("Error fetching Task Card data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Effects
  useEffect(() => {
    fetchData();
  }, [isFocused]);

  const [activeIndex, setActiveIndex] = useState(0); // Track the active index for pagination
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  // 1. Module Cards
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

  // 2. Stock Variance Data
  const stackedChartData = {
    labels: data.varianceData.map((item) => item.category),
    legend: ["Actual", "System"],
    data: data.varianceData.map((item) => [item.actualCount, item.systemCount]),
    barColors: ["#74b900", "#0984e3"],
  };

  // 3. Inventory Discrepancy Data
  const discrepancyData = [
    {
      name: "Damage",
      value: 50,
      color: "#a4b0be",
      legendFontColor: "dodgerblue",
      legendFontSize: 15,
    },
    {
      name: "Sellable",
      value: 858,
      color: "#747d8c",
      legendFontColor: "dodgerblue",
      legendFontSize: 15,
    },
    {
      name: "Non-sellable",
      value: 138,
      color: "#2f3542",
      legendFontColor: "dodgerblue",
      legendFontSize: 15,
    },
  ];

  // 4. Transfers Data
  const transferLabels = ["Requested", "Accepted", "Shipped", "Received"];
  const transferRequestData = {
    labels: transferLabels,
    datasets: [
      {
        data: data.transferRequestDataArray,
      },
    ],
  };

  const transferFulfillmentData = {
    labels: transferLabels,
    datasets: [
      {
        data: data.transferFulfillmentDataArray,
      },
    ],
  };

  // Render
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.textRegular}>Error: {error.message}</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Heading: My Tasks */}
          <Text style={styles.sectionHeading}>My Tasks</Text>

          {/* Cards */}
          <Carousel
            loop
            mode="parallax"
            width={380}
            height={180}
            autoPlay={true}
            autoPlayInterval={3000}
            data={data.taskCardData}
            scrollAnimationDuration={1000}
            renderItem={({ index }) => (
              <TaskCard info={data.taskCardData[index]} />
            )}
            pagingEnabled={true}
            onSnapToItem={(index) => setActiveIndex(index)}
          />

          {/* Pagination for the Carousel */}

          {/* <Pagination
                  dotsLength={data.taskCardData.length}
                  activeDotIndex={activeIndex}
                  containerStyle={{ backgroundColor: "transparent" }}
                  dotStyle={{
                     width: 10,
                     height: 10,
                     borderRadius: 5,
                     marginHorizontal: 8,
                     backgroundColor: "rgba(255, 255, 255, 0.92)",
                  }}
                  inactiveDotStyle={
                     {
                        // Optional inactive dot styles
                     }
                  }
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
               /> */}

          {/* Heading: My Dashboard */}
          <Text style={styles.sectionHeading}>My Dashboard</Text>

          {/* 3 Graphs */}

          {/* Stock Variance Stacked Graph */}
          <View style={styles.graphContainer}>
            <Text style={styles.graphHeading}>
              Category-wise Stock Variance
            </Text>
            <StackedBarChart
              data={stackedChartData}
              width={380}
              height={300}
              chartConfig={{
                backgroundGradientFrom: "#f0f0f0",
                backgroundGradientTo: "#f0f0f0",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ marginTop: 10 }}
              withHorizontalLabels={false}
            />
          </View>

          {/* Inventory Discrepancy Pie Graph */}
          <View style={styles.graphContainer}>
            <Text style={styles.graphHeading}>
              Inventory Discrepancy Report
            </Text>
            <PieChart
              data={discrepancyData}
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

          {/* Transfers Status Bar Graph */}
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
        </ScrollView>
      )}
    </View>
  );
}

function TaskCard({ info }) {
  // custom bg color processor for the icon's container
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
    "Return to Vendor": "RTV",
    "Transfer Receive": "TR",
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
            style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}
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

const styles = StyleSheet.create({
  sectionHeading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#112d4e",
    marginVertical: 20,
  },
  graphHeading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#112d4eaa",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#112d4e",
    padding: 20,
    marginTop: 10,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
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
});
