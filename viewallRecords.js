// ✅ Ensure user is logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first.");
  window.location.href = "index.html";
}

// ✅ Firestore imports
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const recordsTable = document.getElementById("recordsTable");
const viewAllBtn = document.getElementById("viewAllBtn");
const viewGuestBtn = document.getElementById("viewGuestBtn");
const viewEmployeeBtn = document.getElementById("viewEmployeeBtn");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const backBtn = document.getElementById("backBtn");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");

const historySearchSection = document.getElementById("historySearchSection");
const historySearchInput = document.getElementById("historySearchInput");
const historySearchBtn = document.getElementById("historySearchBtn");
const historyResults = document.getElementById("historyResults");

let currentFilter = null;

// ✅ Helper to render table header
function renderTableHeader() {
  recordsTable.innerHTML = "";
  const header = recordsTable.createTHead().insertRow();
  const headers = [
    "Patient ID", "Name", "Age", "Sex", "Address", "Walk-in Date",
    "Department", "Civil Status", "Chief Complaint", "History", "Medication", "Type", "Actions"
  ];
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    header.appendChild(th);
  });
}

// ✅ Load all records (with filter)
async function loadPatients() {
  renderTableHeader();
  const tbody = recordsTable.createTBody();

  let q = collection(db, "patients");
  if (currentFilter) {
    q = query(q, where("type", "==", currentFilter));
  }

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 13; // total columns
    cell.textContent = "No patient records found.";
    cell.style.textAlign = "center";
    return;
  }

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();
    const row = tbody.insertRow();
    row.id = `row-${docSnap.id}`; // Assign unique ID for deletion

    // Medication display
    const medicationDisplay =
      (p.medication1 && p.medication2)
        ? `${p.medication1}, ${p.medication2}`
        : (p.medication1 || p.medication2 || p.medication || p.medicationCombined || "");

    const fields = [
      p.patientNumber || p.patientID || "",
      p.name || p.patientName || "",
      p.patientAge || p.age || "",
      p.sex || "",
      p.patientAddress || p.address || "",
      p.walkInDate || "",
      p.department || "",
      p.civilStatus || "",
      p.chiefComplaint || "",
      p.history || "",
      medicationDisplay,
      p.type || ""
    ];

    fields.forEach(val => {
      const cell = row.insertCell();
      cell.textContent = val;
    });

    // 🔹 Delete button
    const actionCell = row.insertCell();
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "red";
    delBtn.style.color = "white";
    delBtn.style.border = "1px solid black";
    delBtn.style.padding = "5px 10px";
    delBtn.style.cursor = "pointer";
    delBtn.style.fontWeight = "bold";

   delBtn.onclick = async () => {
  if (confirm(`Delete record for ${p.name || p.patientName || "this patient"}?`)) {
    try {
      // ✅ Soft delete instead of permanent delete
      await updateDoc(doc(db, "patients", docSnap.id), { isDeleted: true });

      alert("✅ Record moved to Recycle Bin!");
      const deletedRow = document.getElementById(`row-${docSnap.id}`);
      if (deletedRow) deletedRow.remove(); // Remove row immediately from main table
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("❌ Failed to move record to Recycle Bin. Check console for details.");
    }
  }
};

    actionCell.appendChild(delBtn);
  });
}

// ✅ Button filters
viewAllBtn.onclick = () => {
  currentFilter = null;
  loadPatients();
  hideHistorySearch();
};
viewGuestBtn.onclick = () => {
  currentFilter = "guest";
  loadPatients();
  hideHistorySearch();
};
viewEmployeeBtn.onclick = () => {
  currentFilter = "employee";
  loadPatients();
  hideHistorySearch();
};

// ✅ Print table
printBtn.onclick = () => {
  if (recordsTable.rows.length === 0) return alert("No records to print.");
  const newWin = window.open("", "", "width=900,height=600");
  newWin.document.write(`
    <html><head><title>Print</title><style>
      table{width:100%;border-collapse:collapse;}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;}
      th{background:#007bff;color:#fff;}
    </style></head><body>
    ${recordsTable.outerHTML}
    </body></html>
  `);
  newWin.document.close();
  newWin.print();
};

// ✅ Export to CSV
exportBtn.onclick = () => {
  if (recordsTable.rows.length === 0) return alert("No records to export.");
  const rows = [...recordsTable.rows].map(r =>
    [...r.cells].map(c => `"${c.textContent}"`).join(",")
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "patient_records.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// ✅ Delete all visible records
deleteAllBtn.onclick = async () => {
  if (!confirm("Delete all displayed records?")) return;

  try {
    let q = collection(db, "patients");
    if (currentFilter) {
      q = query(q, where("type", "==", currentFilter));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      alert("No records to delete.");
      return;
    }

    const deletions = snapshot.docs.map(docSnap => deleteDoc(doc(db, "patients", docSnap.id)));
    await Promise.all(deletions);

    alert("🗑️ All records deleted successfully!");
    loadPatients();
  } catch (error) {
    console.error("Error deleting records:", error);
    alert("❌ Failed to delete all records. Check console for details.");
  }
};

// ✅ Navigation
backBtn.onclick = () => window.location.href = "dashboard.html";

// ✅ History search toggle
viewHistoryBtn.onclick = () => {
  if (historySearchSection.style.display === "none" || historySearchSection.style.display === "") {
    showHistorySearch();
  } else {
    hideHistorySearch();
  }
};

function showHistorySearch() {
  historySearchSection.style.display = "block";
  historySearchInput.focus();
  historyResults.innerHTML = "";
  historySearchInput.value = "";
  historySearchSection.scrollIntoView({ behavior: "smooth" });
}

function hideHistorySearch() {
  historySearchSection.style.display = "none";
  historyResults.innerHTML = "";
  historySearchInput.value = "";
}

// ✅ Initial load
loadPatients();
