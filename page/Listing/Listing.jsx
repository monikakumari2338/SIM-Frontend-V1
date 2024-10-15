import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
} from "react-native";
import {
  FAB,
  Overlay,
  Icon,
  Input,
  Button,
  useTheme,
  BottomSheet,
} from "@rneui/themed";
import { useIsFocused, useNavigation } from "@react-navigation/native";
// Custom Comps and Functions
import ListingCard from "./ListingCard";
import EmptyPageComponent from "../../globalComps/EmptyPageComp";
import SearchBar from "./SearchBar_FS";
import { fetchData, createEntry } from "../../context/functions";
import { format } from "date-fns";
import { getData, postData, storeName, userName } from "../../context/auth";
import { endpoints } from "../../context/endpoints";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ListingPage({ type }) {
  // Navigation
  const navigation = useNavigation();
  // Navigation FOCUS Listener
  const isFocused = useIsFocused();
  // Theme Context
  const { theme } = useTheme();

  // ------------ Listing Data State ------------
  // Listing data states
  const [listingData, setListingData] = useState([]);
  // useEffect: Refresh Listing Page Data on Focus
  useEffect(() => {
    refreshListingData();
  }, [isFocused]);
  // Function to refresh Listing Data
  async function refreshListingData() {
    setListingData(await fetchData(type));
  }

  // ------------ Create Mech -------------------
  // No Create FAB on "PO" and "TSFOUT" pages
  const showCreateFab = !["PO", "TSFOUT"].includes(type);
  // Function to create a new entry for the current module
  async function handleCreate() {
    let newEntry;
    switch (type) {
      case "IA":
        newEntry = await createEntry(type);
        navigation.navigate("IA Items", { entryItem: newEntry });
        break;
      case "DSD":
        newEntry = await createEntry(type);
        navigation.navigate("DSD Items", { entryItem: newEntry });
        break;
      case "TSFIN":
        setSupplierOverlay(true);
        break;
      case "SC":
        setScDateOverlay(true);
        break;
      case "RTV":
        newEntry = await createEntry(type);
        navigation.navigate("RTV Items", { entryItem: newEntry });
        // handleCreateRtv();
        break;
      default:
        console.error("Invalid type to create entry");
    }
  }
  async function handleCreateRtv() {
    try {
      const createResponse = await postData(
        endpoints.createRtv + `${entryItem.id}/${storeName}`
      );
      const rtvItem = await getData(
        endpoints.fetchItemsRTV + createResponse.id
      );
      rtvItem.type = "SC";
      navigation.navigate("SC Items", { entryItem: rtvItem });
    } catch (error) {
      console.error("Failed to create SC Request", error);
    }
  }

  // ------------ Overlays ----------------------

  // Supplier Overlay for TSF
  const [tsfSupplierOverlay, setSupplierOverlay] = useState(false);
  // Date Overlay for SC
  const [scDateOverlay, setScDateOverlay] = useState(false);

  return (
    <ImageBackground
      source={require("../../assets/bg3.jpg")}
      style={{ flex: 0.9 }}
    >
      <FlatList
        data={listingData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard {...{ item, refreshListingData }} />
        )}
        ListHeaderComponent={<SearchBar {...{ type, setListingData }} />}
        ListEmptyComponent={<EmptyPageComponent />}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 15,
        }}
      />

      {/* Create FAB */}
      {showCreateFab && (
        <FAB
          title={"Create"}
          titleStyle={{
            fontFamily: "Montserrat-Bold",
          }}
          color={"#f0f0f0"}
          style={styles.fab}
          icon={{
            name: "playlist-add-circle",
            color: "white",
            size: 32,
          }}
          buttonStyle={{
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
            width: 120,
            justifyContent: "space-evenly",
          }}
          onPress={handleCreate}
        />
      )}

      {/* Supplier Overlay */}
      {type === "TSFIN" && (
        <TsfSupplierOverlay
          {...{
            tsfSupplierOverlay,
            setSupplierOverlay,
          }}
        />
      )}

      {/* Date Overlay */}
      {type === "SC" && (
        <DateFilterBottomSheet
          {...{
            scDateOverlay,
            setScDateOverlay,
          }}
        />
      )}
    </ImageBackground>
  );
}

function TsfSupplierOverlay({ tsfSupplierOverlay, setSupplierOverlay }) {
  // States and vars
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState([]);
  const [tsfSupplier, setTsfSupplier] = useState("");

  // Functions
  async function handleSupplierIdChange(text) {
    try {
      // Trim the input text to remove any leading or trailing whitespace
      const trimmedText = text.trim();

      // Set the supplier ID state
      setTsfSupplier(trimmedText);

      // If the trimmed text is not empty, proceed with fetching data
      if (trimmedText) {
        const data = await getData(`${endpoints.fetchStores}${trimmedText}`);

        // Check if data is an object and convert it to an array of objects for FlatList
        if (data && typeof data === "object") {
          const formattedSuggestions = Object.entries(data).map(
            ([key, value]) => ({ id: key, name: value })
          );
          setSuggestions(formattedSuggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        // If the trimmed text is empty, reset suggestions
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);

      // Display an alert to the user in case of an error
      Alert.alert(
        "Error",
        "An error occurred while fetching suppliers. Please try again."
      );

      // Reset suggestions in case of an error
      setSuggestions([]);
    }
  }
  async function handleCreateTsf(tsfSupplier) {
    try {
      const response = await postData(
        `${endpoints.createTsf}${storeName}/${userName}/${tsfSupplier}`
      );
      setSupplierOverlay(false);
      navigation.navigate("Transfer Items", { entryItem: response });
    } catch (error) {
      console.error("Failed to create TSF Request", error);
    }
  }

  return (
    <Overlay
      isVisible={tsfSupplierOverlay}
      overlayStyle={{ width: "70%", padding: 20 }}
    >
      {/* Title */}
      <View style={{ flexDirection: "row", alignSelf: "center" }}>
        <Icon
          name="warehouse"
          type="material-community"
          size={28}
          iconStyle={{ marginRight: 10 }}
        />
        <Text
          style={{
            fontFamily: "Montserrat-Bold",
            fontSize: 20,
            marginBottom: 15,
          }}
        >
          Select From Store
        </Text>
      </View>

      {/* Supplier ID Input */}
      <Input
        inputStyle={{
          fontFamily: "Montserrat-Regular",
          fontSize: 16,
          textAlign: "center",
        }}
        placeholder="Enter a store name"
        value={tsfSupplier}
        onChangeText={handleSupplierIdChange}
      />

      {/* Supplier Suggestion List */}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Button
            type="outline"
            title={`${item.id}: ${item.name}`}
            titleStyle={styles.buttonTitle}
            buttonStyle={[styles.button, { width: "100%" }]}
            containerStyle={{ margin: 10 }}
            onPress={() => {
              handleCreateTsf(item.name);
            }}
          />
        )}
        ListrefreshListingDataterComponent={
          <Button
            type="clear"
            title="Cancel"
            icon={{
              name: "close",
              type: "material-community",
              color: "crimson",
            }}
            buttonStyle={[styles.button, { alignSelf: "center" }]}
            titleStyle={styles.buttonTitle}
            onPress={() => {
              setSupplierOverlay(false);
            }}
          />
        }
      />
    </Overlay>
  );
}

function DateFilterBottomSheet({ scDateOverlay, setScDateOverlay }) {
  // Date Range Picker Component
  function DateRangePicker() {
    // States and Vars
    const [startDate, setStartDate] = useState(
      format(new Date(), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Functions
    function onStartChange(event, selectedDate) {
      setShowStartPicker(false);
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        setStartDate(formattedDate);
      }
    }

    function onEndChange(event, selectedDate) {
      setShowEndPicker(false);
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        setEndDate(formattedDate);
      }
    }

    return (
      <View style={{ flexDirection: "row" }}>
        <View style={styles.container}>
          <View style={styles.picker}>
            <Button
              onPress={() => setShowStartPicker(true)}
              title="Start Date"
              titleStyle={{ fontFamily: "Montserrat-Bold" }}
              icon={{
                name: "calendar",
                type: "material-community",
                color: "white",
              }}
            />
            {showStartPicker && (
              <DateTimePicker
                testID="startDateTimePicker"
                value={new Date(startDate)}
                mode="date"
                display="default"
                onChange={onStartChange}
                minimumDate={new Date()}
              />
            )}
            <Text style={styles.dateText}>{startDate}</Text>
          </View>
          <View style={styles.picker}>
            <Button
              onPress={() => setShowEndPicker(true)}
              title="End Date"
              titleStyle={{ fontFamily: "Montserrat-Bold" }}
              icon={{
                name: "calendar",
                type: "material-community",
                color: "white",
              }}
            />
            {showEndPicker && (
              <DateTimePicker
                testID="endDateTimePicker"
                value={new Date(endDate)}
                mode="date"
                display="default"
                onChange={onEndChange}
                minimumDate={new Date()}
              />
            )}
            <Text style={styles.dateText}>{endDate}</Text>
          </View>
        </View>
        <View style={styles.container}>
          <Button
            title="Create SC"
            titleStyle={{ fontFamily: "Montserrat-Bold" }}
            buttonStyle={{ backgroundColor: "green", borderRadius: 30 }}
            onPress={() => handleCreateSc(startDate, endDate)}
          />
        </View>
      </View>
    );
  }

  // Functions
  async function handleCreateSc(startDate, endDate) {
    try {
      const createResponse = await postData(
        endpoints.createSc + `${storeName}/${startDate}/${endDate}`
      );
      const scItem = await getData(endpoints.fetchScItems + createResponse.id);
      scItem.type = "SC";
      scItem.category = "Sportswear";
      setScDateOverlay(false);
      navigation.navigate("SC Items", { entryItem: scItem });
    } catch (error) {
      console.error("Failed to create SC Request", error);
    }
  }

  const navigation = useNavigation();

  return (
    <BottomSheet
      isVisible={scDateOverlay}
      onBackdropPress={() => setScDateOverlay(false)}
    >
      <View style={styles.bottomSheet}>
        <DateRangePicker />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontFamily: "Montserrat-Regular",
    fontSize: 20,
  },
  fab: {
    position: "absolute",
    right: 15,
    bottom: 15,
  },

  // Date Picker Styles
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  picker: {
    marginVertical: 10,
    alignItems: "center",
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
  },
  bottomSheet: {
    backgroundColor: "white",
    padding: 10,
  },
  buttonContainer: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginHorizontal: 5,
    backgroundColor: "#112d4e",
    borderRadius: 10,
  },
});
