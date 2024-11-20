const endpoints = {
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

   fetchTsfIn: "/transferreceive/get/intransfers/",
   fetchTsfOut: "/transferreceive/get/outtransfers/",
   searchTsfIn: "/transferreceive/search/In/Tsf/",
   searchTsfOut: "/transferreceive/search/Out/Tsf/",
   sortTsf: "/transferreceive/sort/",
   filterTsf: "/transferreceive/filter/",
   createTsf: "/transferreceive/create/transfer/",
   fetchTsfReasons: "/transferreceive/get/reasoncodes",
   fetchItemsTsf: "/transferreceive/getProducts/byTransferid/",
   requestTsf: "/transferreceive/add/tsf/products",
   receiveTsf: "/transferreceive/receive/transfer",
   tsfAcceptance: "/transferreceive/update/orderAcceptance",
   shipTsf: "/transferreceive/ship/tsf/",
   createAsn: "/purchaseOrder/create/asn",
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

   // Dashboard

   fetchMyTasks: "/sim/dashboard/getMyTasks/",
   fetchVariance: "/sim/dashboard/getCategoryWiseVariance/",
   fetchDiscrepancyTypeRatio: "/sim/dashboard/getInventoryDiscrepancyRatio/",
   fetchTransfersStatus: "/sim/dashboard/getTransferStatus/",
};

export { endpoints };
