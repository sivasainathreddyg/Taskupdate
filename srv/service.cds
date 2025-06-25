using my.timesheet as timesheet from '../db/schema.cds';

service TimesheetService {
    // entity Tasks            as projection on timesheet.Tasks;
    entity Timesheet        as projection on timesheet.TimeSheetEntries;
    entity Users            as projection on timesheet.Users;
    entity MasterProjects   as projection on timesheet.MasterProjects;
    entity EmployeeProjects as projection on timesheet.EmployeeProjects;
    entity ProjectTask      as projection on timesheet.ProjectTask;
    entity CommonTask       as projection on timesheet.CommonTask;
    function checkCredentials(email : String, password : String) returns String;
    function SaveTaskData(taskData : String)                     returns String;
    function getTasksByEmail(email : String)                     returns String;
    function UpdateTask(updatedtaskdata : String)                returns String;
    function EditTask(editedtaskdata : String)                   returns String;
    function DeleteTask(taskId : String)                         returns String;
    function GetUsersList()                                      returns String;
    function ProjectMasterData(projectsdata : String)            returns String;
    function ProjectMasterDataread()                             returns String;
    function ProjectMasterDataUpdate(updatedData : String)       returns String;
    function CreateEmployeeProject(employeeprojectdata : String) returns String;
    function ReadEmployeeProjects()                              returns String;
    function UpdateEmployeeProject(updatedData : String)         returns String;
    function CreateProjectTask(ProjectTaskdata : String)         returns String;
    function ReadProjectTask()                                   returns String;
    function UpdateProjectTask(updatedTaskData : String)         returns String;

}
