export interface Department {
  id: string;
  name: string;
  code: string;
  faculty: string;
  description?: string;
  head_of_department?: string;
  email?: string;
  phone?: string;
  building?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Mock University Departments Data
export const mockDepartments: Department[] = [
  // Faculty of Engineering
  {
    id: "dept-001",
    name: "Computer Science and Engineering",
    code: "CSE",
    faculty: "Engineering",
    description:
      "Department of Computer Science and Engineering focusing on software development, algorithms, and system design",
    head_of_department: "Prof. Dr. Michael Johnson",
    email: "cse@university.edu",
    phone: "+1-555-0101",
    building: "Engineering Block A",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-09-01T10:30:00Z",
    is_active: true,
  },
  {
    id: "dept-002",
    name: "Electrical and Electronics Engineering",
    code: "EEE",
    faculty: "Engineering",
    description:
      "Department specializing in electrical systems, electronics, and power engineering",
    head_of_department: "Prof. Dr. Sarah Chen",
    email: "eee@university.edu",
    phone: "+1-555-0102",
    building: "Engineering Block B",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-08-15T14:20:00Z",
    is_active: true,
  },
  {
    id: "dept-003",
    name: "Mechanical Engineering",
    code: "MECH",
    faculty: "Engineering",
    description:
      "Department of Mechanical Engineering covering thermodynamics, mechanics, and design",
    head_of_department: "Prof. Dr. Robert Martinez",
    email: "mech@university.edu",
    phone: "+1-555-0103",
    building: "Engineering Block C",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-07-20T11:45:00Z",
    is_active: true,
  },
  {
    id: "dept-004",
    name: "Civil Engineering",
    code: "CIVIL",
    faculty: "Engineering",
    description:
      "Department focusing on infrastructure, construction, and environmental engineering",
    head_of_department: "Prof. Dr. Amanda Williams",
    email: "civil@university.edu",
    phone: "+1-555-0104",
    building: "Engineering Block D",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-06-10T09:15:00Z",
    is_active: true,
  },

  // Faculty of Science
  {
    id: "dept-005",
    name: "Mathematics",
    code: "MATH",
    faculty: "Science",
    description:
      "Department of Mathematics covering pure and applied mathematics",
    head_of_department: "Prof. Dr. Jennifer Thompson",
    email: "math@university.edu",
    phone: "+1-555-0201",
    building: "Science Complex A",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-08-25T13:30:00Z",
    is_active: true,
  },
  {
    id: "dept-006",
    name: "Physics",
    code: "PHYS",
    faculty: "Science",
    description:
      "Department of Physics focusing on theoretical and experimental physics",
    head_of_department: "Prof. Dr. David Anderson",
    email: "physics@university.edu",
    phone: "+1-555-0202",
    building: "Science Complex B",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-07-30T16:00:00Z",
    is_active: true,
  },
  {
    id: "dept-007",
    name: "Chemistry",
    code: "CHEM",
    faculty: "Science",
    description:
      "Department of Chemistry covering organic, inorganic, and analytical chemistry",
    head_of_department: "Prof. Dr. Lisa Rodriguez",
    email: "chemistry@university.edu",
    phone: "+1-555-0203",
    building: "Science Complex C",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-09-05T12:45:00Z",
    is_active: true,
  },
  {
    id: "dept-008",
    name: "Biology",
    code: "BIO",
    faculty: "Science",
    description:
      "Department of Biology specializing in molecular biology, genetics, and ecology",
    head_of_department: "Prof. Dr. Mark Wilson",
    email: "biology@university.edu",
    phone: "+1-555-0204",
    building: "Science Complex D",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-08-10T10:20:00Z",
    is_active: true,
  },

  // Faculty of Business
  {
    id: "dept-009",
    name: "Business Administration",
    code: "BA",
    faculty: "Business",
    description:
      "Department covering management, finance, and business strategy",
    head_of_department: "Prof. Dr. Emily Davis",
    email: "business@university.edu",
    phone: "+1-555-0301",
    building: "Business School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-09-01T14:15:00Z",
    is_active: true,
  },
  {
    id: "dept-010",
    name: "Economics",
    code: "ECON",
    faculty: "Business",
    description: "Department of Economics focusing on macro and microeconomics",
    head_of_department: "Prof. Dr. Thomas Brown",
    email: "economics@university.edu",
    phone: "+1-555-0302",
    building: "Business School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-07-15T11:30:00Z",
    is_active: true,
  },
  {
    id: "dept-011",
    name: "Accounting",
    code: "ACC",
    faculty: "Business",
    description:
      "Department of Accounting covering financial and management accounting",
    head_of_department: "Prof. Dr. Patricia Miller",
    email: "accounting@university.edu",
    phone: "+1-555-0303",
    building: "Business School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-06-20T15:45:00Z",
    is_active: true,
  },

  // Faculty of Arts and Humanities
  {
    id: "dept-012",
    name: "English Literature",
    code: "ENG",
    faculty: "Arts and Humanities",
    description: "Department of English Literature and Language Studies",
    head_of_department: "Prof. Dr. Margaret Taylor",
    email: "english@university.edu",
    phone: "+1-555-0401",
    building: "Humanities Building",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-08-05T09:30:00Z",
    is_active: true,
  },
  {
    id: "dept-013",
    name: "History",
    code: "HIST",
    faculty: "Arts and Humanities",
    description:
      "Department of History covering world history and historical research methods",
    head_of_department: "Prof. Dr. James Wilson",
    email: "history@university.edu",
    phone: "+1-555-0402",
    building: "Humanities Building",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-07-25T13:20:00Z",
    is_active: true,
  },
  {
    id: "dept-014",
    name: "Philosophy",
    code: "PHIL",
    faculty: "Arts and Humanities",
    description:
      "Department of Philosophy covering ethics, logic, and metaphysics",
    head_of_department: "Prof. Dr. Susan Garcia",
    email: "philosophy@university.edu",
    phone: "+1-555-0403",
    building: "Humanities Building",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-09-10T16:10:00Z",
    is_active: true,
  },

  // Faculty of Medicine
  {
    id: "dept-015",
    name: "Internal Medicine",
    code: "MED",
    faculty: "Medicine",
    description: "Department of Internal Medicine and Clinical Practice",
    head_of_department: "Prof. Dr. Richard Johnson",
    email: "medicine@university.edu",
    phone: "+1-555-0501",
    building: "Medical School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-08-20T12:00:00Z",
    is_active: true,
  },
  {
    id: "dept-016",
    name: "Surgery",
    code: "SURG",
    faculty: "Medicine",
    description: "Department of Surgery and Surgical Procedures",
    head_of_department: "Prof. Dr. Karen Adams",
    email: "surgery@university.edu",
    phone: "+1-555-0502",
    building: "Medical School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-07-12T14:30:00Z",
    is_active: true,
  },
  {
    id: "dept-017",
    name: "Nursing",
    code: "NURS",
    faculty: "Medicine",
    description: "Department of Nursing and Healthcare Management",
    head_of_department: "Prof. Dr. Linda Thompson",
    email: "nursing@university.edu",
    phone: "+1-555-0503",
    building: "Medical School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-06-28T10:15:00Z",
    is_active: true,
  },

  // Faculty of Law
  {
    id: "dept-018",
    name: "Constitutional Law",
    code: "LAW",
    faculty: "Law",
    description: "Department of Law covering constitutional and civil law",
    head_of_department: "Prof. Dr. Michael Roberts",
    email: "law@university.edu",
    phone: "+1-555-0601",
    building: "Law School",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-09-08T11:45:00Z",
    is_active: true,
  },

  // Example of inactive department
  {
    id: "dept-019",
    name: "Agricultural Sciences",
    code: "AGRI",
    faculty: "Agriculture",
    description:
      "Department of Agricultural Sciences (Currently Inactive - Under Restructuring)",
    head_of_department: "Prof. Dr. John Smith",
    email: "agriculture@university.edu",
    phone: "+1-555-0701",
    building: "Agriculture Block",
    created_at: "2020-01-15T08:00:00Z",
    updated_at: "2024-05-15T08:00:00Z",
    is_active: false,
  },
];

// Helper function to get all active departments
export const getActiveDepartments = (): Department[] => {
  return mockDepartments.filter((dept) => dept.is_active);
};

// Helper function to get departments by faculty
export const getDepartmentsByFaculty = (faculty: string): Department[] => {
  return mockDepartments.filter(
    (dept) => dept.faculty === faculty && dept.is_active
  );
};

// Helper function to get all faculties
export const getFaculties = (): string[] => {
  const faculties = mockDepartments
    .filter((dept) => dept.is_active)
    .map((dept) => dept.faculty);
  return [...new Set(faculties)].sort();
};

// Helper function to get department by code
export const getDepartmentByCode = (code: string): Department | undefined => {
  return mockDepartments.find((dept) => dept.code === code && dept.is_active);
};

// Helper function to get department by id
export const getDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find((dept) => dept.id === id && dept.is_active);
};

// Helper function to search departments by name
export const searchDepartments = (query: string): Department[] => {
  const searchTerm = query.toLowerCase();
  return mockDepartments.filter(
    (dept) =>
      dept.is_active &&
      (dept.name.toLowerCase().includes(searchTerm) ||
        dept.code.toLowerCase().includes(searchTerm) ||
        dept.faculty.toLowerCase().includes(searchTerm))
  );
};
