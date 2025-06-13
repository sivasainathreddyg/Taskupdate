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
            const startDate = jsStartDate.  toISOString().replace('T', ' ').slice(0, 19);
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
 
        srv.on("getTasksByEmail", async (req) => {
          const { email } = req.data;
      
          const tasks = await cds.transaction(req).run(
            SELECT.from("MY_TIMESHEET_TIMESHEETENTRIES").where({ email })
          );
      
          if (tasks) {
            return JSON.stringify(tasks);
        } else {
            return JSON.stringify({ error: 'Invalid credentials' });
        }
        });

      
    

};
