// =========================================================
// Sorteador de Números
// =========================================================

const MAX_QUANTITY = 100; // limite para manter o resultado legível na tela
const ROLL_DURATION = 700; // ms que cada número fica "girando"
const ROLL_STAGGER = 120; // ms de atraso entre um número e o próximo
const ROLL_TICK = 50; // ms entre cada troca de número durante a animação

const form = document.querySelector("#draw-form");
const quantityInput = document.querySelector("#quantity");
const minInput = document.querySelector("#min");
const maxInput = document.querySelector("#max");
const noRepeatInput = document.querySelector("#no-repeat");
const drawButton = document.querySelector("#draw-button");
const message = document.querySelector("#message");
const resultList = document.querySelector("#result-list");
const resultMeta = document.querySelector("#result-meta");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------
// Mensagens
// ---------------------------------------------------------
function showMessage(text, type) {
  message.textContent = text;
  message.className = `message is-${type}`;
  message.hidden = false;
}

function hideMessage() {
  message.hidden = true;
  message.textContent = "";
}

function clearInvalid() {
  [quantityInput, minInput, maxInput].forEach((input) => {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  });
}

function markInvalid(input) {
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", "message");
}

// ---------------------------------------------------------
// Validação
// Retorna { ok: true, values } ou { ok: false, error, field }
// ---------------------------------------------------------
function validate() {
  const fields = [
    { input: quantityInput, label: "Quantidade de números" },
    { input: minInput, label: "Mínimo" },
    { input: maxInput, label: "Máximo" },
  ];

  // 1. Campos vazios
  for (const { input, label } of fields) {
    if (input.value.trim() === "") {
      return { ok: false, field: input, error: `Preencha o campo “${label}”.` };
    }
  }

  // 2. Apenas números inteiros
  for (const { input, label } of fields) {
    if (!Number.isInteger(Number(input.value))) {
      return { ok: false, field: input, error: `O campo “${label}” precisa ser um número inteiro.` };
    }
  }

  const quantity = Number(quantityInput.value);
  const min = Number(minInput.value);
  const max = Number(maxInput.value);
  const noRepeat = noRepeatInput.checked;

  // 3. Quantidade válida
  if (quantity < 1) {
    return { ok: false, field: quantityInput, error: "Sorteie pelo menos 1 número." };
  }

  if (quantity > MAX_QUANTITY) {
    return { ok: false, field: quantityInput, error: `Você pode sortear no máximo ${MAX_QUANTITY} números por vez.` };
  }

  // 4. Máximo maior que o mínimo
  if (max <= min) {
    return { ok: false, field: maxInput, error: "O valor máximo precisa ser maior que o valor mínimo." };
  }

  // 5. Sem repetição: quantidade não pode passar do intervalo
  const available = max - min + 1;
  if (noRepeat && quantity > available) {
    return {
      ok: false,
      field: quantityInput,
      error: `Entre ${min} e ${max} existem só ${available} números. Diminua a quantidade, aumente o intervalo ou permita repetições.`,
    };
  }

  return { ok: true, values: { quantity, min, max, noRepeat } };
}

// ---------------------------------------------------------
// Sorteio
// ---------------------------------------------------------

// Inteiro aleatório entre min e max, incluindo os dois
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Com repetição: cada número é independente
function drawWithRepetition(quantity, min, max) {
  return Array.from({ length: quantity }, () => randomInt(min, max));
}

// Sem repetição: Fisher-Yates parcial "virtual".
// Funciona mesmo com intervalos gigantes, pois só guarda as posições trocadas.
function drawWithoutRepetition(quantity, min, max) {
  const size = max - min + 1;
  const swapped = new Map();
  const result = [];

  for (let i = 0; i < quantity; i++) {
    const j = i + Math.floor(Math.random() * (size - i));
    const valueAtJ = swapped.has(j) ? swapped.get(j) : j;
    const valueAtI = swapped.has(i) ? swapped.get(i) : i;
    swapped.set(j, valueAtI);
    result.push(valueAtJ + min);
  }

  return result;
}

function draw({ quantity, min, max, noRepeat }) {
  return noRepeat
    ? drawWithoutRepetition(quantity, min, max)
    : drawWithRepetition(quantity, min, max);
}

// ---------------------------------------------------------
// Exibição + animação
// ---------------------------------------------------------
function clearResults() {
  resultList.innerHTML = "";
  resultMeta.textContent = "";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Faz um item "girar" números aleatórios e revela o valor final
function animateItem(item, finalValue, min, max, delay) {
  return new Promise((resolve) => {
    if (prefersReducedMotion) {
      item.textContent = finalValue;
      item.classList.add("is-revealed");
      resolve();
      return;
    }

    setTimeout(() => {
      const interval = setInterval(() => {
        item.textContent = randomInt(min, max);
      }, ROLL_TICK);

      setTimeout(() => {
        clearInterval(interval);
        item.textContent = finalValue;
        item.classList.remove("is-rolling");
        item.classList.add("is-revealed");
        resolve();
      }, ROLL_DURATION);
    }, delay);
  });
}

async function showResults(numbers, { min, max, noRepeat }) {
  clearResults();
  resultList.setAttribute("aria-busy", "true");

  const items = numbers.map((_, index) => {
    const li = document.createElement("li");
    li.className = "result-item is-rolling";
    li.textContent = "?";
    li.style.animationDelay = `${Math.min(index * 30, 600)}ms`;
    resultList.append(li);
    return li;
  });

  // Com muitos números, encurta o atraso para a animação não ficar longa demais
  const stagger = Math.min(ROLL_STAGGER, 1500 / numbers.length);

  await Promise.all(
    items.map((item, index) => animateItem(item, numbers[index], min, max, index * stagger))
  );

  resultList.setAttribute("aria-busy", "false");
  resultMeta.textContent = `${numbers.length} ${numbers.length === 1 ? "número" : "números"} · de ${min} a ${max}${noRepeat ? " · sem repetição" : ""}`;
}

// ---------------------------------------------------------
// Fluxo principal
// ---------------------------------------------------------
async function handleSubmit(event) {
  event.preventDefault();

  hideMessage();
  clearInvalid();

  const validation = validate();
  if (!validation.ok) {
    markInvalid(validation.field);
    showMessage(validation.error, "error");
    validation.field.focus();
    return;
  }

  const { values } = validation;
  const numbers = draw(values);

  // Desabilita o botão durante a animação
  drawButton.disabled = true;
  drawButton.classList.add("is-loading");
  drawButton.querySelector(".button-text").textContent = "Sorteando";

  await showResults(numbers, values);
  await wait(150);

  drawButton.disabled = false;
  drawButton.classList.remove("is-loading");
  drawButton.querySelector(".button-text").textContent = "Sortear novamente";

  const resultText = numbers.join(", ");
  showMessage(
    numbers.length === 1
      ? `Sorteio concluído! O número sorteado foi ${resultText}.`
      : `Sorteio concluído! Números sorteados: ${resultText}.`,
    "success"
  );
}

form.addEventListener("submit", handleSubmit);

// Limpa o destaque de erro assim que o usuário corrige o campo
[quantityInput, minInput, maxInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") {
      input.removeAttribute("aria-invalid");
      hideMessage();
    }
  });
});
