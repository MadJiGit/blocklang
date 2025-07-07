/**
 * FAQ Dynamic Loader
 * Loads FAQ content from JSON file and renders it dynamically
 */

document.addEventListener('DOMContentLoaded', function() {
    loadFAQData();
});

async function loadFAQData() {
    try {
        const response = await fetch('assets/data/faq-details.json');
        const faqData = await response.json();
        renderFAQItems(faqData);
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        // Fallback to show error message
        showErrorMessage();
    }
}

function renderFAQItems(faqData) {
    const faqContainer = document.querySelector('.faq-container');
    const loadingDiv = document.getElementById('faq-loading');
    const fallbackDiv = document.querySelector('.faq-fallback');
    
    if (!faqContainer) {
        console.error('FAQ container not found');
        return;
    }

    // Hide loading indicator
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    // Hide fallback content if it exists (shouldn't be visible when JS works)
    if (fallbackDiv) {
        fallbackDiv.style.display = 'none';
    }

    // Clear existing content
    faqContainer.innerHTML = '';

    // Generate FAQ items
    Object.keys(faqData).forEach((key, index) => {
        const faq = faqData[key];
        
        // Skip empty questions
        if (!faq.question || !faq.answer) {
            return;
        }

        const faqItem = createFAQItem(faq, index + 1);
        faqContainer.appendChild(faqItem);
    });
}

function createFAQItem(faq, index) {
    // Create main container
    const faqCard = document.createElement('div');
    faqCard.className = 'faq-card mb-3';

    // Create card structure
    const card = document.createElement('div');
    card.className = 'card shadow-sm border-0';

    // Create card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header bg-white border-0 p-0';

    // Create button
    const button = document.createElement('button');
    button.className = 'btn btn-link w-100 text-start p-4 text-decoration-none collapsed';
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse${index}`);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `collapse${index}`);

    // Create button content
    const buttonContent = document.createElement('div');
    buttonContent.className = 'd-flex justify-content-between align-items-center';

    const questionSpan = document.createElement('span');
    questionSpan.className = 'fw-medium text-dark';
    questionSpan.textContent = `Q: ${faq.question}`;

    const icon = document.createElement('i');
    icon.className = 'bi bi-plus-lg text-muted';

    buttonContent.appendChild(questionSpan);
    buttonContent.appendChild(icon);
    button.appendChild(buttonContent);
    cardHeader.appendChild(button);

    // Create collapse content
    const collapseDiv = document.createElement('div');
    collapseDiv.id = `collapse${index}`;
    collapseDiv.className = 'collapse';
    collapseDiv.setAttribute('data-bs-parent', '.faq-container');

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body pt-0';

    const answerDiv = document.createElement('div');
    answerDiv.className = 'text-muted';
    answerDiv.innerHTML = faq.answer;

    cardBody.appendChild(answerDiv);
    collapseDiv.appendChild(cardBody);

    // Assemble the card
    card.appendChild(cardHeader);
    card.appendChild(collapseDiv);
    faqCard.appendChild(card);

    // Add event listener to change icon on toggle
    button.addEventListener('click', function() {
        setTimeout(() => {
            const isCollapsed = button.classList.contains('collapsed');
            const iconElement = button.querySelector('i');
            
            if (isCollapsed) {
                iconElement.className = 'bi bi-plus-lg text-muted';
            } else {
                iconElement.className = 'bi bi-dash-lg text-muted';
            }
        }, 50);
    });

    return faqCard;
}

function showErrorMessage() {
    const faqContainer = document.querySelector('.faq-container');
    const loadingDiv = document.getElementById('faq-loading');
    
    // Hide loading indicator
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    if (!faqContainer) {
        return;
    }

    faqContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Unable to load FAQ content.</strong> Please try refreshing the page.
        </div>
    `;
}


// Helper function to add new FAQ items dynamically (for future use)
function addFAQItem(question, answer) {
    const faqContainer = document.querySelector('.faq-container');
    const existingItems = faqContainer.querySelectorAll('.faq-card').length;
    
    const newFAQ = {
        question: question,
        answer: answer
    };
    
    const newItem = createFAQItem(newFAQ, existingItems + 1);
    faqContainer.appendChild(newItem);
}