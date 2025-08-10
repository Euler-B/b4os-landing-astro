// public/js/language-selector.js
window.initLanguageSelector = function() {
    console.log('🌍 Inicializando selector de idioma...');
    
    const langButton = document.getElementById('langButton');
    const langDropdown = document.getElementById('langDropdown');
    
    if (!langButton || !langDropdown) {
        console.warn('❌ Elementos del selector de idioma no encontrados');
        return;
    }

    console.log('✅ Elementos encontrados:', { langButton, langDropdown });

    let isOpen = false;
    let closeTimeout = null;

    function openDropdown() {
        if (isOpen) return;
        
        console.log('📂 Abriendo dropdown');
        isOpen = true;
        
        // Limpiar timeout de cierre si existe
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
        
        // Determinar posición
        const rect = langButton.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 180; // Altura estimada del dropdown
        
        // Limpiar clases previas
        langDropdown.className = 'lang-dropdown';
        
        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            // Mostrar hacia abajo
            langDropdown.classList.add('dropdown-down');
        } else {
            // Mostrar hacia arriba
            langDropdown.classList.add('dropdown-up');
        }
        
        // Actualizar aria-expanded
        langButton.setAttribute('aria-expanded', 'true');
        
        // Mostrar dropdown con animación
        setTimeout(() => {
            langDropdown.classList.add('show');
        }, 10);
    }

    function closeDropdown() {
        if (!isOpen) return;
        
        console.log('📁 Cerrando dropdown');
        isOpen = false;
        
        // Ocultar dropdown
        langDropdown.classList.remove('show');
        langButton.setAttribute('aria-expanded', 'false');
        
        // Limpiar clases después de la animación
        setTimeout(() => {
            langDropdown.className = 'lang-dropdown';
        }, 200);
    }

    function toggleDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔄 Toggle dropdown, estado actual:', isOpen);
        
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    // Event listeners
    langButton.addEventListener('click', toggleDropdown);
    
    // Manejar hover para cerrar con delay
    langDropdown.addEventListener('mouseenter', () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    });
    
    langDropdown.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(closeDropdown, 150);
    });
    
    langButton.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(closeDropdown, 150);
    });
    
    langButton.addEventListener('mouseenter', () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeDropdown();
            langButton.focus();
        }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (isOpen && !langButton.contains(e.target) && !langDropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    // Manejar navegación con teclado
    langDropdown.addEventListener('keydown', (e) => {
        const options = langDropdown.querySelectorAll('.lang-option');
        const currentIndex = Array.from(options).findIndex(option => option === document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                options[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                options[prevIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (document.activeElement.classList.contains('lang-option')) {
                    document.activeElement.click();
                }
                break;
        }
    });

    // Hacer opciones focusables
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.setAttribute('tabindex', '0');
        option.addEventListener('click', () => {
            closeDropdown();
        });
    });

    console.log('✅ Selector de idioma inicializado correctamente');
};