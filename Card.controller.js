sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"./formatter"
], function (MessageToast, Controller, JSONModel, Formatter) {
	"use strict";

	return Controller.extend("ns.Procedures_Details_Open_Text.Card", {
		Formatter: Formatter,
		onInit: function () {
			var oModel = new JSONModel({});
			this.getView().setModel(oModel, "oProceduresModel");
			this.getView().setBusy(true);

			this.getView().attachModelContextChange(this._onModelArrival, this);

			this._onModelArrival();
		},
		_onModelArrival: function () {
			var oODataModel = this.getOwnerComponent().getModel();

			if (oODataModel) {
				// 3. Success! Stop listening so this doesn't run again
				this.getView().detachModelContextChange(this._onModelArrival, this);

				// 4. Wait for metadata to be ready before calling .read()
				oODataModel.metadataLoaded().then(function () {
					this._loadData();
				}.bind(this));
			}
		},
		
		fullyDecode: function (value) {
			if (!value) return value;
			let prev;
			let current = value;
			try {
				do {
					prev = current;
					current = decodeURIComponent(current);
				} while (prev !== current);
			} catch (e) {
				return value;
			}
			return current;
		},

		_loadData: function () {
			debugger;
			var params = new URLSearchParams(window.location.search);
			var title = params.get("title");
			title = title ? title.split("/")[0] : "";
			if (!title) return; // ✅ stop if no title
			var oView = this.getView();
			if (title.includes('%')) title = this.fullyDecode(title);

			console.log("Received Title:", title);
			oView.setBusy(true);
			this.getOwnerComponent().getModel().read("/FetchOTFiles", {
				urlParameters: {
					"activity": "Procedure",
					"keyword": title
				},
				success: function (oData) {
					debugger;
					var aFormData = oData.results || [];
					var oModel = new sap.ui.model.json.JSONModel(aFormData);
					this.getView().setModel(oModel, "oProceduresModel");
					oView.setBusy(false);
				}.bind(this),
				error: function (oError) {
					oView.setBusy(false);
				}.bind(this)
			});
		},
		handlePress: function (oEvent) {
			var sUrl = oEvent.getSource().getBindingContext('myModel').getObject();
			sap.m.URLHelper.redirect(sUrl.url, true);
		}
	});
});