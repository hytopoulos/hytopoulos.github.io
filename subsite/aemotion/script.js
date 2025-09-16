// Global variables
let noscopeData = [];
let filteredData = [];
let featureGroups = {}; // Group entries by feature number
let topRankingByFeature = {}; // Track top-ranking entry for each feature
let intersectionObserver; // Intersection Observer for viewport-based loading

// DOM elements
const loadingElement = document.getElementById('loading');
const contentElement = document.getElementById('content');
const emotionFilter = document.getElementById('emotion-filter');
const resultsContainer = document.getElementById('results-container');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        setupFilters();
        renderResults();
        showContent();
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    }
});

// Load JSON data
async function loadData() {
    try {
        const response = await fetch('results.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        noscopeData = await response.json();
        
        // Group entries by feature number and find top-ranking entries
        processFeatureData();
        
        filteredData = [...noscopeData];
        console.log(`Loaded ${noscopeData.length} feature entries`);
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Process feature data to group by feature and find top-ranking entries
function processFeatureData() {
    featureGroups = {};
    topRankingByFeature = {};
    
    noscopeData.forEach((item, index) => {
        const featureNum = item.feat;
        
        // Group by feature number
        if (!featureGroups[featureNum]) {
            featureGroups[featureNum] = [];
        }
        featureGroups[featureNum].push({ ...item, originalIndex: index });
        
        // Track top-ranking entry (highest Δfreq(pos-neg)) for each feature
        const deltaFreq = item["Δfreq(pos-neg)"];
        if (!topRankingByFeature[featureNum] || deltaFreq > topRankingByFeature[featureNum].deltaFreq) {
            topRankingByFeature[featureNum] = {
                ...item,
                originalIndex: index,
                deltaFreq: deltaFreq
            };
        }
    });
}

// Setup filter dropdown
function setupFilters() {
    const emotions = [...new Set(noscopeData.map(item => item.label))].sort();
    
    // Clear existing options except "All Emotions"
    emotionFilter.innerHTML = '<option value="all">All Emotions</option>';
    
    // Add emotion options
    emotions.forEach(emotion => {
        const option = document.createElement('option');
        option.value = emotion;
        option.textContent = emotion;
        emotionFilter.appendChild(option);
    });
    
    // Add event listener
    emotionFilter.addEventListener('change', handleFilterChange);
}

// Handle filter changes
function handleFilterChange() {
    const selectedEmotion = emotionFilter.value;
    
    if (selectedEmotion === 'all') {
        filteredData = [...noscopeData];
    } else {
        filteredData = noscopeData.filter(item => item.label === selectedEmotion);
    }
    
    renderResults();
}

// Render results
function renderResults() {
    resultsContainer.innerHTML = '';
    
    if (filteredData.length === 0) {
        resultsContainer.innerHTML = '<p class="error-message">No results found for the selected filter.</p>';
        return;
    }
    
    // Filter to show only top-ranking entries for each feature
    const topRankingEntries = getTopRankingEntries(filteredData);
    
    topRankingEntries.forEach((item, index) => {
        const sectionElement = createFeatureSection(item, index);
        resultsContainer.appendChild(sectionElement);
    });
}

// Get only top-ranking entries for each feature
function getTopRankingEntries(data) {
    const topEntries = [];
    const processedFeatures = new Set();
    
    data.forEach(item => {
        const featureNum = item.feat;
        if (!processedFeatures.has(featureNum)) {
            const topEntry = topRankingByFeature[featureNum];
            if (topEntry && topEntry.originalIndex === item.index) {
                topEntries.push(item);
                processedFeatures.add(featureNum);
            }
        }
    });
    
    return topEntries;
}

// Create feature section element
function createFeatureSection(item, index) {
    const section = document.createElement('div');
    section.className = 'feature-section';
    section.id = `feature-${index}`;
    
    // Handle null responses by finding valid response from same feature
    let responseData = item.response;
    let responseSource = '';
    
    if (!responseData || responseData === null) {
        // Find a valid response from the same feature
        const sameFeatureEntries = featureGroups[item.feat] || [];
        const validEntry = sameFeatureEntries.find(entry => entry.response && entry.response !== null);
        
        if (validEntry) {
            responseData = validEntry.response;
            responseSource = ` (using images from ${validEntry.label} class)`;
        }
    }
    
    // Get top 6 images
    const topImages = responseData?.matches?.slice(0, 6) || [];
    
    // Get top-ranking entry for this feature
    const topRankingEntry = topRankingByFeature[item.feat];
    const isTopRanking = topRankingEntry && topRankingEntry.originalIndex === item.index;
    
    section.innerHTML = `
        <div class="feature-header">
            <h2 class="emotion-title">${item.label}</h2>
            <div class="feature-title-group">
                <span class="feature-element">Feature ${item.feat}</span>
                <span class="delta-freq">(Δ${(item["Δfreq(pos-neg)"] * 100).toFixed(1)}%)</span>
                ${!isTopRanking && topRankingEntry ? 
                    `<a href="#feature-${topRankingEntry.originalIndex}" class="top-ranking-link" title="Go to top-ranking class for this feature">
                        → Top: ${topRankingEntry.label} (Δ${(topRankingEntry.deltaFreq * 100).toFixed(2)}%)
                    </a>` : ''
                }
            </div>
        </div>
        
        ${getAlsoExpressedNote(item)}
        
        <div class="images-section">
            <div class="images-grid-5x4" id="images-grid-${index}" data-matches='${JSON.stringify(responseData?.matches || [])}'>
                <!-- 20 images will be preloaded in 5x4 grid -->
            </div>
        </div>
    `;
    
    // Set up viewport-based loading for this grid
    setTimeout(() => {
        setupViewportLoading(`images-grid-${index}`);
    }, 0);
    
    return section;
}

// Setup viewport-based loading using Intersection Observer
function setupViewportLoading(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid || grid.dataset.observing === 'true') return;
    
    // Mark as being observed to prevent duplicates
    grid.dataset.observing = 'true';
    
    // Create intersection observer if it doesn't exist
    if (!intersectionObserver) {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.loaded) {
                    entry.target.dataset.loaded = 'true';
                    const gridId = entry.target.id;
                    const matchesData = JSON.parse(entry.target.dataset.matches || '[]');
                    preloadImagesIn5x4Grid(matchesData, gridId);
                }
            });
        }, {
            rootMargin: '200px' // Start loading 200px before entering viewport
        });
    }
    
    // Observe this grid
    intersectionObserver.observe(grid);
}

// Get "also expressed in" note for top-ranking entries
function getAlsoExpressedNote(item) {
    const featureNum = item.feat;
    const sameFeatureEntries = featureGroups[featureNum] || [];
    
    // Find other emotions for this feature (excluding the current one)
    const otherEmotions = sameFeatureEntries
        .filter(entry => entry.label !== item.label)
        .map(entry => ({
            label: entry.label,
            deltaFreq: entry["Δfreq(pos-neg)"]
        }))
        .sort((a, b) => b.deltaFreq - a.deltaFreq)
        .slice(0, 3); // Show top 3 other emotions
    
    if (otherEmotions.length === 0) {
        return '';
    }
    
    const emotionList = otherEmotions
        .map(emotion => `${emotion.label}: ${(emotion.deltaFreq * 100).toFixed(1)}%`)
        .join(', ');
    
    return `
        <div class="also-expressed-note">
            <strong>Also expressed in:</strong> ${emotionList}
        </div>
    `;
}

// Preload images in a 5x4 grid (exactly 20 images)
function preloadImagesIn5x4Grid(matches, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid || grid.querySelector('.grid-5x4')) {
        return; // Already loaded or grid doesn't exist
    }
    
    if (!matches || matches.length === 0) {
        grid.innerHTML = '<div class="no-images-message">No images available for this feature/emotion combination.</div>';
        return;
    }
    
    // Create 5x4 grid structure
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-5x4';
    
    // Create exactly 20 empty slots
    const slots = [];
    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'image-slot empty';
        slot.innerHTML = '<div class="empty-slot">—</div>';
        slots.push(slot);
        gridContainer.appendChild(slot);
    }
    
    grid.innerHTML = '';
    grid.appendChild(gridContainer);
    
    // Track loaded images and current match index
    let loadedCount = 0;
    let matchIndex = 0;
    const usedUrls = new Set();
    
    // Function to try loading next available image
    function tryLoadNextImage() {
        if (loadedCount >= 20 || matchIndex >= matches.length) {
            return; // All slots filled or no more images
        }
        
        const match = matches[matchIndex];
        const [similarity, url] = match;
        matchIndex++;
        
        // Skip duplicates
        if (usedUrls.has(url)) {
            tryLoadNextImage();
            return;
        }
        
        const img = new Image();
        
        img.onload = function() {
            if (loadedCount < 20) {
                usedUrls.add(url);
                const slot = slots[loadedCount];
                slot.className = 'image-slot loaded';
                slot.innerHTML = `
                    <img src="${url}" alt="Image ${loadedCount + 1}">
                    <div class="image-info">
                        <div class="similarity-score">${(similarity * 100).toFixed(1)}%</div>
                    </div>
                `;
                loadedCount++;
                
                // Try to load next image
                setTimeout(tryLoadNextImage, 10);
            }
        };
        
        img.onerror = function() {
            // Try next image on error
            tryLoadNextImage();
        };
        
        img.src = url;
    }
    
    // Start loading process
    tryLoadNextImage();
}

// Create image item element (legacy function, kept for compatibility)
function createImageItem(match, index) {
    const [similarity, url, description, , dimensions] = match;
    const [width, height] = dimensions || [0, 0];
    
    return `
        <div class="image-item">
            <img src="${url}" 
                 alt="Similar image ${index + 1}" 
                 loading="lazy"
                 onerror="handleImageError(this)">
            <div class="image-info">
                <div class="similarity-score">Similarity: ${(similarity * 100).toFixed(2)}%</div>
                <div class="image-dimensions">${width} × ${height}px</div>
            </div>
        </div>
    `;
}

// Handle image loading errors
function handleImageError(img) {
    img.style.display = 'none';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'image-error';
    errorDiv.textContent = 'Image failed to load';
    img.parentNode.insertBefore(errorDiv, img);
}

// Show content and hide loading
function showContent() {
    loadingElement.classList.add('hidden');
    contentElement.classList.remove('hidden');
}

// Show error message
function showError(message) {
    loadingElement.innerHTML = `
        <div class="error-message">
            <strong>Error:</strong> ${message}
        </div>
    `;
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals);
}

// Add smooth scrolling for better UX
function scrollToFeature(index) {
    const element = document.getElementById(`feature-${index}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Add search functionality (bonus feature)
function addSearchFunctionality() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by feature number...';
    searchInput.className = 'search-input';
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const sections = document.querySelectorAll('.feature-section');
        
        sections.forEach(section => {
            const featureTitle = section.querySelector('.feature-title').textContent.toLowerCase();
            const shouldShow = featureTitle.includes(searchTerm) || searchTerm === '';
            section.style.display = shouldShow ? 'block' : 'none';
        });
    });
    
    // Insert search input after filters
    const filtersDiv = document.querySelector('.filters');
    filtersDiv.appendChild(searchInput);
}

// Initialize search functionality after content loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addSearchFunctionality, 1000);
});
