// Smart security-check with automatic environment detection
// Works in both development and production safely
document.getElementById('domainForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const domain = document.getElementById('domainInput').value;
    const resultDiv = document.getElementById('result');
    const checkBtn = document.getElementById('checkBtn');
    
    // Show loading state
    resultDiv.style.display = 'block';
    resultDiv.className = 'loading';
    resultDiv.innerHTML = '🔍 Checking domain security...';
    checkBtn.disabled = true;

    // Smart reCAPTCHA handling
    const isProduction = window.location.hostname === 'blocklang.org' || window.location.hostname === 'www.blocklang.org';
    const isDev = !isProduction && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.includes('172.')
    );
    
    let recaptchaResponse = '';
    
    if (isProduction) {
        // Production: require reCAPTCHA
        recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            resultDiv.className = 'result-error';
            resultDiv.innerHTML = '❌ Please complete the reCAPTCHA verification.';
            checkBtn.disabled = false;
            return;
        }
    } else if (isDev) {
        // Development: bypass reCAPTCHA
        recaptchaResponse = 'dev-bypass-token';
        console.log('🔧 DEV MODE: reCAPTCHA bypassed for local testing');
    } else {
        // Unknown environment: require reCAPTCHA for safety
        recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            resultDiv.className = 'result-error';
            resultDiv.innerHTML = '❌ Please complete the reCAPTCHA verification.';
            checkBtn.disabled = false;
            return;
        }
    }

    try {
        // Smart API endpoint selection
        const apiUrl = isDev ? '/api/web' : 'https://api.blocklang.org/api/web';
        
        if (isDev) {
            console.log('🔧 DEV MODE: Using local API endpoint:', apiUrl);
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                domain: domain.trim(), 
                recaptchaToken: recaptchaResponse 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }

        // Format and display results
        displayResults(data);
        
    } catch (error) {
        resultDiv.className = 'result-error';
        
        // User-friendly error messages
        let userMessage;
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            userMessage = '❌ Connection problem. Please check your internet connection and try again.';
        } else if (error.message.includes('Server error: 5')) {
            userMessage = '❌ Our security checker is temporarily busy. Please try again in a moment.';
        } else if (error.message.includes('Server error: 4')) {
            userMessage = '❌ Please check your domain format and try again.';
        } else {
            userMessage = '❌ Unable to check domain security right now. Please try again later.';
        }
        
        resultDiv.innerHTML = userMessage;
    } finally {
        grecaptcha.reset();
        checkBtn.disabled = false;
    }
});

function displayResults(data) {
    const resultDiv = document.getElementById('result');
    const riskLevel = data.risk_level;
    const trustScore = data.trust_score;
    
    // Progressive Green System: Score-based styling (60+ = green territory)
    let className = 'result-dangerous';
    let scoreDescription = 'Very Dangerous';
    
    if (trustScore >= 81) {
        className = 'result-excellent';
        scoreDescription = 'Very Trustworthy';
    } else if (trustScore >= 71) {
        className = 'result-trustworthy';
        scoreDescription = 'Trustworthy';
    } else if (trustScore >= 61) {
        className = 'result-safe';
        scoreDescription = 'Likely Safe';
    } else if (trustScore >= 41) {
        className = 'result-neutral';
        scoreDescription = 'Needs Attention';
    } else if (trustScore >= 21) {
        className = 'result-risky';
        scoreDescription = 'Risky';
    } else {
        className = 'result-dangerous';
        scoreDescription = 'Very Dangerous';
    }
    
    resultDiv.className = className;
    
    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3>Domain: ${data.domain}</h3>
            <p style="font-size: 20px; margin: 10px 0; font-weight: 600;"><strong>Trust Score:</strong> ${trustScore}/100</p>
            <p style="font-size: 16px; margin: 5px 0;"><strong>Assessment:</strong> ${scoreDescription}</p>
        </div>
        
        <div class="results-content">
            <div class="results-column">
                <h4>WHOIS Information</h4>
                <ul>
                    <li><strong>Creation Date:</strong> ${data.whois.creation_date || 'Unknown'}</li>
                    <li><strong>Registrar:</strong> ${data.whois.registrar || 'Unknown'}</li>
                    <li><strong>Country:</strong> ${data.whois.country || 'Unknown'}</li>
                    <li><strong>Domain Age:</strong> ${data.whois.age_days ? `${data.whois.age_days} days` : 'Unknown'}</li>
                </ul>
            </div>
            
            <div class="results-column">
                <h4>SSL Certificate</h4>
                <ul>
                    <li><strong>Valid:</strong> ${data.ssl.valid ? 'Yes' : 'No'}</li>
                    <li><strong>Issuer:</strong> ${data.ssl.issuer || 'Unknown'}</li>
                    <li><strong>Expires:</strong> ${data.ssl.expires || 'Unknown'}</li>
                    <li><strong>Days Remaining:</strong> ${data.ssl.days_remaining || 'Unknown'}</li>
                </ul>
            </div>
        </div>
    `;
    
    // Add content analysis if available
    if (data.content_analysis && data.content_analysis.content_fetched) {
        html += `
            <div class="results-content">
                <div class="results-column">
                    <h4>Content Analysis</h4>
                    <ul>
                        <li><strong>Content Risk Score:</strong> ${data.content_analysis.total_score}</li>
                        <li><strong>Content Risk Level:</strong> ${data.content_analysis.risk_level.toUpperCase()}</li>
                        <li><strong>Urgency Score:</strong> ${data.content_analysis.urgency_score}</li>
                        <li><strong>Payment Risk:</strong> ${data.content_analysis.payment_risk}</li>
                        <li><strong>Social Engineering:</strong> ${data.content_analysis.social_engineering}</li>
                    </ul>
                </div>`;
        
        if (data.content_analysis.detected_patterns.length > 0) {
            html += `
                <div class="results-column">
                    <h4>Detected Patterns</h4>
                    <ul>`;
            data.content_analysis.detected_patterns.forEach(pattern => {
                html += `<li>${pattern}</li>`;
            });
            html += `</ul>
                </div>`;
        } else {
            html += `<div class="results-column"></div>`;
        }
        
        html += `</div>`;
    }
    
    // Add Web Risk analysis (show even if API failed)
    if (data.web_risk) {
        let threatStatus, threatColor, threatIcon;
        
        if (!data.web_risk.success) {
            threatStatus = 'API UNAVAILABLE';
            threatColor = 'color: #f39c12;';
            threatIcon = '⚠️';
        } else {
            threatStatus = data.web_risk.is_threat ? 'THREAT DETECTED' : 'SAFE';
            threatColor = data.web_risk.is_threat ? 'color: #e74c3c;' : 'color: #27ae60;';
            threatIcon = data.web_risk.is_threat ? '⚠️' : '✅';
        }
        
        html += `
            <div class="results-content">
                <div class="results-column">
                    <h4>Google Web Risk Analysis</h4>
                    <ul>
                        <li><strong>Status:</strong> <span style="${threatColor}">${threatIcon} ${threatStatus}</span></li>
                        <li><strong>Threat Types:</strong> ${data.web_risk.threat_types && data.web_risk.threat_types.length > 0 ? data.web_risk.threat_types.join(', ') : 'None detected'}</li>
                        <li><strong>Last Checked:</strong> ${data.web_risk.checked_at ? new Date(data.web_risk.checked_at).toLocaleString() : 'Never'}</li>
                        <li><strong>Data Source:</strong> ${data.web_risk.from_cache ? 'Cached' : 'Live check'}</li>
                    </ul>
                </div>
                <div class="results-column" style="display: none;">
                    <h4>Web Risk Details</h4>
                    <ul>
                        <li><strong>Google Database:</strong> ${data.web_risk.success ? 'Connected' : 'Unavailable'}</li>
                        <li><strong>Protection Level:</strong> Commercial API</li>
                        <li><strong>Coverage:</strong> Malware, Phishing, Unwanted Software</li>
                        <li><strong>Confidence:</strong> ${data.web_risk.success ? 'High (Google verified)' : 'Limited (API offline)'}</li>
                    </ul>
                </div>
            </div>`;
    }
    
    // Add visitor stats and cache info (HIDDEN - UX improvement)
    html += `
        <div class="results-content" style="display: none;">
            <div class="results-column">`;
    
    if (data.visitor_stats) {
        html += `
                <h4>Visitor Statistics</h4>
                <ul>
                    <li><strong>Visit Count:</strong> ${data.visitor_stats.visit_count}</li>
                    <li><strong>Last Check:</strong> ${data.visitor_stats.last_check ? new Date(data.visitor_stats.last_check).toLocaleDateString() : 'Unknown'}</li>
                </ul>`;
    } else {
        html += `
                <h4>Visitor Statistics</h4>
                <ul>
                    <li><strong>Visit Count:</strong> No data available</li>
                    <li><strong>Last Check:</strong> Unknown</li>
                </ul>`;
    }
    
    html += `
            </div>
            <div class="results-column">
                <h4>Scan Information</h4>
                <ul>
                    <li><strong>Cached:</strong> ${data.cached ? 'Yes' : 'No'}</li>
                    <li><strong>Scan Time:</strong> ${new Date(data.timestamp).toLocaleString()}</li>
                </ul>
            </div>
        </div>`;
    
    // Add trust score factors explanation if available (HIDDEN - UX improvement)
    if (data.factors && data.factors.length > 0) {
        html += `
            <div class="results-content" style="display: none;">
                <div class="results-column">
                    <h4>Trust Score Explanation</h4>
                    <ul>`;
        
        data.factors.forEach(factor => {
            html += `<li>${factor}</li>`;
        });
        
        html += `
                    </ul>
                </div>
                <div class="results-column">
                    <h4>Score Details</h4>
                    <ul>
                        <li><strong>Final Score:</strong> ${data.trust_score}/100</li>
                        <li><strong>Risk Level:</strong> ${data.risk_level.toUpperCase()}</li>
                        <li><strong>Algorithm:</strong> WHOIS + SSL + Content + Web Risk</li>
                        <li><strong>Factors Count:</strong> ${data.factors.length} evaluated</li>
                    </ul>
                </div>
            </div>`;
    }
    
    // Add client info if available (HIDDEN - UX improvement)
    if (data.client_info) {
        html += `
            <div class="results-content" style="display: none;">
                <div class="results-column">
                    <h4>Request Information</h4>
                    <ul>
                        <li><strong>Source:</strong> ${data.client_info.source}</li>
                        <li><strong>Browser:</strong> ${data.client_info.browser}</li>
                        <li><strong>Platform:</strong> ${data.client_info.platform}</li>
                        <li><strong>Client ID:</strong> ${data.client_info.combo_id}</li>
                    </ul>
                </div>
                <div class="results-column">
                    <h4>Technical Details</h4>
                    <ul>
                        <li><strong>API Endpoint:</strong> /api/web</li>
                        <li><strong>Response Time:</strong> ~2-3 seconds</li>
                        <li><strong>Data Sources:</strong> WHOIS, SSL Labs, Content Analysis</li>
                        <li><strong>Cache Status:</strong> ${data.cached ? 'Hit' : 'Miss'}</li>
                    </ul>
                </div>
            </div>`;
    }
    
    // Add report button and inline form
    html += `
        <div class="feedback-section">
            <div class="feedback-toggle">
                <p class="feedback-text">Is this result incorrect?</p>
                <button id="reportToggle" class="report-link">Report issue</button>
            </div>
            
            <div id="inlineReportForm" class="inline-report-form" style="display: none;">
                <div class="form-header">
                    <h4>Report Incorrect Result</h4>
                    <p>Help us improve our security detection. What's wrong with this result?</p>
                </div>
                
                <div class="feedback-options">
                    <label class="radio-option">
                        <input type="radio" name="issueType" value="false_positive">
                        <span>This safe site was marked as dangerous (false positive)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="issueType" value="false_negative">
                        <span>This dangerous site was marked as safe (false negative)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="issueType" value="other">
                        <span>Other issue</span>
                    </label>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="userEmail">Your email address:</label>
                        <input type="email" id="userEmail" placeholder="your@email.com" required autocomplete="email">
                        <small>We'll send you a verification link to confirm your report</small>
                    </div>
                </div>

                <div class="form-group">
                    <label for="userComment">Additional details (optional):</label>
                    <textarea id="userComment" placeholder="Tell us more about the issue..." rows="3"></textarea>
                </div>

                <div class="form-actions">
                    <button id="submitReport" class="btn-primary">Submit Report</button>
                    <button id="cancelReport" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    
    // Add click handler for report toggle
    const reportToggle = document.getElementById('reportToggle');
    const inlineForm = document.getElementById('inlineReportForm');
    const cancelBtn = document.getElementById('cancelReport');
    const submitBtn = document.getElementById('submitReport');
    
    if (reportToggle && inlineForm) {
        currentDomain = data.domain;
        currentScore = data.trust_score;
        
        reportToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (inlineForm.style.display === 'none') {
                inlineForm.style.display = 'block';
                reportToggle.textContent = 'Hide form';
                reportToggle.classList.add('active');
            } else {
                inlineForm.style.display = 'none';
                reportToggle.textContent = 'Report issue';
                reportToggle.classList.remove('active');
                clearReportForm();
            }
        });
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                inlineForm.style.display = 'none';
                reportToggle.textContent = 'Report issue';
                reportToggle.classList.remove('active');
                clearReportForm();
            });
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', handleReportSubmit);
        }
    }
}

// Inline form handling functions
let currentDomain = '';
let currentScore = 0;

function clearReportForm() {
    // Clear form
    document.querySelectorAll('input[name="issueType"]').forEach(radio => radio.checked = false);
    const emailField = document.getElementById('userEmail');
    const commentField = document.getElementById('userComment');
    if (emailField) emailField.value = '';
    if (commentField) commentField.value = '';
}

// Toast notification functions
function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function showToast(message, type) {
    // Remove any existing toast
    const existingToast = document.getElementById('toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
}

// Global submit handler function
async function handleReportSubmit() {
    const selectedType = document.querySelector('input[name="issueType"]:checked');
    const userEmail = document.getElementById('userEmail').value.trim();
    
    if (!selectedType) {
        showErrorMessage('Please select an issue type');
        return;
    }
    
    if (!userEmail) {
        showErrorMessage('Please enter your email address');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
        showErrorMessage('Please enter a valid email address');
        return;
    }
    
    const reportData = {
        domain: currentDomain,
        issue_type: selectedType.value,
        email: userEmail,
        comment: document.getElementById('userComment').value.trim(),
        current_score: currentScore
    };
    
    try {
        const response = await fetch('https://api.blocklang.org/api/report-scam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            showSuccessMessage('Thank you! We sent a verification email to ' + userEmail + '. Please check your inbox and click the link to confirm your report.');
            // Hide form and reset
            const inlineForm = document.getElementById('inlineReportForm');
            const reportToggle = document.getElementById('reportToggle');
            if (inlineForm && reportToggle) {
                inlineForm.style.display = 'none';
                reportToggle.textContent = 'Report issue';
                reportToggle.classList.remove('active');
                clearReportForm();
            }
        } else {
            showErrorMessage('Failed to submit report. Please try again later.');
        }
    } catch (error) {
        showErrorMessage('Network error. Please check your connection and try again.');
    }
}