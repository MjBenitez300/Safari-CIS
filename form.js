// ✅ Generate Unique Patient Number (System-Generated)
function generatePatientNumber(patientType) {
  const prefix = patientType === "employee" ? "EMP" : "GUE";
  const uniqueId = Math.floor(Math.random() * 1000000);
  return `${prefix}-${uniqueId}`;
}

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

document.getElementById("pageTitle").textContent =
  `Add ${patientType.charAt(0).toUpperCase() + patientType.slice(1)} Patient`;

const form = document.getElementById("patientForm");
const backBtn = document.getElementById("backBtn");
backBtn.addEventListener("click", () => window.location.href = "dashboard.html");

// ✅ Department list
const departmentOptions = [
  "HR", "Finance and Corporate Services", "Life Sciences & Education", "Park Grounds", "Engineering",
  "Security", "Parks and Adventure", "Safari Camp", "Base Camp", "Front Office", "Motorpool",
  "Sales & Marketing", "Office of the VP", "ML-Agri Ventures", "Santican Cattle Station",
  "Tunnel Garden", "Tenants-Outpost", "Tenants-Auntie Anne's", "Tenants-Pizzeria Michelangelo",
  "Tenants-Convenient Store", "Other"
];

// ✅ Shared medication options
const medicationOptions = [
  "Paracetamol", "Loperamide", "Mefenamic Acid", "Antacid",
  "Cetirizine", "Hyoscine", "Meclizine", "Other"
];

// ✅ Employee fields
const employeeFields = [
  { id: "patientNumber", label: "Patient Number", type: "text", required: false, readonly: true },
  { id: "lastName", label: "Last Name", type: "text", required: true },
  { id: "firstName", label: "First Name", type: "text", required: true },
  { id: "middleName", label: "Middle Name / Initial", type: "text", required: false },
  { id: "patientAge", label: "Age", type: "number", required: true },
  { id: "sex", label: "Sex", type: "radio", options: ["M", "F"], required: true },
  { id: "patientAddress", label: "Address", type: "text", required: true },
  { id: "civilStatus", label: "Civil Status", type: "text", required: false },
  { id: "department", label: "Department", type: "select", options: departmentOptions, required: true },
  { id: "walkInDate", label: "Walk-in Date", type: "date", required: true },
  {
    id: "chiefComplaint",
    label: "Chief Complaint",
    type: "select",
    required: true,
    options: [
      "Loose Bowel Movement", "Fever", "Cough", "Headache", "Hypogastric Pain",
      "Punctured Wound", "Lacerated Wound", "Animal Bite (Dog, Cat, Other)", "Colds",
      "Body Pain", "Toothache", "Stomach Discomfort", "Epigastric Pain", "Other"
    ]
  },
  {
    id: "medication1",
    label: "Medication 1",
    type: "select",
    required: false,
    options: medicationOptions
  },
  {
    id: "medication2",
    label: "Medication 2",
    type: "select",
    required: false,
    options: medicationOptions
  },
  { id: "history", label: "History of Past Illness", type: "text", required: false }
];

// ✅ Guest fields
const guestFields = employeeFields.filter(f => f.id !== "civilStatus" && f.id !== "department");

// ✅ Build Form Function
function buildForm() {
  form.innerHTML = "";
  const fields = patientType === "employee" ? employeeFields : guestFields;

  fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    wrapper.appendChild(label);

    if (field.id === "patientNumber") {
      const input = document.createElement("input");
      input.type = "text";
      input.id = field.id;
      input.value = generatePatientNumber(patientType);
      input.readOnly = true;
      wrapper.appendChild(input);
    } else if (field.type === "radio") {
      field.options.forEach(opt => {
        const radioLabel = document.createElement("label");
        radioLabel.style.marginLeft = "10px";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = field.id;
        input.value = opt;
        if (field.required) input.required = true;
        radioLabel.appendChild(input);
        radioLabel.appendChild(document.createTextNode(opt === "M" ? "Male" : "Female"));
        wrapper.appendChild(radioLabel);
      });
    } else if (field.type === "select") {
      const select = document.createElement("select");
      select.id = field.id;
      if (field.required) select.required = true;

      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = `Select ${field.label}`;
      select.appendChild(defaultOpt);

      field.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        if (select.value === "Animal Bite (Dog, Cat, Other)") {
          addAnimalTypeField(wrapper);
        } else {
          removeAnimalTypeField(wrapper);
        }

        if (select.value === "Other") {
          addOtherField(wrapper, field.id);
          const otherInput = wrapper.querySelector(`#other-${field.id}`);
          if (otherInput) otherInput.required = true;
        } else {
          removeOtherField(wrapper, field.id);
        }

        if (field.id === "medication1" || field.id === "medication2") {
          if (select.value !== "") addMedicationPcsField(wrapper, field.id);
          else removeMedicationPcsField(wrapper, field.id);
        }
      });

      wrapper.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.type = field.type;
      input.id = field.id;
      if (field.required) input.required = true;
      wrapper.appendChild(input);
    }

    form.appendChild(wrapper);
  });

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Add Patient";
  form.appendChild(btn);
}

// ✅ Helper Functions
function addAnimalTypeField(wrapper) {
  if (!wrapper.querySelector("#animalTypeInput")) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "animalTypeInput";
    input.placeholder = "Specify animal type";
    input.required = true;
    wrapper.appendChild(input);
  }
}
function removeAnimalTypeField(wrapper) {
  const input = wrapper.querySelector("#animalTypeInput");
  if (input) input.remove();
}
function addOtherField(wrapper, fieldId) {
  if (!wrapper.querySelector(`#other-${fieldId}`)) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = `other-${fieldId}`;
    input.placeholder = `Specify ${fieldId}`;
    wrapper.appendChild(input);
  }
}
function removeOtherField(wrapper, fieldId) {
  const input = wrapper.querySelector(`#other-${fieldId}`);
  if (input) input.remove();
}
function addMedicationPcsField(wrapper, medicationId) {
  if (!wrapper.querySelector(`#pcs-${medicationId}`)) {
    const pcsInput = document.createElement("input");
    pcsInput.type = "number";
    pcsInput.id = `pcs-${medicationId}`;
    pcsInput.placeholder = "No. of pcs (0–100)";
    pcsInput.min = "0";
    pcsInput.max = "100";
    pcsInput.required = true;
    pcsInput.style.marginLeft = "10px";
    wrapper.appendChild(pcsInput);
  }
}
function removeMedicationPcsField(wrapper, medicationId) {
  const pcsInput = wrapper.querySelector(`#pcs-${medicationId}`);
  if (pcsInput) pcsInput.remove();
}

// ✅ Submit Form and Save Data
form.addEventListener("submit", async e => {
  e.preventDefault();

  const patientData = {};
  const fields = patientType === "employee" ? employeeFields : guestFields;

  patientData.patientNumber = generatePatientNumber(patientType);

  for (const f of fields) {
    const input = form.querySelector(`#${f.id}`);

    if (f.type === "radio") {
      const checked = form.querySelector(`input[name="${f.id}"]:checked`);
      patientData[f.id] = checked ? checked.value : "";
    } else if (f.type === "select") {
      const select = input;
      let value = select.value;

      // 🛠️ Handle special cases
      if (value === "Animal Bite (Dog, Cat, Other)") {
        const animalInput = form.querySelector("#animalTypeInput");
        value = animalInput ? `Animal Bite - ${animalInput.value.trim()}` : value;
      } else if ((f.id === "medication1" || f.id === "medication2") && value === "Other") {
        const otherInput = form.querySelector(`#other-${f.id}`);
        if (otherInput && otherInput.value.trim()) {
          value = otherInput.value.trim();
        }
      } else if (value === "Other") {
        const otherInput = form.querySelector(`#other-${f.id}`);
        value = otherInput ? otherInput.value.trim() : value;
      }

      // 🧮 Append medication quantity if applicable
      if ((f.id === "medication1" || f.id === "medication2") && value.trim() !== "") {
        const pcsInput = form.querySelector(`#pcs-${f.id}`);
        if (pcsInput && pcsInput.value.trim()) {
          patientData[f.id] = `${value} (${pcsInput.value.trim()} pcs)`;
        } else {
          patientData[f.id] = value;
        }
      } else {
        patientData[f.id] = value;
      }
    } else {
      patientData[f.id] = input.value.trim();
    }
  }

  // ✅ Final computed fields
  patientData.medication1 = patientData.medication1 || "";
  patientData.medication2 = patientData.medication2 || "";
  const meds = [];
  if (patientData.medication1.trim()) meds.push(patientData.medication1.trim());
  if (patientData.medication2.trim()) meds.push(patientData.medication2.trim());
  patientData.medication = meds.join(", ");

  patientData.patientName = `${patientData.lastName}, ${patientData.firstName}`;
  patientData.id = Date.now().toString() + Math.floor(Math.random() * 1000);
  patientData.type = patientType;
  patientData.timestamp = new Date().toISOString();

  try {
    // ✅ Save to Firestore (namespaced version)
    await db.collection("patients").doc(patientData.id).set(patientData);

    // ✅ Local Backup
    const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
    allPatients.push(patientData);
    localStorage.setItem("patients", JSON.stringify(allPatients));

    alert("Patient added successfully!");
    form.reset();
    buildForm();
  } catch (error) {
    console.error("Error saving patient:", error);
    alert("Error saving data to Firestore. Check console for details.");
  }
});

buildForm();
