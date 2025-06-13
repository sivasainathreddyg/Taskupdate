using my.timesheet as timesheet from '../db/schema.cds';

service TimesheetService {
    entity Tasks     as projection on timesheet.Tasks;
    entity Timesheet as projection on timesheet.TimeSheetEntries;
    entity Users     as projection on timesheet.Users;
    function checkCredentials(email : String, password : String) returns String;
    function SaveTaskData(taskData : String)                     returns String;
    function getTasksByEmail(email : String)                     returns String;

}
