// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ], (Controller) => {
//     "use strict";
//     var that=this;

//     return Controller.extend("demotime.controller.View1", {
//         onInit() {
//             that.oGmodel = this.getOwnerComponent().getModel("oGModel");
//             this.getOwnerComponent().getRouter().getRoute("View1").attachPatternMatched(this._onPatternMatched, this);

//         },
//         _onPatternMatched(oEvent) {
//             that.oGmodel=this.getOwnerComponent().getModel("oGModel");
//             that.Email=that.oGmodel.oData.userdata.email;

//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/dnd/DropInfo",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, DragInfo, DropInfo, Fragment, MessageToast) {
    "use strict";
    var that = this;

    return Controller.extend("demotime.controller.View1", {
        onInit: function () {
            // Set initial data
            that.oGmodel = this.getOwnerComponent().getModel("oGModel");
            that.Email = that.oGmodel?.getProperty("/userdata/EMAIL") || "";
            this.getOwnerComponent().getRouter().getRoute("View1").attachPatternMatched(this._onPatternMatched, this);
            var oTaskModel = new sap.ui.model.json.JSONModel({
                tasks: [
                    { taskTitle: "SAP AMS User - 1237", taskDescription: "Enhancement task", hours: "56" },
                    { taskTitle: "Fiori App - 3456", taskDescription: "New app dev", hours: "40" },
                    { taskTitle: "Bug Fix - 7890", taskDescription: "Critical fix", hours: "12" }
                ],
                // appointments: [],
                // startDate: new Date(),

            });
            var today = new Date();
            today.setHours(0, 0, 0, 0); // midnight
            var oModel = new sap.ui.model.json.JSONModel({
                startDate: today,
                appointments: [],
                email: that.Email
            });
            this.getView().setModel(oModel, "calendermodel");
            this.getView().setModel(oTaskModel, "taskmodel");
            this._oDraggedTask = null;
            this._bEditMode = false;

        },
        _onPatternMatched(oEvent) {
            that.oGmodel = this.getOwnerComponent().getModel("oGModel");
            that.Email = that.oGmodel?.getProperty("/userdata/EMAIL") || "";
            if (that.Email === "admin@gmail.com") {
                this.getView().byId("SplitContainer").mAggregations._navMaster.addStyleClass("adminWidthClass");
                this.byId("idComboBoxUserList").setVisible(true);
            } else {
                this.getView().byId("SplitContainer").mAggregations._navMaster.removeStyleClass("adminWidthClass");
                this.byId("idComboBoxUserList").setVisible(false);
            }
            this.loadAppointmentsForEmail(that.Email);
            this.getuserslist();

        },
        onTaskDragStart: function (oEvent) {
            this._oDraggedTask = oEvent.getParameter("target").getBindingContext("taskmodel").getObject();
        },
        // createDragDropConfig: function () {
        //     return new DragInfo({ sourceAggregation: "items", groupName: "Tasks" });
        // },
        handleEditSaveButton: function (oEvent) {
            var btnText = oEvent.getSource().getText();
            if (btnText === "Save") {
                this.handleSaveButton();
            } else {
                this.handleEditButton();
            }
        },
        handleEditButton: function () {
            this._bEditMode = true;

            // Make sure view model exists
            if (!this.viewModel) {
                this.viewModel = new sap.ui.model.json.JSONModel({ editMode: true });
                this.getView().setModel(this.viewModel, "view");
            } else {
                this.viewModel.setProperty("/editMode", true);
            }

            // Optionally refresh popover content
            this._pDetailsPopover?.then(function (oPopover) {
                oPopover.getModel("view")?.refresh(true);
            });
        },
        handleSaveButton: function () {
            const oView = this.getView();
            const oFragmentId = oView.getId();

            const oTitleInput = sap.ui.core.Fragment.byId(oFragmentId, "idTitle");
            const oDescInput = sap.ui.core.Fragment.byId(oFragmentId, "idtaskDescription");
            const oStartDateTimePicker = sap.ui.core.Fragment.byId(oFragmentId, "startDateTimePicker");
            const oEndDateTimePicker = sap.ui.core.Fragment.byId(oFragmentId, "endDateTimePicker");

            const sTitle = oTitleInput.getValue();
            const sDesc = oDescInput.getValue();

            let oStartDate = oStartDateTimePicker.getDateValue();
            let oEndDate = oEndDateTimePicker.getDateValue();

            if (!oStartDate) {
                const sStartValue = oStartDateTimePicker.getValue();
                if (sStartValue) {
                    oStartDate = new Date(sStartValue);
                }
            }

            if (!oEndDate) {
                const sEndValue = oEndDateTimePicker.getValue();
                if (sEndValue) {
                    oEndDate = new Date(sEndValue);
                }
            }

            if (!oStartDate || !oEndDate) {
                sap.m.MessageToast.show("Please provide both start and end date & time.");
                return;
            }

            if (oEndDate <= oStartDate) {
                sap.m.MessageToast.show("End time must be after start time.");
                return;
            }

            if (this.selectedAppointment) {
                const oContext = this.selectedAppointment.getBindingContext("calendermodel");
                var oDraggedTask = oContext.getObject();
                const oModel = this.getView().getModel();

                const oTask = {
                    id: oDraggedTask.id,
                    title: sTitle,
                    description: sDesc,
                    startDate: oStartDate,
                    endDate: oEndDate,
                    email: that.Email
                };
                var jsonString = JSON.stringify(oTask);

                oModel.callFunction("/EditTask", {
                    method: "GET",
                    urlParameters: { editedtaskdata: jsonString },
                    success: function (oData) {
                        sap.m.MessageToast.show(oData.value || "Edited");
                        this.loadAppointmentsForEmail(that.Email);
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error saving task to backend.");
                    }
                });

                // oModel.setProperty(sPath + "/title", sTitle);
                // oModel.setProperty(sPath + "/taskDescription", sDesc);
                // oModel.setProperty(sPath + "/startDate", oStartDate);
                // oModel.setProperty(sPath + "/endDate", oEndDate);

                // this.selectedAppointment.setStartDate(new Date(oStartDate));
                // this.selectedAppointment.setEndDate(new Date(oEndDate));
            }

            // this.calculateDailyTotalsFromAppointments();

            if (this._pDetailsPopover) {
                this._pDetailsPopover.then(function (oPopover) {
                    oPopover.destroy();
                });
                this._pDetailsPopover = null;
            }

            this.getView().getModel("view").setProperty("/editMode", false);
        },
        handleAppointmentDrop: function (oEvent) {
            //internally drag and drop in the calender
            var oAppointment = oEvent.getParameter("appointment");
            var oContext = oAppointment.getBindingContext("calendermodel");
            var oDraggedTask = oContext.getObject();
            var oStartDate = oEvent.getParameter("startDate");
            var oEndDate = oEvent.getParameter("endDate");
            const oModel = this.getView().getModel();

            const oTask = {
                id: oDraggedTask.id,
                title: oDraggedTask.title,
                description: oDraggedTask.taskDescription,
                startDate: oStartDate,
                endDate: oEndDate,
                email: that.Email
            };
            var jsonString = JSON.stringify(oTask);

            oModel.callFunction("/UpdateTask", {
                method: "GET",
                urlParameters: { updatedtaskdata: jsonString },
                success: function (oData) {
                    sap.m.MessageToast.show(oData.value || "Updated");
                    this.loadAppointmentsForEmail(that.Email);
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show("Error saving task to backend.");
                }
            });


            // Update the appointment object
            // oAppointment.setStartDate(oStartDate);
            // oAppointment.setEndDate(oEndDate);
            // this.calculateDailyTotalsFromAppointments();

            //sap.m.MessageToast.show("Appointment moved to: " + oStartDate.toLocaleString());
        },
        handleAppointmentResize: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            var oContext = oAppointment.getBindingContext("calendermodel");
            var oDraggedTask = oContext.getObject();
            var oNewStartDate = oEvent.getParameter("startDate");
            var oNewEndDate = oEvent.getParameter("endDate");
            const oModel = this.getView().getModel();

            const oTask = {
                id: oDraggedTask.id,
                title: oDraggedTask.title,
                description: oDraggedTask.taskDescription,
                startDate: oNewStartDate,
                endDate: oNewEndDate,
                email: that.Email
            };
            var jsonString = JSON.stringify(oTask);

            oModel.callFunction("/UpdateTask", {
                method: "GET",
                urlParameters: { updatedtaskdata: jsonString },
                success: function (oData) {
                    sap.m.MessageToast.show(oData.value || "Updated");
                    this.loadAppointmentsForEmail(that.Email);
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show("Error saving task to backend.");
                }
            });

            // Update the appointment object with new times
            // oAppointment.setStartDate(oNewStartDate);
            // oAppointment.setEndDate(oNewEndDate);
            // this.calculateDailyTotalsFromAppointments();

            // sap.m.MessageToast.show("Appointment resized to: " +
            // oNewStartDate.toLocaleString() + " - " + oNewEndDate.toLocaleString());
        },
        getuserslist: function () {
            var oModel = this.getView().getModel();

            oModel.callFunction("/GetUsersList", {
                method: "GET",
                success: function (oData) {
                    if (oData && oData.GetUsersList) {
                        var oUsersModel = new sap.ui.model.json.JSONModel(JSON.parse(oData.GetUsersList));
                        this.getView().setModel(oUsersModel, "userslistModel");
                    } else {
                        sap.m.MessageToast.show("No users found.");
                    }
                }.bind(this),
                error: function (err) {
                    sap.m.MessageToast.show("Error retrieving users list.");
                }
            });
        },
        onUserEmailChange: function (oEvent) {
            const sSelectedEmail = oEvent.getSource().getSelectedKey();
        
            if (sSelectedEmail) {
                this.loadAppointmentsForEmail(sSelectedEmail);
            } else {
                sap.m.MessageToast.show("Please select a valid email.");
            }
        },        

        // handleTaskDropOnCalendar: function (oEvent) {
        //     //drop a task which is drag from the list to calender
        //     const oDraggedTask = oEvent.getParameter("draggedControl").getBindingContext("taskmodel").getObject();
        //     const oCalendar = this.byId("SPC1");
        //     var oNewStartDate = oEvent.getParameter("startDate");



        //     // For example, get drop position from the event's DOM reference:
        //     const oBrowserEvent = oEvent.getParameter("browserEvent");
        //     const oDomRef = oBrowserEvent.target;

        //     // For demo, let's assign startDate as calendar startDate (Monday 00:00)
        //     const oStartDate = oCalendar.getStartDate();
        //     const oEndDate = new Date(oStartDate);
        //     oEndDate.setHours(oEndDate.getHours() + 1);

        //     // Create new appointment entry
        //     const oModel = this.getView().getModel();
        //     const aAppointments = oModel.getProperty("/appointments") || [];

        //     aAppointments.push({
        //       title: oDraggedTask.taskTitle,
        //       taskDescription: oDraggedTask.taskDescription,
        //       type: "Type01",
        //       startDate: oStartDate,
        //       endDate: oEndDate
        //     });

        //     oModel.setProperty("/appointments", aAppointments);
        // },
        handleTaskDropOnCalendar: function (oEvent) {
            const oDraggedTask = oEvent.getParameter("draggedControl")?.getBindingContext("taskmodel")?.getObject();
            if (!oDraggedTask) return;

            const oCalendar = this.byId("SPC1");
            const oBrowserEvent = oEvent.getParameter("browserEvent");
            const dropX = oBrowserEvent.clientX;
            const dropY = oBrowserEvent.clientY;

            const calendarDomRef = oCalendar.getDomRef();
            if (!calendarDomRef) {
                console.error("Calendar DOM not found");
                return;
            }

            // Get the actual element under the drop point
            const hoveredElement = document.elementFromPoint(dropX, dropY);

            // Traverse up to find the .sapMSinglePCRow cell
            let targetCell = hoveredElement;
            while (targetCell && !targetCell.classList.contains("sapMSinglePCRow")) {
                targetCell = targetCell.parentElement;
            }

            if (!targetCell) {
                sap.m.MessageToast.show("Drop must be on a valid time cell.");
                return;
            }

            // Extract start date from data attribute
            const startDateStr = targetCell.getAttribute("data-sap-start-date");
            if (!startDateStr) {
                sap.m.MessageToast.show("Could not read cell date.");
                return;
            }

            // Parse SAP's custom date format (yyyymmdd-HHmm)
            const match = startDateStr.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
            if (!match) {
                sap.m.MessageToast.show("Invalid date format in cell.");
                return;
            }

            const [_, year, month, day, hour, minute] = match;
            const dropDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute)
            );

            // Set end date 1 hour later
            const endDate = new Date(dropDate);
            endDate.setHours(endDate.getHours() + 1);

            const oModel = this.getView().getModel();

            const oTask = {
                id: Date.now() + "_" + Math.floor(Math.random() * 10000),
                title: oDraggedTask.taskTitle,
                description: oDraggedTask.taskDescription,
                startDate: dropDate,
                endDate: endDate,
                email: that.Email
            };
            var jsonString = JSON.stringify(oTask);

            oModel.callFunction("/SaveTaskData", {
                method: "GET",
                urlParameters: { taskData: jsonString },
                success: function (oData) {
                    sap.m.MessageToast.show(oData.value || "Saved!");
                    this.loadAppointmentsForEmail(that.Email);
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show("Error saving task to backend.");
                }
            });


            // Push new appointment to model
            // const oModel = this.getView().getModel();
            // const aAppointments = oModel.getProperty("/appointments") || [];

            // aAppointments.push({
            //     title: oDraggedTask.taskTitle,
            //     taskDescription: oDraggedTask.taskDescription,
            //     startDate: dropDate,
            //     endDate: endDate,
            //     type: "Type01"
            // });

            // oModel.setProperty("/appointments", aAppointments);
            // this.calculateDailyTotalsFromAppointments();
            // sap.m.MessageToast.show("Task dropped at: " + dropDate.toLocaleString());
        },
        loadAppointmentsForEmail: function (sEmail) {
            const oModel = this.getView().getModel();
            const oCalendarModel = this.getView().getModel("calendermodel");

            oModel.callFunction("/getTasksByEmail", {
                method: "GET",
                urlParameters: {
                    email: sEmail
                },
                success: function (oData) {
                    const results = JSON.parse(oData.getTasksByEmail) || [];

                    // const aAppointments = results.map(entry => ({
                    //   title: entry.TITLE,
                    //   description: entry.DESCRIPTION,
                    //   startDate: new Date(entry.STARTDATE),
                    //   endDate: new Date(entry.ENDDATE),
                    //   type: "Type01"
                    // }));
                    const aAppointments = results.map(entry => ({
                        id: entry.ID,
                        title: entry.TITLE,
                        taskDescription: entry.DESCRIPTION,
                        startDate: new Date(entry.STARTDATE + "Z"),
                        endDate: new Date(entry.ENDDATE + "Z"),
                        type: "Type01"
                    }));


                    oCalendarModel.setProperty("/appointments", aAppointments);
                    oCalendarModel.setSizeLimit(aAppointments.length);
                    this.getView().getModel("calendermodel").refresh(true);
                    // this.calculateDailyTotalsFromAppointments();
                    this.handleStartDateChange();
                }.bind(this),
                error: function (err) {
                    console.error("Error fetching tasks for email", err);
                    sap.m.MessageToast.show("Failed to load appointments.");
                }
            });
        },
        // handleTaskDropOnCalendar: function (oEvent) {
        //     const oDraggedControl = oEvent.getParameter("draggedControl");
        //     if (!oDraggedControl) {
        //         sap.m.MessageToast.show("Dragged control is undefined.");
        //         return;
        //     }

        //     const oContext = oDraggedControl.getBindingContext("taskmodel");
        //     if (!oContext) {
        //         sap.m.MessageToast.show("No task data found.");
        //         return;
        //     }

        //     const oDraggedTask = oContext.getObject();
        //     const oDropStartDate = oEvent.getParameter("startDate");  // <-- THIS is key!

        //     const oDropEndDate = new Date(oDropStartDate.getTime() + 60 * 60 * 1000); // +1 hour duration

        //     const oModel = this.getView().getModel();
        //     const aAppointments = oModel.getProperty("/appointments") || [];

        //     aAppointments.push({
        //         title: oDraggedTask.taskTitle,
        //         text: oDraggedTask.taskDescription,
        //         type: "Type01",
        //         startDate: oDropStartDate,
        //         endDate: oDropEndDate
        //     });

        //     oModel.setProperty("/appointments", aAppointments);
        // },        
        handleAppointmentSelect: function (oEvent) {
            this._bEditMode = false;
            //getting details of the task
            var oAppointment = oEvent.getParameter("appointment");
            this.selectedAppointment = oAppointment;
            var oView = this.getView();

            if (!oAppointment) {
                return;
            }

            var oStartDate = oAppointment.getStartDate();
            var oEndDate = oAppointment.getEndDate();

            // var totalHoursvalue = 0;
            // if (oStartDate && oEndDate) {
            //     totalHoursvalue = (oEndDate.getTime() - oStartDate.getTime()) / (1000 * 60 * 60);
            //     totalHoursvalue = totalHoursvalue.toFixed(2); // round to 2 decimals
            // }
            var totalHoursvalue = this.getDurationString(oStartDate, oEndDate)
            const calculatedModel = new sap.ui.model.json.JSONModel({
                totalHours: totalHoursvalue
            })
            this.getView().setModel(calculatedModel, "calculated");

            // Clone dates and reset hours/minutes/seconds to 0
            var oTrimmedStartDate = new Date(oStartDate.getTime());
            var oTrimmedEndDate = new Date(oEndDate.getTime());

            this._setHoursToZero(oTrimmedStartDate);
            this._setHoursToZero(oTrimmedEndDate);



            // If appointment is deselected and popover open, close popover
            if (!oAppointment.getSelected() && this._pDetailsPopover) {
                this._pDetailsPopover.then(function (oPopover) {
                    oPopover.close();
                });
                return;
            }

            // Load popover fragment if not yet loaded
            if (!this._pDetailsPopover) {
                this._pDetailsPopover = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demotime.Fragment.Details",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            if (!this.viewModel) {
                this.viewModel = new sap.ui.model.json.JSONModel({ editMode: false })
                this.getView().setModel(this.viewModel, "view");
            }
            this.viewModel.setProperty("/editMode", this._bEditMode)


            // Open popover and bind context to selected appointment
            // this._pDetailsPopover.then(function (oPopover) {
            //     oPopover.setBindingContext(oAppointment.getBindingContext());
            //     oPopover.openBy(oAppointment);
            // });

            this._pDetailsPopover.then(function (oPopover) {
                const oContext = oAppointment.getBindingContext("calendermodel");
                oPopover.setBindingContext(oContext, "calendermodel");
                oPopover.openBy(oAppointment);
            });
        },
        getDurationString: function (startDate, endDate) {
            const diffMs = endDate - startDate; // difference in milliseconds
            const totalMinutes = Math.floor(diffMs / 60000); // convert to total minutes
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            let results = "";
            if (hours > 0) {
                results += hours + " " + "hour" + (hours > 1 ? "s" : "")
            }
            if (minutes > 0) {
                if (results)
                    results += " ";
                results += minutes + " " + "minute" + (minutes > 0 ? "s" : "")
            }
            return results || "0"
        },

        // Helper function to zero hours, minutes, seconds, ms of a Date
        _setHoursToZero: function (oDate) {
            oDate.setHours(0, 0, 0, 0);
        },
        // onAddNewTask: function (oEvent) {
        //     if (!this.oCreateDialog) {
        //         this.oCreateDialog = sap.ui.xmlfragment("demotime.Fragment.CreateAppointment", this);
        //         this.getView().addDependent(this.oCreateDialog);
        //     }
        //     this.oCreateDialog.open();
        // },
        // onDialogCancel: function () {
        //     if (this.oCreateDialog) {
        //         this.oCreateDialog.close();
        //     }
        // },
        // onCreateAppointmentSave: function () {
        //     const oModel = this.getView().getModel();
        //     const oTask = sap.ui.getCore().byId("taskSelect").getSelectedItem();
        //     const sTaskTitle = oTask ? oTask.getText() : "No Task";

        //     const oStartDate = sap.ui.getCore().byId("startDateTime").getDateValue();
        //     const oEndDate = sap.ui.getCore().byId("endDateTime").getDateValue();

        //     if (!oStartDate || !oEndDate) {
        //         sap.m.MessageToast.show("Please select valid start and end time.");
        //         return;
        //     }

        //     const aAppointments = oModel.getProperty("/appointments") || [];
        //     aAppointments.push({
        //         title: sTaskTitle,
        //         taskDescription: "Created from form",
        //         type: "Type01",
        //         startDate: oStartDate,
        //         endDate: oEndDate
        //     });

        //     oModel.setProperty("/appointments", aAppointments);
        //     this.oCreateDialog.close();
        // },
        onTaskSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oList = this.byId("TaskList");
            const oBinding = oList.getBinding("items");
            if (oBinding) {
                const aFilter = [];
                if (sQuery && sQuery.length > 0) {
                    aFilter.push(new sap.ui.model.Filter("taskTitle", sap.ui.model.FilterOperator.Contains, sQuery));
                }
                oBinding.filter(aFilter);
            }
        },

        // onTaskSearch: function (oEvent) {
        //     const sQuery = oEvent.getParameter("newValue");
        //     const oList = this.byId("TaskList");
        //     const oBinding = oList.getBinding("items");

        //     if (oBinding) {
        //         let aFilters = [];
        //         if (sQuery && sQuery.length > 0) {
        //             aFilters = new sap.ui.model.Filter({
        //                 filters: [
        //                     new sap.ui.model.Filter("taskTitle", sap.ui.model.FilterOperator.Contains, sQuery),
        //                     new sap.ui.model.Filter("taskDescription", sap.ui.model.FilterOperator.Contains, sQuery)
        //                 ],
        //                 and: false // Use OR logic
        //             });
        //         }
        //         oBinding.filter(aFilters);
        //     }
        // },        
        onOpenLegend: function (oEvent) {
            const oView = this.getView();

            if (!this._pLegendPopover) {
                this._pLegendPopover = Fragment.load({
                    id: oView.getId(),
                    name: "demotime.Fragment.LegendPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pLegendPopover.then(function (oPopover) {
                oPopover.openBy(oEvent.getSource());
            });
        },
        handleStartDateChange: function (oEvent) {
            const oCalendar = this.byId("SPC1"); // Replace with your calendar ID
            const oStartDate = oCalendar.getStartDate(); // returns visible start date

            // Compute the week start (Monday) and week end (Sunday)
            const startOfWeek = new Date(oStartDate);
            const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const diffToMonday = (day === 0 ? -6 : 1 - day); // shift Sunday back 6 days
            startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            // Call your totals calculation function
            this.calculateDailyTotalsFromAppointments(startOfWeek, endOfWeek);
        },
        calculateDailyTotalsFromAppointments: function (startOfWeek, endOfWeek) {
            const calModel = this.getView().getModel("calendermodel");
            const aAppointments = calModel.getProperty("/appointments") || [];

            // Initialize totals for each day of the week (Sunday to Saturday)
            const oTotals = {
                0: 0, // Sunday
                1: 0, // Monday
                2: 0, // Tuesday
                3: 0, // Wednesday
                4: 0, // Thursday
                5: 0, // Friday
                6: 0  // Saturday
            };

            aAppointments.forEach(appointment => {
                const oStart = new Date(appointment.startDate);
                const oEnd = new Date(appointment.endDate);

                // Only process appointments within the selected week range
                if (oStart >= startOfWeek && oEnd <= endOfWeek) {
                    const day = oStart.getDay();
                    const diffMs = oEnd - oStart;

                    if (diffMs > 0) {
                        const diffHrs = diffMs / (1000 * 60 * 60); // ms to hours
                        oTotals[day] += diffHrs;
                    }
                }
            });

            const formatHours = (val) => {
                const hours = Math.floor(val);
                const mins = Math.round((val - hours) * 60);
                return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
            };

            // Update UI elements with the formatted totals
            this.byId("sunHours").setText(formatHours(oTotals[0]));
            this.byId("monHours").setText(formatHours(oTotals[1]));
            this.byId("tueHours").setText(formatHours(oTotals[2]));
            this.byId("wedHours").setText(formatHours(oTotals[3]));
            this.byId("thuHours").setText(formatHours(oTotals[4]));
            this.byId("friHours").setText(formatHours(oTotals[5]));
            this.byId("satHours").setText(formatHours(oTotals[6]));
        },
        // handlePopoverDeleteButton: function () {
        //     if (this.selectedAppointment) {
        //         var oContext = this.selectedAppointment.getBindingContext();
        //         var oModel = oContext.getModel();
        //         var sPath = oContext.getPath();

        //         if (sPath) {
        //             oModel.remove(sPath, {
        //                 success: function () {
        //                     sap.m.MessageToast.show("ss")
        //                 },
        //                 error: function () {
        //                     sap.m.MessageToast.show("ee")
        //                 }
        //             })
        //         }
        //     }

        // },
        handlePopoverDeleteButton: function () {
            if (this.selectedAppointment) {
                const oContext = this.selectedAppointment.getBindingContext("calendermodel");
                const oDraggedTask = oContext.getObject();
                const oModel = this.getView().getModel();
                oModel.callFunction("/DeleteTask", {
                    method: "GET",
                    urlParameters: { taskId: oDraggedTask.id },
                    success: function (oData) {
                        sap.m.MessageToast.show(oData.value || "Deleted");
                        this.loadAppointmentsForEmail(that.Email); // reload appointments

                        // Close and destroy popover AFTER updating appointments
                        if (that._pDetailsPopover) {
                            that._pDetailsPopover.then(function (oPopover) {
                                oPopover.close();
                                oPopover.destroy();
                                that._pDetailsPopover = null;
                            });
                        }

                        that.selectedAppointment = null;
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error deleting task from backend.");
                    }
                });
            }
        }


    });
});