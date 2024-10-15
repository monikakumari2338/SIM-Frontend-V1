// Context for handling the item data temporarily

import React, { createContext, useContext, useState } from "react";

const ItemContext = createContext();

export const useItem = () => {
   return useContext(ItemContext);
};

export const ItemProvider = ({ children }) => {
   // States
   const [tempItems, setTempItems] = useState([]);
   const [tempReason, setTempReason] = useState(null);
   const [tempSupplier, setTempSupplier] = useState(null);

   // add a new item to the current list
   function addItem(item) {
      setTempItems([item, ...tempItems]);
   }
   // delete an item based on the SKU
   function deleteItem(sku) {
      setTempItems(tempItems.filter((item) => item.sku !== sku));
   }
   // fetch the items for an entry
   async function fetchItems(entryItem) {
      const items = [];
      if (entryItem.type === "IA") {
         const response = await getData(endpoints.fetchItemsIA + entryItem.id);
         setTempItems(response.items);
         setTempReason(response.reason);
      }
   }

   const contextVal = {
      tempItems,
      setTempItems,
      addItem,
      deleteItem,
   };

   return (
      <ItemContext.Provider value={contextVal}>{children}</ItemContext.Provider>
   );
};
