/* ============================================================
   PUBLI-BRISA Enterprise JS v3.0 (CORRIGIDO)
   ============================================================ */

const state = {
  page: "dashboard",
  charts: {},
  maps: {},
  isCollapsed: false,
  mapTheme: "dark"
};

// --- DADOS GEOGRÁFICOS ---
const NETWORK_NODES = [
  { name: "Fortaleza", lat: -3.71, lng: -38.54 },
  { name: "Sobral", lat: -3.68, lng: -40.34 },
  { name: "Mossoró", lat: -5.19, lng: -37.33 },
  { name: "Natal", lat: -5.79, lng: -35.20 },
  { name: "João Pessoa", lat: -7.11, lng: -34.86 },
  { name: "Campina Grande", lat: -7.23, lng: -35.88 },
  { name: "Recife", lat: -8.05, lng: -34.88 },
  { name: "Salvador", lat: -12.97, lng: -38.50 },
  { name: "Teresina", lat: -5.09, lng: -42.80 },
  { name: "São Luís", lat: -2.53, lng: -44.30 }
];

// --- SIDEBAR TOGGLE ---
window.toggleSidebar = function() {
    state.isCollapsed = !state.isCollapsed;
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    const icon = document.querySelector('.sidebar-toggle i');
    icon.className = state.isCollapsed ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left";
    setTimeout(() => { window.dispatchEvent(new Event('resize')); if (state.maps[state.page]) state.maps[state.page].invalidateSize(); }, 300);
};

// --- NAVEGAÇÃO ---
window.showPage = function(pageId) {
  state.page = pageId;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');
  const btn = document.querySelector(`[onclick*="'${pageId}'"]`);
  if (btn) btn.classList.add('active');
  document.getElementById('pageTitle').textContent = pageId.toUpperCase();
  if (pageId === "dashboard") setTimeout(initDashboardCharts, 100);
  if (pageId === "analytics") setTimeout(initAnalyticsCharts, 100);
  if (pageId === "alarms") renderAlarms();
  if (pageId === "logs") renderLogs();
  if (["fibra", "5g", "metro", "dwdm"].includes(pageId)) setTimeout(() => initMap(pageId), 150);
}

// --- GRÁFICOS ---
function initDashboardCharts() {
  const isLight = document.body.classList.contains('light');
  const textColor = isLight ? '#1e293b' : '#94a3b8';
  Chart.defaults.color = textColor;
  ['chartPizza', 'chartLinha', 'chartWireless'].forEach(id => { const ex = Chart.getChart(id); if(ex) ex.destroy(); });
  new Chart(document.getElementById('chartPizza'), { type: 'doughnut', data: { labels: ['Online', 'Alerta', 'Crítico'], datasets: [{ data: [1432, 11, 2], backgroundColor: ['#00ff9d', '#ffae00', '#ff3131'], borderWidth: 0, cutout: '80%' }]}, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
  new Chart(document.getElementById('chartLinha'), { type: 'line', data: { labels: ['00h','04h','08h','12h','16h','20h','24h'], datasets: [{ label: 'Latência ms', data: [25, 32, 28, 45, 38, 52, 35], borderColor: '#ff4500', fill: true, backgroundColor: 'rgba(255, 69, 0, 0.1)', tension: 0.4, pointRadius: 0 }]}, options: { maintainAspectRatio: false } });
  new Chart(document.getElementById('chartWireless'), { type: 'bar', data: { labels: ['2.4G', '5G', '6E', 'Mesh', 'Backhaul'], datasets: [{ data: [400, 950, 1300, 650, 1100], backgroundColor: ['#ff4500', '#00bfff', '#7c3aed', '#00ff9d', '#ffae00'], borderRadius: 6 }]}, options: { maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

function initAnalyticsCharts() {
    ['chartTraffic', 'chartLoss'].forEach(id => { const ex = Chart.getChart(id); if(ex) ex.destroy(); });
    new Chart(document.getElementById('chartTraffic'), { type: 'line', data: { labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], datasets: [{ label: 'Gbps', data: [40, 55, 45, 90, 70, 85, 60], borderColor: '#00bfff', fill: true, backgroundColor: 'rgba(0,191,255,0.1)', tension: 0.4 }] }, options: { maintainAspectRatio: false } });
    new Chart(document.getElementById('chartLoss'), { type: 'line', data: { labels: ['00h','04h','08h','12h','16h','20h'], datasets: [{ label: '% Perda', data: [0.1, 0.2, 0.5, 3.9, 2.1, 1.2], borderColor: '#ff3131', fill: true, backgroundColor: 'rgba(255,49,49,0.1)', tension: 0.4 }] }, options: { maintainAspectRatio: false } });
}

function initMap(type) {
  const mapId = `map-${type}`;
  if (!document.getElementById(mapId)) return;
  if (state.maps[type]) state.maps[type].remove();
  const m = L.map(mapId, { zoomControl: false }).setView([-7.00, -38.50], 6);
  state.maps[type] = m;
  const tile = document.body.classList.contains('light') ? 'voyager' : 'dark_all';
  L.tileLayer(`https://{s}.basemaps.cartocdn.com/${tile}/{z}/{x}/{y}{r}.png`).addTo(m);
  NETWORK_NODES.forEach(n => L.circleMarker([n.lat, n.lng], { radius: 6, color: "#00ff9d", fillOpacity: 0.8 }).addTo(m).bindTooltip(n.name));
  if (type !== "5g") L.polyline(NETWORK_NODES.map(n => [n.lat, n.lng]), { color: "#00ff9d", weight: 2, opacity: 0.5 }).addTo(m);
}

function renderAlarms() { const data = [["red", "SÃO LUÍS-CORE", "Corte de Fibra"], ["amber", "RECIFE-OLT", "Latência Alta"], ["green", "FORTALEZA-DC", "Operacional"]]; document.getElementById('alarmsBody').innerHTML = data.map(([c, s, t]) => `<tr><td><span class="chip ${c}">${c}</span></td><td>${s}</td><td>${t}</td><td><button class="btn-logout"><i class="fa-solid fa-microscope"></i></button></td></tr>`).join(""); }
function renderLogs() { const logs = ["16:30 [INFO] Meraki Sync OK", "16:31 [WARN] Jitter 4.5ms em Teresina", "16:35 [AI] Análise Correlacionada Completa"]; document.getElementById('logStream').innerHTML = logs.map(l => `<div>${l}</div>`).join(""); }

// --- CHAT IA (ESTRUTURADO) ---
document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => { const el = document.getElementById('clock'); if(el) el.textContent = new Date().toLocaleTimeString('pt-BR'); }, 1000);
  document.getElementById('themeToggle').onclick = () => { document.body.classList.toggle('light'); showPage(state.page); };

  const panel = document.getElementById('aiPanel');
  const dragHandle = document.getElementById('aiDragHandle');
  const msgBox = document.getElementById('aiMessages');

  // Arrastar Painel
  let isDragging = false;
  let offset = { x: 0, y: 0 };
  dragHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offset = { x: e.clientX - panel.offsetLeft, y: e.clientY - panel.offsetTop };
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      panel.style.left = (e.clientX - offset.x) + 'px';
      panel.style.top = (e.clientY - offset.y) + 'px';
      panel.style.bottom = 'auto';
    }
  });
  document.addEventListener('mouseup', () => isDragging = false);

  document.getElementById('aiExpandBtn').onclick = () => panel.classList.toggle('expanded');
  document.getElementById('aiFab').onclick = () => panel.classList.toggle('open');
  document.getElementById('aiCloseBtn').onclick = () => panel.classList.remove('open');

  // ENVIO DE MENSAGEM
  document.getElementById('aiComposer').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    msgBox.innerHTML += `<div class="msg user">${msg}</div>`;
    
    // Simulação de resposta
    if(msg.toLowerCase().includes('diagnostique')) {
        setTimeout(() => {
            msgBox.innerHTML += `<div class="msg bot">Análise de link:
                <div class="report-card">
                    <div class="report-row"><span>Perda média</span><span>2.55%</span></div>
                    <div class="report-row"><span>Root cause</span><span>Congestionamento</span></div>
                </div>
            </div>`;
            msgBox.scrollTop = msgBox.scrollHeight;
        }, 500);
    }
    
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;
  });

  showPage('dashboard');
});