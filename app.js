/* app.js — AI Data Centers Map Application */

(function () {
  'use strict';

  // ================================================================
  // COMPANY COLORS
  // ================================================================
  const COMPANY_COLORS = {
    'OpenAI':    '#FF6B2B',
    'Stargate':  '#FF6B2B',
    'Meta':      '#0668E1',
    'Microsoft': '#00BCF2',
    'Amazon':    '#FF9900',
    'AWS':       '#FF9900',
    'Google':    '#34A853',
    'Alphabet':  '#34A853',
    'xAI':       '#FFFFFF',
    'CoreWeave': '#76B900',
    'NVIDIA':    '#76B900',
    'Applied Digital': '#76B900',
    'Anthropic': '#D4A574',
    'Apple':     '#A2AAAD',
    'Foxconn':   '#A2AAAD',
    'Nebius':    '#8B5CF6',
    'Nscale':    '#2DD4BF',
    'STACK':     '#EC4899',
    'G42':       '#F59E0B',
    'NEOM':      '#EAB308',
    'DataVolt':  '#EAB308',
    'Saudi':     '#EAB308',
    'Groq':      '#EAB308',
    'Aramco':    '#EAB308',
    'NEXTDC':    '#F97316',
  };

  // Map company strings from data to a display group + color
  function getCompanyGroup(company) {
    const c = company.toLowerCase();
    if (c.includes('nextdc')) return { group: 'NEXTDC / OpenAI Australia', color: '#F97316' };
    if (c.includes('openai') || c.includes('oracle') || c.includes('softbank')) return { group: 'OpenAI / Stargate', color: '#FF6B2B' };
    if (c.includes('meta')) return { group: 'Meta', color: '#0668E1' };
    if (c.includes('nscale')) return { group: 'Nscale', color: '#2DD4BF' };
    if (c.includes('microsoft') && !c.includes('nscale')) return { group: 'Microsoft', color: '#00BCF2' };
    if ((c.includes('amazon') || c.includes('aws'))) return { group: 'Amazon / AWS', color: '#FF9900' };
    if (c.includes('anthropic')) return { group: 'Anthropic', color: '#D4A574' };
    if (c.includes('google') || c.includes('alphabet')) return { group: 'Google', color: '#34A853' };
    if (c.includes('xai')) return { group: 'xAI', color: '#FFFFFF' };
    if (c.includes('coreweave') || c.includes('applied digital')) return { group: 'CoreWeave / NVIDIA', color: '#76B900' };
    if (c.includes('apple') || c.includes('foxconn')) return { group: 'Apple', color: '#A2AAAD' };
    if (c.includes('nebius')) return { group: 'Nebius', color: '#8B5CF6' };
    if (c.includes('stack')) return { group: 'STACK', color: '#EC4899' };
    if (c.includes('g42')) return { group: 'G42 / UAE', color: '#F59E0B' };
    if (c.includes('neom') || c.includes('datavolt') || c.includes('groq') || c.includes('aramco') || c.includes('humain')) return { group: 'Saudi Arabia', color: '#EAB308' };
    return { group: 'Other', color: '#8891a8' };
  }

  function getStatusCategory(status) {
    const s = status.toLowerCase();
    if (s.includes('operational') && !s.includes('partially')) return 'Operational';
    if (s.includes('partially operational')) return 'Partially Operational';
    if (s.includes('under construction') || s.includes('construction started') || s.includes('construction imminent') || s.includes('groundbreaking')) return 'Under Construction';
    if (s.includes('under development') || s.includes('approved')) return 'Under Development';
    if (s.includes('expansion') || s.includes('expanding') || s.includes('ongoing')) return 'Expanding';
    return 'Under Development';
  }

  function getStatusBadgeClass(cat) {
    switch (cat) {
      case 'Operational': return 'status-badge--operational';
      case 'Partially Operational': return 'status-badge--operational';
      case 'Under Construction': return 'status-badge--construction';
      case 'Under Development': return 'status-badge--development';
      case 'Expanding': return 'status-badge--expanding';
      default: return 'status-badge--development';
    }
  }

  // ================================================================
  // STATE
  // ================================================================
  let data = [];
  let map = null;
  let markers = [];
  let activeCompanyFilter = null;
  let activeStatusFilter = null;
  let legendOpen = false;
  let currentTheme = 'dark';
  let tileLayer = null;

  // ================================================================
  // INIT
  // ================================================================
  async function init() {
    // Set dark theme by default
    document.documentElement.setAttribute('data-theme', 'dark');

    // Load data
    try {
      const resp = await fetch('./data.json');
      data = await resp.json();
    } catch (e) {
      console.error('Failed to load data:', e);
      return;
    }

    initMap();
    renderMarkers();
    renderFilters();
    renderLegend();
    updateStats();
    bindEvents();
  }

  // ================================================================
  // MAP
  // ================================================================
  function getTileUrl() {
    if (currentTheme === 'dark') {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  }

  function initMap() {
    map = L.map('map', {
      center: [30, -20],
      zoom: 3,
      minZoom: 2,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: false
    });

    tileLayer = L.tileLayer(getTileUrl(), {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Attribution
    L.control.attribution({
      prefix: false,
      position: 'bottomright'
    }).addTo(map).addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>');
  }

  function updateTileLayer() {
    if (tileLayer) {
      tileLayer.setUrl(getTileUrl());
    }
  }

  // ================================================================
  // MARKERS
  // ================================================================
  function parsePower(powerStr) {
    if (!powerStr) return 0;
    const s = powerStr.toLowerCase();
    // Extract numeric values
    const gwMatch = s.match(/([\d.]+)\s*gw/);
    const mwMatch = s.match(/([\d.]+)\s*mw/);
    if (gwMatch) return parseFloat(gwMatch[1]) * 1000; // Convert to MW
    if (mwMatch) return parseFloat(mwMatch[1]);
    if (s.includes('multi-gw')) return 2000;
    if (s.includes('multi-hundred mw')) return 500;
    return 200; // Default
  }

  function getMarkerRadius(powerMW) {
    // Scale: 200MW = 6px, 5000MW = 22px
    const minR = 6, maxR = 22;
    const minP = 200, maxP = 5000;
    const clamped = Math.max(minP, Math.min(maxP, powerMW));
    return minR + ((clamped - minP) / (maxP - minP)) * (maxR - minR);
  }

  function renderMarkers() {
    // Clear existing
    markers.forEach(m => map.removeLayer(m.marker));
    markers = [];

    const filteredData = data.filter(d => {
      const { group } = getCompanyGroup(d.company);
      const statusCat = getStatusCategory(d.status);
      if (activeCompanyFilter && group !== activeCompanyFilter) return false;
      if (activeStatusFilter && statusCat !== activeStatusFilter) return false;
      return true;
    });

    filteredData.forEach((d, i) => {
      const { group, color } = getCompanyGroup(d.company);
      const powerMW = parsePower(d.power);
      const radius = getMarkerRadius(powerMW);
      const statusCat = getStatusCategory(d.status);

      // Create custom div icon with pulse
      const iconSize = radius * 2;
      const pulseSize = iconSize * 2.5;
      const pulseOffset = (pulseSize - iconSize) / 2;

      const icon = L.divIcon({
        className: 'custom-marker',
        iconSize: [pulseSize, pulseSize],
        iconAnchor: [pulseSize / 2, pulseSize / 2],
        html: `
          <div style="position:relative;width:${pulseSize}px;height:${pulseSize}px;">
            <div class="marker-pulse" style="
              width:${iconSize}px;height:${iconSize}px;
              top:${pulseOffset}px;left:${pulseOffset}px;
              background:${color};
              animation-delay:${(i % 5) * 0.6}s;
            "></div>
            <div style="
              position:absolute;
              top:${pulseOffset}px;left:${pulseOffset}px;
              width:${iconSize}px;height:${iconSize}px;
              border-radius:50%;
              background:${color};
              opacity:0.85;
              border:${color === '#FFFFFF' ? '2px solid rgba(100,100,120,0.5)' : '1.5px solid rgba(255,255,255,0.15)'};
              box-shadow: 0 0 ${radius}px ${color}44, 0 0 ${radius * 0.4}px ${color}22;
              cursor:pointer;
              transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms;
            " onmouseover="this.style.transform='scale(1.2)';this.style.opacity='1';"
               onmouseout="this.style.transform='scale(1)';this.style.opacity='0.85';"
            ></div>
          </div>
        `
      });

      const marker = L.marker([d.lat, d.lng], { icon });

      // Tooltip
      const tooltipContent = `
        <div class="tooltip-inner">
          <div class="tooltip-name">${d.name}</div>
          <div class="tooltip-company">${d.company}</div>
          <div class="tooltip-row">
            <span class="tooltip-data">${d.power || 'TBD'}</span>
            <span class="tooltip-data">${d.investment || 'TBD'}</span>
          </div>
          <span class="tooltip-status status-badge ${getStatusBadgeClass(statusCat)}">${statusCat}</span>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -radius - 4],
        opacity: 1
      });

      marker.on('click', () => openDetailPanel(d));
      marker.addTo(map);

      markers.push({ marker, data: d, group, statusCat });
    });

    // Update stats based on filtered data
    updateStats(filteredData);
  }

  // ================================================================
  // FILTERS
  // ================================================================
  function renderFilters() {
    const companyGroups = [...new Set(data.map(d => getCompanyGroup(d.company).group))].sort();
    const statusCats = [...new Set(data.map(d => getStatusCategory(d.status)))].sort();

    const companyContainer = document.getElementById('companyFilters');
    const statusContainer = document.getElementById('statusFilters');

    // All chip
    companyContainer.innerHTML = `<button class="chip active" data-filter="company" data-value="">All</button>`;
    companyGroups.forEach(g => {
      const color = getCompanyGroup(data.find(d => getCompanyGroup(d.company).group === g).company).color;
      companyContainer.innerHTML += `<button class="chip" data-filter="company" data-value="${g}"><span class="chip__dot" style="background:${color}"></span>${g}</button>`;
    });

    statusContainer.innerHTML = `<button class="chip active" data-filter="status" data-value="">All</button>`;
    statusCats.forEach(s => {
      statusContainer.innerHTML += `<button class="chip" data-filter="status" data-value="${s}">${s}</button>`;
    });

    // Bind filter clicks
    document.querySelectorAll('.chip[data-filter="company"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value || null;
        activeCompanyFilter = val;
        document.querySelectorAll('.chip[data-filter="company"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMarkers();
      });
    });

    document.querySelectorAll('.chip[data-filter="status"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value || null;
        activeStatusFilter = val;
        document.querySelectorAll('.chip[data-filter="status"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMarkers();
      });
    });
  }

  // ================================================================
  // LEGEND
  // ================================================================
  function renderLegend() {
    const groups = [...new Set(data.map(d => getCompanyGroup(d.company).group))].sort();
    const legendBody = document.getElementById('legendBody');
    legendBody.innerHTML = groups.map(g => {
      const color = getCompanyGroup(data.find(d => getCompanyGroup(d.company).group === g).company).color;
      const borderStyle = color === '#FFFFFF' ? 'border: 1px solid #555;' : '';
      return `<div class="legend__item"><span class="legend__dot" style="background:${color};${borderStyle}"></span>${g}</div>`;
    }).join('');

    const legend = document.getElementById('legend');
    const toggle = document.getElementById('legendToggle');
    // Start collapsed to avoid overlapping markers
    toggle.addEventListener('click', () => {
      legend.classList.toggle('open');
    });
  }

  // ================================================================
  // STATS
  // ================================================================
  function parseInvestmentBillions(inv) {
    if (!inv) return 0;
    const s = inv.replace(/[,$]/g, '').toLowerCase();
    // Skip non-specific amounts
    if (s.includes('multi-billion') || s.includes('part of') || s.includes('tbd')) return 0;
    const bMatch = s.match(/([\d.]+)\s*b/);
    if (bMatch) return parseFloat(bMatch[1]);
    const mMatch = s.match(/([\d.]+)\s*m(?:illion)?/);
    if (mMatch) return parseFloat(mMatch[1]) / 1000;
    // Try euros
    const eurMatch = s.match(/€([\d.]+)\s*b/i);
    if (eurMatch) return parseFloat(eurMatch[1]) * 1.1;
    const aMatch = s.match(/a\$([\d.]+)\s*b/i);
    if (aMatch) return parseFloat(aMatch[1]) * 0.65;
    return 0;
  }

  function updateStats(filteredData) {
    const items = filteredData || data;
    const projectCount = items.length;

    let totalInvestment = 0;
    items.forEach(d => {
      totalInvestment += parseInvestmentBillions(d.investment);
    });

    let totalPowerGW = 0;
    items.forEach(d => {
      totalPowerGW += parsePower(d.power) / 1000;
    });

    animateValue('statProjects', projectCount, '', false);
    animateValue('statInvestment', Math.round(totalInvestment), '$', true, 'B+');
    animateValue('statPower', totalPowerGW.toFixed(1), '', false, ' GW');
  }

  function animateValue(elementId, targetValue, prefix, animate, suffix) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const numTarget = parseFloat(targetValue);
    if (isNaN(numTarget)) {
      el.textContent = prefix + targetValue + (suffix || '');
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    const startVal = 0;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numTarget - startVal) * eased;

      if (Number.isInteger(numTarget)) {
        el.textContent = (prefix || '') + Math.round(current) + (suffix || '');
      } else {
        el.textContent = (prefix || '') + current.toFixed(1) + (suffix || '');
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ================================================================
  // DETAIL PANEL
  // ================================================================
  function openDetailPanel(d) {
    const panel = document.getElementById('detailPanel');
    const { group, color } = getCompanyGroup(d.company);
    const statusCat = getStatusCategory(d.status);

    document.getElementById('panelCompany').textContent = d.company;
    document.getElementById('panelCompany').style.color = color;
    document.getElementById('panelTitle').textContent = d.name;

    const body = document.getElementById('panelBody');
    body.innerHTML = `
      <div class="detail-stats">
        <div class="detail-stat">
          <span class="detail-stat__value">${d.investment || 'TBD'}</span>
          <span class="detail-stat__label">Investment</span>
        </div>
        <div class="detail-stat">
          <span class="detail-stat__value">${d.power || 'TBD'}</span>
          <span class="detail-stat__label">Power Capacity</span>
        </div>
        <div class="detail-stat">
          <span class="detail-stat__value">${d.gpus || 'TBD'}</span>
          <span class="detail-stat__label">GPUs / Chips</span>
        </div>
        <div class="detail-stat">
          <span class="detail-stat__value">${d.jobs || 'TBD'}</span>
          <span class="detail-stat__label">Jobs</span>
        </div>
      </div>

      <div class="detail-field">
        <div class="detail-field__label">Status</div>
        <div class="detail-field__value">
          <span class="status-badge ${getStatusBadgeClass(statusCat)}">${statusCat}</span>
          <div style="margin-top:var(--space-2);font-size:var(--text-xs);color:var(--color-text-muted);">${d.status}</div>
        </div>
      </div>

      <div class="detail-field">
        <div class="detail-field__label">Location</div>
        <div class="detail-field__value">${d.location}</div>
      </div>

      <div class="detail-field">
        <div class="detail-field__label">Category</div>
        <div class="detail-field__value">${d.category}</div>
      </div>

      <div class="detail-divider"></div>

      <div class="detail-field">
        <div class="detail-field__label">Details</div>
        <div class="detail-field__value" style="line-height:1.6;">${d.details}</div>
      </div>

      ${d.source ? `
      <div class="detail-field">
        <div class="detail-field__label">Source</div>
        <div class="detail-field__value">
          <a href="${d.source}" target="_blank" rel="noopener noreferrer">${new URL(d.source).hostname.replace('www.','')}</a>
        </div>
      </div>
      ` : ''}
    `;

    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ================================================================
  // ABOUT MODAL
  // ================================================================
  function openAbout() {
    document.getElementById('aboutModal').classList.add('open');
  }

  function closeAbout() {
    document.getElementById('aboutModal').classList.remove('open');
  }

  // ================================================================
  // THEME TOGGLE
  // ================================================================
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateTileLayer();

    const toggle = document.querySelector('[data-theme-toggle]');
    toggle.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`);
    toggle.innerHTML = currentTheme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ================================================================
  // EVENT BINDINGS
  // ================================================================
  function bindEvents() {
    document.getElementById('panelClose').addEventListener('click', closeDetailPanel);
    document.getElementById('panelOverlay').addEventListener('click', closeDetailPanel);
    document.getElementById('aboutBtn').addEventListener('click', openAbout);
    document.getElementById('aboutClose').addEventListener('click', closeAbout);
    document.getElementById('aboutOverlay').addEventListener('click', closeAbout);
    document.querySelector('[data-theme-toggle]').addEventListener('click', toggleTheme);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailPanel();
        closeAbout();
      }
    });
  }

  // ================================================================
  // BOOT
  // ================================================================
  document.addEventListener('DOMContentLoaded', init);
})();
