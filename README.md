# RemediFind

A modern web application designed to help users find natural alternatives to pharmaceutical drugs and supplements.

## Features

- **Fast Search**: Find natural alternatives to common pharmaceuticals quickly
- **Dark/Light Mode**: Toggle between light and dark themes for comfortable viewing
- **Search History**: Keep track of your recent searches for easy reference
- **Fuzzy Search**: Find results even when your spelling isn't perfect
- **Filtering**: Filter results by category or matching nutrients
- **Pagination**: Navigate through results easily
- **Mobile-Friendly Design**: Works on all devices

## Tech Stack

- **React**: For building the user interface
- **Next.js**: For server-side rendering and API routes
- **TypeScript**: For type safety
- **TailwindCSS**: For styling
- **Levenshtein Algorithm**: For fuzzy search functionality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/remedi.git
cd remedi
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── search/         # Search API
│   ├── layout.tsx          # Root layout with ThemeProvider
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── theme-provider.tsx  # Manages theme state
│   └── ui/                 # UI components
│       ├── demo.tsx        # Demo component
│       ├── filter.tsx      # Filter component
│       ├── header.tsx      # Header component
│       ├── pagination.tsx  # Pagination component
│       ├── search.tsx      # Search component
│       └── theme-toggle.tsx # Theme toggle button
├── hooks/                  # Custom React hooks
│   └── use-local-storage.ts # localStorage hook
├── lib/                    # Utility functions
│   ├── fuzzy-search.ts     # Fuzzy search implementation
│   └── utils.ts            # General utilities
├── public/                 # Static assets
├── styles/                 # Global styles
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## API Routes

### GET /api/search

Search for natural alternatives to a pharmaceutical.

**Parameters:**
- `query` (string): The name of the pharmaceutical to search for

**Example Response:**
```json
[
  {
    "id": "b1",
    "name": "Turmeric",
    "description": "Contains curcumin which has anti-inflammatory properties.",
    "imageUrl": "https://example.com/turmeric.jpg",
    "category": "Herbal Remedy",
    "matchingNutrients": ["Curcumin"],
    "similarityScore": 0.85
  }
]
```

## Implemented Features

### Dark/Light Mode
- System preference detection
- Manual toggle option
- Persistent theme selection

### Search Functionality
- Fuzzy matching with Levenshtein distance algorithm
- Relevance scoring for results
- Search history tracking
- Suggested searches

### Filtering System
- Filter by category (Food Source, Herbal Remedy, etc.)
- Filter by matching nutrients
- Multiple filter selection
- Filter counts display

### User Interface
- Responsive design for all screen sizes
- Modern, clean aesthetic
- Accessible color schemes
- Loading states and error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for informational purposes only. Always consult with a healthcare professional before making changes to your medication regimen.
