jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Categories in the list
// * All 3 Categories have at least one Products

sap.ui.require([
	"sap/ui/test/Opa5",
	"mjzsoft/sapui5/tutorial/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"mjzsoft/sapui5/tutorial/test/integration/pages/App",
	"mjzsoft/sapui5/tutorial/test/integration/pages/Browser",
	"mjzsoft/sapui5/tutorial/test/integration/pages/Master",
	"mjzsoft/sapui5/tutorial/test/integration/pages/Detail",
	"mjzsoft/sapui5/tutorial/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "mjzsoft.sapui5.tutorial.view."
	});

	sap.ui.require([
		"mjzsoft/sapui5/tutorial/test/integration/MasterJourney",
		"mjzsoft/sapui5/tutorial/test/integration/NavigationJourney",
		"mjzsoft/sapui5/tutorial/test/integration/NotFoundJourney",
		"mjzsoft/sapui5/tutorial/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});