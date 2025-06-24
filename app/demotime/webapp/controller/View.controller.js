sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.View", {
        onInit() {
            that.component = this.getOwnerComponent().getRouter().initialize();
            var oComponent = this.getOwnerComponent();
            that.oGmodel = oComponent.getModel("oGModel");
        },
        onSignUpPress: function () {
            const oView = this.getView();
            const sEmail = oView.byId("emailInput").getValue();
            const sPassword = oView.byId("passwordInput").getValue();

            if (!sEmail || !sPassword) {
                sap.m.MessageToast.show("Please enter both email and password.");
                return;
            }

            const oModel = this.getView().getModel();

            oModel.callFunction("/checkCredentials", {
                method: "GET",
                urlParameters: {
                    email: sEmail,
                    password: sPassword
                },
                success: function (sMessage) {
                    var userdata = JSON.parse(sMessage.checkCredentials);
                    if (userdata.error === "Invalid credentials") {
                        sap.m.MessageToast.show("Invalid credentials");
                    } else {
                        that.oGmodel.setData({ userdata });
                        sap.m.MessageToast.show("Login successful!");
                        if (userdata.EMAIL === "admin@gmail.com") {
                            that.component.navTo("Tileview")
                        } else {
                            that.component.navTo("View1");
                        }

                    }

                },
                error: function () {
                    sap.m.MessageToast.show("An error occurred during login.");
                }
            });
        }
    });
});