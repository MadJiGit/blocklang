/**
 * Blog Dynamic Loader
 * Loads blog content from JSON file and renders it dynamically
 */

document.addEventListener('DOMContentLoaded', function() {
    loadBlogData();
});

async function loadBlogData() {
    try {
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('assets/data/blog-details.json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const blogData = await response.json();
        renderBlogPosts(blogData);
    } catch (error) {
        console.error('Error loading blog data:', error);
        showFallbackContent();
    }
}

function renderBlogPosts(blogData) {
    const blogContainer = document.querySelector('.blog-container');
    const loadingDiv = document.getElementById('blog-loading');
    
    if (!blogContainer) {
        console.error('Blog container not found');
        return;
    }

    // Hide loading indicator
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }

    // Clear existing content
    blogContainer.innerHTML = '';

    // Sort posts by date (newest first)
    const sortedPosts = Object.entries(blogData)
        .sort(([,a], [,b]) => new Date(b.date) - new Date(a.date));

    // Generate blog posts
    sortedPosts.forEach(([key, post]) => {
        if (!post.title || !post.content) {
            return;
        }

        const postElement = createBlogPost(post, key);
        blogContainer.appendChild(postElement);
    });
}

function createBlogPost(post, postId) {
    // Create main container
    const postCard = document.createElement('article');
    postCard.className = 'blog-post mb-5';
    
    // Add featured class if needed
    if (post.featured) {
        postCard.classList.add('featured-post');
    }

    // Create card structure
    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm h-100';

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body p-4';

    // Featured badge
    if (post.featured) {
        const featuredBadge = document.createElement('span');
        featuredBadge.className = 'badge bg-primary mb-2';
        featuredBadge.textContent = 'Featured';
        cardBody.appendChild(featuredBadge);
    }

    // Title
    const title = document.createElement('h2');
    title.className = 'card-title mb-3';
    title.textContent = post.title;
    cardBody.appendChild(title);

    // Meta information
    const metaDiv = document.createElement('div');
    metaDiv.className = 'blog-meta mb-3 text-muted small';
    
    const dateSpan = document.createElement('span');
    dateSpan.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${formatDate(post.date)}`;
    
    const authorSpan = document.createElement('span');
    authorSpan.innerHTML = `<i class="bi bi-person me-1 ms-3"></i>${post.author}`;
    
    metaDiv.appendChild(dateSpan);
    metaDiv.appendChild(authorSpan);
    cardBody.appendChild(metaDiv);

    // Excerpt
    if (post.excerpt) {
        const excerpt = document.createElement('p');
        excerpt.className = 'card-text text-muted mb-3';
        excerpt.textContent = post.excerpt;
        cardBody.appendChild(excerpt);
    }

    // Content preview (first 150 characters)
    const contentPreview = document.createElement('div');
    contentPreview.className = 'content-preview mb-3';
    const plainText = post.content.replace(/<[^>]*>/g, '');
    const preview = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    contentPreview.textContent = preview;
    cardBody.appendChild(contentPreview);

    // Tags
    if (post.tags && post.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'blog-tags mb-3';
        
        post.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'badge bg-light text-dark me-2';
            tagSpan.innerHTML = `<i class="bi bi-tag me-1"></i>${tag}`;
            tagsDiv.appendChild(tagSpan);
        });
        
        cardBody.appendChild(tagsDiv);
    }

    // Read more button
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'btn btn-outline-primary';
    readMoreBtn.innerHTML = '<i class="bi bi-book-open me-2"></i>Read More';
    readMoreBtn.onclick = () => expandPost(postId, post, readMoreBtn);
    cardBody.appendChild(readMoreBtn);

    // Full content (hidden initially)
    const fullContent = document.createElement('div');
    fullContent.className = 'full-content mt-3 d-none';
    fullContent.innerHTML = post.content;
    cardBody.appendChild(fullContent);

    card.appendChild(cardBody);
    postCard.appendChild(card);

    return postCard;
}

function expandPost(postId, post, button) {
    const postElement = button.closest('.blog-post');
    const fullContent = postElement.querySelector('.full-content');
    const contentPreview = postElement.querySelector('.content-preview');
    
    if (fullContent.classList.contains('d-none')) {
        // Expand
        fullContent.classList.remove('d-none');
        contentPreview.style.display = 'none';
        button.innerHTML = '<i class="bi bi-chevron-up me-2"></i>Show Less';
        button.className = 'btn btn-outline-secondary';
    } else {
        // Collapse
        fullContent.classList.add('d-none');
        contentPreview.style.display = 'block';
        button.innerHTML = '<i class="bi bi-book-open me-2"></i>Read More';
        button.className = 'btn btn-outline-primary';
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showErrorMessage() {
    const blogContainer = document.querySelector('.blog-container');
    const loadingDiv = document.getElementById('blog-loading');
    
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    if (!blogContainer) {
        return;
    }

    blogContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Unable to load blog content.</strong> Please try refreshing the page.
        </div>
    `;
}

function showFallbackContent() {
    const blogContainer = document.querySelector('.blog-container');
    const loadingDiv = document.getElementById('blog-loading');
    
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    if (!blogContainer) {
        return;
    }

    // Show static content from noscript section
    blogContainer.innerHTML = `
        <article class="blog-post mb-5">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <span class="badge bg-primary mb-2">Featured</span>
                    <h2 class="card-title mb-3">Welcome to BlockLang Blog</h2>
                    <div class="blog-meta mb-3 text-muted small">
                        <span><i class="bi bi-calendar3 me-1"></i>December 1, 2024</span>
                        <span><i class="bi bi-person me-1 ms-3"></i>BlockLang Team</span>
                    </div>
                    <p class="card-text text-muted mb-3">Learn about our journey building a privacy-focused browser extension and our mission to clean up the web.</p>
                </div>
            </div>
        </article>
        
        <article class="blog-post mb-5">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h2 class="card-title mb-3">5 Tips for Effective Search Filtering</h2>
                    <div class="blog-meta mb-3 text-muted small">
                        <span><i class="bi bi-calendar3 me-1"></i>November 15, 2024</span>
                        <span><i class="bi bi-person me-1 ms-3"></i>BlockLang Team</span>
                    </div>
                    <p class="card-text text-muted mb-3">Master the art of search filtering with these practical tips for using BlockLang more effectively.</p>
                </div>
            </div>
        </article>
    `;
}

// Helper function to add new blog posts dynamically (for future use)
function addBlogPost(title, excerpt, content, author, tags = []) {
    const blogContainer = document.querySelector('.blog-container');
    
    const newPost = {
        title: title,
        excerpt: excerpt,
        content: content,
        author: author,
        date: new Date().toISOString().split('T')[0],
        tags: tags,
        featured: false
    };
    
    const newPostElement = createBlogPost(newPost, `post_${Date.now()}`);
    blogContainer.insertBefore(newPostElement, blogContainer.firstChild);
}