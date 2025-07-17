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

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        resultDiv.className = 'result-error';
        resultDiv.innerHTML = '❌ Please complete the reCAPTCHA verification.';
        checkBtn.disabled = false;
        return;
    }

    try {
        // Use your deployed Vercel API URL
        const apiUrl = 'https://blocklang-5cz9b2su1-madjis-projects.vercel.app/api/check';
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
        console.error('API Error:', error);
        resultDiv.className = 'result-error';
        resultDiv.innerHTML = `❌ Error: ${error.message}`;
    } finally {
        grecaptcha.reset();
        checkBtn.disabled = false;
    }
});

function displayResults(data) {
    const resultDiv = document.getElementById('result');
    const riskLevel = data.risk_level;
    const trustScore = data.trust_score;
    
    // Set appropriate styling based on risk level
    let className = 'result-success';
    let icon = '✅';
    
    if (riskLevel === 'critical') {
        className = 'result-error';
        icon = '🚨';
    } else if (riskLevel === 'high') {
        className = 'result-warning';
        icon = '⚠️';
    } else if (riskLevel === 'medium') {
        className = 'result-warning';
        icon = '⚠️';
    }
    
    resultDiv.className = className;
    
    let html = `
        <h3>${icon} Domain: ${data.domain}</h3>
        <p><strong>Trust Score:</strong> ${trustScore}/100</p>
        <p><strong>Risk Level:</strong> ${riskLevel.toUpperCase()}</p>
        
        <h4>📋 WHOIS Information</h4>
        <ul>
            <li><strong>Creation Date:</strong> ${data.whois.creation_date || 'Unknown'}</li>
            <li><strong>Registrar:</strong> ${data.whois.registrar || 'Unknown'}</li>
            <li><strong>Country:</strong> ${data.whois.country || 'Unknown'}</li>
            <li><strong>Domain Age:</strong> ${data.whois.age_days ? `${data.whois.age_days} days` : 'Unknown'}</li>
        </ul>
        
        <h4>🔒 SSL Certificate</h4>
        <ul>
            <li><strong>Valid:</strong> ${data.ssl.valid ? 'Yes' : 'No'}</li>
            <li><strong>Issuer:</strong> ${data.ssl.issuer || 'Unknown'}</li>
            <li><strong>Expires:</strong> ${data.ssl.expires || 'Unknown'}</li>
            <li><strong>Days Remaining:</strong> ${data.ssl.days_remaining || 'Unknown'}</li>
        </ul>
    `;
    
    // Add content analysis if available
    if (data.content_analysis && data.content_analysis.content_fetched) {
        html += `
            <h4>🔍 Content Analysis</h4>
            <ul>
                <li><strong>Content Risk Score:</strong> ${data.content_analysis.total_score}</li>
                <li><strong>Content Risk Level:</strong> ${data.content_analysis.risk_level.toUpperCase()}</li>
                <li><strong>Urgency Score:</strong> ${data.content_analysis.urgency_score}</li>
                <li><strong>Payment Risk:</strong> ${data.content_analysis.payment_risk}</li>
                <li><strong>Social Engineering:</strong> ${data.content_analysis.social_engineering}</li>
            </ul>
        `;
        
        if (data.content_analysis.detected_patterns.length > 0) {
            html += `<p><strong>Detected Patterns:</strong></p><ul>`;
            data.content_analysis.detected_patterns.forEach(pattern => {
                html += `<li>${pattern}</li>`;
            });
            html += `</ul>`;
        }
    }
    
    // Add visitor stats if available
    if (data.visitor_stats) {
        html += `
            <h4>📊 Visitor Statistics</h4>
            <ul>
                <li><strong>Visit Count:</strong> ${data.visitor_stats.visit_count}</li>
                <li><strong>Last Visited:</strong> ${new Date(data.visitor_stats.last_visited).toLocaleDateString()}</li>
            </ul>
        `;
    }
    
    html += `<p><small>Cached: ${data.cached ? 'Yes' : 'No'} | ${new Date(data.timestamp).toLocaleString()}</small></p>`;
    
    resultDiv.innerHTML = html;
}