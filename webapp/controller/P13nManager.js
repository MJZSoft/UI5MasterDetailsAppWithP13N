/*
@Auther: Mahdi Jaberzadeh Ansari 
@email: mahdijaberzadehansari@yahoo.co.uk
@license: Copyright (c) 2018 MjzSoft
*/
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/P13nGroupPanel",
	"sap/m/P13nGroupItem"
], function(BaseObject, Sorter, Filter, FilterOperator, JSONModel, P13nGroupPanel, P13nGroupItem) {
	"use strict";
	return BaseObject.extend("mjzsoft.sapui5.tutorial.controller.P13nManager", {
		// The following 2 objects just show the structure of input 
		/*mSettings: {
			sModel: "",
			oColumnBindingInfo: {
				path: ""
			},
			oFiltersItemsBindingInfo: {
				path: ""
			},
			oFiltersBindingInfo: {
				path: ""
			},
			oSortItemsBindingInfo: {
				path: ""
			},
			oSortBindingInfo: {
				path: ""
			},
			oGroupItemsBindingInfo: {
				path: ""
			},
			oGroupBindingInfo: {
				path: ""
			},
			fnOnOkButtonPress: null,
			oI18nIds: {
				sColumnsPanelTitleId: "",
				sSortPanelTitleId: "",
				sFilterPanelTitleId: "",
				sGroupPanelTitleId: ""
			},
			oPanelsVisibility: {
				bColumn: true,
				bSort: true,
				bFilter: true,
				bGroup: true
			}
		},*/
		constructor: function(oOwnerComponent, mSettings, oListener) {
			this._oOwnerComponent = oOwnerComponent;
			this._oP13nManagerSettings = mSettings;
			this._oListener = oListener;
			this._iRandId = null;
			this._oPersonalizationDialog = null;
			this._oColumnsPanel = null;
			this._oSortPanel = null;
			this._oFilterPanel = null;
			this._oGroupPanel = null;
			this._aColumnsItems = [];
			this._aFilterItems = [];
			this._aSortItems = [];
			this._aGroupItems = [];
			this._init();
		},
		_init: function() {
			this._iRandId = new Date().getTime();
			var oData = this._oOwnerComponent.getModel(this._oP13nManagerSettings.sModel).getData();
			for (var iColumnIndex = 0; oData.ColumnsItems && iColumnIndex < oData.ColumnsItems.length; ++iColumnIndex) {
				this._aColumnsItems[iColumnIndex] = oData.ColumnsItems[iColumnIndex];
				this._aColumnsItems[iColumnIndex].iIndex = iColumnIndex;
			}
		},
		getRandId: function() {
			return this._iRandId;
		},
		onP13nDialogOkButtonPress: function(oEvent) {
			if (typeof this._oP13nManagerSettings.fnOnOkButtonPress === "function") {
				this._oP13nManagerSettings.fnOnOkButtonPress(oEvent);
			}
			this._oPersonalizationDialog.close();
		},
		onP13nDialogCancelButtonPress: function(oEvent) {
			if (typeof this._oP13nManagerSettings.fnOnCancelButtonPress === "function") {
				this._oP13nManagerSettings.fnOnCancelButtonPress(oEvent);
			}
			this._oPersonalizationDialog.close();
		},
		onP13nDialogResetButtonPress: function(oEvent) {
			if (typeof this._oP13nManagerSettings.fnOnResetButtonPress === "function") {
				this._oP13nManagerSettings.fnOnResetButtonPress(oEvent);
			}
		},
		open: function() {
			var oPersonalizationDialog = this._getDialog();
			oPersonalizationDialog.setShowResetEnabled(this.bShowResetEnabled);
			oPersonalizationDialog.open();
		},
		getFilter: function() {
			var aFilterItems = this._oFilterPanel.getFilterItems(),
				aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				var sPath = aFilterItems[i].getColumnKey(),
					bExclude = aFilterItems[i].getExclude(),
					sOperation = bExclude === true ? sap.ui.model.FilterOperator.NE : aFilterItems[i].getOperation(),
					sValue1 = aFilterItems[i].getValue1(),
					sValue2 = aFilterItems[i].getValue2();
				aFilters.push(new Filter({
					path: sPath,
					operator: sOperation,
					value1: sValue1,
					value2: sValue2
				}));
			}
			return aFilters;
		},
		getSorter: function() {
			var aSortItems = this._oSortPanel.getSortItems(),
				aSorters = [];
			for (var i = 0; i < aSortItems.length; i++) {
				var bDescending = aSortItems[i].getOperation() === "Descending" ? true : false,
					sPath = aSortItems[i].getColumnKey();
				aSorters.push(new Sorter(sPath, bDescending, false));
			}
			return aSorters;
		},
		getGroup: function() {
			var aGroupItems = this._oGroupPanel.getGroupItems(),
				aSorters = [];
			for (var i = 0; i < aGroupItems.length; i++) {
				var aCustomData = aGroupItems[i].getCustomData(),
					vGroup = true;
				if (aCustomData.length > 0) {
					if (aCustomData[0].getKey() === "fnVGroup") {
						vGroup = aCustomData[0].getValue();
					}
				}
				aSorters.push(new Sorter(aGroupItems[i].getColumnKey(), false, vGroup));
			}
			return aSorters;
		},
		_getDialog: function() {
			if (this._oPersonalizationDialog) {
				return this._oPersonalizationDialog;
			}
			// associate controller with the fragment
			this._oPersonalizationDialog = this._createP13nDialog();
			this._oListener.getView().addDependent(this._oPersonalizationDialog);
			return this._oPersonalizationDialog;
		},
		_createP13nDialog: function() {
			var aPanels = [];
			if (this._oP13nManagerSettings.oPanelsVisibility.bColumn === true) {
				aPanels.push(this._createP13nColumnsPanel());
			}
			if (this._oP13nManagerSettings.oPanelsVisibility.bSort === true) {
				aPanels.push(this._createP13nSortPanel());
			}
			if (this._oP13nManagerSettings.oPanelsVisibility.bFilter === true) {
				aPanels.push(this._createP13nFilterPanel());
			}
			if (this._oP13nManagerSettings.oPanelsVisibility.bGroup === true) {
				aPanels.push(this._createP13nGroupPanel());
			}

			var oDialog = new sap.m.P13nDialog("__p13nDialog_" + this.getRandId(), {
				panels: aPanels,
				ok: [this.onP13nDialogOkButtonPress, this],
				cancel: [this.onP13nDialogCancelButtonPress, this],
				reset: [this.onP13nDialogResetButtonPress, this]
			});
			return oDialog;
		},
		_createP13nColumnsPanel: function() {
			this._oColumnsPanel = new sap.m.P13nColumnsPanel();
			this._oColumnsPanel.setProperty("title", "{i18n>" + this._oP13nManagerSettings.oI18nIds.sColumnsPanelTitleId + "}");
			this._oColumnsPanel.bindItems({
				path: this._oP13nManagerSettings.oColumnBindingInfo.path,
				factory: this._createP13nItemFactory.bind(this)
			});
			this._oColumnsPanel.bindColumnsItems({
				path: this._oP13nManagerSettings.oColumnBindingInfo.path,
				factory: this._createP13nColumnsItemFactory.bind(this)
			});
			return this._oColumnsPanel;
		},
		_createP13nSortPanel: function() {
			this._oSortPanel = new sap.m.P13nSortPanel();
			this._oSortPanel.setProperty("title", "{i18n>" + this._oP13nManagerSettings.oI18nIds.sSortPanelTitleId + "}");
			this._oSortPanel.attachAddSortItem(this._onAddSortItem, this);
			this._oSortPanel.attachRemoveSortItem(this._onRemoveSortItem, this);
			this._oSortPanel.attachUpdateSortItem(this._onUpdateSortItem, this);
			this._oSortPanel.bindItems({
				path: this._oP13nManagerSettings.oSortItemsBindingInfo.path,
				factory: this._createP13nItemFactory.bind(this)
			});
			this._oSortPanel.bindSortItems({
				path: this._oP13nManagerSettings.oSortBindingInfo.path,
				factory: this._createP13nSortItemFactory.bind(this)
			});
			return this._oSortPanel;
		},
		_createP13nFilterPanel: function() {
			this._oFilterPanel = new sap.m.P13nFilterPanel();
			this._oFilterPanel.setProperty("title", "{i18n>" + this._oP13nManagerSettings.oI18nIds.sFilterPanelTitleId + "}");
			var aIncludeOperations = this._oFilterPanel.getIncludeOperations();
			aIncludeOperations = aIncludeOperations.concat([sap.m.P13nConditionOperation.Contains]);
			this._oFilterPanel.setIncludeOperations(aIncludeOperations);
			this._oFilterPanel.attachAddFilterItem(this._onAddFilterItem, this);
			this._oFilterPanel.attachRemoveFilterItem(this._onRemoveFilterItem, this);
			this._oFilterPanel.attachUpdateFilterItem(this._onUpdateFilterItem, this);
			this._oFilterPanel.bindItems({
				path: this._oP13nManagerSettings.oFiltersItemsBindingInfo.path,
				factory: this._createP13nItemFactory.bind(this)
			});
			this._oFilterPanel.bindFilterItems({
				path: this._oP13nManagerSettings.oFiltersBindingInfo.path,
				factory: this._createP13nFilterItemFactory.bind(this)
			});
			return this._oFilterPanel;
		},
		_createP13nGroupPanel: function() {
			this._oGroupPanel = new P13nGroupPanel();
			this._oGroupPanel.setProperty("title", "{i18n>" + this._oP13nManagerSettings.oI18nIds.sGroupPanelTitleId + "}");
			this._oGroupPanel.bindItems({
				path: this._oP13nManagerSettings.oGroupItemsBindingInfo.path,
				factory: this._createP13nItemFactory.bind(this)
			});
			this._oGroupPanel.bindGroupItems({
				path: this._oP13nManagerSettings.oGroupBindingInfo.path,
				factory: this._createP13nGroupItemFactory.bind(this)
			});
			this._oGroupPanel.attachAddGroupItem(this._onAddGroupItem, this);
			this._oGroupPanel.attachRemoveGroupItem(this._onRemoveGroupItem, this);
			this._oGroupPanel.attachUpdateGroupItem(this._onUpdateGroupItem, this);
			return this._oGroupPanel;
		},
		_createP13nColumnsItemFactory: function(sId, oContext) {
			var oColumnsItem = new sap.m.P13nColumnsItem({
				columnKey: oContext.getProperty("sColumnKey")
			});
			oColumnsItem.bindProperty("visible", {
				model: this._oP13nManagerSettings.sModel,
				path: oContext.getPath() + "/sColumnVisible"
			});
			oColumnsItem.bindProperty("index", {
				model: this._oP13nManagerSettings.sModel,
				path: oContext.getPath() + "/iIndex"
			});
			return oColumnsItem;
		},
		_createP13nSortItemFactory: function(sId, oContext) {
			var oSortItem = new sap.m.P13nSortItem({
				columnKey: oContext.getProperty("sColumnKey"),
				operation: oContext.getProperty("sOperation")
			});
			var sConditionId = "condition_" + sId.split(/\-/).pop();
			this._aSortItems[sConditionId] = oSortItem;
			return oSortItem;
		},
		_createP13nFilterItemFactory: function(sId, oContext) {
			var oFilterItem = new sap.m.P13nFilterItem({
				columnKey: oContext.getProperty("sColumnKey"),
				operation: oContext.getProperty("sOperation"),
				value1: oContext.getProperty("sValue1"),
				value2: oContext.getProperty("sValue2"),
				exclude: oContext.getProperty("bExclude")
			});
			var sConditionId = "condition_" + sId.split(/\-/).pop();
			this._aFilterItems[sConditionId] = oFilterItem;
			return oFilterItem;
		},
		_createP13nGroupItemFactory: function(sId, oContext) {
			var oGroupItem = new sap.m.P13nGroupItem({
				columnKey: oContext.getProperty("sColumnKey"),
				operation: oContext.getProperty("sOperation"),
				showIfGrouped: oContext.getProperty("bShowIfGrouped")
			});
			var sConditionId = "condition_" + sId.split(/\-/).pop();
			this._aGroupItems[sConditionId] = oGroupItem;
			return oGroupItem;
		},
		_createP13nItemFactory: function(sId, oContext) {
			var oItem = new sap.m.P13nItem({
				columnKey: oContext.getProperty("sColumnKey")
			});
			oItem.bindProperty("visible", {
				model: this._oP13nManagerSettings.sModel,
				path: oContext.getPath() + "/bColumnVisible"
			});
			oItem.addCustomData(new sap.ui.core.CustomData({
				key: "fn",
				value: "1"
			}));
			oItem.setProperty("text", "{i18n>" + oContext.getProperty("sColumnI18nKey") + "}");
			return oItem;
		},
		_onAddFilterItem: function(oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oFilterItem = oEvent.getParameter("filterItemData");
			oFilterPanel.addFilterItem(oFilterItem);
			this._aFilterItems[oParameters.key] = oFilterItem;
		},
		_onRemoveFilterItem: function(oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			oFilterPanel.removeFilterItem(this._aFilterItems[oParameters.key]);
			delete this._aFilterItems[oParameters.key];
		},
		_onUpdateFilterItem: function(oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oFilterItem = oEvent.getParameter("filterItemData");
			var aFilterItems = oFilterPanel.getFilterItems();
			for (var i = 0; i < aFilterItems.length; i++) {
				if (aFilterItems[i] === this._aFilterItems[oParameters.key]) {
					break;
				}
			}
			oFilterPanel.removeFilterItem(this._aFilterItems[oParameters.key]);
			oFilterPanel.insertFilterItem(oFilterItem, i);
			this._aFilterItems[oParameters.key] = oFilterItem;
		},
		_onAddSortItem: function(oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oSortItem = oEvent.getParameter("sortItemData");
			oSortPanel.addSortItem(oSortItem);
			this._aSortItems[oParameters.key] = oSortItem;
		},
		_onRemoveSortItem: function(oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			oSortPanel.removeSortItem(this._aSortItems[oParameters.key]);
			delete this._aSortItems[oParameters.key];
		},
		_onUpdateSortItem: function(oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oSortItem = oEvent.getParameter("sortItemData");
			var aSortItems = oSortPanel.getSortItems();
			for (var i = 0; i < aSortItems.length; i++) {
				if (aSortItems[i] === this._aSortItems[oParameters.key]) {
					break;
				}
			}
			oSortPanel.removeSortItem(this._aSortItems[oParameters.key]);
			oSortPanel.insertSortItem(oSortItem, i);
			this._aSortItems[oParameters.key] = oSortItem;
		},
		_onAddGroupItem: function(oEvent) {
			var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oGroupItem = oEvent.getParameter("groupItemData"),
				oList = oGroupPanel.getBinding("items").oList,
				sKey = oGroupItem.getColumnKey();
			oGroupItem.removeAllCustomData();
			for (var i = 0; i < oList.length; i++) {
				if (oList[i].sColumnKey === sKey) {
					if (oList[i].fnVGroup) {
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: oList[i].fnVGroup
						}));
					} else {
						var sText = oList[i].sColumnI18nKey;
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: function(oContext) {
								var sName = oContext.getProperty(sKey);
								return {
									key: sName,
									text: "{i18n>" + sText + "}: " + sName
								};
							}
						}));
					}
					break;
				}
			}
			oGroupPanel.addGroupItem(oGroupItem);
			this._aGroupItems[oParameters.key] = oGroupItem;
		},
		_onRemoveGroupItem: function(oEvent) {
			var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			oGroupPanel.removeGroupItem(this._aGroupItems[oParameters.key]);
			delete this._aGroupItems[oParameters.key];
		},
		_onUpdateGroupItem: function(oEvent) {
			var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oGroupItem = oEvent.getParameter("groupItemData"),
				oList = oGroupPanel.getBinding("items").oList,
				sKey = oGroupItem.getColumnKey();
			oGroupItem.removeAllCustomData();
			for (var i = 0; i < oList.length; i++) {
				if (oList[i].sColumnKey === sKey) {
					if (oList[i].fnVGroup) {
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: oList[i].fnVGroup
						}));
					} else {
						var sText = oList[i].sColumnI18nKey;
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: function(oContext) {
								var sName = oContext.getProperty(sKey);
								return {
									key: sName,
									text: "{i18n>" + sText + "} : " + sName
								};
							}
						}));
					}
					break;
				}
			}
			var aGroupItems = oGroupPanel.getGroupItems();
			for (i = 0; i < aGroupItems.length; i++) {
				if (aGroupItems[i] === this._aGroupItems[oParameters.key]) {
					break;
				}
			}
			oGroupPanel.removeGroupItem(this._aGroupItems[oParameters.key]);
			oGroupPanel.insertGroupItem(oGroupItem, i);
			this._aGroupItems[oParameters.key] = oGroupItem;
		}
	});
});