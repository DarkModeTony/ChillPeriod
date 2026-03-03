// Using static JSON data
import syllabusData from './syllabus-data.json';

export const semesters = [
  { value: "firstsemesters",   label: "1st Semester", short: "1st" },
  { value: "secondsemesters",  label: "2nd Semester", short: "2nd" },
  { value: "thirdsemesters",   label: "3rd Semester", short: "3rd" },
  { value: "fourthsemesters",  label: "4th Semester", short: "4th" },
  { value: "fifthsemesters",   label: "5th Semester", short: "5th" },
  { value: "sixthsemesters",   label: "6th Semester", short: "6th" },
  { value: "seventhsemesters", label: "7th Semester", short: "7th" },
  { value: "eighthsemesters",  label: "8th Semester", short: "8th" },
];

export const branches = [
  { value: "CSE",  label: "Computer Science & Engineering" },
  { value: "IT",   label: "Information Technology" },
  { value: "ECE",  label: "Electronics & Communication" },
  { value: "EE",   label: "Electrical Engineering" },
  { value: "EEE",  label: "Electrical & Electronics" },
  { value: "ME",   label: "Mechanical Engineering" },
  { value: "CE",   label: "Civil Engineering" },
  { value: "MAE",  label: "Mechanical & Automation" },
  { value: "ICE",  label: "Instrumentation & Control" },
  { value: "CST",  label: "Computer Science & Technology" },
  { value: "ITE",  label: "Information Technology & Engineering" },
];

export const syllabusPdfs = {
  "CSE":    "http://www.ipu.ac.in/syllabus/btech2025/Annexure%20-%206a%20--%20USS%20CSE%20-%202025.pdf",
  "IT":     "http://www.ipu.ac.in/syllabus/btech2025/Annexure%20-%206b%20--%20USS%20IT%20-%202025.pdf",
  "ECE":    "http://www.ipu.ac.in/syllabus/btech2025/Annexure%20-%206c%20--%20USS%20ECE%20-%202025.pdf",
  "CSE-AI": "http://www.ipu.ac.in/syllabus/btech2025/Annexure%20-%206d%20--%20USS%20-%20CSE%20-%20AI%20-%202025.pdf",
  "CSE-DS": "http://www.ipu.ac.in/syllabus/Annexure%20-%206e%20--%20USS%20CSE%20-%20DS%20-%202025.pdf",
};

/**
 * Fetch subject list from static syllabus data.
 * Returns array of slug strings like ["database-management-system", "theory-of-computation"]
 */
export async function fetchSubjects(semesterValue, branch) {
  try {
    return syllabusData[semesterValue]?.[branch]?.subjects || [];
  } catch (error) {
    console.error('[Syllabus] Static data error:', error);
    return [];
  }
}

/**
 * Fetch full details for a single subject.
 * Returns rich object with theory units, lab experiments, paper codes, credits, etc.
 */
export async function fetchSubjectDetails(semesterValue, branch, slug) {
  try {
    return syllabusData[semesterValue]?.[branch]?.details?.[slug] || null;
  } catch (error) {
    console.error('[Syllabus Detail] Static data error:', error);
    return null;
  }
}


// Legacy helpers (still used by existing code)
export const getPdfLink = (branch) => syllabusPdfs[branch] || null;
