/* ================================
   Lost & Found - Main JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // === LOADING OVERLAY ===
    // Create a full-page loading overlay element and add it to body
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">Processing...</div>';
    document.body.appendChild(overlay);

    // === AUTO-HIDE ALERTS ===
    // Automatically dismiss flash messages after 5 seconds with a slide-out animation
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.add('alert-dismissing');
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 300);
        }, 5000);
    });
    
    // === IMAGE PREVIEW ===
    // Show thumbnail preview when user selects an image file
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size exceeds 5MB limit');
                    input.value = '';
                    return;
                }
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(event) {
                    let preview = input.parentElement.querySelector('.image-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.className = 'image-preview img-fluid mt-2 rounded';
                        preview.style.maxHeight = '200px';
                        input.parentElement.appendChild(preview);
                    }
                    preview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    // === FORM SUBMIT WITH LOADING OVERLAY ===
    // Show loading overlay and disable submit button when any form is submitted
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Store original button text on page load
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
        }

        form.addEventListener('submit', function(e) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn && !btn.disabled) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                
                // Show the full-page loading overlay
                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.add('active');
                }
                
                // Safety: re-enable everything after 15 seconds if page hasn't navigated
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = btn.getAttribute('data-original-text') || 'Submit';
                    if (loadingOverlay) {
                        loadingOverlay.classList.remove('active');
                    }
                }, 15000);
            }
        });
    });
    
    // === SEARCH CLEAR BUTTON ===
    // Add a clear (X) button to search inputs that have a value
    const searchInputs = document.querySelectorAll('input[name="q"], input[name="search"]');
    searchInputs.forEach(input => {
        if (input.value) {
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y';
            clearBtn.innerHTML = '<i class="fas fa-times"></i>';
            clearBtn.style.zIndex = '5';
            clearBtn.onclick = function() {
                input.value = '';
                input.form.submit();
            };
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(clearBtn);
        }
    });
    
    // === SMOOTH SCROLL ===
    // Enable smooth scrolling for same-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // === NAVIGATION LOADING CURSOR ===
    // Change cursor to "wait" when navigating to internal links
    document.querySelectorAll('a').forEach(link => {
        if (link.href && !link.href.startsWith('#') && !link.target && link.hostname === window.location.hostname) {
            link.addEventListener('click', function(e) {
                // Don't add loading for dropdown toggles or javascript: links
                if (!this.classList.contains('dropdown-toggle') && !this.href.startsWith('javascript:')) {
                    document.body.style.cursor = 'wait';
                }
            });
        }
    });
    
    // === DATE INPUT LIMIT ===
    // Set max date on date inputs to today (can't report items in the future)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.max) {
            input.max = new Date().toISOString().split('T')[0];
        }
    });
    
    // === UNSAVED CHANGES WARNING ===
    // Warn user if they try to leave a page with unsaved form changes
    let formChanged = false;
    const formInputs = document.querySelectorAll('form input, form textarea, form select');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            formChanged = true;
        });
    });
    
    window.addEventListener('beforeunload', function(e) {
        if (formChanged) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // Reset unsaved changes flag on form submit (so the warning doesn't fire)
    forms.forEach(form => {
        form.addEventListener('submit', () => {
            formChanged = false;
        });
    });
    
    // === TOOLTIPS ===
    // Initialize Bootstrap tooltips on elements with data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    
    // === CHARACTER COUNTER ===
    // Show live character count on textareas that have a maxlength attribute
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const counter = document.createElement('small');
        counter.className = 'text-muted float-end';
        counter.textContent = `0/${maxLength}`;
        textarea.parentElement.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            counter.textContent = `${this.value.length}/${maxLength}`;
            if (this.value.length > maxLength * 0.9) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.remove('text-warning');
            }
        });
        
        // Initial count
        counter.textContent = `${textarea.value.length}/${maxLength}`;
    });

    // === MOBILE MENU AUTO-CLOSE ===
    // Close the mobile navbar when a nav link is clicked
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
        const navLinks = navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse && navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }
});

// === UTILITY FUNCTIONS ===

// Format a date string into a human-readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Debounce helper to limit how often a function is called
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
