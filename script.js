const canvas = document.getElementById("artCanvas");
const ctx = canvas.getContext("2d");

const form = {
  sectorInputs: [...document.querySelectorAll("[data-sector]")],
  customDepartment: document.getElementById("customDepartment"),
  store: document.getElementById("store"),
  customStore: document.getElementById("customStore"),
  customStoreWrap: document.getElementById("customStoreWrap"),
  shiftDate: document.getElementById("shiftDate"),
  note: document.getElementById("note"),
  downloadBtn: document.getElementById("downloadBtn"),
  clearBtn: document.getElementById("clearBtn"),
};

const brandLogo = new Image();
brandLogo.src = "terra-fertil-logo-crop.png";

const colors = {
  ink: "#151E29",
  graphite: "#1C2633",
  muted: "#768597",
  green: "#668D3C",
  vivid: "#A5CD39",
  lime: "#C8DB3D",
  orange: "#FF7212",
  paper: "#F7FAF1",
  pale: "#F3F9EE",
  white: "#FFFFFF",
  border: "#DCE8D2",
};

function nextSaturday(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const distance = (6 - day + 7) % 7 || 7;
  result.setDate(result.getDate() + distance);
  return result;
}

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value) {
  if (!value) return "{{DATA}}";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getStore() {
  if (form.store.value === "Outro") {
    return toUppercaseText(form.customStore.value.trim() || "Loja");
  }
  return toUppercaseText(form.store.value);
}

function toUppercaseText(value) {
  return value.toLocaleUpperCase("pt-BR");
}

function normalizeUppercaseElement(element) {
  if (!element || element.type === "date" || element.tagName === "SELECT") return;

  const previousValue = element.value;
  const nextValue = toUppercaseText(previousValue);
  if (previousValue === nextValue) return;

  const selectionStart = element.selectionStart;
  const selectionEnd = element.selectionEnd;

  element.value = nextValue;

  if (selectionStart !== null && selectionEnd !== null) {
    element.setSelectionRange(selectionStart, selectionEnd);
  }
}

function cleanNames(value) {
  return value
    .split(/\n|,/)
    .map((name) => toUppercaseText(name.trim()))
    .filter(Boolean);
}

function getSectorGroups() {
  return form.sectorInputs
    .map((input) => {
      const baseName = input.dataset.sector;
      const sector = baseName === "Outro" ? form.customDepartment.value.trim() || "Outros" : baseName;

      return {
        sector: toUppercaseText(sector),
        names: cleanNames(input.value),
      };
    })
    .filter((group) => group.names.length > 0);
}

function drawRoundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  drawRoundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawShadow(x, y, width, height, radius, alpha = 0.08) {
  ctx.save();
  ctx.shadowColor = `rgba(21, 30, 41, ${alpha})`;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  fillRoundRect(x, y, width, height, radius, colors.white);
  ctx.restore();
}

function fitText(text, maxWidth, startSize, minSize, weight = 800, family = "Exo 2") {
  let size = startSize;

  do {
    ctx.font = `${weight} ${size}px "${family}", Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  } while (size >= minSize);

  return minSize;
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function drawBackground() {
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(900, 120, 60, 900, 120, 620);
  glow.addColorStop(0, "rgba(200, 219, 61, 0.24)");
  glow.addColorStop(1, "rgba(200, 219, 61, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, 460);

  ctx.fillStyle = colors.ink;
  ctx.fillRect(0, 0, canvas.width, 14);
  ctx.fillStyle = colors.lime;
  ctx.fillRect(0, 14, canvas.width * 0.78, 8);
  ctx.fillStyle = colors.orange;
  ctx.fillRect(canvas.width * 0.78, 14, canvas.width * 0.22, 8);

  ctx.globalAlpha = 0.06;
  ctx.fillStyle = colors.green;

  ctx.beginPath();
  ctx.ellipse(1010, 186, 150, 250, 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(40, canvas.height - 130, 160, 240, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawLogo(x, y, width) {
  if (!brandLogo.complete || !brandLogo.naturalWidth) return 0;

  const height = width * (brandLogo.naturalHeight / brandLogo.naturalWidth);
  ctx.drawImage(brandLogo, x, y, width, height);
  return height;
}

function drawHeader(store, date, note) {
  const margin = 64;
  const logoWidth = 250;
  const logoHeight = drawLogo(margin, 66, logoWidth);

  ctx.fillStyle = colors.ink;
  ctx.font = "900 66px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Plantão de Sábado", 366, 116);

  ctx.fillStyle = colors.graphite;
  ctx.font = "600 28px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("Escala semanal da equipe Terra Fértil", 368, 158);

  fillRoundRect(368, 184, 214, 36, 18, "rgba(102, 141, 60, 0.12)");
  ctx.fillStyle = colors.green;
  ctx.font = "800 17px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("COMUNICADO INTERNO", 390, 208);

  const lineY = Math.max(238, 66 + logoHeight + 28);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, lineY);
  ctx.lineTo(canvas.width - margin, lineY);
  ctx.stroke();

  const infoY = lineY + 34;
  const cardW = 460;
  const cardH = 116;
  const cards = [
    { label: "Loja", value: store, x: margin, accent: colors.green },
    { label: "Data", value: formatShortDate(date), x: canvas.width - margin - cardW, accent: colors.ink },
  ];

  cards.forEach((card) => {
    drawShadow(card.x, infoY, cardW, cardH, 8, 0.07);
    fillRoundRect(card.x, infoY, cardW, cardH, 8, colors.white, colors.border, 1.5);

    ctx.fillStyle = card.accent;
    ctx.fillRect(card.x, infoY, 8, cardH);

    ctx.fillStyle = colors.muted;
    ctx.font = "800 20px 'Inter', Arial, Helvetica, sans-serif";
    ctx.fillText(card.label.toUpperCase(), card.x + 34, infoY + 38);

    const valueSize = fitText(card.value, cardW - 68, 42, 26, 900);
    ctx.fillStyle = colors.ink;
    ctx.font = `900 ${valueSize}px "Exo 2", Arial, Helvetica, sans-serif`;
    ctx.fillText(card.value, card.x + 34, infoY + 88);
  });

  const noteY = infoY + cardH + 22;
  const noteText = note || "ATENDIMENTO CONFORME ESCALA";

  fillRoundRect(margin, noteY, canvas.width - margin * 2, 58, 8, colors.white, colors.border, 1.2);

  ctx.fillStyle = colors.orange;
  ctx.fillRect(margin, noteY, 7, 58);

  ctx.fillStyle = colors.graphite;
  ctx.font = "700 23px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText(noteText, margin + 30, noteY + 38);

  return noteY + 104;
}

function drawSectionTitle(groups, y) {
  const totalNames = groups.reduce((sum, group) => sum + group.names.length, 0);
  const margin = 64;

  ctx.fillStyle = colors.ink;
  ctx.font = "900 36px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Colaboradores por setor", margin, y);

  const label = `${totalNames} ${totalNames === 1 ? "colaborador" : "colaboradores"}`;
  const pillW = Math.max(238, ctx.measureText(label).width + 58);

  fillRoundRect(canvas.width - margin - pillW, y - 38, pillW, 48, 24, colors.green);

  ctx.fillStyle = colors.white;
  ctx.font = "900 22px 'Inter', Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, canvas.width - margin - pillW / 2, y - 7);
  ctx.textAlign = "left";

  return y + 34;
}

function getNameColumns(count) {
  if (count >= 18) return 3;
  if (count >= 2) return 2;
  return 1;
}

function measureSectorHeight(group) {
  const columns = getNameColumns(group.names.length);
  const rows = Math.ceil(group.names.length / columns);
  return 86 + rows * 48 + 30;
}

function drawCheck(x, y) {
  ctx.fillStyle = colors.lime;
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors.white;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x - 1, y + 4);
  ctx.lineTo(x + 7, y - 6);
  ctx.stroke();
}

function drawSectorGroup(group, x, y, width) {
  const columns = getNameColumns(group.names.length);
  const columnGap = 18;
  const rows = Math.ceil(group.names.length / columns);
  const nameBoxW = (width - 48 - columnGap * (columns - 1)) / columns;
  const height = measureSectorHeight(group);

  drawShadow(x, y, width, height, 8, 0.055);
  fillRoundRect(x, y, width, height, 8, colors.white, colors.border, 1.3);

  ctx.fillStyle = colors.green;
  ctx.fillRect(x, y, 8, height);

  ctx.fillStyle = colors.ink;
  const sectorSize = fitText(group.sector, width - 270, 31, 23, 900);
  ctx.font = `900 ${sectorSize}px "Exo 2", Arial, Helvetica, sans-serif`;
  ctx.fillText(group.sector, x + 28, y + 48);

  const countLabel = `${group.names.length} ${group.names.length === 1 ? "pessoa" : "pessoas"}`;
  const countW = Math.max(116, ctx.measureText(countLabel).width + 40);

  fillRoundRect(x + width - countW - 24, y + 22, countW, 36, 18, "rgba(102, 141, 60, 0.12)");

  ctx.fillStyle = colors.green;
  ctx.font = "800 18px 'Inter', Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(countLabel, x + width - countW / 2 - 24, y + 46);
  ctx.textAlign = "left";

  const startY = y + 82;

  group.names.forEach((name, index) => {
    const col = columns === 1 ? 0 : index % columns;
    const row = columns === 1 ? index : Math.floor(index / columns);
    const itemX = x + 28 + col * (nameBoxW + columnGap);
    const itemY = startY + row * 48;

    fillRoundRect(itemX, itemY, nameBoxW, 38, 19, colors.pale, "#E6EFD9", 1);
    drawCheck(itemX + 22, itemY + 19);

    const nameSize = fitText(name, nameBoxW - 58, 24, 17, 800);
    ctx.fillStyle = colors.ink;
    ctx.font = `800 ${nameSize}px "Exo 2", Arial, Helvetica, sans-serif`;
    ctx.fillText(name, itemX + 46, itemY + 27);
  });

  return height;
}

function drawEmptyState(y) {
  const margin = 64;

  drawShadow(margin, y, canvas.width - margin * 2, 170, 8, 0.05);
  fillRoundRect(margin, y, canvas.width - margin * 2, 170, 8, colors.white, colors.border, 1.2);

  ctx.fillStyle = colors.muted;
  ctx.font = "800 30px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Preencha os nomes nos setores ao lado", margin + 36, y + 74);

  ctx.font = "600 22px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("Setores vazios não aparecem na arte final.", margin + 36, y + 112);

  return 170;
}

function drawMainContent(groups, startY) {
  const margin = 64;
  let y = drawSectionTitle(groups, startY);

  if (!groups.length) {
    return y + drawEmptyState(y) + 24;
  }

  groups.forEach((group) => {
    const height = drawSectorGroup(group, margin, y, canvas.width - margin * 2);
    y += height + 20;
  });

  return y;
}

function drawFooter(y) {
  const margin = 64;
  const footerY = Math.max(y + 24, canvas.height - 142);

  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, footerY);
  ctx.lineTo(canvas.width - margin, footerY);
  ctx.stroke();

  const logoHeight = drawLogo(margin, footerY + 26, 186);

  ctx.fillStyle = colors.muted;
  ctx.font = "700 20px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("Arte gerada automaticamente para manter o padrão visual", 300, footerY + 60);

  ctx.fillStyle = colors.ink;
  ctx.font = "900 25px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Escala de sábado", 300, footerY + 30);

  return footerY + Math.max(logoHeight + 36, 112);
}

function measureContentHeight(groups) {
  let height = 508;
  height += 68;

  if (!groups.length) {
    height += 170 + 24;
  } else {
    groups.forEach((group) => {
      height += measureSectorHeight(group) + 20;
    });
  }

  return Math.max(1350, height + 170);
}

function render() {
  const groups = getSectorGroups();
  const note = toUppercaseText(form.note.value.trim());

  canvas.height = measureContentHeight(groups);

  drawBackground();

  const contentStartY = drawHeader(getStore(), form.shiftDate.value, note);
  const contentEndY = drawMainContent(groups, contentStartY);

  drawFooter(contentEndY);
}

function downloadImage() {
  const groups = getSectorGroups();

  if (!groups.length) {
    form.sectorInputs[0].focus();
    return;
  }

  const store = slug(getStore());
  const date = form.shiftDate.value || "sabado";
  const link = document.createElement("a");

  link.download = `plantao-sabado-${store}-${date}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function clearForm() {
  form.sectorInputs.forEach((input) => {
    input.value = "";
  });

  form.customDepartment.value = "";
  form.store.value = "Limoeiro";
  form.customStore.value = "";
  form.note.value = "ATENDIMENTO CONFORME ESCALA";
  form.shiftDate.value = toInputDate(nextSaturday());
  form.customStoreWrap.classList.add("hidden");

  render();
  form.sectorInputs[0].focus();
}

form.shiftDate.value = toInputDate(nextSaturday());
form.note.value = toUppercaseText(form.note.value);

[
  ...form.sectorInputs,
  form.customDepartment,
  form.store,
  form.customStore,
  form.shiftDate,
  form.note,
].forEach((element) => {
  element.addEventListener("input", () => {
    normalizeUppercaseElement(element);
    render();
  });

  element.addEventListener("change", () => {
    normalizeUppercaseElement(element);
    render();
  });
});

form.store.addEventListener("change", () => {
  form.customStoreWrap.classList.toggle("hidden", form.store.value !== "Outro");
  render();
});

form.downloadBtn.addEventListener("click", downloadImage);
form.clearBtn.addEventListener("click", clearForm);

brandLogo.addEventListener("load", render);

if (document.fonts) {
  document.fonts.ready.then(render);
}

render();
