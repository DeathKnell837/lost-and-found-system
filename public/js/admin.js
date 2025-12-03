/* ================================
   Admin Panel JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
    
    // Mark active nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Auto-hide alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    
    // Confirm delete actions
    const deleteForms = document.querySelectorAll('form[action*="delete"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        const checkboxes = document.querySelectorAll('input[name="selectedItems"]');
        selectAllCheckbox.addEventListener('change', function() {
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    
    // Image preview for edit forms
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    let preview = input.parentElement.querySelector('.image-preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.className = 'image-preview img-fluid mt-2 rounded';
                        preview.style.maxHeight = '150px';
                        input.parentElement.appendChild(preview);
                    }
                    preview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    // Search input debounce
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Auto-submit on search (optional)
                // this.form.submit();
            }, 500);
        });
    }
    
    // Batch actions
    const batchActionBtn = document.getElementById('batchActionBtn');
    if (batchActionBtn) {
        batchActionBtn.addEventListener('click', function() {
            const checkedBoxes = document.querySelectorAll('input[name="selectedItems"]:checked');
            if (checkedBoxes.length === 0) {
                alert('Please select at least one item');
                return;
            }
            // Handle batch action
        });
    }
    
    // Data tables enhancement
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Add hover effect
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.cursor = 'pointer';
        });
    });
    
    // Form submission loading state
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalHTML = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                
                // Store original for reset
                submitBtn.setAttribute('data-original', originalHTML);
            }
        });
    });
    
    // Quick stats animation
    const statNumbers = document.querySelectorAll('.stat-details h3');
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = finalValue / 30;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(currentValue);
        }, 30);
    });
    
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    
    // Export functionality (if needed)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Handle export
            alert('Export functionality - implement as needed');
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const saveBtn = document.querySelector('button[type="submit"]');
            if (saveBtn) saveBtn.click();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });
        }
    });
});

// Utility: Format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Utility: Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}
