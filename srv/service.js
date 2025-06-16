const cds = require('@sap/cds');

module.exports = srv => {
    srv.on('checkCredentials', async req => {
        const { email, password } = req.data;

        const user = await cds.transaction(req).run(
            SELECT.one.from('my.timesheet.Users').where({ email, password })
        );

        if (user) {
            return JSON.stringify(user);
        } else {
            return JSON.stringify({ error: 'Invalid credentials' });
        }
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
                    .set({ TITLE:task.title,DESCRIPTION:task.description,STARTDATE: startDate, ENDDATE: endDate }).where({ ID: task.id });

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

    //     if(email==="admin@gmail.com"){
    //         tasks = await cds.transaction(req).run(
    //             SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES")
    //         );
    //     }else{
    //          tasks = await cds.transaction(req).run(
    //             SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ email })
    //         );
    //     }

    //     if (tasks) {
    //         return JSON.stringify(tasks);
    //     } else {
    //         return JSON.stringify({ error: 'Invalid credentials' });
    //     }
    // });

    srv.on("getTasksByEmail", async (req) => {
        try {
            const { email } = req.data;
    
            const query = SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES");
    
            if (email !== "admin@gmail.com") {
                query.where({ EMAIL: email });
            }
    
            const tasks = await cds.transaction(req).run(query);
    
            return tasks.length ? tasks : { message: "No tasks found." };
        } catch (err) {
            console.error("Error fetching tasks:", err);
            return { error: "Failed to fetch tasks." };
        }
    });
    



};
