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
  ink: "#151e29",
  graphite: "#1c2633",
  muted: "#768597",
  green: "#668d3c",
  vivid: "#a5cd39",
  lime: "#c8db3d",
  gold: "#ffac14",
  orange: "#ff7212",
  cream: "#f8faf2",
  white: "#ffffff",
  pale: "#f3f9ee",
  border: "#dbe7cf",
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

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getStore() {
  if (form.store.value === "Outro") {
    return form.customStore.value.trim() || "Loja";
  }
  return form.store.value;
}

function cleanNames(value) {
  return value
    .split(/\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function getSectorGroups() {
  return form.sectorInputs
    .map((input) => {
      const baseName = input.dataset.sector;
      const sector = baseName === "Outro" ? form.customDepartment.value.trim() || "Outro" : baseName;
      return {
        sector,
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

function drawSoftShadow(x, y, width, height, radius, alpha = 0.12) {
  ctx.save();
  ctx.shadowColor = `rgba(21, 30, 41, ${alpha})`;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = colors.white;
  drawRoundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
}

function fitText(text, maxWidth, startSize, minSize, weight = 800) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px "Exo 2", Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size >= minSize);
  return minSize;
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function drawBackground() {
  ctx.fillStyle = "#f7faef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(820, 190, 60, 820, 190, 620);
  glow.addColorStop(0, "rgba(200,219,61,0.22)");
  glow.addColorStop(1, "rgba(200,219,61,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const masthead = ctx.createLinearGradient(0, 0, canvas.width, 260);
  masthead.addColorStop(0, colors.ink);
  masthead.addColorStop(0.68, colors.graphite);
  masthead.addColorStop(1, "#24354a");
  ctx.fillStyle = masthead;
  ctx.fillRect(0, 0, canvas.width, 300);

  ctx.fillStyle = colors.lime;
  ctx.fillRect(0, 0, canvas.width, 12);
  ctx.fillStyle = colors.orange;
  ctx.fillRect(0, 12, canvas.width, 5);

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = colors.lime;
  ctx.beginPath();
  ctx.moveTo(715, 0);
  ctx.bezierCurveTo(905, 74, 1004, 168, 1080, 286);
  ctx.lineTo(1080, 0);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.09;
  drawSimpleLeaf(958, 164, 2.15);
  drawSimpleLeaf(126, canvas.height - 105, 1.8);
  ctx.globalAlpha = 1;
}

function drawSimpleLeaf(cx, cy, scale = 1, opacity = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = colors.green;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(-28, -18, -8, -44, 28, -58);
  ctx.bezierCurveTo(30, -20, 18, 8, 0, 18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.bezierCurveTo(-42, 0, -42, -28, -16, -46);
  ctx.bezierCurveTo(-12, -18, -5, 2, -10, 20);
  ctx.fill();
  ctx.restore();
}

function drawPeopleIcon(cx, cy, radius) {
  const iconGradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  iconGradient.addColorStop(0, colors.lime);
  iconGradient.addColorStop(1, "#3f8428");
  ctx.fillStyle = iconGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors.white;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy - 13, 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - 31, cy - 3, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 31, cy - 3, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 38, cy + 34);
  ctx.quadraticCurveTo(cx, cy + 8, cx + 38, cy + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 61, cy + 30);
  ctx.quadraticCurveTo(cx - 34, cy + 12, cx - 17, cy + 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 17, cy + 30);
  ctx.quadraticCurveTo(cx + 34, cy + 12, cx + 61, cy + 30);
  ctx.stroke();
}

function drawStoreIcon(cx, cy) {
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.strokeRect(cx - 29, cy - 14, 58, 42);
  ctx.strokeRect(cx - 9, cy + 4, 18, 24);
  ctx.beginPath();
  ctx.moveTo(cx - 34, cy - 14);
  ctx.lineTo(cx - 26, cy - 40);
  ctx.lineTo(cx + 26, cy - 40);
  ctx.lineTo(cx + 34, cy - 14);
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 14, cy - 40);
    ctx.lineTo(cx + i * 12, cy - 14);
    ctx.stroke();
  }
}

function drawCalendarIcon(cx, cy) {
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.strokeRect(cx - 30, cy - 34, 60, 62);
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 14);
  ctx.lineTo(cx + 30, cy - 14);
  ctx.moveTo(cx - 16, cy - 42);
  ctx.lineTo(cx - 16, cy - 26);
  ctx.moveTo(cx + 16, cy - 42);
  ctx.lineTo(cx + 16, cy - 26);
  ctx.stroke();
  ctx.fillStyle = colors.ink;
  [-15, 0, 15].forEach((x) => {
    [1, 17].forEach((y) => {
      ctx.fillRect(cx + x - 3, cy + y - 3, 6, 6);
    });
  });
}

function drawHeader(store, date, note) {
  if (brandLogo.complete && brandLogo.naturalWidth) {
    ctx.fillStyle = colors.white;
    drawRoundRect(64, 56, 220, 116, 8);
    ctx.fill();
    const logoWidth = 176;
    const logoHeight = logoWidth * (brandLogo.naturalHeight / brandLogo.naturalWidth);
    ctx.drawImage(brandLogo, 86, 68, logoWidth, logoHeight);
  }

  ctx.fillStyle = colors.white;
  ctx.font = "900 64px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Plantão de Sábado", 320, 104);
  ctx.font = "600 26px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText("Escala semanal da equipe Terra Fértil", 322, 146);

  ctx.fillStyle = "rgba(200,219,61,0.14)";
  drawRoundRect(322, 174, 276, 42, 21);
  ctx.fill();
  ctx.fillStyle = colors.lime;
  ctx.font = "800 20px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("COMUNICADO INTERNO", 344, 202);

  const infoY = 238;
  const cards = [
    { label: "LOJA", value: store, x: 58, width: 464 },
    { label: "DATA", value: date ? date.split("-").reverse().join("/") : "{{DATA}}", x: 558, width: 464 },
  ];

  cards.forEach((card) => {
    drawSoftShadow(card.x, infoY, card.width, 124, 8, 0.14);
    ctx.fillStyle = colors.white;
    drawRoundRect(card.x, infoY, card.width, 124, 8);
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = card.label === "LOJA" ? colors.green : colors.orange;
    drawRoundRect(card.x + 26, infoY + 24, 78, 28, 14);
    ctx.fill();
    ctx.fillStyle = colors.white;
    ctx.font = "900 16px 'Inter', Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.label, card.x + 65, infoY + 44);
    ctx.textAlign = "left";

    ctx.fillStyle = colors.green;
    if (card.label === "DATA") ctx.fillStyle = colors.ink;
    const valueSize = fitText(card.value, card.width - 56, 38, 24, 900);
    ctx.font = `900 ${valueSize}px "Exo 2", Arial, Helvetica, sans-serif`;
    ctx.fillText(card.value, card.x + 28, infoY + 94);
  });

  if (note) {
    ctx.fillStyle = colors.white;
    drawRoundRect(58, 386, 964, 62, 8);
    ctx.fill();
    ctx.fillStyle = colors.orange;
    ctx.fillRect(58, 386, 7, 62);
    ctx.fillStyle = colors.graphite;
    ctx.font = "700 23px 'Inter', Arial, Helvetica, sans-serif";
    ctx.fillText(note, 88, 426);
  }
}

function drawSectorGroup(group, x, y, width) {
  const countLabel = `${group.names.length} ${group.names.length === 1 ? "pessoa" : "pessoas"}`;
  const columns = group.names.length > 1 ? 2 : 1;
  const columnGap = 22;
  const chipWidth = columns === 2 ? (width - 64 - columnGap) / 2 : width - 64;
  const rowHeight = 52;
  const rows = Math.ceil(group.names.length / columns);
  const cardHeight = 92 + rows * rowHeight + 28;

  drawSoftShadow(x, y, width, cardHeight, 8, 0.08);
  ctx.fillStyle = colors.white;
  drawRoundRect(x, y, width, cardHeight, 8);
  ctx.fill();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  const headerGradient = ctx.createLinearGradient(x, y, x + width, y);
  headerGradient.addColorStop(0, colors.ink);
  headerGradient.addColorStop(0.78, colors.graphite);
  headerGradient.addColorStop(1, "#31455d");
  ctx.fillStyle = headerGradient;
  drawRoundRect(x, y, width, 72, 8);
  ctx.fill();
  ctx.fillStyle = colors.lime;
  ctx.font = "900 28px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText(group.sector, x + 32, y + 46);
  ctx.fillStyle = colors.white;
  ctx.font = "800 22px 'Inter', Arial, Helvetica, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(countLabel, x + width - 32, y + 46);
  ctx.textAlign = "left";

  ctx.font = "800 25px 'Exo 2', Arial, Helvetica, sans-serif";
  group.names.forEach((name, index) => {
    const col = columns === 2 ? index % 2 : 0;
    const row = columns === 2 ? Math.floor(index / 2) : index;
    const chipX = x + 32 + col * (chipWidth + columnGap);
    const chipY = y + 96 + row * rowHeight;
    ctx.fillStyle = "#f7faf3";
    drawRoundRect(chipX, chipY, chipWidth, 40, 20);
    ctx.fill();
    ctx.strokeStyle = "#e3ecd8";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = colors.lime;
    ctx.beginPath();
    ctx.arc(chipX + 22, chipY + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.white;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(chipX + 16, chipY + 20);
    ctx.lineTo(chipX + 21, chipY + 25);
    ctx.lineTo(chipX + 29, chipY + 14);
    ctx.stroke();
    ctx.fillStyle = colors.ink;
    const size = fitText(name, chipWidth - 58, 25, 18, 800);
    ctx.font = `800 ${size}px "Exo 2", Arial, Helvetica, sans-serif`;
    ctx.fillText(name, chipX + 46, chipY + 28);
  });

  return cardHeight;
}

function drawMainCard(groups, store, date, note) {
  let y = note ? 492 : 414;

  ctx.fillStyle = colors.ink;
  ctx.font = "900 32px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Colaboradores por setor", 58, y);

  const totalNames = groups.reduce((sum, group) => sum + group.names.length, 0);
  ctx.fillStyle = colors.green;
  drawRoundRect(754, y - 34, 268, 46, 23);
  ctx.fill();
  ctx.fillStyle = colors.white;
  ctx.font = "900 22px 'Inter', Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${totalNames} ${totalNames === 1 ? "colaborador" : "colaboradores"}`, 888, y - 4);
  ctx.textAlign = "left";
  y += 34;

  if (!groups.length) {
    ctx.fillStyle = colors.white;
    drawRoundRect(58, y, 964, 180, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(102,141,60,0.26)";
    ctx.stroke();
    ctx.fillStyle = colors.muted;
    ctx.font = "800 30px 'Exo 2', Arial, Helvetica, sans-serif";
    ctx.fillText("Preencha os nomes nos setores ao lado", 108, y + 98);
    return y + 210;
  }

  groups.forEach((group) => {
    const height = drawSectorGroup(group, 58, y, 964);
    y += height + 22;
  });

  return y;
}

function drawFooter(y) {
  const footerY = Math.max(y + 28, canvas.height - 160);
  ctx.fillStyle = colors.white;
  drawRoundRect(58, footerY, 964, 112, 8);
  ctx.fill();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (brandLogo.complete && brandLogo.naturalWidth) {
    ctx.fillStyle = "#f7faf3";
    drawRoundRect(84, footerY + 20, 218, 72, 8);
    ctx.fill();
    const logoWidth = 128;
    const logoHeight = logoWidth * (brandLogo.naturalHeight / brandLogo.naturalWidth);
    ctx.drawImage(brandLogo, 129, footerY + 23, logoWidth, logoHeight);
  } else {
    ctx.fillStyle = colors.green;
    ctx.font = "900 34px 'Exo 2', Arial, Helvetica, sans-serif";
    ctx.fillText("Terra Fértil", 100, footerY + 66);
  }

  ctx.fillStyle = colors.ink;
  ctx.font = "800 28px 'Exo 2', Arial, Helvetica, sans-serif";
  ctx.fillText("Escala de sábado", 350, footerY + 48);
  ctx.fillStyle = colors.muted;
  ctx.font = "600 21px 'Inter', Arial, Helvetica, sans-serif";
  ctx.fillText("Arte gerada automaticamente para manter o padrão visual", 350, footerY + 82);
}

function measureContentHeight(groups, note) {
  let y = note ? 492 : 414;
  y += 34;
  if (!groups.length) return Math.max(1350, y + 210 + 220);

  groups.forEach((group) => {
    const columns = group.names.length > 1 ? 2 : 1;
    const rows = Math.ceil(group.names.length / columns);
    const height = 92 + rows * 52 + 28;
    y += height + 22;
  });

  return Math.max(1350, y + 220);
}

function render() {
  const groups = getSectorGroups();
  const note = form.note.value.trim();
  canvas.height = measureContentHeight(groups, note);

  drawBackground();
  drawHeader(getStore(), form.shiftDate.value, note);
  const endY = drawMainCard(groups, getStore(), form.shiftDate.value, note);
  drawFooter(endY);
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  form.note.value = "Atendimento conforme escala";
  form.shiftDate.value = toInputDate(nextSaturday());
  form.customStoreWrap.classList.add("hidden");
  render();
  form.sectorInputs[0].focus();
}

form.shiftDate.value = toInputDate(nextSaturday());

[
  ...form.sectorInputs,
  form.customDepartment,
  form.store,
  form.customStore,
  form.shiftDate,
  form.note,
].forEach((element) => {
  element.addEventListener("input", render);
  element.addEventListener("change", render);
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
