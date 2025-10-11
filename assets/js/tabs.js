(function () {
  "use strict";

  function initTabs(root = document) {
    // Find any UL that declares data-tab (header) and pair with its tab-content
    const headers = root.querySelectorAll('ul[data-tab]');
    headers.forEach((header) => {
      const groupId = header.getAttribute('data-tab');
      const panels = root.querySelector(`ul.tab-content[id="${groupId}"]`);
      if (!panels) return;

      const headerItems = Array.from(header.querySelectorAll(':scope > li'));
      const panelItems  = Array.from(panels.querySelectorAll(':scope > li'));
      const count = Math.min(headerItems.length, panelItems.length);

      header.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        e.preventDefault();

        const li = a.closest('li');
        const idx = headerItems.indexOf(li);
        if (idx === -1) return;

        // Toggle active classes
        headerItems.forEach((n, i) => n.classList.toggle('active', i === idx));
        panelItems.forEach((n, i) => n.classList.toggle('active', i === idx));

        // Optional: update browser history (hashless)
        const group = header.dataset.name || groupId || 'tabs';
        const label = (a.textContent || '').trim();
        const state = { __tabs__: true, group, index: idx, label };
        if (history.replaceState) history.replaceState(state, '');
      }, { passive: false });

      // Initial activation (from ?tab=... or default)
      const params = new URLSearchParams(window.location.search);
      const want = params.get('tab');
      let idx = 0;
      if (want) {
        if (/^\d+$/.test(want)) {
          idx = Math.max(0, Math.min(count - 1, parseInt(want, 10) - 1));
        } else {
          const lower = want.toLowerCase();
          idx = headerItems.findIndex(li => {
            const a = li.querySelector('a');
            return a && (a.textContent || '').trim().toLowerCase() === lower;
          });
          if (idx < 0) idx = 0;
        }
      } else {
        const anyActive = header.querySelector(':scope > li.active');
        idx = anyActive ? headerItems.indexOf(anyActive) : 0;
      }
      headerItems.forEach((n, i) => n.classList.toggle('active', i === idx));
      panelItems.forEach((n, i) => n.classList.toggle('active', i === idx));
    });
  }

  // Run on full loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTabs());
  } else {
    initTabs();
  }

  // Re-run on soft navigation frameworks
  window.addEventListener('pageshow', () => initTabs());
  document.addEventListener('turbo:load', () => initTabs());
  document.addEventListener('turbolinks:load', () => initTabs());
})();
