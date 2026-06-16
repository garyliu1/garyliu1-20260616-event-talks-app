// App State
let state = {
    releases: [],
    selectedNoteId: null,
    searchTerm: '',
    typeFilter: 'all',
    activeTemplate: 'default'
};

// SVG Icons for cards
const ICONS = {
    calendar: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    copy: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    copyText: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    twitter: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
};

// DOM Elements
const DOM = {
    refreshBtn: document.getElementById('refresh-btn'),
    refreshIcon: document.getElementById('refresh-icon'),
    spinner: document.getElementById('spinner'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    themeToggleBtn: document.getElementById('theme-toggle'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    charOverflowWarning: document.getElementById('char-overflow-warning'),
    charOverflowCount: document.getElementById('char-overflow-count'),
    cardsContainer: document.getElementById('cards-container'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    typeFiltersContainer: document.getElementById('type-filters-container'),
    feedStatusText: document.getElementById('feed-status-text'),
    emptyState: document.getElementById('empty-state'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    
    // Stats elements
    statTotal: document.getElementById('stat-total'),
    statFeatures: document.getElementById('stat-features'),
    statIssues: document.getElementById('stat-issues'),
    statChanged: document.getElementById('stat-changed'),
    statDeprecated: document.getElementById('stat-deprecated'),
    statCards: document.querySelectorAll('.stat-card'),
    
    // Share Workspace elements
    workspaceEmptyState: document.getElementById('workspace-empty-state'),
    workspaceComposer: document.getElementById('workspace-composer'),
    composerNoteType: document.getElementById('composer-note-type'),
    composerNoteDate: document.getElementById('composer-note-date'),
    tweetTextarea: document.getElementById('tweet-text'),
    charCountText: document.getElementById('char-count-text'),
    charProgressCircle: document.getElementById('char-progress-circle'),
    tweetSubmitBtn: document.getElementById('tweet-submit-btn'),
    cancelSelectionBtn: document.getElementById('cancel-selection-btn'),
    
    // Templates
    tplDefault: document.getElementById('tpl-default'),
    tplNews: document.getElementById('tpl-news'),
    tplShort: document.getElementById('tpl-short'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.querySelector('.toast-message')
};

// Circular Progress Bar configuration
const CIRCLE_RADIUS = 12;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Initialize circle stroke-dasharray
if (DOM.charProgressCircle) {
    DOM.charProgressCircle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
    DOM.charProgressCircle.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
}

// Map types to CSS themes
const TYPE_CONFIG = {
    'Feature': {
        accent: 'var(--type-feature)',
        bg: 'var(--type-feature-bg)'
    },
    'Issue': {
        accent: 'var(--type-issue)',
        bg: 'var(--type-issue-bg)'
    },
    'Changed': {
        accent: 'var(--type-changed)',
        bg: 'var(--type-changed-bg)'
    },
    'Deprecated': {
        accent: 'var(--type-deprecated)',
        bg: 'var(--type-deprecated-bg)'
    },
    'default': {
        accent: 'var(--type-fallback)',
        bg: 'var(--type-fallback-bg)'
    }
};

// Templates Generators
const TWEET_TEMPLATES = {
    default: (note, cleanSummary) => {
        // Truncate to leave space for boilerplate, link and hashtags
        const maxLen = 140; 
        const summary = cleanSummary.length > maxLen ? cleanSummary.substring(0, maxLen - 3) + '...' : cleanSummary;
        return `🚀 BigQuery Update [${note.date}] (${note.type}):\n\n${summary}\n\nRead details here: ${note.link} #BigQuery #GoogleCloud`;
    },
    news: (note, cleanSummary) => {
        const maxLen = 130;
        const summary = cleanSummary.length > maxLen ? cleanSummary.substring(0, maxLen - 3) + '...' : cleanSummary;
        return `📰 GCP NEWS: ${note.type} released in Google Cloud BigQuery on ${note.date}.\n\n"${summary}"\n\n🔗 ${note.link} #GCP #DataAnalytics`;
    },
    short: (note, cleanSummary) => {
        const maxLen = 160;
        const summary = cleanSummary.length > maxLen ? cleanSummary.substring(0, maxLen - 3) + '...' : cleanSummary;
        return `⚡ BigQuery ${note.type} (${note.date}): ${summary} ${note.link} #BigQuery`;
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchReleaseNotes();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Refresh Button Click
    DOM.refreshBtn.addEventListener('click', () => {
        fetchReleaseNotes(true);
    });

    // Export CSV Button Click
    if (DOM.exportCsvBtn) {
        DOM.exportCsvBtn.addEventListener('click', () => {
            exportToCSV();
        });
    }

    // Search Input
    DOM.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.trim().toLowerCase();
        toggleSearchClearBtn();
        render();
    });

    // Search Clear Button
    DOM.searchClear.addEventListener('click', () => {
        DOM.searchInput.value = '';
        state.searchTerm = '';
        toggleSearchClearBtn();
        render();
        DOM.searchInput.focus();
    });

    // Type Filter Pills
    DOM.typeFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            const type = e.target.getAttribute('data-type');
            setActiveFilterPill(type);
            state.typeFilter = type;
            render();
        }
    });

    // Stat Cards Filter Click
    DOM.statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filterType = card.getAttribute('data-filter');
            // Sync with pill
            setActiveFilterPill(filterType);
            state.typeFilter = filterType;
            render();
            
            // Scroll to control section
            DOM.searchInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    // Reset Filters Button
    DOM.resetFiltersBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        state.searchTerm = '';
        toggleSearchClearBtn();
        setActiveFilterPill('all');
        state.typeFilter = 'all';
        render();
    });

    // Tweet text change listener
    DOM.tweetTextarea.addEventListener('input', () => {
        updateCharacterCount();
    });

    // Template Selector Chip clicks
    DOM.tplDefault.addEventListener('click', () => setTemplate('default'));
    DOM.tplNews.addEventListener('click', () => setTemplate('news'));
    DOM.tplShort.addEventListener('click', () => setTemplate('short'));

    // Cancel Selection
    DOM.cancelSelectionBtn.addEventListener('click', () => {
        selectNote(null);
    });

    // Post to X Button click
    DOM.tweetSubmitBtn.addEventListener('click', () => {
        const text = DOM.tweetTextarea.value;
        if (text.length > 280) {
            showToast('Post exceeds X limit of 280 characters!', true);
            return;
        }
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        showToast('Redirected to X composer.');
    });

    // Theme Toggle Button click
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

// Fetch Release Notes
async function fetchReleaseNotes(forceRefresh = false) {
    showLoading(true);
    let url = '/api/releases';
    if (forceRefresh) {
        url += '?refresh=true';
    }

    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === 'success' || result.status === 'partial_success') {
            state.releases = result.data;
            
            // Show metadata of fetch
            const fetchTimeStr = new Date(result.last_fetched * 1000).toLocaleTimeString();
            const sourceStr = result.source === 'cache' ? 'Cached' : 'Live Feed';
            DOM.feedStatusText.textContent = `Synced: ${fetchTimeStr} (${sourceStr})`;
            
            if (forceRefresh) {
                showToast('Release notes successfully refreshed!');
            }
        } else {
            showToast(result.message || 'Error fetching feed data.', true);
        }
    } catch (error) {
        console.error('Error fetching release notes:', error);
        showToast('Network error while connecting to backend.', true);
    } finally {
        showLoading(false);
        calculateStats();
        render();
    }
}

// Show/Hide Loading state
function showLoading(isLoading) {
    if (isLoading) {
        DOM.refreshBtn.disabled = true;
        DOM.refreshIcon.classList.add('hidden');
        DOM.spinner.classList.remove('hidden');
        
        // Render skeletons in container
        DOM.cardsContainer.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
        DOM.emptyState.classList.add('hidden');
    } else {
        DOM.refreshBtn.disabled = false;
        DOM.refreshIcon.classList.remove('hidden');
        DOM.spinner.classList.add('hidden');
    }
}

// Calculate Stats dynamically
function calculateStats() {
    const total = state.releases.length;
    const features = state.releases.filter(r => r.type === 'Feature').length;
    const issues = state.releases.filter(r => r.type === 'Issue').length;
    const changed = state.releases.filter(r => r.type === 'Changed').length;
    const deprecated = state.releases.filter(r => r.type === 'Deprecated').length;

    DOM.statTotal.textContent = total;
    DOM.statFeatures.textContent = features;
    DOM.statIssues.textContent = issues;
    DOM.statChanged.textContent = changed;
    DOM.statDeprecated.textContent = deprecated;
}

// Toggle Search Clear Button visibility
function toggleSearchClearBtn() {
    if (state.searchTerm) {
        DOM.searchClear.classList.remove('hidden');
    } else {
        DOM.searchClear.classList.add('hidden');
    }
}

// Set Active Filter Pill Style
function setActiveFilterPill(type) {
    const pills = DOM.typeFiltersContainer.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        if (pill.getAttribute('data-type') === type) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

// Get currently active filtered releases
function getFilteredReleases() {
    return state.releases.filter(item => {
        // Filter by Type
        if (state.typeFilter !== 'all' && item.type !== state.typeFilter) {
            return false;
        }
        
        // Filter by Search Query
        if (state.searchTerm) {
            const inText = item.text_summary.toLowerCase().includes(state.searchTerm);
            const inDate = item.date.toLowerCase().includes(state.searchTerm);
            const inType = item.type.toLowerCase().includes(state.searchTerm);
            return inText || inDate || inType;
        }
        
        return true;
    });
}

// Render release note cards based on current filters
function render() {
    const filteredReleases = getFilteredReleases();

    if (filteredReleases.length === 0) {
        DOM.cardsContainer.innerHTML = '';
        DOM.emptyState.classList.remove('hidden');
        return;
    }

    DOM.emptyState.classList.add('hidden');
    
    // Generate card fragments
    DOM.cardsContainer.innerHTML = '';
    
    filteredReleases.forEach(item => {
        const isSelected = state.selectedNoteId === item.id;
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG['default'];
        
        const card = document.createElement('div');
        card.className = `release-card ${isSelected ? 'selected-card' : ''}`;
        card.setAttribute('data-id', item.id);
        card.style.setProperty('--card-accent', config.accent);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-meta">
                    <span class="type-badge" style="--badge-bg: ${config.bg}; --badge-color: ${config.accent}">${item.type}</span>
                    <span class="card-date">${ICONS.calendar} ${item.date}</span>
                </div>
                
                <div class="select-container ${isSelected ? 'checked' : ''}" onclick="toggleSelect('${item.id}')">
                    <div class="select-checkbox">
                        ${ICONS.check}
                    </div>
                    <span>${isSelected ? 'Selected' : 'Select Update'}</span>
                </div>
            </div>
            
            <div class="card-content">
                ${item.content}
            </div>
            
            <div class="card-footer">
                <div class="card-footer-left">
                    <button class="btn-card-action" onclick="copyToClipboard('${item.link}', event)">
                        <span class="action-icon">${ICONS.copy}</span>
                        <span>Copy Link</span>
                    </button>
                    <button class="btn-card-action" onclick="copyTextToClipboard('${item.id}', event)">
                        <span class="action-icon">${ICONS.copyText}</span>
                        <span>Copy Text</span>
                    </button>
                    <a class="btn-card-action" href="${item.link}" target="_blank" onclick="event.stopPropagation()">
                        <span class="action-icon">${ICONS.externalLink}</span>
                        <span>Source Note</span>
                    </a>
                </div>
                
                <button class="btn-card-tweet" onclick="tweetDirectly('${item.id}', event)">
                    <span class="action-icon">${ICONS.twitter}</span>
                    <span>Tweet This</span>
                </button>
            </div>
        `;
        
        DOM.cardsContainer.appendChild(card);
    });
}

// Toggle Selection from Card Header
window.toggleSelect = function(id) {
    if (state.selectedNoteId === id) {
        selectNote(null);
    } else {
        selectNote(id);
    }
};

// Tweet Directly button inside the card footer
window.tweetDirectly = function(id, event) {
    event.stopPropagation();
    selectNote(id);
    // Scroll workspace composer into view if on mobile/small screens
    if (window.innerWidth <= 1024) {
        DOM.workspaceComposer.scrollIntoView({ behavior: 'smooth' });
    }
};

// Copy feed item link to clipboard
window.copyToClipboard = function(text, event) {
    event.stopPropagation();
    
    // Change icon visually inside target
    const btn = event.currentTarget;
    const textSpan = btn.querySelector('span:last-child');
    const iconSpan = btn.querySelector('.action-icon');
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!');
        
        // Provide visual feedback
        const originalText = textSpan.textContent;
        const originalIcon = iconSpan.innerHTML;
        
        textSpan.textContent = 'Copied!';
        iconSpan.innerHTML = ICONS.check;
        btn.style.color = 'var(--accent-cyan)';
        
        setTimeout(() => {
            textSpan.textContent = originalText;
            iconSpan.innerHTML = originalIcon;
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy link.', true);
    });
};

// Handles selection update and UI sync
function selectNote(id) {
    state.selectedNoteId = id;
    
    // Highlight active card
    const cards = DOM.cardsContainer.querySelectorAll('.release-card');
    cards.forEach(card => {
        if (card.getAttribute('data-id') === id) {
            card.classList.add('selected-card');
            const selector = card.querySelector('.select-container');
            selector.classList.add('checked');
            selector.querySelector('span').textContent = 'Selected';
        } else {
            card.classList.remove('selected-card');
            const selector = card.querySelector('.select-container');
            if (selector) {
                selector.classList.remove('checked');
                selector.querySelector('span').textContent = 'Select Update';
            }
        }
    });

    if (id === null) {
        DOM.workspaceComposer.classList.add('hidden');
        DOM.workspaceEmptyState.classList.remove('hidden');
    } else {
        const note = state.releases.find(r => r.id === id);
        if (note) {
            DOM.workspaceEmptyState.classList.add('hidden');
            DOM.workspaceComposer.classList.remove('hidden');
            
            // Set note metadata
            DOM.composerNoteDate.textContent = note.date;
            DOM.composerNoteType.textContent = note.type;
            
            const config = TYPE_CONFIG[note.type] || TYPE_CONFIG['default'];
            DOM.composerNoteType.style.setProperty('--badge-bg', config.bg);
            DOM.composerNoteType.style.setProperty('--badge-color', config.accent);
            
            // Regenerate template content
            setTemplate(state.activeTemplate);
        }
    }
}

// Update Active Template chip and populate composer
function setTemplate(tplName) {
    state.activeTemplate = tplName;
    
    // Active chip toggling
    DOM.tplDefault.classList.toggle('active', tplName === 'default');
    DOM.tplNews.classList.toggle('active', tplName === 'news');
    DOM.tplShort.classList.toggle('active', tplName === 'short');
    
    if (!state.selectedNoteId) return;
    
    const note = state.releases.find(r => r.id === state.selectedNoteId);
    if (note) {
        const templateFunc = TWEET_TEMPLATES[tplName];
        const draftText = templateFunc(note, note.text_summary);
        
        DOM.tweetTextarea.value = draftText;
        updateCharacterCount();
    }
}

// Real-time character count and circular progress updates
function updateCharacterCount() {
    const text = DOM.tweetTextarea.value;
    const len = text.length;
    const remaining = 280 - len;
    
    // Update label text
    DOM.charCountText.textContent = remaining;
    
    // Progress Ring Calculations
    let progress = Math.min(len / 280, 1.0);
    const offset = CIRCLE_CIRCUMFERENCE - (progress * CIRCLE_CIRCUMFERENCE);
    DOM.charProgressCircle.style.strokeDashoffset = offset;
    
    // Handle Character Overflow Warning explanation
    if (remaining < 0) {
        const overflow = len - 280;
        if (DOM.charOverflowWarning) {
            DOM.charOverflowWarning.classList.remove('hidden');
            DOM.charOverflowCount.textContent = overflow;
        }
    } else {
        if (DOM.charOverflowWarning) {
            DOM.charOverflowWarning.classList.add('hidden');
        }
    }
    
    // Color states based on limits
    if (remaining < 0) {
        DOM.charCountText.className = 'char-count danger';
        DOM.charProgressCircle.style.stroke = 'var(--accent-red)';
        DOM.tweetSubmitBtn.disabled = true;
    } else if (remaining <= 20) {
        DOM.charCountText.className = 'char-count warning';
        DOM.charProgressCircle.style.stroke = 'var(--accent-deprecated)';
        DOM.tweetSubmitBtn.disabled = false;
    } else {
        DOM.charCountText.className = 'char-count';
        DOM.charProgressCircle.style.stroke = 'var(--accent-cyan)';
        DOM.tweetSubmitBtn.disabled = false;
    }
}

// Show standard Toast notification
function showToast(message, isError = false) {
    DOM.toastMessage.textContent = message;
    
    if (isError) {
        DOM.toast.style.borderColor = 'var(--accent-red)';
        DOM.toast.style.boxShadow = '0 10px 30px rgba(244, 63, 94, 0.2)';
    } else {
        DOM.toast.style.borderColor = 'var(--accent-cyan)';
        DOM.toast.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.2)';
    }
    
    DOM.toast.classList.add('show');
    DOM.toast.classList.remove('hidden');
    
    // Automatically hide after 3.5s
    setTimeout(() => {
        DOM.toast.classList.remove('show');
        setTimeout(() => {
            DOM.toast.classList.add('hidden');
        }, 300);
    }, 3500);
}

// Initialize theme on startup
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode!`);
}

// Apply the theme and sync icons
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
        if (DOM.themeIconSun) DOM.themeIconSun.classList.add('hidden');
        if (DOM.themeIconMoon) DOM.themeIconMoon.classList.remove('hidden');
    } else {
        if (DOM.themeIconSun) DOM.themeIconSun.classList.remove('hidden');
        if (DOM.themeIconMoon) DOM.themeIconMoon.classList.add('hidden');
    }
}

// Copy plain text content of a note to clipboard
window.copyTextToClipboard = function(id, event) {
    event.stopPropagation();
    const note = state.releases.find(r => r.id === id);
    if (!note) return;

    const btn = event.currentTarget;
    const textSpan = btn.querySelector('span:last-child');
    const iconSpan = btn.querySelector('.action-icon');

    navigator.clipboard.writeText(note.text_summary).then(() => {
        showToast('Update text copied to clipboard!');
        
        const originalText = textSpan.textContent;
        const originalIcon = iconSpan.innerHTML;
        
        textSpan.textContent = 'Copied!';
        iconSpan.innerHTML = ICONS.check;
        btn.style.color = 'var(--accent-cyan)';
        
        setTimeout(() => {
            textSpan.textContent = originalText;
            iconSpan.innerHTML = originalIcon;
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy text.', true);
    });
};

// Export currently filtered releases to CSV
function exportToCSV() {
    const filteredReleases = getFilteredReleases();
    if (filteredReleases.length === 0) {
        showToast('No releases to export.', true);
        return;
    }

    const headers = ['Date', 'Type', 'Link', 'Summary'];
    const rows = filteredReleases.map(item => [
        item.date,
        item.type,
        item.link,
        item.text_summary
    ]);

    // Format row values: escape double quotes, wrap in quotes
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create a Blob and download it
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `bigquery_release_notes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV export completed successfully!');
    } catch (e) {
        console.error('CSV Export failed:', e);
        showToast('Failed to export CSV.', true);
    }
}
