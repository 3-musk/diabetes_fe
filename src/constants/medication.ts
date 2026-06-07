export const medication = {
  pageTitle: "Medication",
  selectDatePlaceholder: "Select Date",
  selectCategoryTitle: "Select Medicine Category",
  medicationNameLabel: "Medication Name",
  medicationNamePlaceholder: "Enter Medication Name",
  strengthLabel: "Strength",
  strengthPlaceholder: "e.g. 500 mg",
  frequencyLabel: "Frequency",
  startDateLabel: "Start Date",
  endDateLabel: "End Date",
  saveBtn: "Save",
  
  categories: [
    { id: 'Capsules', icon: 'medkit' },
    { id: 'Pills',    icon: 'circle-o' },
    { id: 'Liquid',   icon: 'flask' },
    { id: 'Others',   icon: 'user-md' },
  ] as const
};
