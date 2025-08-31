document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");

    fetch("assets/data/services-details.json")
        .then(response => response.json())
        .then(detailsMap => {
            const details = detailsMap[platform];
            if (details) {
                document.getElementById("service-details-title").textContent = details.title;
                document.getElementById("service-details-description").textContent = details.description;
                const appStoreLink = document.getElementById("app-store-extension-id");

                if (appStoreLink) {
                    // Set link
                    appStoreLink.setAttribute("href", details.app_store_link);

                    // Set image
                    const appStoreImage = appStoreLink.querySelector("img");
                    if (appStoreImage) {
                        appStoreImage.setAttribute("src", details.app_store_logo);
                        appStoreImage.setAttribute("alt", details.alt);
                    }
                } else {
                    // console.error(`No details found for platform: ${platform}`);
                }

                const serviceDetailImage = document.getElementById("service-details-image");

                if (serviceDetailImage) {
                    serviceDetailImage.setAttribute("src", details.image_main);
                    serviceDetailImage.setAttribute("alt", details.alt);
                } else {
                    // console.error(`No details found for platform: ${platform}`);
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