import React, { useEffect, useState } from "react";

// React Native Imports
import { View, Pressable, StyleSheet, Text } from "react-native";

// React Native Elements UI Library
import { Icon, SearchBar, ListItem } from "@rneui/themed";

// Custom Components
import { BottomSheet } from "@rneui/base";
import { getData } from "../../context/auth";
import {
  searchEntry,
  sortEntry,
  filterEntry,
  fetchData,
} from "../../context/functions";

export default function SearchBar_FS({ type, setListingData }) {
  // Search string state
  const [searchStr, setSearchStr] = useState("");

  // Search Function
  async function searchData() {
    try {
      if (searchStr.length === 0) {
        setListingData(await fetchData(type));
        return;
      }
      const searchResults = await searchEntry(type, searchStr);
      setListingData(searchResults);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  // useEffect: Search string
  useEffect(() => {
    searchData();
  }, [searchStr]);

  // Visibility States
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [reasonFilterVisible, setReasonFilterVisible] = useState(false);
  const [statusFilterVisible, setStatusFilterVisible] = useState(false);

  return (
    <>
      <View style={styles.searchBarAndOpts}>
        {/* Search Bar */}
        <SearchBar
          placeholder="Enter a search criteria"
          containerStyle={{
            flex: 1,
            backgroundColor: "transparent",
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
          }}
          inputStyle={{
            fontFamily: "Montserrat-Medium",
            fontSize: 10,
          }}
          inputContainerStyle={{
            height: 40,
            borderRadius: 50,
            backgroundColor: "white",
          }}
          value={searchStr}
          onChangeText={(text) => {
            setSearchStr(text);
          }}
        />

        {/* Filter Button */}
        <Pressable
          style={styles.buttonContainer}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="filter" type="material-community" color={"white"} />
        </Pressable>

        {/* Sort Button */}
        <Pressable
          style={styles.buttonContainer}
          onPress={() => setSortVisible(true)}
        >
          <Icon
            name="sort"
            type="materialcommunity"
            size={25}
            color={"white"}
          />
        </Pressable>
      </View>

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        {...{ type, sortVisible, setSortVisible, setListingData }}
      />

      {/* Main Filter Bottom Sheet */}
      <FilterBottomSheet
        {...{
          type,
          filterVisible,
          setFilterVisible,
          setReasonFilterVisible,
          setStatusFilterVisible,
          setListingData,
        }}
      />

      {/* Reason Filter Bottom Sheet */}
      <ReasonFilterBottomSheet
        {...{
          type,
          reasonFilterVisible,
          setReasonFilterVisible,
          setListingData,
        }}
      />

      {/* Status Filter Bottom Sheet */}
      <StatusFilterBottomSheet
        {...{
          type,
          statusFilterVisible,
          setStatusFilterVisible,
          setListingData,
        }}
      />
    </>
  );
}

function SortBottomSheet({
  type,
  sortVisible,
  setSortVisible,
  setListingData,
}) {
  // States and Vars
  const sortOpts = [
    {
      title: "Sort by",
      titleStyle: {
        fontFamily: "Montserrat-Regular",
        fontSize: 25,
      },
      containerStyle: [styles.sortOptContainer, { paddingTop: 0 }],
    },
    {
      title: "Sort by latest",
      icon: {
        name: "sort-clock-descending-outline",
        type: "material-community",
        color: "black",
        size: 35,
      },
      titleStyle: styles.bottomSheetOpt,
      containerStyle: styles.sortOptContainer,
      sortType: "latest",
    },
    {
      title: "Sort by oldest",
      icon: {
        name: "sort-clock-descending-outline",
        type: "material-community",
        color: "black",
        size: 35,
        containerStyle: {
          transform: [{ scaleY: -1 }],
        },
      },
      titleStyle: styles.bottomSheetOpt,
      containerStyle: styles.sortOptContainer,
      sortType: "oldest",
    },
    {
      title: "Cancel",
      icon: { name: "cancel", type: "material", color: "white" },
      containerStyle: [styles.sortOptContainer, { backgroundColor: "darkred" }],
      titleStyle: styles.sortOptCancel,
      sortType: "reset",
    },
  ];

  async function fetchData(sortType) {
    if (sortType === "reset") {
      setListingData(await fetchData(type));
      return;
    }

    try {
      setListingData(await sortEntry(type, sortType));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <BottomSheet
      isVisible={sortVisible}
      onBackdropPress={() => setSortVisible(false)}
    >
      {sortOpts.map((opt, i) => (
        <ListItem
          key={i}
          containerStyle={opt.containerStyle}
          onPress={() => {
            fetchData(opt.sortType);
            setSortVisible(false);
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={opt.titleStyle}>{opt.title}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </BottomSheet>
  );
}

function FilterBottomSheet({
  type,
  filterVisible,
  setFilterVisible,
  setStatusFilterVisible,
  setReasonFilterVisible,
  setListingData,
}) {
  async function resetFilter() {
    try {
      setListingData(await fetchData(type));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Filter Info
  /*
      The sorting is by "oldest" and "latest" entries for all the modules based on the primary date data.
      
      The filtering is as follows:
         Inventory Adjustment: Status, Reason
         Direct Store Delivery: Status, Supplier
         Purchase Order: Status, Supplier
         In Transfer/Out Transfer: Status, Supplier
         Stock Count: Status, Reason
         Return to Vendor: Status, Reason, Category, Vendor

      On the basis of this data, create a filter options array for all the modules, and select the appropriate filter options for each module.   
   */

  // States and Vars
  const filterOpts = [
    {
      title: "Filter by",
      titleStyle: {
        fontSize: 25,
      },
      containerStyle: {
        paddingTop: 10,
      },
    },
    {
      title: "Status",
      icon: {
        name: "progress-question",
        type: "material-community",
        color: "black",
        size: 30,
      },
      titleStyle: styles.bottomSheetOpt,
    },
    {
      title: "Reason",
      icon: {
        name: "report-problem",
        type: "material",
        color: "black",
        size: 30,
      },
      titleStyle: styles.bottomSheetOpt,
    },
    {
      title: "Reset",
      icon: { name: "refresh", type: "material", color: "white" },
      containerStyle: { backgroundColor: "darkred" },
      titleStyle: styles.sortOptCancel,
      type: "reset",
    },
  ];

  return (
    <BottomSheet
      isVisible={filterVisible}
      onBackdropPress={() => setFilterVisible(false)}
    >
      {filterOpts.map((opt, i) => (
        <ListItem
          key={i}
          containerStyle={[styles.sortOptContainer, opt.containerStyle]}
          onPress={() => {
            setFilterVisible(false);
            // Actions defined for each filter option
            const actions = {
              Status: () => setStatusFilterVisible(true),
              Reason: () => setReasonFilterVisible(true),
              Reset: resetFilter,
            };
            const action = actions[opt.title];
            action ? action() : console.error("Invalid filter option");
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={[styles.bottomSheetOpt, opt.titleStyle]}>
              {opt.title}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </BottomSheet>
  );
}

function StatusFilterBottomSheet({
  type,
  statusFilterVisible,
  setStatusFilterVisible,
  setListingData,
}) {
  // States and Vars
  const statusFilterOpts = [
    {
      title: "Select a status",
      titleStyle: {
        fontFamily: "Montserrat-Regular",
        fontSize: 25,
      },
      containerStyle: [styles.sortOptContainer, { paddingTop: 0 }],
    },
    {
      title: "In Progress",
      icon: {
        name: "progress-question",
        type: "material-community",
        color: "black",
        size: 30,
      },
      titleStyle: styles.bottomSheetOpt,
      containerStyle: styles.sortOptContainer,
      filterType: "In Progress",
    },
    {
      title: "Completed",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
      titleStyle: styles.bottomSheetOpt,
      containerStyle: styles.sortOptContainer,
      filterType: "complete",
    },
    // reset filter
    {
      title: "Reset",
      icon: {
        name: "refresh",
        type: "material",
        color: "white",
      },
      containerStyle: [styles.sortOptContainer, { backgroundColor: "darkred" }],
      titleStyle: styles.sortOptCancel,
      filterType: "reset",
    },
  ];

  const statusFilter = {
    IA: [
      {
        title: "Select a status",
        titleStyle: {
          fontFamily: "Montserrat-Regular",
          fontSize: 25,
        },
        containerStyle: [styles.sortOptContainer, { paddingTop: 0 }],
      },
      {
        title: "In Progress",
        icon: {
          name: "progress-question",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "In Progress",
      },
      {
        title: "Completed",
        icon: {
          name: "progress-check",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "complete",
      },
      // reset filter
      {
        title: "Reset",
        icon: {
          name: "refresh",
          type: "material",
          color: "white",
        },
        containerStyle: [
          styles.sortOptContainer,
          { backgroundColor: "darkred" },
        ],
        titleStyle: styles.sortOptCancel,
        filterType: "reset",
      },
    ],
    DSD: [
      {
        title: "Select a status",
        titleStyle: {
          fontFamily: "Montserrat-Regular",
          fontSize: 25,
        },
        containerStyle: [styles.sortOptContainer, { paddingTop: 0 }],
      },
      {
        title: "In Progress",
        icon: {
          name: "progress-question",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "In Progress",
      },
      {
        title: "Completed",
        icon: {
          name: "progress-check",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "complete",
      },
      // reset filter
      {
        title: "Reset",
        icon: {
          name: "refresh",
          type: "material",
          color: "white",
        },
        containerStyle: [
          styles.sortOptContainer,
          { backgroundColor: "darkred" },
        ],
        titleStyle: styles.sortOptCancel,
        filterType: "reset",
      },
    ],
    RTV: [
      {
        title: "Select a status",
        titleStyle: {
          fontFamily: "Montserrat-Regular",
          fontSize: 25,
        },
        containerStyle: [styles.sortOptContainer, { paddingTop: 0 }],
      },
      {
        title: "In Progress",
        icon: {
          name: "progress-question",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "In Progress",
      },
      {
        title: "Dispatched",
        icon: {
          name: "progress-check",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "Dispatched",
      },
      // reset filter
      {
        title: "Reset",
        icon: {
          name: "refresh",
          type: "material",
          color: "white",
        },
        containerStyle: [
          styles.sortOptContainer,
          { backgroundColor: "darkred" },
        ],
        titleStyle: styles.sortOptCancel,
        filterType: "reset",
      },
    ],
  }[type];

  // Functions
  async function filterStatus(status) {
    if (status === "reset") {
      setListingData(await fetchData(type));
      return;
    }

    try {
      setListingData(await filterEntry(type, status));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <BottomSheet
      isVisible={statusFilterVisible}
      onBackdropPress={() => setStatusFilterVisible(false)}
    >
      {statusFilter.map((opt, i) => (
        <ListItem
          key={i}
          containerStyle={opt.containerStyle}
          onPress={() => {
            filterStatus(opt.filterType);
            setStatusFilterVisible(false);
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={opt.titleStyle}>{opt.title}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </BottomSheet>
  );
}

function ReasonFilterBottomSheet({
  type,
  reasonFilterVisible,
  setReasonFilterVisible,
  setListingData,
}) {
  // States and Vars
  const [filterApplied, setFilterApplied] = useState(false);
  const reasonFilterOpts = {
    IA: [
      {
        title: "Damage",
        icon: {
          name: "image-broken-variant",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: "Theft",
        icon: {
          name: "shield-lock-open",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "theft",
      },
      {
        title: "Stock In",
        icon: {
          name: "download",
          type: "font-awesome",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: "Stock Out",
        icon: {
          name: "upload",
          type: "font-awesome",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: filterApplied ? "Reset Filter" : "Cancel",
        icon: {
          name: filterApplied ? "refresh" : "cancel",
          type: "material",
          color: "white",
        },
        containerStyle: [
          styles.sortOptContainer,
          { backgroundColor: "darkred" },
        ],
        titleStyle: styles.sortOptCancel,
        filterType: "reset",
      },
    ],
    RTV: [
      {
        title: "Box Damaged",
        icon: {
          name: "image-broken-variant",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: "Item Damaged",
        icon: {
          name: "shield-lock-open",
          type: "material-community",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
        filterType: "theft",
      },
      {
        title: "Stock In",
        icon: {
          name: "download",
          type: "font-awesome",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: "Wrong Item",
        icon: {
          name: "upload",
          type: "font-awesome",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: "Quality Issue",
        icon: {
          name: "upload",
          type: "font-awesome",
          color: "black",
          size: 30,
        },
        titleStyle: styles.bottomSheetOpt,
        containerStyle: styles.sortOptContainer,
      },
      {
        title: filterApplied ? "Reset Filter" : "Cancel",
        icon: {
          name: filterApplied ? "refresh" : "cancel",
          type: "material",
          color: "white",
        },
        containerStyle: [
          styles.sortOptContainer,
          { backgroundColor: "darkred" },
        ],
        titleStyle: styles.sortOptCancel,
        filterType: "reset",
      },
    ],
  }[type];

  // Functions
  async function filterReason(reason) {
    if (reason === "reset") {
      const data = await getData("/inventoryadjustment/all/adjustments");
      setListingData(data);
      return;
    }
    try {
      const data = await getData(
        "/inventoryadjustment/filter/adjustments/" + reason
      );
      setListingData(data);
      setFilterApplied(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <BottomSheet
      isVisible={reasonFilterVisible}
      onBackdropPress={() => setReasonFilterVisible(false)}
    >
      {reasonFilterOpts.map((opt, i) => (
        <ListItem
          key={i}
          containerStyle={opt.containerStyle}
          onPress={() => {
            filterEntry(type,opt.title);
            setReasonFilterVisible(false);
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={styles.bottomSheetOpt}>
              {opt.title}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchBarAndOpts: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipButton: {
    marginHorizontal: 5,
  },
  sortOptContainer: {
    paddingVertical: 20,
  },
  bottomSheetOpt: {
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
    marginTop: 10,
  },
  sortOptCancel: {
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
    color: "white",
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
