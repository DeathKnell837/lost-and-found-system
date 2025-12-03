/* ================================
   Lost & Found - Main JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Image preview for file uploads
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
    
    // Form validation enhancement
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                
                // Re-enable after 10 seconds (safety)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
                }, 10000);
            }
        });
        
        // Store original button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
        }
    });
    
    // Search input clear button
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
    
    // Smooth scroll for anchor links
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
    
    // Add loading state to navigation links
    document.querySelectorAll('a').forEach(link => {
        if (link.href && !link.href.startsWith('#') && !link.target && link.hostname === window.location.hostname) {
            link.addEventListener('click', function(e) {
                // Don't add loading for dropdown toggles
                if (!this.classList.contains('dropdown-toggle')) {
                    document.body.style.cursor = 'wait';
                }
            });
        }
    });
    
    // Date input max date (today)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.max) {
            input.max = new Date().toISOString().split('T')[0];
        }
    });
    
    // Confirm before leaving page with unsaved changes
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
    
    // Reset formChanged on form submit
    forms.forEach(form => {
        form.addEventListener('submit', () => {
            formChanged = false;
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    
    // Character counter for textareas
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
});

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

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
