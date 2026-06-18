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
  emptyBody: "Add your prescribed medicines to get reminders and stay on track.",
  addMedicationBtn: "Add Medication",
  medicationsTitle: "Medications",

  categories: [
    {
      id: "Capsules",
      icon: require("../../assets/svgs/medicine_category/capsule.svg"),
    },
    {
      id: "Pills",
      icon: require("../../assets/svgs/medicine_category/pill.svg"),
    },
    {
      id: "Liquid",
      icon: require("../../assets/svgs/medicine_category/liquid.svg"),
    },
    {
      id: "Others",
      icon: require("../../assets/svgs/medicine_category/others.svg"),
    },
  ] as const,
};
