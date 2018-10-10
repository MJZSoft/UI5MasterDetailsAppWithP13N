/*
@Auther: Mahdi Jaberzadeh Ansari 
@email: mahdijaberzadehansari@yahoo.co.uk
@license: Copyright (c) 2018 MjzSoft
*/
sap.ui.define([
	"sap/ui/base/Object",
	"mjzsoft/sapui5/tutorial/controller/P13nManager"
], function(BaseObject, P13nManager) {
	"use strict";
	return BaseObject.extend("mjzsoft.sapui5.tutorial.controller.ListManager", {
		/*_oP13nManagerSettings: {
			bAddNoneItem: false,
			oI18nIds: {
				sColumnsPanelTitleId: "",
				sSortPanelTitleId: "",
				sFilterPanelTitleId: "",
				sGroupPanelTitleId: "",
				sNoneItemId: ""
			},
			aFilterItems: [{
				sColumnKey: "",
				sColumnI18nKey: ""
			}],
			aSortItems: [{
				sColumnKey: "",
				sColumnI18nKey: ""
			}],
			aGroupItems: [{
				sColumnKey: "",
				sColumnI18nKey: "",
				fnVGroup: null
			}],
			aFilters: [{ // https://sapui5.hana.ondemand.com/1.38.16/#docs/api/symbols/sap.m.P13nFilterItem.html#constructor
				sColumnKey: "",
				sOperation: "Contains",
				sValue1: "0",
				sValue2: "",
				sExclude: false
			}],
			aSort: [{ // https://sapui5.hana.ondemand.com/1.38.16/#docs/api/symbols/sap.m.P13nSortItem.html#constructor
				sColumnKey: "",
				sOperation: "Descending"
			}],
			aGroup: [{ // https://sapui5.hana.ondemand.com/1.38.16/#docs/api/symbols/sap.m.P13nGroupItem.html#constructor
				sColumnKey: "",
				sOperation: "Ascending",
				bShowIfGrouped: true
			}]
		},*/
		constructor: function(oOwnerComponent, oList, oP13NBtn, mP13nSettings) {
			this._oOwnerComponent = oOwnerComponent;
			this._oList = oList;
			this._oP13nManagerSettings = mP13nSettings;
			this._sP13nModel = "__jsonModel_list_" + new Date().getTime();
			this._oListFilterState = {
				aFilters: [],
				aSorter: []
			}; 
			this._initP13NModel();
			this._initP13nDialog();
			oP13NBtn.attachPress(this._openP13nDialog, this);
		},
		_initP13NModel: function() {
			if (this._oP13nManagerSettings) {
				var aNoneItem = [];
				if (this._oP13nManagerSettings.bAddNoneItem === true) {
					aNoneItem.push({
						sColumnKey: null,
						sColumnI18nKey: this._oP13nManagerSettings.oI18nIds.sNoneItemId
					});
				}
				var aColumnsItems = this._oP13nManagerSettings.aColumnItems,
					aFilterItems = aNoneItem.concat(this._oP13nManagerSettings.aFilterItems),
					aSortItems = aNoneItem.concat(this._oP13nManagerSettings.aSortItems),
					aGroupItems = aNoneItem.concat(this._oP13nManagerSettings.aGroupItems);
				this._oP13nModel = new sap.ui.model.json.JSONModel({
					ColumnsItems: aColumnsItems,
					FiltersItems: aFilterItems,
					SortItems: aSortItems,
					GroupItems: aGroupItems,
					Filters: this._oP13nManagerSettings.aFilters,
					Sort: this._oP13nManagerSettings.aSort,
					Group: this._oP13nManagerSettings.aGroup
				});
				this._oOwnerComponent.setModel(this._oP13nModel, this._sP13nModel);
			}
		},
		_initP13nDialog: function() {
			if (this._oP13nManagerSettings) {
				var oP13nSettings = {
					sModel: this._sP13nModel,
					oFiltersItemsBindingInfo: {
						path: this._sP13nModel + ">/FiltersItems"
					},
					oFiltersBindingInfo: {
						path: this._sP13nModel + ">/Filters"
					},
					oSortItemsBindingInfo: {
						path: this._sP13nModel + ">/SortItems"
					},
					oSortBindingInfo: {
						path: this._sP13nModel + ">/Sort"
					},
					oGroupItemsBindingInfo: {
						path: this._sP13nModel + ">/GroupItems"
					},
					oGroupBindingInfo: {
						path: this._sP13nModel + ">/Group"
					},
					fnOnOkButtonPress: this._onP13nDialogOkButtonPress.bind(this),
					oI18nIds: this._oP13nManagerSettings.oI18nIds,
					oPanelsVisibility: {
						bColumn: false,
						bSort: true,
						bFilter: true,
						bGroup: true
					}
				};
				this._oP13nDialog = new P13nManager(this._oOwnerComponent, oP13nSettings, this._oP13nManagerSettings.oListener);
			}
		},
		_onP13nDialogOkButtonPress: function(oEvent) {
			var aP13nSorter = this._oP13nDialog.getSorter();
			var aP13nFilter = this._oP13nDialog.getFilter();
			var aP13nGroup = this._oP13nDialog.getGroup();
			var aFilters = [];
			var aSorter = [];
			if (aP13nGroup) {
				for (var iGroupIndex = 0; iGroupIndex < aP13nGroup.length; ++iGroupIndex) {
					aSorter.push(aP13nGroup[iGroupIndex]);
				}
			}
			if (aP13nSorter) {
				for (var iSorterIndex = 0; iSorterIndex < aP13nSorter.length; ++iSorterIndex) {
					aSorter.push(aP13nSorter[iSorterIndex]);
				}
			}
			if (aP13nFilter) {
				for (var iFilterIndex = 0; iFilterIndex < aP13nFilter.length; ++iFilterIndex) {
					aFilters.push(aP13nFilter[iFilterIndex]);
				}
			}
			this._oListFilterState.aFilters = aFilters;
			this._oListFilterState.aSorter = aSorter;
			this._applyGroupSort();
			this._applyFilterSearch();
		},
		_openP13nDialog: function() {
			if (this._oP13nDialog) {
				this._oP13nDialog.open();
			}
		},
		_applyFilterSearch: function(fnCallBack) {
			var aFilters = this._oListFilterState.aFilters;
			if (typeof fnCallBack === "function") {
				var fnDataReceived = function(oEvent) {
					fnCallBack(oEvent);
					this._oList.getBinding("items").detachDataReceived(fnDataReceived, this);
				}.bind(this);
				this._oList.getBinding("items").attachDataReceived(fnDataReceived, this);
			}
			this._oList.getBinding("items").filter(aFilters, "Application");
		},
		_applyGroupSort: function() {
			var aSorters = this._oListFilterState.aSorter;
			this._oList.getBinding("items").sort(aSorters);
		}
	});

});