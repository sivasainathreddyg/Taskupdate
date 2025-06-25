sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, JSONModel, Fragment, MessageToast) => {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.ProjectMaster", {
        onInit() {
            that.component = this.getOwnerComponent().getRouter().initialize();
            var oComponent = this.getOwnerComponent();
            that.oGmodel = oComponent.getModel("oGModel");

            this.viewModel = new JSONModel({ editMode: false });
            this.getView().setModel(this.viewModel, "viewModel");

            this.projectModel = new JSONModel({});
            this.getView().setModel(this.projectModel, "projectModel");

            this.projectDialog = null;


        },
        onNavBack: function () {
            that.component.navTo("Tileview")
        },
        onAfterRendering() {
            this.ReadMasterProjects();
        },
        onCreatePress: function () {
            this.viewModel.setProperty("/editMode", false);
            this.projectModel.setData({
                PROJECTID: "",
                PROJECTNAME: "",
                PROJECTDESCRIPTION: "",
                PROJECTSTATUS: "Active",
                VALIDTO: ""
            });
            this.openProjectDialog();
        },
        onUpdatePress: function (oEvent) {
            var oSelectedItem = this.getView().byId("projectTable").getSelectedItem();
            if(!oSelectedItem){
                sap.m.MessageToast.show("please select any of the row");
                return;
            }
            var oData = oSelectedItem.getBindingContext("TableprojectModel").getObject();

            // Set edit mode to true
            this.viewModel.setProperty("/editMode", true);

            // Set data to local model used in dialog
            this.projectModel.setData(oData);

            // Open dialog with pre-filled data
            this.openProjectDialog();
        },
        openProjectDialog: function () {
            var oView = this.getView();
            if (!this.projectDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "demotime.Fragment.ProjectMaster",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    this.projectDialog = oDialog;
                    oDialog.open();
                }.bind(this));
            } else {
                this.projectDialog.open();
            }
        },
        onCancelProjectDialog: function () {
            if (this.projectDialog) {
                this.projectDialog.close();
            }

        },
        formatDate: function (oDate) {
            if (!oDate) return null;
            var oFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            return oFormat.format(new Date(oDate));
        },
        onSaveProject: function () {
            var oData = this.projectModel.getData();
            var bEditMode = this.viewModel.getProperty("/editMode");

            // Format date fields if necessary
            // oData.VALIDFROM = this.formatDate(oData.VALIDFROM);
            // oData.VALIDTO = this.formatDate(oData.VALIDTO);
            var jsonString = JSON.stringify(oData);
            var oModel = this.getView().getModel();
            if (bEditMode) {
                oModel.callFunction("/ProjectMasterDataUpdate", {
                    method: "GET",
                    urlParameters: { updatedData: jsonString },
                    success: function (data) {
                        MessageToast.show(data.ProjectMasterDataUpdate);
                        this.ReadMasterProjects();
                        this.projectDialog.close();
                    }.bind(this),
                    error: function (err) {
                        MessageToast.show("Failed to update project.");
                    }
                });
            }
            else {
                oModel.callFunction("/ProjectMasterData", {
                    method: "GET",
                    urlParameters: { projectsdata: jsonString },
                    success: function (data) {
                        if (data.ProjectMasterData === "Task saved successfully!") {
                            MessageToast.show("Project created successfully!");
                            this.ReadMasterProjects();
                        } else {
                            MessageToast.show("Failed to create project.");
                        }
                    }.bind(this), error: function (err) {
                        MessageToast.show("Failed to create project.", err);
                    }
                })
                this.projectDialog.close();
            }
        },

        ReadMasterProjects: function () {
            var oModel = this.getView().getModel();
            oModel.callFunction("/ProjectMasterDataread", {
                method: "GET",
                success: function (odata) {
                    var projects = JSON.parse(odata.ProjectMasterDataread);
                    var oTableProjectModel = new sap.ui.model.json.JSONModel(projects);
                    this.getView().setModel(oTableProjectModel, "TableprojectModel");
                    oTableProjectModel.refresh(true);

                }.bind(this),
                error: function (err) {
                    sap.m.MessageToast("Failed to read projects.")

                }
            })
        },
        formatDateOnly: function (sDate) {
            if (!sDate) return "";
            try {
                const oDate = new Date(sDate);
                return oDate.toISOString().split("T")[0];
            } catch (e) {
                return "";
            }
        },
        formatDateTime: function (sDate) {
            if (!sDate) return "";

            const oDate = new Date(sDate + "Z");

            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, '0');
            const day = String(oDate.getDate()).padStart(2, '0');
            const hours = String(oDate.getHours()).padStart(2, '0');
            const minutes = String(oDate.getMinutes()).padStart(2, '0');
            const seconds = String(oDate.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }


    });
});