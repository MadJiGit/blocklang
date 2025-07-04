document.addEventListener('DOMContentLoaded', function() {
    let currentIndex = 0;
    let whyTexts = {};
    let whyKeys = [];
    let paragraphElements = [];
    let titleElement = null;
    let rotationInterval = null;
    
    // Load why-details.json data
    fetch('/assets/data/why-details.json')
        .then(response => response.json())
        .then(data => {
            whyTexts = data;
            whyKeys = Object.keys(data).filter(key => key.startsWith('why_'));
            
            // Find title and paragraph elements by ID
            titleElement = document.getElementById('why-title');
            paragraphElements = [
                document.getElementById('why-p1'),
                document.getElementById('why-p2'),
                document.getElementById('why-p3'),
                document.getElementById('why-p4')
            ];
            
            // Check if all elements exist
            if (titleElement && paragraphElements.every(el => el !== null) && whyKeys.length > 0) {
                // Set initial text
                updateAllContent(whyKeys[0]);
                
                // Start rotation after 5 seconds
                setTimeout(() => {
                    startTextRotation();
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Error loading why-details.json:', error);
        });
    
    function updateAllContent(whyKey) {
        const storyData = whyTexts[whyKey];
        if (!storyData) return;
        
        // Update title
        if (storyData.title && titleElement) {
            const formattedTitle = storyData.title
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');
            titleElement.innerHTML = `<i class="bi bi-lightbulb"></i> ${formattedTitle}`;
        }
        
        // Update each paragraph with corresponding p_1, p_2, p_3, p_4
        paragraphElements.forEach((element, index) => {
            const paragraphKey = `p_${index + 1}`;
            if (storyData[paragraphKey]) {
                // Replace \n\n with double <br> and \n with single <br>
                element.innerHTML = storyData[paragraphKey]
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>');
            }
        });
    }
    
    function startTextRotation() {
        if (whyKeys.length <= 1) return; // No rotation needed if only one text
        
        rotationInterval = setInterval(() => {
            rotateText();
        }, 8000); // Change text every 8 seconds
    }
    
    function rotateText() {
        if (paragraphElements.length === 0 || whyKeys.length === 0) return;
        
        // Add fade out effect to title and all paragraphs
        if (titleElement) {
            titleElement.style.opacity = '0';
            titleElement.style.transition = 'opacity 0.5s ease-in-out';
        }
        
        paragraphElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.5s ease-in-out';
        });
        
        setTimeout(() => {
            // Move to next text
            currentIndex = (currentIndex + 1) % whyKeys.length;
            updateAllContent(whyKeys[currentIndex]);
            
            // Add fade in effect to title and all paragraphs
            if (titleElement) {
                titleElement.style.opacity = '1';
            }
            
            paragraphElements.forEach(element => {
                element.style.opacity = '1';
            });
        }, 500); // Wait for fade out to complete
    }
    
    // Pause rotation when user hovers over title or any paragraph
    const allElements = [titleElement, ...paragraphElements].filter(el => el !== null);
    
    allElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (rotationInterval) {
                clearInterval(rotationInterval);
                rotationInterval = null;
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (!rotationInterval) {
                startTextRotation();
            }
        });
    });
});