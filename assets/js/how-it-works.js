// Language Filter Explorer Script for BlockLang
// Interactive language search and filter code generator

// Language database with common languages and their ISO 639-1 codes
const languages = [
    { name: 'Arabic', code: 'ar', native: 'العربية' },
    { name: 'Bulgarian', code: 'bg', native: 'български' },
    { name: 'Chinese', code: 'zh', native: '中文' },
    { name: 'Chinese (Simplified)', code: 'zh-cn', native: '简体中文' },
    { name: 'Chinese (Traditional)', code: 'zh-tw', native: '繁體中文' },
    { name: 'Croatian', code: 'hr', native: 'hrvatski' },
    { name: 'Czech', code: 'cs', native: 'čeština' },
    { name: 'Danish', code: 'da', native: 'dansk' },
    { name: 'Dutch', code: 'nl', native: 'Nederlands' },
    { name: 'English', code: 'en', native: 'English' },
    { name: 'Finnish', code: 'fi', native: 'suomi' },
    { name: 'French', code: 'fr', native: 'français' },
    { name: 'German', code: 'de', native: 'Deutsch' },
    { name: 'Greek', code: 'el', native: 'ελληνικά' },
    { name: 'Hebrew', code: 'he', native: 'עברית' },
    { name: 'Hindi', code: 'hi', native: 'हिन्दी' },
    { name: 'Hungarian', code: 'hu', native: 'magyar' },
    { name: 'Italian', code: 'it', native: 'italiano' },
    { name: 'Japanese', code: 'ja', native: '日本語' },
    { name: 'Korean', code: 'ko', native: '한국어' },
    { name: 'Norwegian', code: 'no', native: 'norsk' },
    { name: 'Polish', code: 'pl', native: 'polski' },
    { name: 'Portuguese', code: 'pt', native: 'português' },
    { name: 'Romanian', code: 'ro', native: 'română' },
    { name: 'Russian', code: 'ru', native: 'русский' },
    { name: 'Serbian', code: 'sr', native: 'српски' },
    { name: 'Slovak', code: 'sk', native: 'slovenčina' },
    { name: 'Slovenian', code: 'sl', native: 'slovenščina' },
    { name: 'Spanish', code: 'es', native: 'español' },
    { name: 'Swedish', code: 'sv', native: 'svenska' },
    { name: 'Thai', code: 'th', native: 'ไทย' },
    { name: 'Turkish', code: 'tr', native: 'Türkçe' },
    { name: 'Ukrainian', code: 'uk', native: 'українська' },
    { name: 'Vietnamese', code: 'vi', native: 'Tiếng Việt' }
];

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('languageSearchInput');
    const resultsDiv = document.getElementById('languageResults');
    const languageListDiv = document.getElementById('languageList');
    const selectedLanguageDiv = document.getElementById('selectedLanguage');
    const languageCodeSpan = document.getElementById('languageCode');
    const noResultsDiv = document.getElementById('noResults');
    
    // Only initialize if elements exist (for how-it-works.html page)
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            resultsDiv.classList.add('d-none');
            noResultsDiv.classList.add('d-none');
            return;
        }
        
        // Filter languages based on search query
        const matchedLanguages = languages.filter(lang => 
            lang.name.toLowerCase().includes(query) ||
            lang.code.toLowerCase().includes(query) ||
            lang.native.toLowerCase().includes(query)
        );
        
        if (matchedLanguages.length > 0) {
            displayLanguages(matchedLanguages);
            resultsDiv.classList.remove('d-none');
            noResultsDiv.classList.add('d-none');
        } else {
            resultsDiv.classList.add('d-none');
            noResultsDiv.classList.remove('d-none');
        }
    });
    
    function displayLanguages(languages) {
        languageListDiv.innerHTML = '';
        selectedLanguageDiv.classList.add('d-none');
        
        // Limit to first 8 results to avoid clutter
        const limitedLanguages = languages.slice(0, 8);
        
        limitedLanguages.forEach(lang => {
            const langButton = document.createElement('div');
            langButton.className = 'col-md-6 col-lg-4';
            langButton.innerHTML = `
                <button class="btn btn-outline-secondary w-100 text-start language-btn" 
                        onclick="selectLanguage('${lang.code}', '${lang.name}', '${lang.native}')">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${lang.name}</strong><br>
                            <small class="text-muted">${lang.native}</small>
                        </div>
                        <code class="badge bg-light text-dark">${lang.code}</code>
                    </div>
                </button>
            `;
            languageListDiv.appendChild(langButton);
        });
    }
});

function selectLanguage(code, name, native) {
    const languageCodeSpan = document.getElementById('languageCode');
    const selectedLanguageDiv = document.getElementById('selectedLanguage');
    
    // Show the filter code
    languageCodeSpan.textContent = `language:${code}`;
    selectedLanguageDiv.classList.remove('d-none');
    
    // Update the alert text with language name
    const alertText = selectedLanguageDiv.querySelector('div > div');
    alertText.innerHTML = `
        <strong>To block ${name} (${native}) content, add this to your filters:</strong>
        <code class="ms-2 bg-white p-2 rounded" id="languageCode">language:${code}</code>
    `;
    
    // Scroll to show the result
    selectedLanguageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function copyLanguageCode() {
    const languageCode = document.getElementById('languageCode').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(languageCode).then(function() {
            // Show success feedback
            const copyBtn = event.target.closest('button');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="bi bi-check me-1"></i>Copied!';
            copyBtn.classList.remove('btn-outline-primary');
            copyBtn.classList.add('btn-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
                copyBtn.classList.add('btn-outline-primary');
            }, 2000);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = languageCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        alert('Language code copied: ' + languageCode);
    }
}