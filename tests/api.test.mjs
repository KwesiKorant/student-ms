// Automated Acceptance Criteria & Security Verification Suite for Auspify Task 2
// Tests all criteria (AC-1 through AC-8) and architectural requirements

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function isServerUp(url) {
  try {
    const res = await fetch(`${url}/api/v1/departments`, { signal: AbortSignal.timeout(2000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runTests() {
  console.log("==========================================================");
  console.log("   ARCFIELD SYSTEMS — AUSPIFY TASK 2 TEST SUITE          ");
  console.log("   Validating AC-1 through AC-8 & Security Controls       ");
  console.log(`   Target Server: ${BASE_URL}                            `);
  console.log("==========================================================\n");

  const serverReady = await isServerUp(BASE_URL);
  if (!serverReady) {
    console.error(`✗ ERROR: Server at ${BASE_URL} is not responding.`);
    console.error("  Please ensure the application is running via 'npm run dev' or 'npm start'.\n");
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Unique IP per test suite run guarantees clean sliding-window rate limit isolation
  const SUITE_IP = `10.42.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200) + 1}`;
  async function apiFetch(url, init = {}) {
    const headers = {
      ...(init.headers || {}),
      "X-Forwarded-For": SUITE_IP,
    };
    return fetch(url, { ...init, headers });
  }

  try {
    // ----------------------------------------------------
    // Test 1: Department Registry
    // ----------------------------------------------------
    console.log("--> Testing GET /api/v1/departments");
    const deptRes = await apiFetch(`${BASE_URL}/api/v1/departments`);
    const deptJson = await deptRes.json();
    assert(deptRes.status === 200, "Departments returns status 200");
    assert(Array.isArray(deptJson.data) && deptJson.data.length >= 5, "Returns at least 5 seeded departments");
    const csDept = deptJson.data.find((d) => d.code === "CS");
    assert(!!csDept, "Computer Science (CS) department exists");

    // ----------------------------------------------------
    // Test 2: Student Directory Listing & Pagination
    // ----------------------------------------------------
    console.log("\n--> Testing GET /api/v1/students (Pagination & Directory)");
    const listRes = await apiFetch(`${BASE_URL}/api/v1/students?page=1&limit=10`);
    const listJson = await listRes.json();
    assert(listRes.status === 200, "Student directory returns status 200");
    assert(Array.isArray(listJson.data) && listJson.data.length === 10, "Returns 10 students per page");
    assert(listJson.pagination.totalRecords >= 18, `Total active records recorded (${listJson.pagination.totalRecords})`);

    // ----------------------------------------------------
    // Test 3: Search Filter & Multi-Word Match (AC-4)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-4: Real-Time Directory Search (Single & Multi-Word)");
    const searchRes = await apiFetch(`${BASE_URL}/api/v1/students?search=Kwame`);
    const searchJson = await searchRes.json();
    assert(searchRes.status === 200, "Search returns status 200");
    assert(searchJson.data.some((s) => s.firstName === "Kwame"), "Search matches 'Kwame'");

    const multiWordRes = await apiFetch(`${BASE_URL}/api/v1/students?search=Kwame+Mensah`);
    const multiWordJson = await multiWordRes.json();
    assert(multiWordRes.status === 200, "Multi-word search returns status 200");
    assert(multiWordJson.data.some((s) => s.firstName === "Kwame" && s.lastName === "Mensah"), "Multi-word search matches 'Kwame Mensah'");

    // Test 3b: Department Sorting
    console.log("\n--> Testing Department Sorting (sortBy=department)");
    const sortDeptRes = await apiFetch(`${BASE_URL}/api/v1/students?sortBy=department&sortOrder=asc&limit=5`);
    const sortDeptJson = await sortDeptRes.json();
    assert(sortDeptRes.status === 200, "Department sort returns status 200");
    assert(sortDeptJson.data.length > 0, "Department sort returns records");

    // ----------------------------------------------------
    // Test 4: Student Record Creation (AC-1)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-1: POST /api/v1/students (Valid Enrollment with Auto-generated ID)");
    const testEmail = `test.student.${Date.now()}@university.edu`;
    const createPayload = {
      firstName: "Gabriel",
      lastName: "Kofi",
      email: testEmail,
      departmentId: csDept.id,
      academicYear: 2,
      gpa: 3.85,
      dateOfBirth: "2004-03-15",
      phone: "+233-20-111-2233",
      status: "ACTIVE",
    };
    const createRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, "Enrollment returns status 201 Created");
    assert(createJson.data.email === testEmail, "Created student email matches");
    assert(createJson.data.studentId.startsWith("STU-"), `Generated unique ID format (${createJson.data.studentId})`);
    const createdId = createJson.data.id;

    // Test 4b: Manual Student ID ingestion
    console.log("\n--> Testing FR-1.2: Manual Student ID Ingestion");
    const manualHex = Math.floor(1000 + Math.random() * 8000).toString(16).toUpperCase().padStart(4, "0");
    const manualStudentId = `STU-2026-${manualHex}`;
    const manualEmail = `manual.id.${Date.now()}@university.edu`;
    const manualRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createPayload,
        email: manualEmail,
        studentId: manualStudentId,
      }),
    });
    const manualJson = await manualRes.json();
    assert(manualRes.status === 201, "Manual Student ID enrollment returns 201 Created");
    assert(manualJson.data.studentId === manualStudentId, `Manual Student ID ingested accurately (${manualJson.data.studentId})`);

    // Duplicate Student ID conflict test
    const dupIdRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createPayload,
        email: `dup.id.${Date.now()}@university.edu`,
        studentId: manualStudentId,
      }),
    });
    assert(dupIdRes.status === 409, "Duplicate manual Student ID returns 409 Conflict");

    // ----------------------------------------------------
    // Test 5: Validation Bounds (AC-2)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-2: Validation Bounds Enforcement");
    const invalidGpaRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createPayload, email: `bad.gpa.${Date.now()}@uni.edu`, gpa: 4.85 }),
    });
    assert(invalidGpaRes.status === 400, "Submitting GPA > 4.0 returns 400 Bad Request");

    const invalidEmailRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createPayload, email: "not-an-email" }),
    });
    assert(invalidEmailRes.status === 400, "Submitting invalid email returns 400 Bad Request");

    // ----------------------------------------------------
    // Test 6: Conflict Handling (AC-3)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-3: Duplicate Email Conflict Handling");
    const conflictRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createPayload, email: testEmail }),
    });
    assert(conflictRes.status === 409, "Duplicate email returns 409 Conflict");

    // ----------------------------------------------------
    // Test 7: Inspection & Audit Trail (AC-5)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-5: Profile Inspection & Audit Trail");
    const detailRes = await apiFetch(`${BASE_URL}/api/v1/students/${createdId}`);
    const detailJson = await detailRes.json();
    assert(detailRes.status === 200, "Detail fetch returns status 200");
    assert(detailJson.data.id === createdId, "Detail returns correct student");
    assert(detailJson.data.auditLogs && detailJson.data.auditLogs.length > 0, "Audit logs attached to student");
    assert(detailJson.data.auditLogs[0].action === "CREATE", "Audit log records CREATE event");

    // ----------------------------------------------------
    // Test 8: Parity Record Modification (AC-6)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-6: Record Modification (PUT)");
    const updateRes = await apiFetch(`${BASE_URL}/api/v1/students/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpa: 3.95, academicYear: 3 }),
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, "Update returns status 200 OK");
    assert(updateJson.data.gpa === 3.95, "GPA updated to 3.95");
    assert(updateJson.data.academicYear === 3, "Academic year updated to 3");

    // ----------------------------------------------------
    // Test 9: Safe Archival (AC-7)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-7: Safe Soft Archival (DELETE)");
    const archiveRes = await apiFetch(`${BASE_URL}/api/v1/students/${createdId}`, {
      method: "DELETE",
    });
    const archiveJson = await archiveRes.json();
    assert(archiveRes.status === 200, "Soft archival returns status 200 OK");
    assert(archiveJson.data.isArchived === true, "Student isArchived flag set to true");

    // ----------------------------------------------------
    // Test 10: Record Restoration
    // ----------------------------------------------------
    console.log("\n--> Testing Archival Restoration (POST /restore)");
    const restoreRes = await apiFetch(`${BASE_URL}/api/v1/students/${createdId}/restore`, {
      method: "POST",
    });
    const restoreJson = await restoreRes.json();
    assert(restoreRes.status === 200, "Restore returns status 200 OK");
    assert(restoreJson.data.isArchived === false, "Student restored (isArchived false)");

    // Defensive handling checks
    console.log("\n--> Testing Defensive Edge Case Handling");
    const malformedRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not_a_valid_json_string",
    });
    const malformedJson = await malformedRes.json();
    assert(malformedRes.status === 400, "Malformed JSON returns 400 Bad Request");
    assert(malformedJson.error === "MALFORMED_JSON", "Returns MALFORMED_JSON domain error code");

    const invalidFkRes = await apiFetch(`${BASE_URL}/api/v1/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "ForeignKey",
        email: `invalid.fk.${Date.now()}@uni.edu`,
        departmentId: "non_existent_department_id",
      }),
    });
    const invalidFkJson = await invalidFkRes.json();
    assert(invalidFkRes.status === 400, "Invalid department ID returns 400 Bad Request");
    assert(invalidFkJson.error === "INVALID_RELATION", "Returns INVALID_RELATION domain error code");

    // ----------------------------------------------------
    // Test 11: Rate Limiter Flooding (AC-8)
    // ----------------------------------------------------
    console.log("\n--> Testing AC-8: Sliding-Window Rate Limiting Defense (429)");
    const FLOOD_IP = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    let got429 = false;
    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/students/${createdId}/restore`, {
        method: "POST",
        headers: { "X-Forwarded-For": FLOOD_IP },
      });
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    assert(got429, "Flooding mutation endpoint triggered 429 Too Many Requests");

    // ----------------------------------------------------
    // Test 12: Root UI Render & Security Headers
    // ----------------------------------------------------
    console.log("\n--> Testing Root Portal Homepage Render & Security Headers");
    const pageRes = await fetch(`${BASE_URL}/`);
    const pageHtml = await pageRes.text();
    assert(pageRes.status === 200, "Portal homepage returns status 200");
    assert(pageHtml.includes("ARCFIELD SYSTEMS"), "Page contains 'ARCFIELD SYSTEMS' brand");
    assert(pageHtml.includes("Student Directory"), "Page contains 'Student Directory'");

    // Security Headers & Info Leakage
    console.log("\n--> Testing Security Headers & Information Leakage Defense");
    assert(pageRes.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff present");
    assert(pageRes.headers.get("x-frame-options") === "DENY", "X-Frame-Options: DENY present");
    assert(pageRes.headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy present");
    assert(!pageRes.headers.get("x-powered-by"), "X-Powered-By header suppressed");

  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(`   TEST EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
