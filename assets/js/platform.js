document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");

    const swiperConfig = {
        loop: true,
        speed: 600,
        autoplay: {
            delay: 15000
        },
        slidesPerView: "auto",
        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true
        }
    };

    fetch("assets/data/platform-details.json")
        .then(response => response.json())
        .then(detailsMap => {
            const details = detailsMap[platform];
            // console.log('Platform:', platform);
            // console.log('Details:', details);
            // console.log('Images:', details?.images);
            if (!details) {
                // console.error(`No details found for platform: ${platform}`);
                throw new Error(`No details found for platform: ${platform}`);
            }
            const imagePaths = details.images || [];

            const wrapper = document.getElementById("platform-images");
            if (wrapper) {
                wrapper.innerHTML = '';
                if (imagePaths.length > 0) {
                    imagePaths.forEach((path, index) => {
                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide';

                        const isVideo = path.endsWith('.mov') || path.endsWith('.mp4') || path.endsWith('.webm');
                        
                        if (isVideo) {
                            const video = document.createElement('video');
                            video.src = path;
                            video.controls = true;
                            video.classList.add('image-border');
                            video.style.width = '100%';
                            video.style.height = 'auto';
                            slide.appendChild(video);
                        } else {
                            const img = document.createElement('img');
                            img.src = path;
                            img.alt = "under constructions";
                            img.classList.add('image-border');
                            slide.appendChild(img);
                        }

                        const caption = document.createElement('div');
                        caption.className = 'slide-caption';
                        caption.textContent = (details.captions && details.captions[index]) || '';

                        slide.appendChild(caption);
                        wrapper.appendChild(slide);
                    });
                }
                new Swiper(".init-swiper", swiperConfig);
            } else {
                // console.log("NO WRAPPER");
            }

            if (details) {
                document.getElementById("platform-actions-title").textContent = details.platform_actions_title;
                document.getElementById("platform-title").textContent = details.title;
                document.getElementById("platform-description").textContent = details.description;

                document.getElementById("platform-category").textContent = details.category;
                document.getElementById("platform-client").textContent = details.client;
                document.getElementById("platform-date").textContent = details.date;
                const urlElement = document.getElementById("platform-url");
                if (urlElement) {
                    urlElement.textContent = details.url;
                    urlElement.setAttribute("href", details.url);
                }

                document.getElementById("platform-action").textContent = details.action;

                const platformCurrentElement = document.getElementById("platform-current");
                const platformCurrentLink = platformCurrentElement.querySelector("a");
                if (platformCurrentLink) {
                    platformCurrentLink.textContent = details.platform;
                }
            } else {
                document.getElementById("platform-details")?.classList.add("d-none");
                document.getElementById("platform-error")?.classList.remove("d-none");
            }
        })
        .catch(error => {
            // console.error("Failed to load platform details:", error);
            document.getElementById("platform-details")?.classList.add("d-none");
            document.getElementById("platform-error")?.classList.remove("d-none");
        });
});