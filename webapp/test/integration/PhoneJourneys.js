jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"mjzsoft/sapui5/tutorial/test/integration/NavigationJourneyPhone",
		"mjzsoft/sapui5/tutorial/test/integration/NotFoundJourneyPhone",
		"mjzsoft/sapui5/tutorial/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});