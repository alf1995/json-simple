(function() {
  /**
   * CONFIGURACIÓN Y UTILS
   */
  const Utils = {
    isJsonPage: () => {
      const type = document.contentType;
      return (type && (type.includes('json') || type.includes('javascript'))) || type.includes('text/plain');
    },
    
    extractJson: (text) => {
      const startIndex = text.search(/[\[\{]/);
      const endIndex = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;
      
      try {
        const cleanText = text.substring(startIndex, endIndex + 1);
        return JSON.parse(cleanText);
      } catch (e) {
        return null;
      }
    },

    createElement: (tag, className, props = {}) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      Object.assign(el, props);
      return el;
    }
  };

  /**
   * RENDERIZADO
   */
  const Renderer = {
    render: (val, key = null) => {
      const wrapper = Utils.createElement('div', 'entry');
      const isObj = typeof val === 'object' && val !== null;
      const isArray = Array.isArray(val);
      
      const line = Utils.createElement('div', 'line');
      
      const toggle = Utils.createElement('span', 'toggle-btn', {
        textContent: isObj ? '▼' : '',
        onclick: isObj ? (e) => {
          e.stopPropagation();
          wrapper.classList.toggle('collapsed');
          toggle.textContent = wrapper.classList.contains('collapsed') ? '▶' : '▼';
        } : null
      });
      line.appendChild(toggle);

      if (key !== null) {
        const kSpan = Utils.createElement('span', 'json-key', { textContent: `"${key}": ` });
        line.appendChild(kSpan);
      }

      if (isObj) {
        line.append(isArray ? '[' : '{');
        wrapper.appendChild(line);

        const nodeArea = Utils.createElement('div', 'json-node');
        const keys = Object.keys(val);
        
        keys.forEach((k, i) => {
          const child = Renderer.render(val[k], isArray ? null : k);
          if (i < keys.length - 1) {
            const comma = Utils.createElement('span', '', { textContent: ',' });
            child.lastElementChild.appendChild(comma);
          }
          nodeArea.appendChild(child);
        });

        wrapper.appendChild(nodeArea);
        wrapper.appendChild(Utils.createElement('div', 'line footer-line', { 
          textContent: isArray ? ']' : '}' 
        }));
      } else {
        const type = val === null ? 'null' : typeof val;
        const vSpan = Utils.createElement('span', `json-${type}`, {
          textContent: type === 'string' ? `"${val}"` : String(val)
        });
        line.appendChild(vSpan);
        wrapper.appendChild(line);
      }
      return wrapper;
    }
  };

  /**
   * BÚSQUEDA Y UI
   */
  class JsonViewerApp {
    constructor(json) {
      this.json = json;
      this.matches = [];
      this.currentIndex = -1;
      this.container = Utils.createElement('div', '', { id: 'json-container' });
    }

    init() {
      document.body.classList.add('json-viewer-active');
      document.body.innerHTML = '';
      
      this.injectStyles();
      this.renderToolbar();
      
      document.body.appendChild(this.container);
      this.container.appendChild(Renderer.render(this.json));
      
      this.initTheme();
    }

    injectStyles() {
      const link = Utils.createElement('link', '', {
        rel: 'stylesheet',
        href: chrome.runtime.getURL('styles.css')
      });
      document.head.appendChild(link);
    }

    renderToolbar() {
      const nav = Utils.createElement('div', '', { id: 'json-toolbar' });
      nav.innerHTML = `
        <span style="font-weight:bold; opacity: 0.8; margin-right: 15px;">${chrome.i18n.getMessage("extName")}</span>
        <div class="search-container">
          <input type="text" id="json-search" placeholder="${chrome.i18n.getMessage("searchPlaceholder")}" autocomplete="off">
          <span id="search-count" class="search-info">0/0</span>
          <div class="search-nav-buttons">
            <button id="prev-btn" class="nav-btn">▲</button>
            <button id="next-btn" class="nav-btn">▼</button>
          </div>
        </div>
        <button id="copy-btn" class="tool-btn">${chrome.i18n.getMessage("copyBtn")}</button>
        <button id="collapse-all-btn" class="tool-btn">${chrome.i18n.getMessage("collapseAll")}</button>
        <select id="theme-selector">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      `;
      document.body.appendChild(nav);
      this.setupListeners();
    }

    setupListeners() {
      const searchInput = document.getElementById('json-search');
      
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      document.getElementById('next-btn').onclick = () => this.navigateSearch(1);
      document.getElementById('prev-btn').onclick = () => this.navigateSearch(-1);
      
      document.getElementById('copy-btn').onclick = this.copyToClipboard.bind(this);
      document.getElementById('collapse-all-btn').onclick = this.toggleCollapseAll.bind(this);
      
      const themeSelector = document.getElementById('theme-selector');
      themeSelector.onchange = (e) => this.setTheme(e.target.value);
    }

    handleSearch(term) {
      this.container.querySelectorAll('.search-match').forEach(el => el.classList.remove('search-match', 'current'));
      const countDisplay = document.getElementById('search-count');

      if (!term) {
        this.matches = [];
        countDisplay.textContent = "0/0";
        return;
      }

      const targets = this.container.querySelectorAll('.json-key, .json-string, .json-number, .json-boolean');
      this.matches = Array.from(targets).filter(el => el.textContent.toLowerCase().includes(term.toLowerCase()));
      
      this.matches.forEach(el => el.classList.add('search-match'));
      
      if (this.matches.length > 0) {
        this.currentIndex = 0;
        this.scrollToMatch();
      } else {
        countDisplay.textContent = "0/0";
      }
    }

    navigateSearch(direction) {
      if (this.matches.length === 0) return;
      this.currentIndex = (this.currentIndex + direction + this.matches.length) % this.matches.length;
      this.scrollToMatch();
    }

    scrollToMatch() {
      const target = this.matches[this.currentIndex];
      this.matches.forEach(m => m.classList.remove('current'));
      target.classList.add('current');
      
      document.getElementById('search-count').textContent = `${this.currentIndex + 1}/${this.matches.length}`;

      let parent = target.closest('.entry');
      while (parent && parent !== this.container) {
        if (parent.classList.contains('collapsed')) {
          parent.classList.remove('collapsed');
          const btn = parent.querySelector('.toggle-btn');
          if (btn) btn.textContent = '▼';
        }
        parent = parent.parentElement.closest('.entry');
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async copyToClipboard() {
      await navigator.clipboard.writeText(JSON.stringify(this.json, null, 2));
      const btn = document.getElementById('copy-btn');
      const originalText = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(() => btn.textContent = originalText, 2000);
    }

    toggleCollapseAll() {
      const btn = document.getElementById('collapse-all-btn');
      const isCollapsing = btn.textContent === 'Colapsar Todo';
      
      this.container.querySelectorAll('.entry').forEach(node => {
        if (node.querySelector('.json-node')) {
          node.classList.toggle('collapsed', isCollapsing);
          const tBtn = node.querySelector('.toggle-btn');
          if (tBtn) tBtn.textContent = isCollapsing ? '▶' : '▼';
        }
      });
      btn.textContent = isCollapsing ? 'Expandir Todo' : 'Colapsar Todo';
    }

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('j-viewer-t', theme);
    }

    initTheme() {
      const savedTheme = localStorage.getItem('j-viewer-t') || 'dark';
      this.setTheme(savedTheme);
      document.getElementById('theme-selector').value = savedTheme;
    }
  }

  /**
   * PUNTO DE ENTRADA
   */
  if (Utils.isJsonPage()) {
    const rawText = document.body.innerText.trim();
    const jsonData = Utils.extractJson(rawText);
    
    if (jsonData) {
      const app = new JsonViewerApp(jsonData);
      app.init();
    }
  }
})();