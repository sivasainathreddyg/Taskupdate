namespace my.timesheet;

entity TimeSheetEntries {
  key id          : UUID;
      title       : String;
      description : String;
      project     : Association to MasterProjects;
      taskid      : String;
      startDate   : Timestamp;
      endDate     : Timestamp;
      email       : String;
}

// entity TimeSheetEntries {
//   key id          : UUID;
//       title       : String;
//       description : String;
//       project      : Association to MasterProjects;
//       task         : Association to ProjectTask;
//       user         : Association to Users;
//       startDate   : Timestamp;
//       endDate     : Timestamp;
// }
entity Users {
  key email    : String;
      password : String;
}

entity MasterProjects : managedobject, validobject {
  key ProjectID          : String;
      projectName        : String;
      projectDescription : String;
      projectStatus      : String;
}

entity EmployeeProjects : managedobject, validobject {
  key ProjectID     : String;
  key EmployeeEmail : String;
      Supervisor    : Boolean;
}

entity ProjectTask : managedobject, dateobject {
  key TaskID      : String;
  key ProjectID   : String;
      Title       : String;
      Description : String;
      taskstatus  : String(20);
      taskowner   : String(30);
}

entity CommonTask {
  key TaskID  : String;
      Title   : String;
      leave   : String;
      Holiday : String;
}

aspect managedobject {
  CreatedDate : Timestamp;
  UpdatedDate : Timestamp;
}

aspect validobject {
  ValidFrom : Timestamp;
  ValidTo   : Timestamp;
}

aspect dateobject {
  startdate : Date;
  enddate   : Date;
}
