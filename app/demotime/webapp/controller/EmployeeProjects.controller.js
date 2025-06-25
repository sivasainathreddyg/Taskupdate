sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, JSONModel, Fragment, MessageToast) => {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.EmployeeProjects", {
        onInit() {
            that.component = this.getOwnerComponent().getRouter().initialize();
            var oComponent = this.getOwnerComponent();
            that.oGmodel = oComponent.getModel("oGModel");
            this.viewModel = new JSONModel({ editMode: false });
            this.getView().setModel(this.viewModel, "viewModel")
            this.EmployeeProjectModel = new JSONModel({});
            this.getView().setModel(this.EmployeeProjectModel, "EmployeeProjectModel")

        },
        onAfterRendering() {
            this.loadProjectAndUserData();
            this.ReadEmployeeProjects();
        },
        onNavBack: function () {
            that.component.navTo("Tileview")
        },
        loadProjectAndUserData: function () {
            const oModel = this.getView().getModel();
            oModel.callFunction("/ProjectMasterDataread", {
                method: "GET",
                success: function (oData) {
                    const aProjects = JSON.parse(oData.ProjectMasterDataread);
                    const oProjectModel = new sap.ui.model.json.JSONModel(aProjects);
                    this.getView().setModel(oProjectModel, "projectListModel");
                }.bind(this)
            });

            // Load user email list
            oModel.callFunction("/GetUsersList", {
                method: "GET",
                success: function (oData) {
                    const aUsers = JSON.parse(oData.GetUsersList);
                    const oUserModel = new sap.ui.model.json.JSONModel(aUsers);
                    this.getView().setModel(oUserModel, "userListModel");
                }.bind(this)
            });
        },
        onCreatePress: function () {
            this.viewModel.setProperty("/editMode", false);
            this.EmployeeProjectModel.setData({
                PROJECTID: "",
                EMPLOYEEEMAIL: "",
                SUPERVISOR: false,
                VALIDFROM: "",
                VALIDTO: ""

            });
            this.openEmployeeProjectDialog();

        },
        onUpdatePress: function (oEvent) {
            var oSelectedItem = this.getView().byId("idTableEmployeeProject").getSelectedItem();
            if (!oSelectedItem) {
                sap.m.MessageToast.show("please select any of the row");
                return;
            }
            var oData = oSelectedItem.getBindingContext("TableEmployeeProjectModel").getObject();
            oData.SUPERVISOR = oData.SUPERVISOR === 1 ? true : false;
            this.viewModel.setProperty("/editMode", true);
            this.EmployeeProjectModel.setData(oData);
            this.openEmployeeProjectDialog();
        },
        openEmployeeProjectDialog: function () {
            if (!this.pCreateDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "demotime.Fragment.EmployeeProjectsCreate",
                    controller: this
                }).then(function (oDialog) {
                    this.pCreateDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    this.pCreateDialog.open();
                }.bind(this));
            } else {
                this.pCreateDialog.open();
            }
        },

        onSaveEmployeeProject: function () {
            var oData = this.EmployeeProjectModel.getData();
            var bEditMode = this.viewModel.getProperty("/editMode");

            // const oData = {
            //     ProjectID: sap.ui.getCore().byId("comboProjectId").getSelectedKey(),
            //     EmployeeEmail: sap.ui.getCore().byId("comboEmail").getSelectedKey(),
            //     Supervisor: sap.ui.getCore().byId("idSupervisorCheckbox").getSelected() ? "Yes" : "No",
            //     ValidFrom: sap.ui.getCore().byId("idValidFromDP").getDateValue(),
            //     ValidTo: sap.ui.getCore().byId("idValidToDP").getDateValue(),
            //     CreatedDate: new Date(),
            //     UpdatedDate: new Date()
            // };

            const sPayload = JSON.stringify(oData);
            var oModel = this.getView().getModel();
            if (bEditMode) {
                oModel.callFunction("/UpdateEmployeeProject", {
                    method: "GET",
                    urlParameters: { updatedData: sPayload },
                    success: function (data) {
                        if (data.UpdateEmployeeProject === "EmployeeProject updated successfully") {
                            MessageToast.show(data.UpdateEmployeeProject);
                            this.ReadEmployeeProjects();
                            this.pCreateDialog.close();
                        } else {
                            MessageToast.show(data.UpdateEmployeeProject);
                        }

                    }.bind(this),
                    error: function (err) {
                        MessageToast.show("Failed to update employee project.");
                    }
                });
            } else {
                oModel.callFunction("/CreateEmployeeProject", {
                    method: "GET",
                    urlParameters: { employeeprojectdata: sPayload },
                    success: function (data) {
                        if (data.CreateEmployeeProject === "Task saved successfully!") {
                            MessageToast.show("Employee project saved successfully!");
                            this.pCreateDialog.close();
                            this.ReadEmployeeProjects();
                        } else {
                            MessageToast.show(data.CreateEmployeeProject);
                        }

                    }.bind(this),
                    error: function () {
                        MessageToast.show("Failed to create employee project.");
                    }
                });
            }
        },

        ReadEmployeeProjects: function () {
            const oModel = this.getView().getModel();
            oModel.callFunction("/ReadEmployeeProjects", {
                method: "GET",
                success: function (oData) {
                    const aProjects = JSON.parse(oData.ReadEmployeeProjects);
                    if (aProjects) {
                        const oTableModel = new sap.ui.model.json.JSONModel(aProjects);
                        this.getView().setModel(oTableModel, "TableEmployeeProjectModel");
                    } else {
                        sap.m.MessageToastshow("No data found!")
                    }

                }.bind(this),
                error: function (err) {
                    sap.m.MessageToast.show("Failed to read data")
                }
            });
        },

        onCloseDialog: function () {
            if (this.pCreateDialog) {
                this.pCreateDialog.close();
            }
        },
        onCancelEmployeeProject:function(){
            if (this.pCreateDialog) {
                this.pCreateDialog.close();
            }
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
        },
        formatSupervisor: function (value) {
            return value === 1 ? "Yes" : "No";
        }

    });
});

