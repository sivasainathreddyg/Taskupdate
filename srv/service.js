const cds = require('@sap/cds');

module.exports = srv => {
    srv.on('checkCredentials', async req => {
        const { email, password } = req.data;

        const user = await cds.transaction(req).run(
            SELECT.one.from('MY_TIMESHEET_USERS').where({ email, password })
        );

        if (user) {
            return JSON.stringify(user);
        } else {
            return JSON.stringify({ error: 'Invalid credentials' });
        }
    });
    srv.on("GetUsersList", async req => {
        const users = await cds.transaction(req).run(
            SELECT.from('MY_TIMESHEET_USERS')
        );
        return JSON.stringify(users);
    });

    srv.on("SaveTaskData", async (req) => {
        try {
            const task = JSON.parse(req.data.taskData);

            const jsStartDate = new Date(task.startDate);
            const jsEndDate = new Date(task.endDate);

            // Check for invalid dates
            if (isNaN(jsStartDate.getTime()) || isNaN(jsEndDate.getTime())) {
                return "Invalid date format.";
            }

            // Format to HANA-compatible timestamp string
            const startDate = jsStartDate.toISOString().replace('T', ' ').slice(0, 19);
            const endDate = jsEndDate.toISOString().replace('T', ' ').slice(0, 19);

            await cds.transaction(req).run(
                INSERT.into('MY_TIMESHEET_TIMESHEETENTRIES').entries({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    startDate: startDate,
                    endDate: endDate,
                    email: task.email
                })
            );

            return "Task saved successfully!";
        } catch (err) {
            console.error("Error parsing or inserting task:", err);
            return "Error saving task.";
        }
    });
    function toHanaTimestamp(date) {
        return date.toISOString().replace('T', ' ').slice(0, 19); // "YYYY-MM-DD HH:MM:SS"
      }
      

    srv.on("ProjectMasterData", async (req) => {
        try {
            const masterdata = JSON.parse(req.data.projectsdata);

            await cds.transaction(req).run(
                INSERT.into('MY_TIMESHEET_MASTERPROJECTS').entries({
                    projectid: masterdata.PROJECTID,
                    projectname: masterdata.PROJECTNAME,
                    projectdescription: masterdata.PROJECTDESCRIPTION,
                    projectstatus: masterdata.PROJECTSTATUS,
                    validfrom: masterdata.VALIDFROM,
                    validto: masterdata.VALIDTO,
                    createddate: toHanaTimestamp(new Date()),
                })
            );

            return "Task saved successfully!";
        } catch (err) {
            console.error("Error saving project master data:", err);
            return "Error saving project master data.";
        }
    });

    srv.on("ProjectMasterDataread", async req => {
        const projects = await cds.transaction(req).run(
            SELECT.from('MY_TIMESHEET_MASTERPROJECTS')
        );
        return JSON.stringify(projects);
    });

    srv.on("ProjectMasterDataUpdate", async (req) => {
        try {
            const updatedata = JSON.parse(req.data.updatedData);
            const projectid = updatedata.PROJECTID;
    
            // Optional: Format date fields to valid ISO strings or HANA-compatible format
            if (updatedata.VALIDFROM) {
                updatedata.VALIDFROM = new Date(updatedata.VALIDFROM).toISOString().slice(0, 19).replace("T", " ");
            }
            if (updatedata.VALIDTO) {
                updatedata.VALIDTO = new Date(updatedata.VALIDTO).toISOString().slice(0, 19).replace("T", " ");
            }
            updatedata.UPDATEDDATE = new Date().toISOString().slice(0, 19).replace("T", " ");
    
            const updatePayload = {
                PROJECTNAME: updatedata.PROJECTNAME,
                PROJECTDESCRIPTION: updatedata.PROJECTDESCRIPTION,
                PROJECTSTATUS: updatedata.PROJECTSTATUS,
                VALIDFROM: new Date(updatedata.VALIDFROM),
                VALIDTO: new Date(updatedata.VALIDTO),
                UPDATEDDATE: new Date()
            };
    
            await cds.update('MY_TIMESHEET_MASTERPROJECTS')
                .set(updatePayload)
                .where({ PROJECTID: projectid });
    
            return 'MasterProject updated successfully'
        } catch (err) {
            console.error("Error updating MasterProject:", err);
            return req.error(500, "Error updating MasterProject.");
        }
    });
    
    //drag and drop  and resize functionality for task entries
    srv.on("UpdateTask", async (req) => {
        try {
            const task = JSON.parse(req.data.updatedtaskdata);

            const jsStartDate = new Date(task.startDate);
            const jsEndDate = new Date(task.endDate);

            // Check for invalid dates
            if (isNaN(jsStartDate.getTime()) || isNaN(jsEndDate.getTime())) {
                return "Invalid date format.";
            }

            // Format to HANA-compatible timestamp string
            const startDate = jsStartDate.toISOString().replace('T', ' ').slice(0, 19);
            const endDate = jsEndDate.toISOString().replace('T', ' ').slice(0, 19);

            try {

                await cds.update('MY_TIMESHEET_TIMESHEETENTRIES')
                    .set({ STARTDATE: startDate, ENDDATE: endDate }).where({ ID: task.id });

                return 'Timesheet updated successfully';
            } catch (error) {
                return req.error(500, 'Failed to update timesheet  ' + error.message);
            }
        } catch (err) {
            console.error("Error parsing or :", err);
            return "Error update task.";
        }
    });
    //Edit function 
    srv.on("EditTask", async (req) => {
        try {
            const task = JSON.parse(req.data.editedtaskdata);

            const jsStartDate = new Date(task.startDate);
            const jsEndDate = new Date(task.endDate);

            // Check for invalid dates
            if (isNaN(jsStartDate.getTime()) || isNaN(jsEndDate.getTime())) {
                return "Invalid date format.";
            }

            // Format to HANA-compatible timestamp string
            const startDate = jsStartDate.toISOString().replace('T', ' ').slice(0, 19);
            const endDate = jsEndDate.toISOString().replace('T', ' ').slice(0, 19);

            try {

                await cds.update('MY_TIMESHEET_TIMESHEETENTRIES')
                    .set({ TITLE: task.title, DESCRIPTION: task.description, STARTDATE: startDate, ENDDATE: endDate }).where({ ID: task.id });

                return 'Timesheet Edit successfully';
            } catch (error) {
                return req.error(500, 'Failed to Edit timesheet  ' + error.message);
            }
        } catch (err) {
            console.error("Error parsing :", err);
            return "Error Edit task.";
        }
    });

    // srv.on("getTasksByEmail", async (req) => {
    //     const { email } = req.data;
    //     let tasks;

    //          tasks = await cds.transaction(req).run(
    //             SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ email })
    //         );

    //     if (tasks) {
    //         return JSON.stringify(tasks);
    //     } else {
    //         return JSON.stringify({ error: 'Invalid credentials' });
    //     }
    // });

    srv.on("getTasksByEmail", async (req) => {
        const { email } = req.data;
        let tasks;

        if (email === "admin@gmail.com") {
            tasks = await cds.transaction(req).run(
                SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES")
            );
        } else {
            tasks = await cds.transaction(req).run(
                SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ email })
            );
        }

        if (tasks) {
            return JSON.stringify(tasks);
        } else {
            return JSON.stringify({ error: 'Invalid credentials' });
        }
    });

    srv.on("DeleteTask", async req => {
        const TaskID = req.data.taskId;

        const Task = await cds.transaction(req).run(
            SELECT.one.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ ID: TaskID })
        );

        if (Task) {
            await cds.transaction(req).run(
                DELETE.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ ID: TaskID })
            );
            return "Task deleted successfully";
        } else {
            return req.error(404, "Task not found");
        }
    });


    // srv.on("getTasksByEmail", async (req) => {
    //     try {
    //         const { email } = req.data;

    //         const query = SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES");

    //         if (email !== "admin@gmail.com") {
    //             query.where({ EMAIL: email });
    //         }

    //         const tasks = await cds.transaction(req).run(query);

    //         return tasks.length ? JSON.stringify(tasks) : { message: "No tasks found." };
    //     } catch (err) {
    //         console.error("Error fetching tasks:", err);
    //         return { error: "Failed to fetch tasks." };
    //     }
    // });




};
