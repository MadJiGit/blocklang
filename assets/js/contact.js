/**
 * Contact Form Handler
 * Handles form submission via AJAX to Vercel API
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingDiv = document.getElementById('form-loading');
    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');
    
    // Time-based validation - record when page loads
    const pageLoadTime = Date.now();

    if (!form) {
        console.log('Contact form not found on this page');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            website: formData.get('website'), // Honeypot field
            'human-check': formData.get('human-check') // Anti-bot checkbox
        };

        // Time-based validation - humans need at least 5 seconds to fill the form
        const submitTime = Date.now();
        const timeSpent = submitTime - pageLoadTime;
        if (timeSpent < 5000) { // Less than 5 seconds
            showError('Please take a moment to review your message.');
            return;
        }

        // Checkbox validation
        const humanCheck = formData.get('human-check');
        if (!humanCheck) {
            showError('Please confirm that you are not a robot.');
            return;
        }

        // Basic validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            showError('Please fill in all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('Please enter a valid email address.');
            return;
        }

        try {
            // Show loading state
            showLoading();

            // Send to BlockLang API
            const response = await fetch('https://api.blocklang.org/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                // Handle HTTP errors (404, 500, etc.) with user-friendly message
                showError('Our contact form is temporarily unavailable.<br>Please use contact@blocklang.org.<br>Sorry for the inconvenience.');
                return;
            }

            const result = await response.json();

            if (result.success) {
                showSuccess(result.message);
                form.reset(); // Clear the form
            } else {
                // Only show API error messages for validation errors (400 status)
                if (response.status === 400) {
                    showError(result.message || 'Please check your input and try again.');
                } else {
                    showError('Our contact form is temporarily unavailable.<br>Please use contact@blocklang.org.<br>Sorry for the inconvenience.');
                }
            }

        } catch (error) {
            // console.error('Form submission error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            hideLoading();
        }
    });

    function showLoading() {
        loadingDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    }

    function hideLoading() {
        loadingDiv.classList.add('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-envelope me-2"></i>Send Message';
    }

    function showError(message) {
        errorText.innerHTML = message;
        errorDiv.classList.remove('d-none');
        successDiv.classList.add('d-none');
        
        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showSuccess(message) {
        successText.textContent = message;
        successDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            successDiv.classList.add('d-none');
        }, 5000);
    }
});