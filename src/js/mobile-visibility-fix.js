// ===== MOBILE VISIBILITY FIX - ULTRA OPTIMIZADO =====
(function() {
    'use strict';
    
    // Configuración optimizada
    const CONFIG = {
        MOBILE_BREAKPOINT: 1024,
        RETRY_DELAY: 200,
        MAX_RETRIES: 2,
        OBSERVER_THROTTLE: 500,
        CRITICAL_SELECTORS: [
            '.features', '.videos', '.faq', '.contact',
            '.contact__footer', '.contact__footer-content',
            '.contact__footer-text', '.contact__footer-cta',
            '.btn--footer', '.contact__channel'
        ]
    };
    
    let retryCount = 0;
    let isInitialized = false;
    let observer = null;
    let throttleTimeout = null;
    
    // Detección de dispositivo optimizada con cache
    const deviceInfo = {
        isMobile: null,
        isLowEnd: null,
        get mobile() {
            if (this.isMobile === null) {
                this.isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT || 
                               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }
            return this.isMobile;
        },
        get lowEnd() {
            if (this.isLowEnd === null) {
                this.isLowEnd = navigator.hardwareConcurrency <= 4 || 
                               (navigator.connection && ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType));
            }
            return this.isLowEnd;
        },
        reset() {
            this.isMobile = null;
            this.isLowEnd = null;
        }
    };
    
    // CSS optimizado como string para inyección directa
    const VISIBILITY_CSS = `
        .mobile-visible {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            position: relative !important;
        }
        .mobile-flex { display: flex !important; }
        .mobile-grid { display: grid !important; }
        .mobile-footer {
            z-index: 10 !important;
            min-height: 120px !important;
            padding: 2rem 1rem !important;
            margin-top: 1.5rem !important;
        }
        .mobile-footer-content {
            flex-direction: column !important;
            gap: 1.5rem !important;
            text-align: center !important;
            align-items: center !important;
        }
        .mobile-btn-footer {
            width: 100% !important;
            max-width: 280px !important;
            margin: 0 auto !important;
            align-items: center !important;
            justify-content: center !important;
            flex-direction: column !important;
        }
        .mobile-channel {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
        }
        .mobile-channel-icon {
            align-items: center !important;
            justify-content: center !important;
            margin: 0 auto 1rem auto !important;
        }
    `;
    
    // Inyectar CSS una sola vez
    const injectCSS = () => {
        if (document.getElementById('mobile-visibility-css')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-visibility-css';
        style.textContent = VISIBILITY_CSS;
        document.head.appendChild(style);
    };
    
    // Aplicar clases optimizadas en lugar de estilos inline
    const applyVisibilityClasses = (elements) => {
        const flexSelectors = ['.contact__footer-content', '.btn--footer', '.contact__channel', '.contact__channel-icon'];
        const gridSelectors = ['.contact__grid', '.features__grid', '.faq__list'];
        
        elements.forEach(element => {
            // Clase base de visibilidad
            element.classList.add('mobile-visible');
            
            // Clases específicas de display
            if (flexSelectors.some(sel => element.matches(sel))) {
                element.classList.add('mobile-flex');
            } else if (gridSelectors.some(sel => element.matches(sel))) {
                element.classList.add('mobile-grid');
            }
            
            // Clases específicas por elemento
            if (element.matches('.contact__footer')) {
                element.classList.add('mobile-footer');
            } else if (element.matches('.contact__footer-content')) {
                element.classList.add('mobile-footer-content');
            } else if (element.matches('.btn--footer')) {
                element.classList.add('mobile-btn-footer');
            } else if (element.matches('.contact__channel')) {
                element.classList.add('mobile-channel');
            } else if (element.matches('.contact__channel-icon')) {
                element.classList.add('mobile-channel-icon');
            }
        });
    };
    
    // Función principal optimizada
    const ensureVisibility = () => {
        if (!deviceInfo.mobile || isInitialized) return;
        
        const elements = document.querySelectorAll(CONFIG.CRITICAL_SELECTORS.join(', '));
        
        // Retry logic mejorado
        if (elements.length === 0 && retryCount < CONFIG.MAX_RETRIES) {
            retryCount++;
            setTimeout(ensureVisibility, CONFIG.RETRY_DELAY * retryCount);
            return;
        }
        
        if (elements.length > 0) {
            // Inyectar CSS si no existe
            injectCSS();
            
            // Aplicar clases en batch para mejor rendimiento
            requestAnimationFrame(() => {
                applyVisibilityClasses(elements);
                isInitialized = true;
            });
        }
    };
    
    // Observer throttleado para cambios DOM
    const createThrottledObserver = () => {
        if (!('MutationObserver' in window) || deviceInfo.lowEnd) return null;
        
        return new MutationObserver((mutations) => {
            if (throttleTimeout) return;
            
            let shouldUpdate = false;
            
            // Check más eficiente de mutaciones relevantes
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                    break;
                } else if (mutation.type === 'attributes' && 
                          ['style', 'class'].includes(mutation.attributeName) &&
                          CONFIG.CRITICAL_SELECTORS.some(sel => mutation.target.matches?.(sel))) {
                    shouldUpdate = true;
                    break;
                }
            }
            
            if (shouldUpdate) {
                throttleTimeout = setTimeout(() => {
                    if (!isInitialized) ensureVisibility();
                    throttleTimeout = null;
                }, CONFIG.OBSERVER_THROTTLE);
            }
        });
    };
    
    // Inicialización optimizada
    const initialize = () => {
        if (!deviceInfo.mobile) return;
        
        ensureVisibility();
        
        // Observer solo si es necesario y el dispositivo lo soporta
        if (!isInitialized && !deviceInfo.lowEnd) {
            observer = createThrottledObserver();
            
            if (observer) {
                // Observar solo elementos críticos
                const criticalElements = [
                    document.querySelector('.contact'),
                    document.querySelector('.contact__footer')
                ].filter(Boolean);
                
                criticalElements.forEach(element => {
                    observer.observe(element, {
                        attributes: true,
                        childList: true,
                        subtree: true,
                        attributeFilter: ['style', 'class']
                    });
                });
            }
        }
    };
    
    // Resize handler ultra optimizado
    const handleResize = (() => {
        let resizeTimeout;
        return () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                deviceInfo.reset();
                if (deviceInfo.mobile && !isInitialized) {
                    ensureVisibility();
                }
            }, CONFIG.OBSERVER_THROTTLE);
        };
    })();
    
    // Cleanup optimizado
    const cleanup = () => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (throttleTimeout) {
            clearTimeout(throttleTimeout);
            throttleTimeout = null;
        }
    };
    
    // Event listeners optimizados con passive
    const attachEventListeners = () => {
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                deviceInfo.reset();
                initialize();
            }, 300);
        }, { passive: true });
        
        // Cleanup al salir
        window.addEventListener('beforeunload', cleanup, { passive: true });
        
        // Cleanup para navegación SPA
        window.addEventListener('pagehide', cleanup, { passive: true });
    };
    
    // Inicialización principal
    const init = () => {
        // Early return si no es móvil
        if (!deviceInfo.mobile) return;
        
        initialize();
        attachEventListeners();
        
        // Fallback final solo si es necesario
        if (!isInitialized && !deviceInfo.lowEnd) {
            setTimeout(() => {
                if (!isInitialized) ensureVisibility();
            }, 2000);
        }
    };
    
    // Auto-inicialización
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        // Micro-delay para permitir que otros scripts se ejecuten primero
        setTimeout(init, 0);
    }
    
    // Exposición mínima para debugging (solo en desarrollo)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        window.mobileVisibilityFix = {
            isInitialized: () => isInitialized,
            deviceInfo: () => ({ mobile: deviceInfo.mobile, lowEnd: deviceInfo.lowEnd }),
            forceReinit: () => { isInitialized = false; initialize(); }
        };
    }
    
})();