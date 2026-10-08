import { PrismaClient, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding institutional departments...");

  const departmentsData = [
    {
      code: "CS",
      name: "Computer Science",
      description: "Department of Computer Science, Software Engineering, and AI",
    },
    {
      code: "EE",
      name: "Electrical Engineering",
      description: "Department of Electrical and Electronic Systems Engineering",
    },
    {
      code: "ME",
      name: "Mechanical Engineering",
      description: "Department of Mechanical, Robotics, and Aerospace Systems",
    },
    {
      code: "BUS",
      name: "Business Administration",
      description: "School of Global Business, Finance, and Strategic Management",
    },
    {
      code: "BMS",
      name: "Biomedical Sciences",
      description: "Department of Biomedical Sciences, Genetics, and Biotechnology",
    },
  ];

  const departmentMap = new Map<string, string>();

  for (const dept of departmentsData) {
    const record = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
      },
      create: {
        code: dept.code,
        name: dept.name,
        description: dept.description,
      },
    });
    departmentMap.set(dept.code, record.id);
  }

  console.log("Seeded 5 departments.");

  console.log("Seeding student records and audit trails...");

  const studentsData = [
    {
      studentId: "STU-2026-4F1A",
      firstName: "Kwame",
      lastName: "Mensah",
      email: "kwame.mensah@university.edu",
      dateOfBirth: "2004-05-14",
      phone: "+233-24-123-4567",
      deptCode: "CS",
      academicYear: 3,
      gpa: 3.82,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-9B2C",
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena.rostova@university.edu",
      dateOfBirth: "2003-11-20",
      phone: "+44-7700-900123",
      deptCode: "CS",
      academicYear: 4,
      gpa: 3.95,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2026-8D3E",
      firstName: "Marcus",
      lastName: "Thorne",
      email: "marcus.thorne@university.edu",
      dateOfBirth: "2005-02-18",
      phone: "+1-415-555-0142",
      deptCode: "ME",
      academicYear: 2,
      gpa: 3.41,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2024-1A9F",
      firstName: "Aisha",
      lastName: "Al-Mansoor",
      email: "aisha.almansoor@university.edu",
      dateOfBirth: "2002-08-30",
      phone: "+971-50-123-4567",
      deptCode: "BUS",
      academicYear: 4,
      gpa: 3.88,
      status: EnrollmentStatus.GRADUATED,
      isArchived: false,
    },
    {
      studentId: "STU-2026-3C7B",
      firstName: "Chen",
      lastName: "Wei",
      email: "chen.wei@university.edu",
      dateOfBirth: "2004-12-05",
      phone: "+65-9123-4567",
      deptCode: "EE",
      academicYear: 3,
      gpa: 3.76,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2027-5E2A",
      firstName: "Sofia",
      lastName: "Rossi",
      email: "sofia.rossi@university.edu",
      dateOfBirth: "2005-07-22",
      phone: "+39-02-555-0199",
      deptCode: "BMS",
      academicYear: 1,
      gpa: 3.65,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-7H4D",
      firstName: "David",
      lastName: "O'Connor",
      email: "david.oconnor@university.edu",
      dateOfBirth: "2003-03-15",
      phone: "+353-87-555-0122",
      deptCode: "ME",
      academicYear: 3,
      gpa: 2.94,
      status: EnrollmentStatus.INACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2026-2K8L",
      firstName: "Fatima",
      lastName: "Zahra",
      email: "fatima.zahra@university.edu",
      dateOfBirth: "2004-10-10",
      phone: "+212-66-123-4567",
      deptCode: "CS",
      academicYear: 2,
      gpa: 3.91,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2024-6N1P",
      firstName: "Hiroshi",
      lastName: "Tanaka",
      email: "hiroshi.tanaka@university.edu",
      dateOfBirth: "2002-04-03",
      phone: "+81-90-5555-0188",
      deptCode: "EE",
      academicYear: 4,
      gpa: 3.52,
      status: EnrollmentStatus.GRADUATED,
      isArchived: false,
    },
    {
      studentId: "STU-2026-9Q3R",
      firstName: "Amara",
      lastName: "Okafor",
      email: "amara.okafor@university.edu",
      dateOfBirth: "2005-01-29",
      phone: "+234-802-555-0177",
      deptCode: "BMS",
      academicYear: 2,
      gpa: 3.84,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-4S6T",
      firstName: "Lucas",
      lastName: "Silva",
      email: "lucas.silva@university.edu",
      dateOfBirth: "2003-09-17",
      phone: "+55-11-98765-4321",
      deptCode: "BUS",
      academicYear: 3,
      gpa: 3.29,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2026-8U2V",
      firstName: "Maya",
      lastName: "Patel",
      email: "maya.patel@university.edu",
      dateOfBirth: "2004-06-08",
      phone: "+91-98200-12345",
      deptCode: "CS",
      academicYear: 3,
      gpa: 3.98,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-1W5X",
      firstName: "Liam",
      lastName: "Johansson",
      email: "liam.johansson@university.edu",
      dateOfBirth: "2003-12-19",
      phone: "+46-70-123-4567",
      deptCode: "ME",
      academicYear: 3,
      gpa: 2.45,
      status: EnrollmentStatus.SUSPENDED,
      isArchived: false,
    },
    {
      studentId: "STU-2027-3Y7Z",
      firstName: "Zara",
      lastName: "Khan",
      email: "zara.khan@university.edu",
      dateOfBirth: "2006-03-11",
      phone: "+92-300-555-0133",
      deptCode: "BMS",
      academicYear: 1,
      gpa: 3.73,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2026-5B9C",
      firstName: "Alex",
      lastName: "Rivera",
      email: "alex.rivera@university.edu",
      dateOfBirth: "2004-08-25",
      phone: "+1-212-555-0182",
      deptCode: "BUS",
      academicYear: 2,
      gpa: 3.15,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-7D1E",
      firstName: "Chloe",
      lastName: "Martin",
      email: "chloe.martin@university.edu",
      dateOfBirth: "2003-05-30",
      phone: "+33-6-555-0144",
      deptCode: "CS",
      academicYear: 4,
      gpa: 3.68,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2026-9F3G",
      firstName: "Ethan",
      lastName: "Wright",
      email: "ethan.wright@university.edu",
      dateOfBirth: "2005-04-14",
      phone: "+1-312-555-0195",
      deptCode: "EE",
      academicYear: 2,
      gpa: 3.33,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    {
      studentId: "STU-2025-2H5J",
      firstName: "Nia",
      lastName: "Williams",
      email: "nia.williams@university.edu",
      dateOfBirth: "2003-07-07",
      phone: "+1-404-555-0163",
      deptCode: "BUS",
      academicYear: 3,
      gpa: 3.59,
      status: EnrollmentStatus.ACTIVE,
      isArchived: false,
    },
    // Archived records for soft-delete & verification testing
    {
      studentId: "STU-2023-0A1B",
      firstName: "Oliver",
      lastName: "Bennett",
      email: "oliver.bennett@university.edu",
      dateOfBirth: "2001-09-12",
      phone: "+44-7700-900555",
      deptCode: "ME",
      academicYear: 5,
      gpa: 3.12,
      status: EnrollmentStatus.INACTIVE,
      isArchived: true,
      archivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      studentId: "STU-2024-8K2M",
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@university.edu",
      dateOfBirth: "2002-10-23",
      phone: "+91-98111-22334",
      deptCode: "BMS",
      academicYear: 4,
      gpa: 3.94,
      status: EnrollmentStatus.GRADUATED,
      isArchived: true,
      archivedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  ];

  for (const s of studentsData) {
    const deptId = departmentMap.get(s.deptCode);
    if (!deptId) continue;

    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: {
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: s.dateOfBirth,
        phone: s.phone,
        departmentId: deptId,
        academicYear: s.academicYear,
        gpa: s.gpa,
        status: s.status,
        isArchived: s.isArchived,
        archivedAt: s.archivedAt || null,
      },
      create: {
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        dateOfBirth: s.dateOfBirth,
        phone: s.phone,
        departmentId: deptId,
        academicYear: s.academicYear,
        gpa: s.gpa,
        status: s.status,
        isArchived: s.isArchived,
        archivedAt: s.archivedAt || null,
      },
    });

    // Create Audit Log for record creation
    await prisma.auditLog.create({
      data: {
        studentId: student.id,
        action: "CREATE",
        details: JSON.stringify({
          event: "Initial enrollment registration",
          studentId: student.studentId,
          academicYear: student.academicYear,
          status: student.status,
        }),
        performedBy: "system_seeder",
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    });

    // If archived, add ARCHIVE audit log
    if (s.isArchived) {
      await prisma.auditLog.create({
        data: {
          studentId: student.id,
          action: "ARCHIVE",
          details: JSON.stringify({
            event: "Administrative soft archival",
            reason: s.status === EnrollmentStatus.GRADUATED ? "Graduated cohort archival" : "Administrative inactive status",
            previousStatus: s.status,
          }),
          performedBy: "registrar_lead",
          timestamp: s.archivedAt || new Date(),
        },
      });
    }
  }

  console.log("Successfully seeded 20 students with comprehensive audit logs.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
