// ==============================================
// CONFIGURACIÓN DE AIRTABLE
// ==============================================
// 1. Creá una base en https://airtable.com con una tabla (ej: "Leads")
//    con columnas: nombre, email, telefono, tipo_negocio, objetivo.
// 2. Generá un token en https://airtable.com/create/tokens
//    - Alcance (scope): SOLO "data.records:write"
//    - Acceso: SOLO a esta base específica (no a todas tus bases)
//    Esto limita el daño si alguien copia el token desde el código
//    del sitio (es público porque el sitio es estático).
// 3. Completá los 3 valores de abajo. NUNCA uses un token con permisos
//    de lectura o de administración acá — quedaría expuesto a cualquiera.
const AIRTABLE_BASE_ID = "PEGA_TU_BASE_ID_AQUI";
const AIRTABLE_TABLE_NAME = "Leads";
const AIRTABLE_TOKEN = "PEGA_TU_TOKEN_SOLO_ESCRITURA_AQUI";
// ==============================================

const answers = {};
let currentStep = 1;
const totalSteps = 4;

function goToStep(step) {
  document.querySelectorAll(".quiz-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });
  currentStep = step;
}

document.querySelectorAll(".option").forEach((btn) => {
  btn.addEventListener("click", () => {
    answers[btn.dataset.field] = btn.dataset.value;
    goToStep(currentStep + 1);
  });
});

const leadForm = document.getElementById("leadForm");

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = leadForm.querySelector(".submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  const formData = new FormData(leadForm);
  const payload = {
    ...answers,
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
  };

  try {
    await sendToAirtable(payload);
    goToStep(4);
  } catch (err) {
    console.error("Error enviando a Airtable:", err);
    submitBtn.disabled = false;
    submitBtn.textContent = "Recibir mi plan gratis";
    alert("Hubo un problema enviando tus datos. Probá de nuevo en unos segundos.");
  }
});

async function sendToAirtable(fields) {
  if (AIRTABLE_BASE_ID.startsWith("PEGA_") || AIRTABLE_TOKEN.startsWith("PEGA_")) {
    console.warn(
      "Airtable no está configurado todavía. Completá AIRTABLE_BASE_ID y AIRTABLE_TOKEN en script.js."
    );
    return;
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!res.ok) {
    throw new Error(`Airtable respondió ${res.status}`);
  }
}
