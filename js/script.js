// ========================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ========================================

let allAIs = []; // Almacena todas las IAs
let filteredAIs = []; // IAs filtradas por búsqueda/categoría
let currentCategory = 'all'; // Categoría actualmente seleccionada
let searchTerm = ''; // Término de búsqueda actual

// Elementos del DOM que usaremos frecuentemente
const elements = {
    aiGrid: document.getElementById('aiGrid'),
    searchInput: document.getElementById('searchInput'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    resultsCount: document.getElementById('resultsCount'),
    noResults: document.getElementById('noResults'),
    totalAIs: document.getElementById('totalAIs'),
    featuredAIs: document.getElementById('featuredAIs')
};

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando AI Directory...');
    initializeApp();
});

async function initializeApp() {
    try {
        // Cargar datos de IAs
        await loadAIData();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Mostrar todas las IAs inicialmente
        displayAIs(allAIs);
        
        // Actualizar estadísticas
        updateStats();
        
        console.log('✅ AI Directory cargado correctamente');
    } catch (error) {
        console.error('❌ Error al cargar AI Directory:', error);
        showError('Error al cargar los datos. Por favor, recarga la página.');
    }
}

// ========================================
// CARGA DE DATOS
// ========================================

async function loadAIData() {
    try {
        console.log('📊 Cargando datos de IAs...');
        
        const response = await fetch('data/ais.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allAIs = data.ais;
        filteredAIs = [...allAIs];
        
        console.log(`✅ ${allAIs.length} IAs cargadas correctamente`);
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        // Datos de respaldo en caso de error
        allAIs = getFallbackData();
        filteredAIs = [...allAIs];
        console.log('⚠️ Usando datos de respaldo');
    }
}

// Datos de respaldo si falla la carga del JSON
function getFallbackData() {
    return [
        {
            id: 1,
            name: "ChatGPT",
            category: "text",
            description: "Asistente conversacional avanzado de OpenAI.",
            features: ["Conversación natural", "Generación de texto", "Programación"],
            pricing: "Freemium",
            website: "https://chat.openai.com",
            logo: "🤖",
            featured: true,
            company: "OpenAI"
        },
        {
            id: 2,
            name: "Midjourney",
            category: "image",
            description: "Generador de imágenes de alta calidad usando IA.",
            features: ["Arte digital", "Estilos variados", "Alta resolución"],
            pricing: "Paid",
            website: "https://midjourney.com",
            logo: "🎨",
            featured: true,
            company: "Midjourney Inc."
        }
    ];
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Búsqueda en tiempo real
    elements.searchInput.addEventListener('input', handleSearch);
    
    // Filtros de categoría
    elements.filterButtons.forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
    
    // Enter en búsqueda
    elements.searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
    
    // Links del footer para filtros
    document.querySelectorAll('footer a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            setActiveFilter(category);
            filterByCategory(category);
        });
    });
}

// ========================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ========================================

function handleSearch() {
    searchTerm = elements.searchInput.value.toLowerCase().trim();
    applyFilters();
}

function handleCategoryFilter(e) {
    e.preventDefault();
    const category = e.target.getAttribute('data-category');
    setActiveFilter(category);
    filterByCategory(category);
}

function setActiveFilter(category) {
    // Remover clase active de todos los botones
    elements.filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase active al botón seleccionado
    const activeButton = document.querySelector(`[data-category="${category}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    currentCategory = category;
}

function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
}

function applyFilters() {
    let filtered = [...allAIs];
    
    // Filtrar por categoría
    if (currentCategory !== 'all') {
        filtered = filtered.filter(ai => ai.category === currentCategory);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(ai => {
            return ai.name.toLowerCase().includes(searchTerm) ||
                   ai.description.toLowerCase().includes(searchTerm) ||
                   ai.category.toLowerCase().includes(searchTerm) ||
                   ai.company.toLowerCase().includes(searchTerm) ||
                   ai.features.some(feature => feature.toLowerCase().includes(searchTerm));
        });
    }
    
    filteredAIs = filtered;
    displayAIs(filteredAIs);
    updateResultsInfo();
}

// ========================================
// RENDERIZADO DE IAs
// ========================================

function displayAIs(ais) {
    if (!elements.aiGrid) {
        console.error('❌ Elemento aiGrid no encontrado');
        return;
    }
    
    // Limpiar grid
    elements.aiGrid.innerHTML = '';
    
    if (ais.length === 0) {
        showNoResults();
        return;
    }
    
    // Crear y agregar tarjetas
    ais.forEach(ai => {
        const aiCard = createAICard(ai);
        elements.aiGrid.appendChild(aiCard);
    });
    
    // Animar entrada de tarjetas
    animateCards();
}

function createAICard(ai) {
    const card = document.createElement('div');
    card.className = 'ai-card';
    card.setAttribute('data-category', ai.category);
    
    // Determinar clase de pricing
    const pricingClass = ai.pricing.toLowerCase() === 'free' ? 'free' : 
                        ai.pricing.toLowerCase() === 'paid' ? 'paid' : '';
    
    card.innerHTML = `
        <div class="ai-header">
            <div class="ai-logo">${ai.logo}</div>
            <div class="ai-info">
                <h3>${ai.name}</h3>
                <span class="ai-category">${getCategoryName(ai.category)}</span>
            </div>
        </div>
        
        <p class="ai-description">${ai.description}</p>
        
        <div class="ai-features">
            <h4>Características principales</h4>
            <div class="features-list">
                ${ai.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
        </div>
        
        <div class="ai-footer">
            <span class="ai-pricing ${pricingClass}">${ai.pricing}</span>
            <a href="${ai.website}" target="_blank" rel="noopener noreferrer" class="ai-link">
                Explorar <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `;
    
    return card;
}

function getCategoryName(category) {
    const categoryNames = {
        'text': 'Texto',
        'image': 'Imágenes', 
        'code': 'Código',
        'audio': 'Audio',
        'video': 'Video'
    };
    
    return categoryNames[category] || category;
}

function showNoResults() {
    elements.aiGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda o categorías</p>
            <button onclick="clearFilters()" class="ai-link" style="margin-top: 1rem;">
                <i class="fas fa-refresh"></i> Limpiar filtros
            </button>
        </div>
    `;
}

function showError(message) {
    elements.aiGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="ai-link" style="margin-top: 1rem;">
                <i class="fas fa-refresh"></i> Recargar página
            </button>
        </div>
    `;
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

function updateResultsInfo() {
    if (!elements.resultsCount) return;
    
    const total = filteredAIs.length;
    const searchInfo = searchTerm ? ` para "${searchTerm}"` : '';
    const categoryInfo = currentCategory !== 'all' ? ` en ${getCategoryName(currentCategory)}` : '';
    
    elements.resultsCount.textContent = `Mostrando ${total} IA${total !== 1 ? 's' : ''}${categoryInfo}${searchInfo}`;
}

function updateStats() {
    if (elements.totalAIs) {
        elements.totalAIs.textContent = allAIs.length;
    }
    
    if (elements.featuredAIs) {
        const featured = allAIs.filter(ai => ai.featured).length;
        elements.featuredAIs.textContent = featured;
    }
}

function animateCards() {
    const cards = document.querySelectorAll('.ai-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function clearFilters() {
    // Limpiar búsqueda
    elements.searchInput.value = '';
    searchTerm = '';
    
    // Resetear categoría
    setActiveFilter('all');
    currentCategory = 'all';
    
    // Mostrar todas las IAs
    filteredAIs = [...allAIs];
    displayAIs(filteredAIs);
    updateResultsInfo();
}

// ========================================
// FUNCIONES ADICIONALES Y MEJORAS
// ========================================

// Debounce para búsqueda (mejora el rendimiento)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce a la búsqueda
const debouncedSearch = debounce(handleSearch, 300);

// Reemplazar el event listener de búsqueda con la versión debounced
if (elements.searchInput) {
    elements.searchInput.removeEventListener('input', handleSearch);
    elements.searchInput.addEventListener('input', debouncedSearch);
}

// Función para compartir resultados (función extra)
function shareResults() {
    const url = window.location.href;
    const text = `¡Descubre las mejores herramientas de IA en AI Directory! ${filteredAIs.length} herramientas disponibles.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'AI Directory',
            text: text,
            url: url
        });
    } else {
        // Fallback: copiar al clipboard
        navigator.clipboard.writeText(`${text} ${url}`).then(() => {
            alert('¡Enlace copiado al portapapeles!');
        });
    }
}

// Función para scroll suave a secciones
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Event listener para teclas de atajo
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K para enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
    }
    
    // Escape para limpiar búsqueda
    if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
        clearFilters();
        elements.searchInput.blur();
    }
});

// ========================================
// FUNCIONES EXPORTADAS (DISPONIBLES GLOBALMENTE)
// ========================================

// Hacer algunas funciones disponibles globalmente para uso en HTML
window.clearFilters = clearFilters;
window.shareResults = shareResults;
window.scrollToSection = scrollToSection;

// Log de inicialización
console.log(`
🤖 AI Directory v1.0
==================
✅ JavaScript cargado correctamente
🎯 Funcionalidades disponibles:
   - Búsqueda en tiempo real
   - Filtrado por categorías  
   - Animaciones suaves
   - Atajos de teclado (Ctrl+K, Escape)
   - Responsive design
   
🚀 ¡Listo para explorar IAs!
`);

// ========================================
// ANALYTICS Y TRACKING (OPCIONAL)
// ========================================

// Función para trackear interacciones (opcional)
function trackInteraction(action, category, label) {
    // Aquí puedes agregar Google Analytics, Mixpanel, etc.
    console.log(`📊 Tracking: ${action} - ${category} - ${label}`);
}

// Trackear búsquedas
elements.searchInput?.addEventListener('input', () => {
    if (searchTerm.length > 2) {
        trackInteraction('search', 'user_interaction', searchTerm);
    }
});

// Trackear filtros
elements.filterButtons?.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        trackInteraction('filter', 'category', category);
    });
});