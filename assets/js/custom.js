document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lab11-contact-form");
  if (!form) return;

  const submitBtn = document.getElementById("lab11-submit-btn");
  const clearBtn = document.getElementById("lab11-clear-btn");
  const resultBox = document.getElementById("lab11-result");

  const fields = {
    vardas: document.getElementById("vardas"),
    pavarde: document.getElementById("pavarde"),
    elpastas: document.getElementById("elpastas"),
    telefonas: document.getElementById("telefonas"),
    adresas: document.getElementById("adresas"),
    vertinimas1: document.getElementById("vertinimas1"),
    vertinimas2: document.getElementById("vertinimas2"),
    vertinimas3: document.getElementById("vertinimas3"),
  };

  const errorEls = {
    vardas: document.getElementById("error-vardas"),
    pavarde: document.getElementById("error-pavarde"),
    elpastas: document.getElementById("error-elpastas"),
    telefonas: document.getElementById("error-telefonas"),
    adresas: document.getElementById("error-adresas"),
    vertinimas1: document.getElementById("error-vertinimas1"),
    vertinimas2: document.getElementById("error-vertinimas2"),
    vertinimas3: document.getElementById("error-vertinimas3"),
  };

  const lettersOnlyRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+(?:[\s-][A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+)*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function formatLithuanianPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, "");

    if (digits.startsWith("370")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("86")) {
      digits = digits.slice(1);
    }

    digits = digits.slice(0,9);
    if (digits.length === 0) {
      return "";
    }

    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 9);

    if (digits.length <= 3) {
      return `+370 ${part1}`;
    }
    return `+370 ${part1} ${part2}`;
  }

  function validateField(name, showError = true) {
    const input = fields[name];
    const errorEl = errorEls[name];
    const val = input.value.trim();
    let errorMessage = "";

    if (name === "vardas" || name === "pavarde") {
      if (!val) {
        errorMessage = name === "vardas"
          ? "Šis laukas privalomas: įveskite vardą."
          : "Šis laukas privalomas: įveskite pavardę.";
      } else if (!lettersOnlyRegex.test(val)) {
        errorMessage = "Lauke gali būti tik raidės.";
      }
    } else if (name === "elpastas") {
      if (!val) {
        errorMessage = "Šis laukas privalomas: įveskite el. pašto adresą.";
      } else if (!emailRegex.test(val)) {
        errorMessage = "Įveskite tinkamą el. pašto formatą (pvz., vardenis@pastas.lt).";
      }
    } else if (name === "telefonas") {
      const digitsOnly = val.replace(/\D/g, "");
      if (!val) {
        errorMessage = "Šis laukas privalomas: įveskite telefono numerį.";
      } else if (!/^\+370 6\d{2} \d{5}$/.test(val) || digitsOnly.length !== 11) {
        errorMessage = "Numeris turi atitikti formatą +370 6xx xxxxx.";
      }
    } else if (name === "adresas") {
      if (!val) {
        errorMessage = "Šis laukas privalomas: įveskite adresą.";
      } else if (val.length < 3) {
        errorMessage = "Adresas turi būti bent 3 simbolių ilgio.";
      }
    } else if (name === "vertinimas1" || name === "vertinimas2" || name === "vertinimas3") {
      const num = Number(val);
      if (val === "") {
        errorMessage = "Šis laukas privalomas (1–10).";
      } else if (!Number.isInteger(num) || num < 1 || num > 10) {
        errorMessage = "Reikšmė turi būti sveikas skaičius nuo 1 iki 10.";
      }
    }

    if (showError) {
      if (errorMessage) {
        input.classList.add("is-invalid-field");
        input.classList.remove("is-valid-field");
        errorEl.textContent = errorMessage;
      } else {
        input.classList.remove("is-invalid-field");
        input.classList.add("is-valid-field");
        errorEl.textContent = "";
      }
    }

    return errorMessage === "";
  }

  function updateSubmitButtonState() {
    const allValid = Object.keys(fields).every((key) => validateField(key, false));
    submitBtn.disabled = !allValid;
  }

  Object.keys(fields).forEach((key) => {
    const input = fields[key];

    input.addEventListener("input", () => {
      if (key === "telefonas") {
        input.value = formatLithuanianPhone(input.value);
      }
      validateField(key, true);
      updateSubmitButtonState();
    });

    input.addEventListener("blur", () => {
      if (key === "telefonas") {
        input.value = formatLithuanianPhone(input.value);
      }
      validateField(key, true);
      updateSubmitButtonState();
    });
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = Object.keys(fields).every((key) => validateField(key, true));
    updateSubmitButtonState();

    if (!isFormValid) {
      resultBox.innerHTML = `<p class="lab11-submit-warning">Patikrinkite paryškintus laukus – yra validacijos klaidų.</p>`;
      return;
    }

    const v1 = Number(fields.vertinimas1.value.trim());
    const v2 = Number(fields.vertinimas2.value.trim());
    const v3 = Number(fields.vertinimas3.value.trim());
    const average = Number(((v1 + v2 + v3) / 3).toFixed(2));

    const formDataObject = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      elPastas: fields.elpastas.value.trim(),
      telefonoNumeris: fields.telefonas.value.trim(),
      adresas: fields.adresas.value.trim(),
      vertinimai: {
        klausimas1: v1,
        klausimas2: v2,
        klausimas3: v3,
      },
      ivertinimuVidurkis: average,
    };

    console.log("Kontaktų formos duomenų objektas:", formDataObject);

    resultBox.innerHTML = `
      <div class="lab11-result-card">
        <div class="lab11-result-details">
          <div>Vardas: ${escapeHtml(formDataObject.vardas)}</div>
          <div>Pavardė: ${escapeHtml(formDataObject.pavarde)}</div>
          <div>El. paštas: <a href="mailto:${escapeHtml(formDataObject.elPastas)}">${escapeHtml(formDataObject.elPastas)}</a></div>
          <div>Tel. Numeris: ${escapeHtml(formDataObject.telefonoNumeris)}</div>
          <div>Adresas: ${escapeHtml(formDataObject.adresas)}</div>
          <div>Vertinimai (1–10): ${v1}, ${v2}, ${v3}</div>
        </div>
        <div class="lab11-average-line">
          ${escapeHtml(formDataObject.vardas)} ${escapeHtml(formDataObject.pavarde)}: ${average}
        </div>
      </div>
    `;
  });

  clearBtn.addEventListener("click", () => {
    form.reset();

    Object.keys(fields).forEach((key) => {
      fields[key].classList.remove("is-invalid-field", "is-valid-field");
      errorEls[key].textContent = "";
    });

    resultBox.innerHTML = "";
    submitBtn.disabled = true;
    fields.vardas.focus();
  });

  updateSubmitButtonState();
});