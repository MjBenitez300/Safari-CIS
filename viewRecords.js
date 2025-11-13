// ✅ Check if logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first.");
  window.location.href = "index.html";
}

// ✅ Get patient type from URL
const urlParams = new URLSearchParams(window.location.search);
const patientType = urlParams.get("type");
if (!patientType || !["guest", "employee"].includes(patientType)) {
  alert("Invalid patient type.");
  window.location.href = "dashboard.html";
}

// ✅ Set page title dynamically
document.getElementById("pageTitle").textContent = `View My ${patientType.charAt(0).toUpperCase() + patientType.slice(1)} Records`;

// ✅ Get button references
const recordsTable = document.getElementById("recordsTable");
const backBtn = document.getElementById("backBtn");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const downloadStatsBtn = document.getElementById("downloadStatsBtn");
const viewHistoryBtn = document.getElementById("viewHistoryBtn"); // optional button

// ✅ Simple green popup for success messages
function showPopup(message, color = "green") {
  const popup = document.createElement("div");
  popup.textContent = message;
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.background = color;
  popup.style.color = "white";
  popup.style.padding = "10px 20px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  popup.style.zIndex = "9999";
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}

// ✅ Navigation Buttons
backBtn.addEventListener("click", () => (window.location.href = "dashboard.html"));
if (viewHistoryBtn) {
  viewHistoryBtn.addEventListener("click", () => (window.location.href = "history.html"));
}

// ✅ Define data structure fields
const employeeExtraFields = [{ id: "patientID", label: "Patient ID" }];
const commonFields = [
  { id: "patientName", label: "Patient Name" },
  { id: "patientAge", label: "Age" },
  { id: "sex", label: "Sex" },
  { id: "patientAddress", label: "Address" },
  { id: "civilStatus", label: "Civil Status" },
  { id: "department", label: "Department" },
  { id: "walkInDate", label: "Walk-in Date" },
  { id: "chiefComplaint", label: "Chief Complaint" },
  { id: "history", label: "History of Past Illness" },
  { id: "medication", label: "Medication" },
];

const fields =
  patientType === "employee"
    ? [...employeeExtraFields, ...commonFields]
    : commonFields.filter((f) => !["civilStatus", "department"].includes(f.id));

// ✅ Render Table Header
function renderTableHeader() {
  recordsTable.innerHTML = "";
  const header = recordsTable.createTHead();
  const row = header.insertRow();

  fields.forEach((f) => {
    const th = document.createElement("th");
    th.textContent = f.label;
    row.appendChild(th);
  });

  ["Timestamp", "Actions"].forEach((txt) => {
    const th = document.createElement("th");
    th.textContent = txt;
    row.appendChild(th);
  });
}

// ✅ Load current user’s records
function loadRecords() {
  const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  return allPatients.filter(
    (p) => p.type === patientType && p.savedBy === loggedInUser.username
  );
}

// ✅ Render Records in Table
function renderRecords() {
  renderTableHeader();
  const patients = loadRecords();
  const tbody = recordsTable.createTBody();

  if (patients.length === 0) {
    const emptyRow = tbody.insertRow();
    const cell = emptyRow.insertCell();
    cell.colSpan = fields.length + 2;
    cell.style.textAlign = "center";
    cell.textContent = "No records found.";
    return;
  }

  patients.forEach((p) => {
    const row = tbody.insertRow();

    fields.forEach((f) => {
      const cell = row.insertCell();
      if (f.id === "sex") {
        cell.textContent = p.sex === "M" ? "Male" : "Female";
      } else if (f.id === "chiefComplaint" && p.chiefComplaint === "Other" && p.otherChiefComplaint) {
        cell.textContent = p.otherChiefComplaint;
      } else if (f.id === "medication" && p.medication === "Other" && p.medicationOther) {
        // ✅ Fix blank medication
        cell.textContent = p.medicationOther;
      } else {
        cell.textContent = p[f.id] || "";
      }
    });

    // ✅ Timestamp Cell
    const cellTimestamp = row.insertCell();
    cellTimestamp.textContent = p.timestamp || "";

    // ✅ Delete Button Cell
    const cellActions = row.insertCell();
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "red";
    delBtn.style.color = "white";
    delBtn.style.border = "none";
    delBtn.style.padding = "5px 10px";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this record?")) {
        deleteRecord(p.id);
      }
    };
    cellActions.appendChild(delBtn);
  });
}

// ✅ Delete one record
function deleteRecord(id) {
  let allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  allPatients = allPatients.filter((p) => p.id !== id);
  localStorage.setItem("patients", JSON.stringify(allPatients));
  showPopup("Record deleted successfully!");
  renderRecords();
}

// ✅ Print Table
printBtn.addEventListener("click", () => {
  const printContents = recordsTable.outerHTML;
  const originalContents = document.body.innerHTML;
  document.body.innerHTML = `<h1>${document.getElementById("pageTitle").textContent}</h1>` + printContents;
  window.print();
  document.body.innerHTML = originalContents;
  attachEventListeners();
  renderRecords();
});

// ✅ Export to Excel (CSV)
exportBtn.addEventListener("click", () => {
  const patients = loadRecords();
  if (patients.length === 0) return alert("No records to export.");

  const headers = fields.map((f) => `"${f.label}"`).join(",") + `,"Timestamp"`;
  const csvRows = [headers];

  patients.forEach((p) => {
    const row = fields.map((f) => {
      if (f.id === "sex") {
        return p.sex === "M" ? '"Male"' : '"Female"';
      } else if (f.id === "chiefComplaint" && p.chiefComplaint === "Other" && p.otherChiefComplaint) {
        return `"${p.otherChiefComplaint}"`;
      } else if (f.id === "medication" && p.medication === "Other" && p.medicationOther) {
        return `"${p.medicationOther}"`;
      } else {
        return `"${p[f.id] || ""}"`;
      }
    });
    row.push(`"${p.timestamp || ""}"`);
    csvRows.push(row.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${patientType}_records_${loggedInUser.username}.csv`;
  link.click();
  showPopup("Records exported successfully!");
});

// ✅ Delete All Records
deleteAllBtn.addEventListener("click", () => {
  if (!confirm(`Delete ALL your ${patientType} records? This cannot be undone.`)) return;
  let allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  allPatients = allPatients.filter(
    (p) => !(p.type === patientType && p.savedBy === loggedInUser.username)
  );
  localStorage.setItem("patients", JSON.stringify(allPatients));
  showPopup("All records deleted!");
  renderRecords();
});

// ✅ Download Complaint & Medication Stats
downloadStatsBtn.addEventListener("click", () => {
  const patients = loadRecords();
  if (patients.length === 0) return alert("No records to generate stats.");

  const countOccurrences = (arr) =>
    arr.reduce((acc, val) => {
      if (val) acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

  const complaints = countOccurrences(
    patients.map((p) =>
      p.chiefComplaint === "Other" && p.otherChiefComplaint
        ? p.otherChiefComplaint
        : p.chiefComplaint
    )
  );

  const meds = countOccurrences(
    patients.map((p) =>
      p.medication === "Other" && p.medicationOther
        ? p.medicationOther
        : p.medication
    )
  );

  const csv = ['"Category","Item","Count"'];
  Object.entries(complaints).forEach(([k, v]) =>
    csv.push(`"Chief Complaint","${k}",${v}`)
  );
  Object.entries(meds).forEach(([k, v]) =>
    csv.push(`"Medication","${k}",${v}`)
  );

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${patientType}_stats_${loggedInUser.username}.csv`;
  link.click();
  showPopup("Statistics downloaded!");
});

// ✅ Restore buttons after printing
function attachEventListeners() {
  backBtn.addEventListener("click", () => (window.location.href = "dashboard.html"));
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener("click", () => (window.location.href = "history.html"));
  }
  printBtn.addEventListener("click", () => {
    const printContents = recordsTable.outerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = `<h1>${document.getElementById("pageTitle").textContent}</h1>` + printContents;
    window.print();
    document.body.innerHTML = originalContents;
    attachEventListeners();
    renderRecords();
  });
}

// ✅ Initial render
renderRecords();
