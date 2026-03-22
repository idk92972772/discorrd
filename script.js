// Replace BASE_URL with your actual GitHub Pages / raw GitHub URL
const BASE_URL = "hhttps://idk92972772.github.io/discorrd/#";

const themes = [
  {
    id: 1,
    name: "Midnight Red",
    author: "you",
    desc: "Deep black base with crimson red accents. Sleek and aggressive.",
    tags: ["dark", "red"],
    color: "#0a0a0a",
    accent: "#c0392b",
    emoji: "🔴",
    file: "midnight-red.theme.css"
  },
  {
    id: 2,
    name: "Ocean Dark",
    author: "you",
    desc: "Deep ocean blues with teal highlights. Calm and immersive.",
    tags: ["dark", "blue"],
    color: "#0b0f1a",
    accent: "#22d3ee",
    emoji: "🌊",
    file: "ocean-dark.theme.css"
  },
  {
    id: 3,
    name: "Neon Green",
    author: "you",
    desc: "Pure black with electric green neon accents. Full hacker mode.",
    tags: ["dark", "green", "neon"],
    color: "#050505",
    accent: "#00ff41",
    emoji: "�",
    file: "neon-green.theme.css"
  },
  {
    id: 4,
    name: "Sakura",
    author: "you",
    desc: "Soft pink cherry blossom theme. Dark base, dreamy pink accents.",
    tags: ["dark", "pink"],
    color: "#1a0d12",
    accent: "#ff6eb4",
    emoji: "�",
    file: "sakura.theme.css"
  },
  {
    id: 5,
    name: "Void Purple",
    author: "you",
    desc: "Near-black with deep violet and electric purple accents.",
    tags: ["dark", "purple"],
    color: "#0c0910",
    accent: "#a78bfa",
    emoji: "🟣",
    file: "void-purple.theme.css"
  }
];

let installed = JSON.parse(localStorage.getItem("installedThemes") || "[]");

function saveInstalled() {
  localStorage.setItem("installedThemes", JSON.stringify(installed));
}

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast" + (isError ? " error" : "");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

function isInstalled(id) { return installed.includes(id); }

function installTheme(theme) {
  const url = `${BASE_URL}/${theme.file}`;
  const psScript = `
$themesDir = "$env:APPDATA\\Vencord\\themes"
if (-not (Test-Path $themesDir)) { New-Item -ItemType Directory -Path $themesDir -Force | Out-Null }
$out = Join-Path $themesDir "${theme.file}"
Write-Host ""
Write-Host "  Installing: ${theme.name}" -ForegroundColor Cyan
try {
  Invoke-WebRequest -Uri "${url}" -OutFile $out -UseBasicParsing
  Write-Host "  Installed to: $out" -ForegroundColor Green
  Write-Host "  Reload Discord (Ctrl+R) to apply." -ForegroundColor Yellow
} catch {
  Write-Host "  Failed: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host "  Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`.trim();

  // Write ps1 as a blob and download it
  const blob = new Blob([psScript], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `install-${theme.file.replace(".theme.css", "")}.ps1`;
  a.click();
  URL.revokeObjectURL(a.href);

  if (!installed.includes(theme.id)) {
    installed.push(theme.id);
    saveInstalled();
    renderAll();
  }

  showToast(`Downloaded installer for ${theme.name}. Right-click → Run with PowerShell.`);
}

function removeTheme(id) {
  installed = installed.filter(i => i !== id);
  saveInstalled();
  renderAll();
  showToast("Theme removed from list.");
}

function createCard(theme, showRemove = false) {
  const card = document.createElement("div");
  card.className = "theme-card";
  card.dataset.name = theme.name.toLowerCase();
  card.dataset.tags = theme.tags.join(" ");

  // Preview: gradient using bg + accent color
  const preview = document.createElement("div");
  preview.className = "theme-preview-placeholder";
  preview.style.background = `linear-gradient(135deg, ${theme.color} 60%, ${theme.accent}55)`;
  preview.innerHTML = `<span style="font-size:2.2rem">${theme.emoji}</span>
    <span style="position:absolute;bottom:10px;right:14px;width:18px;height:18px;border-radius:50%;background:${theme.accent};box-shadow:0 0 10px ${theme.accent}"></span>`;
  preview.style.position = "relative";

  const body = document.createElement("div");
  body.className = "theme-body";
  body.innerHTML = `
    <div class="theme-name">${theme.name}</div>
    <div class="theme-author">by ${theme.author}</div>
    <div class="theme-desc">${theme.desc}</div>
    <div class="theme-tags">${theme.tags.map(t => `<span class="tag" style="background:${theme.accent}22;color:${theme.accent}">${t}</span>`).join("")}</div>
  `;

  const footer = document.createElement("div");
  footer.className = "theme-footer";

  if (showRemove) {
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => removeTheme(theme.id);
    footer.appendChild(removeBtn);
  } else {
    const installBtn = document.createElement("button");
    if (isInstalled(theme.id)) {
      installBtn.className = "btn-install";
      installBtn.textContent = "↓ Re-download";
      installBtn.style.background = theme.accent;
    } else {
      installBtn.className = "btn-install";
      installBtn.textContent = "↓ Install";
      installBtn.style.background = theme.accent;
    }
    installBtn.onclick = () => installTheme(theme);
    footer.appendChild(installBtn);
  }

  card.appendChild(preview);
  card.appendChild(body);
  card.appendChild(footer);
  return card;
}

function renderAll(query = "") {
  const onlineGrid = document.getElementById("online");
  const installedGrid = document.getElementById("installed");
  onlineGrid.innerHTML = "";
  installedGrid.innerHTML = "";

  const q = query.toLowerCase();
  const filtered = themes.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.author.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q))
  );

  if (filtered.length === 0) {
    onlineGrid.innerHTML = `<div class="empty-state">No themes found for "${query}"</div>`;
  } else {
    filtered.forEach(t => onlineGrid.appendChild(createCard(t, false)));
  }

  const installedThemes = themes.filter(t => isInstalled(t.id));
  if (installedThemes.length === 0) {
    installedGrid.innerHTML = `<div class="empty-state">No themes installed yet.</div>`;
  } else {
    installedThemes.forEach(t => installedGrid.appendChild(createCard(t, true)));
  }
}

function switchTab(id, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".themes-grid").forEach(g => g.classList.add("hidden"));
  btn.classList.add("active");
  document.getElementById(id).classList.remove("hidden");
}

function filterThemes(val) { renderAll(val); }

renderAll();
