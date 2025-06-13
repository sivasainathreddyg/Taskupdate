namespace my.timesheet;

entity Tasks {
  key id: UUID;
  title: String;
  description: String;
}

entity TimeSheetEntries {
  key id: UUID;
  title: String;
  description: String;
  startDate: Timestamp;
  endDate: Timestamp;
  email: String;
}

entity Users {
  key email: String;
  password: String;
}
