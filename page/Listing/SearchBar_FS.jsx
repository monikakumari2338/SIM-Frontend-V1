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
import { List } from "react-native-paper";

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
  // Apply Filter Function
  async function applyFilter(type, reasonOrStatus) {
    if (reasonOrStatus === "reset") {
      resetFilter();
    }

    try {
      setListingData(await filterEntry(type, reasonOrStatus));
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
          applyFilter,
          reasonFilterVisible,
          setReasonFilterVisible,
        }}
      />

      {/* Status Filter Bottom Sheet */}
      <StatusFilterBottomSheet
        {...{
          type,
          applyFilter,
          statusFilterVisible,
          setStatusFilterVisible,
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

  // Functions
  async function resetFilter() {
    try {
      setListingData(await fetchData(type));
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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
  applyFilter,
  statusFilterVisible,
  setStatusFilterVisible,
}) {
  // States and Vars
  const STATUSES = {
    InProgress: {
      name: "In Progress",
      icon: {
        name: "progress-question",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    New: {
      name: "New",
      icon: {
        name: "progress-question",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Pending: {
      name: "Pending",
      icon: {
        name: "progress-question",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Completed: {
      name: "Complete",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Dispatched: {
      name: "Dispatched",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Saved: {
      name: "Saved",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    NewRequest: {
      name: "New Request",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Shipped: {
      name: "Shipped",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Delivered: {
      name: "Delivered",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Accepted: {
      name: "Accepted",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Rejected: {
      name: "Rejected",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    PartiallyAccepted: {
      name: "Partially Accepted",
      icon: {
        name: "progress-check",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
  };

  const statusFilter = {
    IA: [STATUSES.InProgress, STATUSES.Completed],
    DSD: [STATUSES.Saved, STATUSES.Completed],
    RTV: [STATUSES.InProgress, STATUSES.Dispatched],
    PO: [
      STATUSES.Pending,
      STATUSES.InProgress,
      STATUSES.Completed,
      STATUSES.Saved,
    ],
    TSFIN: [
      STATUSES.NewRequest,
      STATUSES.Accepted,
      STATUSES.PartiallyAccepted,
      STATUSES.Rejected,
      STATUSES.Delivered,
    ],
    TSFOUT: [
      STATUSES.NewRequest,
      STATUSES.Accepted,
      STATUSES.PartiallyAccepted,
      STATUSES.Rejected,
      STATUSES.Delivered,
    ],
    SC: [
      STATUSES.Pending,
      STATUSES.InProgress,
      STATUSES.Completed,
      STATUSES.Saved,
      STATUSES.New,
    ],
  }[type];

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
            applyFilter(type, opt.name);
            setStatusFilterVisible(false);
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={styles.bottomSheetOpt}>
              {opt.name}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}

      {/* Reset Option */}
      <ListItem
        containerStyle={[styles.sortOptCancel, { backgroundColor: "darkred" }]}
        onPress={() => {
          applyFilter(type, "reset");
          setStatusFilterVisible(false);
        }}
      >
        <ListItem.Content>
          <Icon
            {...{
              name: "cancel",
              type: "material",
              color: "white",
            }}
          />
          <ListItem.Title
            style={[
              styles.bottomSheetOpt,
              {
                fontFamily: "Montserrat-Medium",
                color: "white",
              },
            ]}
          >
            Reset Filter
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </BottomSheet>
  );
}

function ReasonFilterBottomSheet({
  type,
  applyFilter,
  reasonFilterVisible,
  setReasonFilterVisible,
}) {
  // States and Vars
  const REASONS = {
    Damaged: {
      name: "Damaged",
      icon: {
        name: "image-broken-variant",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Theft: {
      name: "Theft",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    StockIn: {
      name: "Stock In",
      icon: {
        name: "download",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    StockOut: {
      name: "Stock Out",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    BoxDamaged: {
      name: "Box Damaged",
      icon: {
        name: "image-broken-variant",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    ItemDamaged: {
      name: "Item Damaged",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    WrongItem: {
      name: "Wrong Item",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    QualityIssue: {
      name: "Quality Issue",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },

    EmergencyRequest: {
      name: "Emergency Request",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    StockRedistribution: {
      name: "Stock Redistribution",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    InventoryReplenishment: {
      name: "Inventory Replenishment",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    PromotionalEvent: {
      name: "Promotional Event",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    StockConsolidation: {
      name: "Stock Consolidation",
      icon: {
        name: "upload",
        type: "font-awesome",
        color: "black",
        size: 30,
      },
    },
    Audit: {
      name: "Audit",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Damage: {
      name: "Damage",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Routine: {
      name: "Routine",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
    Discrepancy: {
      name: "Discrepancy",
      icon: {
        name: "shield-lock-open",
        type: "material-community",
        color: "black",
        size: 30,
      },
    },
  };

  const reasonFilter = {
    IA: [REASONS.Damaged, REASONS.Theft, REASONS.StockIn, REASONS.StockOut],
    RTV: [
      REASONS.BoxDamaged,
      REASONS.ItemDamaged,
      REASONS.WrongItem,
      REASONS.QualityIssue,
    ],
    DSD: [REASONS.BoxDamaged],
    PO: [REASONS.BoxDamaged],
    TSFIN: [
      REASONS.EmergencyRequest,
      REASONS.InventoryReplenishment,
      REASONS.PromotionalEvent,
      REASONS.StockConsolidation,
      REASONS.StockRedistribution,
    ],
    TSFOUT: [
      REASONS.EmergencyRequest,
      REASONS.InventoryReplenishment,
      REASONS.PromotionalEvent,
      REASONS.StockConsolidation,
      REASONS.StockRedistribution,
    ],
    SC: [REASONS.Audit, REASONS.Damage, REASONS.Routine, REASONS.Discrepancy],
  }[type];

  return (
    <BottomSheet
      isVisible={reasonFilterVisible}
      onBackdropPress={() => setReasonFilterVisible(false)}
    >
      {reasonFilter.map((opt, i) => (
        <ListItem
          key={i}
          containerStyle={opt.containerStyle}
          onPress={() => {
            applyFilter(type, opt.name);
            setReasonFilterVisible(false);
          }}
        >
          <ListItem.Content>
            <Icon {...opt.icon} />
            <ListItem.Title style={styles.bottomSheetOpt}>
              {opt.name}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}

      {/* Reset Option */}
      <ListItem
        containerStyle={[styles.sortOptCancel, { backgroundColor: "darkred" }]}
        onPress={() => {
          applyFilter(type, "reset");
          setReasonFilterVisible(false);
        }}
      >
        <ListItem.Content>
          <Icon
            {...{
              name: "cancel",
              type: "material",
              color: "white",
            }}
          />
          <ListItem.Title
            style={[
              styles.bottomSheetOpt,
              {
                fontFamily: "Montserrat-Medium",
                color: "white",
              },
            ]}
          >
            Reset Filter
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
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
