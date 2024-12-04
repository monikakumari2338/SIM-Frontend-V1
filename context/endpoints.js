import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const endpoints = {
   // Login

   getAllStores: "/store/getallstores",

   // UPC Search

   getUpcDetails: "/product/upcs/",

   // Inventory Adjustment

   fetchIa: "/inventoryadjustment/all/adjustments",
   createIA: "/inventoryadjustment/create/IA/",
   searchIA: "/inventoryadjustment/search/adjustments/",
   deleteIA: "/inventoryadjustment/delete/byid/",
   filterIA: "/inventoryadjustment/filter/adjustments/",
   sortIA: "/inventoryadjustment/sort/",
   saveAsDraftIA: "/inventoryadjustment/saveAsDraft",
   submitIA: "/inventoryadjustment/save/adj/products",
   fetchItemsIA: "/inventoryadjustment/products/id/",

   // Direct Store Delivery

   fetchDsd: "/dsd/all/Dsd",
   createDSD: "/dsd/create/Dsd/",
   deleteDSD: "/dsd/delete/byid/",
   searchDSD: "/dsd/getMatched/Dsd/",
   sortDSD: "/dsd/sort/",
   filterDSD: "/dsd/filter/Dsd/",
   saveAsDraftDSD: "/dsd/saveAsDraft",
   submitDSD: "/dsd/save/Dsd/products",
   fetchItemsDSD: "/dsd/products/DsdNumber/",
   fetchItemsBySupplier: "/dsd/get/supplier/products/",
   fetchSupplierByNameOrId: "/dsd/getMatched/suppliers/",

   // Transfers

   // Listing IN
   fetchTsfIn: "/transferreceive/get/intransfers/",
   // Listing OUT
   fetchTsfOut: "/transferreceive/get/outtransfers/",
   // Search IN
   searchTsfIn: "/transferreceive/search/In/Tsf/",
   // Search OUT
   searchTsfOut: "/transferreceive/search/Out/Tsf/",
   // Sort
   sortTsf: "/transferreceive/sort/",
   // Filter
   filterTsf: "/transferreceive/filter/",
   // Create
   createTsf: "/transferreceive/create/transfer/",
   // Fetch Reasons
   fetchTsfReasons: "/transferreceive/get/reasoncodes",
   // Fetch Items
   fetchItemsTsf: "/transferreceive/getProducts/byTransferid/",
   // Add Items to Transfer Request
   requestTsf: "/transferreceive/add/tsf/products",
   // Receive Transfer Request
   receiveTsf: "/transferreceive/receive/transfer",
   // Change the Acceptance Status for Transfer Request
   tsfAcceptance: "/transferreceive/update/orderAcceptance",
   // Ship Transfer Request
   shipTsf: "/transferreceive/ship/tsf/",
   // Create ASN
   createAsn: "/purchaseOrder/create/asn",
   // Fetch ASN Items by ASN Number
   fetchAsnItems: "/purchaseOrder/getitemsby/asnnumber/",

   // Purchase Order

   fetchPo: "/purchaseOrder/getall/po",
   searchPo: "/purchaseOrder/getMatched/Po/",
   sortPo: "/purchaseOrder/sort/",
   submitAsnItems: "/purchaseOrder/save/po_receive/",
   saveAsnItems: "/purchaseOrder/save/draft/po/",
   fetchASNForPO: "/purchaseOrder/get/asn/list/by/ponumber/",
   fetchPoItems: "/purchaseOrder/get/itemBy/po/",
   filterPo: "/purchaseOrder/filter/po/",

   // Stock Count

   fetchSc: "/stockcount/all/StockCounts",
   createSc: "/stockcount/Create/AdhocstockCount/",
   fetchScItems: "/stockcount/products/id/",
   fetchScReasons: "/stockcount/reasoncodes",
   fetchScEntry: "/stockcount/products/id/",
   addItemsToSc: "/stockcount/update/count/recount",
   addItemsToAd: "/stockcount/add/AdhocProducts",
   draftSc: "/stockcount/draft/SC/",
   filterSc: "/stockcount/filter/SC/",
   sortSC: "/stockcount/sort/",

   // Return to Vendor

   fetchRtv: "/returntovendor/all/rtv",
   createRtv: "/returntovendor/create/rtv/",
   fetchItemsRTV: "/returntovendor/getRtv/products/id/",
   fetchRTVReasons: "/returntovendor/reasoncodes",
   deleteRTV: "/returntovendor/delete/byid/",
   searchRTV: "/returntovendor/search/rtv/",
   sortRTV: "/returntovendor/sort/",
   saveAsDraftRTV: "/returntovendor/save/draft/rtv",
   submitRTV: "/returntovendor/save/rtv/products",
   filterRTV: "/returntovendor/filter/rtv/",

   // Miscellaneous Endpoints

   generalItemSearch: "/product/getMatched/sku/",
   storeItemDetails: "/store/getBuddyStoreProductDetails/",
   fetchVariants: "/product/getVariants/",
   fetchReasons: "/inventoryadjustment/reasoncodes",
   fetchStores: "/store/getMatched/stores/",
   getAllBuddyStores: "/store/get/all/buddystores/",
   fetchCurrentDetails: "/product/getProductDetailsByVariants",
   getAllCategories: "/product/getall/categories",
   searchCatItems: "/product/getMatched/sku/byCategory/",
   fetchItemBySku: "/product/findbysku/",

   // Dashboard

   fetchMyTasks: "/sim/dashboard/getMyTasks/",
   fetchVariance: "/sim/dashboard/getCategoryWiseVariance/",
   fetchDiscrepancyTypeRatio: "/sim/dashboard/getInventoryDiscrepancyRatio/",
   fetchTransfersStatus: "/sim/dashboard/getTransferStatus/",
};

export { endpoints };
