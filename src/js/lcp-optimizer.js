// ===== LCP OPTIMIZER - CRITICAL PERFORMANCE =====
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        MOBILE_BREAKPOINT: 1023,
        LCP_TIMEOUT: 2500,
        PRELOAD_DELAY: 100,
        VIDEO_LOAD_DELAY: 1000
    };
    
    // Device detection
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const isLowEnd = navigator.hardwareConcurrency <= 4;
    const conn = navigator.connection;
    const isSlowConn = conn && ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
    const performanceMode = isMobile && (isSlowConn || isLowEnd);
    
    // LCP element detection and optimization
    function optimizeLCP() {
        const lcpElements = isMobile ? 
            [document.getElementById('hero-mobile-video')] :
            [document.querySelector('.hero__phone-app-image'), document.getElementById('hero-video')];
        
        lcpElements.forEach(element => {
            if (!element) return;
            
            if (element.tagName === 'VIDEO') {
                optimizeVideoLCP(element);
            } else {
                optimizeImageLCP(element);
            }
        });
    }
    
    // Video LCP optimization
    function optimizeVideoLCP(video) {
        if (performanceMode) {
            // Use poster image for LCP in performance mode
            const poster = video.getAttribute('poster');
            if (poster) {
                video.style.backgroundImage = `url(${poster})`;
                video.style.backgroundSize = 'cover';
                video.style.backgroundPosition = 'center';
                video.preload = 'none';
                video.autoplay = false;
            }
            return;
        }
        
        // Progressive video loading
        video.preload = 'metadata';
        video.style.opacity = '0.8';
        
        // Optimize loading events
        video.addEventListener('loadstart', function() {
            this.style.opacity = '0.9';
        }, { once: true });
        
        video.addEventListener('loadeddata', function() {
            this.style.opacity = '1';
            this.classList.add('loaded');
            
            // Report LCP improvement
            if ('PerformanceObserver' in window) {
                reportLCPImprovement(this);
            }
        }, { once: true });
        
        video.addEventListener('error', function() {
            handleVideoError(this);
        }, { once: true });
        
        // Timeout fallback
        setTimeout(() => {
            if (!video.classList.contains('loaded')) {
                handleVideoError(video);
            }
        }, CONFIG.LCP_TIMEOUT);
    }
    
    // Image LCP optimization
    function optimizeImageLCP(image) {
        // Ensure image is visible immediately
        image.style.opacity = '1';
        image.style.display = 'block';
        image.style.visibility = 'visible';
        
        // Add loading optimization
        if (image.style.backgroundImage) {
            // Background image optimization
            const imageUrl = image.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (imageUrl && imageUrl[1]) {
                preloadImage(imageUrl[1]).then(() => {
                    image.classList.add('loaded');
                    reportLCPImprovement(image);
                });
            }
        } else if (image.src) {
            // Regular image optimization
            if (image.complete) {
                image.classList.add('loaded');
                reportLCPImprovement(image);
            } else {
                image.addEventListener('load', function() {
                    this.classList.add('loaded');
                    reportLCPImprovement(this);
                }, { once: true });
            }
        }
    }
    
    // Preload image utility
    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }
    
    // Handle video errors
    function handleVideoError(video) {
        const poster = video.getAttribute('poster');
        if (poster) {
            // Replace with poster image
            const img = document.createElement('img');
            img.src = poster;
            img.alt = video.getAttribute('aria-label') || 'StarFlex Demo';
            img.style.cssText = video.style.cssText;
            img.style.objectFit = 'cover';
            img.classList.add('video-fallback', 'loaded');
            
            video.parentNode.replaceChild(img, video);
            reportLCPImprovement(img);
        }
    }
    
    // Report LCP improvement
    function reportLCPImprovement(element) {
        if ('PerformanceObserver' in window) {
            try {
                // Mark LCP element as optimized
                element.setAttribute('data-lcp-optimized', 'true');
                
                // Optional: Send to analytics
                if (window.gtag) {
                    window.gtag('event', 'lcp_optimized', {
                        'element_type': element.tagName.toLowerCase(),
                        'is_mobile': isMobile,
                        'performance_mode': performanceMode
                    });
                }
            } catch (e) {
                // Silently handle errors
            }
        }
    }
    
    // Critical resource preloading
    function preloadCriticalResources() {
        const criticalResources = [
            { href: './assets/logo.avif', as: 'image', type: 'image/avif' }
        ];
        
        if (isMobile) {
            criticalResources.push({
                href: './assets/phones/Hero.mp4',
                as: 'video',
                type: 'video/mp4'
            });
        } else {
            criticalResources.push({
                href: './assets/phones/Hero.avif',
                as: 'image',
                type: 'image/avif'
            });
        }
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.type) link.type = resource.type;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        });
    }
    
    // Desktop video progressive loading
    function setupDesktopVideoProgressive() {
        if (isMobile || performanceMode) return;
        
        const video = document.getElementById('hero-video');
        const image = document.querySelector('.hero__phone-app-image');
        
        if (!video || !image) return;
        
        // Show image first for immediate LCP
        image.style.display = 'block';
        image.style.zIndex = '2';
        video.style.zIndex = '1';
        video.style.opacity = '0';
        
        // Load video progressively after LCP
        setTimeout(() => {
            video.preload = 'metadata';
            video.autoplay = true;
            video.addEventListener('loadeddata', function() {
                this.style.opacity = '1';
                this.style.zIndex = '2';
                image.style.zIndex = '1';
                this.classList.add('loaded');
            }, { once: true });
            
            video.addEventListener('error', function() {
                image.style.zIndex = '2';
                this.style.display = 'none';
            }, { once: true });
        }, CONFIG.VIDEO_LOAD_DELAY);
    }
    
    // Initialize LCP optimizations
    function init() {
        // Immediate LCP optimization
        optimizeLCP();
        
        // Setup progressive loading for desktop
        setupDesktopVideoProgressive();
        
        // Preload critical resources after initial render
        setTimeout(preloadCriticalResources, CONFIG.PRELOAD_DELAY);
        
        // Monitor LCP performance
        if ('PerformanceObserver' in window) {
            monitorLCP();
        }
    }
    
    // LCP performance monitoring
    function monitorLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                // Log LCP timing for debugging
                console.log('LCP:', lastEntry.startTime, 'Element:', lastEntry.element);
                
                // Optional: Send to analytics
                if (window.gtag && lastEntry.startTime) {
                    window.gtag('event', 'lcp_timing', {
                        'value': Math.round(lastEntry.startTime),
                        'is_mobile': isMobile,
                        'performance_mode': performanceMode
                    });
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Silently handle errors
        }
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for debugging
    window.LCPOptimizer = {
        isMobile,
        performanceMode,
        optimizeLCP,
        preloadCriticalResources
    };
    
})();
