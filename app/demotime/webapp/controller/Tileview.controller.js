sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.Tileview", {
        onInit() {
            that.component = this.getOwnerComponent().getRouter().initialize();
            var oComponent = this.getOwnerComponent();
            that.oGmodel = oComponent.getModel("oGModel");

        },
        onCalendarApp: function () {
            that.component.navTo("View1");
        },
        onProjectMaster: function () {
            that.component.navTo("ProjectMaster");
        },
        onHomePress: function () {
            that.component.navTo("View");
        },
        onEmployeeProjects: function () {
            that.component.navTo("EmployeeProjects")
        },
        onProjectTask: function () {
            that.component.navTo("ProjectTask");
        }

    });
});