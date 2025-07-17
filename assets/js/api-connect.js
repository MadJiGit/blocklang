document.getElementById('domainForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const domain = document.getElementById('domainInput').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = 'Checking...';

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        resultDiv.innerText = 'Please complete the reCAPTCHA.';
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
        if (!response.ok) {
            throw new Error('Server error');
        }
        const data = await response.json();
        resultDiv.innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        resultDiv.innerText = 'Error: ' + error.message;
    } finally {
        grecaptcha.reset(); // Reset the captcha after submission
    }
});