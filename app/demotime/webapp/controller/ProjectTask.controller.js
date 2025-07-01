sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, JSONModel, Fragment, MessageToast) => {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.ProjectTask", {
        onInit() {
            that.component = this.getOwnerComponent().getRouter().initialize();
            var oComponent = this.getOwnerComponent();
            that.oGmodel = oComponent.getModel("oGModel");
            this.viewModel = new JSONModel({ editMode: false });
            this.getView().setModel(this.viewModel, "viewModel")
            this.ProjectTaskModel = new JSONModel({});
            this.getView().setModel(this.ProjectTaskModel, "ProjectTaskModel")

        },
        onAfterRendering() {
            this.loadProject();
            this.ReadProjectTask();
        },
        onNavBack: function () {
            that.component.navTo("Tileview")
        },
        generateTaskID: function () {
            const now = new Date();
            const pad = (n) => (n < 10 ? "0" + n : n);

            const taskId = "TASK" +
                pad(now.getDate()) +
                pad(now.getMonth() + 1) +
                now.getFullYear().toString().slice(2) + // last two digits of year
                pad(now.getHours()) +
                pad(now.getMinutes()) +
                pad(now.getSeconds());

            return taskId; // e.g. TASK250624124405
        },
        loadProject: function () {
            const oModel = this.getView().getModel();
            oModel.callFunction("/ProjectMasterDataread", {
                method: "GET",
                success: function (oData) {
                    const aProjects = JSON.parse(oData.ProjectMasterDataread);
                    const oProjectModel = new sap.ui.model.json.JSONModel(aProjects);
                    this.getView().setModel(oProjectModel, "projectListModel");
                }.bind(this)
            });

            // // Load user email list
            // oModel.callFunction("/GetUsersList", {
            //     method: "GET",
            //     success: function (oData) {
            //         const aUsers = JSON.parse(oData.GetUsersList);
            //         const oUserModel = new sap.ui.model.json.JSONModel(aUsers);
            //         this.getView().setModel(oUserModel, "userListModel");
            //     }.bind(this)
            // });
        },
        onCreatePress: function () {
            this.viewModel.setProperty("/editMode", false);
            const taskId = this.generateTaskID();
            this.ProjectTaskModel.setData({
                PROJECTID: "",
                TASKID: taskId,
                TITLE: "",
                DESCRIPTION: ""
            });
            this.openTaskDialog();
        },
        onUpdatePress: function (oEvent) {
            var oSelectedItem = this.getView().byId("idTableProjectTasks").getSelectedItem();
            if (!oSelectedItem) {
                sap.m.MessageToast.show("please select any of the row");
                return;
            }
            var oData = oSelectedItem.getBindingContext("TableProjectTasksModel").getObject();
            this.viewModel.setProperty("/editMode", true);
            this.ProjectTaskModel.setData(oData);
            this.openTaskDialog();
        },
        openTaskDialog: function () {
            if (!this.pCreateDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "demotime.Fragment.ProjectTaskCreate",
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

        onSaveTask: function () {
            var oData = this.ProjectTaskModel.getData();
            var bEditMode = this.viewModel.getProperty("/editMode");
            const sPayload = JSON.stringify(oData);
            var oModel = this.getView().getModel();
            if (!bEditMode && (!oData.PROJECTID || oData.PROJECTID.trim() === "")) {
                MessageToast.show("Project ID is required to create a task.");
                return;
            }
            if (bEditMode) {
                oModel.callFunction("/UpdateProjectTask", {
                    method: "GET",
                    urlParameters: { updatedTaskData: sPayload },
                    success: function (data) {
                        if (data.UpdateProjectTask === "ProjectTask updated successfully") {
                            MessageToast.show(data.UpdateProjectTask);
                            this.ReadProjectTask();
                            this.pCreateDialog.close();
                        } else {
                            MessageToast.show(data.UpdateProjectTask);
                        }

                    }.bind(this),
                    error: function (err) {
                        MessageToast.show("Failed to update employee project.");
                    }
                });
            } else {
                oModel.callFunction("/CreateProjectTask", {
                    method: "GET",
                    urlParameters: { ProjectTaskdata: sPayload },
                    success: function (data) {
                        if (data.CreateProjectTask === "Task saved successfully!") {
                            MessageToast.show("Employee project saved successfully!");
                            this.pCreateDialog.close();
                            this.ReadProjectTask();
                        } else {
                            MessageToast.show(data.CreateProjectTask);
                        }

                    }.bind(this),
                    error: function () {
                        MessageToast.show("Failed to create employee project.");
                    }
                });
            }
        },

        ReadProjectTask: function () {
            const oModel = this.getView().getModel();
            oModel.callFunction("/ReadProjectTask", {
                method: "GET",
                success: function (oData) {
                    if (oData) {
                        const aProjects = JSON.parse(oData.ReadProjectTask);

                        const oTableModel = new sap.ui.model.json.JSONModel(aProjects);
                        this.getView().setModel(oTableModel, "TableProjectTasksModel");
                    } else {
                        sap.m.MessageToast.show("No data found!")
                    }

                }.bind(this),
                error: function (err) {
                    sap.m.MessageToast.show("Failed to read data")
                }
            });
        },

        onCloseTaskDialog: function () {
            if (this.pCreateDialog) {
                this.pCreateDialog.close();
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
        // onCancelEmployeeProject: function () {
        //     if (this.pCreateDialog) {
        //         this.pCreateDialog.close();
        //     }
        // },


    });
});

