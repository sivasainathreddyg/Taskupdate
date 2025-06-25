namespace my.timesheet;

// entity Tasks {
//   key id          : UUID;
//       title       : String;
//       description : String;
// }

entity TimeSheetEntries {
  key id          : UUID;
      title       : String;
      description : String;
      startDate   : Timestamp;
      endDate     : Timestamp;
      email       : String;
}

entity Users {
  key email    : String;
      password : String;
}

entity MasterProjects {
  key ProjectID          : String;
      projectName        : String;
      projectDescription : String;
      projectStatus      : String;
      ValidFrom          : Timestamp;
      ValidTo            : Timestamp;
      CreatedDate        : Timestamp;
      UpdatedDate        : Timestamp;
}

entity EmployeeProjects {
  key ProjectID     : String;
  key EmployeeEmail : String;
      Supervisor    : Boolean;
      ValidFrom     : Timestamp;
      ValidTo       : Timestamp;
      CreatedDate   : Timestamp;
      UpdatedDate   : Timestamp;
}

entity ProjectTask {
  key TaskID      : String;
  key ProjectID   : String;
      Title       : String;
      Description : String;
}

entity CommonTask {
  key TaskID  : String;
      Title   : String;
      leave   : String;
      Holiday : String;
}
