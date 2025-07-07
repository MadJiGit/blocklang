# BlockLang Website

This repository contains the official website for BlockLang - a privacy-focused browser extension that helps you clean up your search results by filtering unwanted content.

## About BlockLang

BlockLang is a lightweight and privacy-friendly browser extension that helps you filter out unwanted languages, domains, or sites from your Google and Bing search results. It works completely offline with no tracking or data collection.

## Key Features

- **Custom Domain Filtering**: Block specific websites (e.g., `facebook.com`, `*.ru`)
- **Language Filtering**: Filter content by language (e.g., `language:ru`, `language:zh`)
- **Quick Russian Filter**: Toggle to instantly block 89+ Russian domains
- **Complete Privacy**: All filtering happens locally - no data leaves your device
- **Cross-Platform**: Available for Chrome, Firefox, Safari (macOS/iOS)
- **Free & Pro Tiers**: 5 domain filters free, unlimited with Pro

## Website Structure

The website provides comprehensive information about BlockLang:

### Main Sections
- **Home** (`index.html`) - Landing page with overview
- **About** - Basic information about the extension
- **How It Works** (`how-it-works.html`) - Technical details with dropdown navigation
  - Technical Overview - Step-by-step filtering process
  - Language Filter Explorer - Interactive language code finder with 34+ languages
  - Implementation Details - DOM filtering, local storage, performance
  - Real-world examples - 4 practical use cases with visual flow
- **How To Use** - Video tutorials and screenshots
- **Download** - Links to browser stores
- **Privacy Policy** (`privacy.html`) - Data handling transparency
- **Terms of Use** (`terms.html`) - Usage terms
- **Credits** (`credits.html`) - Acknowledgments

### Interactive Features
- **Language Filter Explorer** - Search and find language codes for filtering
  - Type to search 34+ languages (e.g., "Russian", "Chinese", "Arabic")
  - Copy language codes with one click (e.g., `language:ru`, `language:zh`)
  - Visual language selection with native script display
- **Dropdown Navigation** - Quick access to How It Works sections
- **Responsive Examples** - Visual step-by-step filtering demonstrations
- **Copy-to-clipboard** functionality for easy filter setup

### Technical Implementation
- Built with Bootstrap 5 for responsive design
- Uses AOS (Animate On Scroll) for smooth animations
- Custom JavaScript components (`how-it-works.js`) for interactive features
- Modular CSS and JS architecture for maintainability
- Optimized for all device sizes (desktop, tablet, mobile)
- SEO-friendly with proper meta tags and structured content

## Deployment

The website is hosted via GitHub Pages and automatically deploys from the main branch.

## Browser Extension Repositories

- **Safari Extension**: Private repository (iOS/macOS App Store)
- **Chrome Extension**: Available on Chrome Web Store
- **Firefox Extension**: Available on Firefox Add-ons

## Contact

- **Website**: [blocklang.org](https://www.blocklang.org)
- **Email**: contact@blocklang.org
- **Support**: Available through website contact form

## License

This website project is licensed under the MIT License. The BlockLang browser extensions may have different licensing terms - see individual extension stores for details.
