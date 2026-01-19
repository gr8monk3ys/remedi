# Remedi

A modern web application designed to help users find natural alternatives to pharmaceutical drugs and supplements. The app integrates with the OpenFDA API and uses an intelligent database-first search strategy to provide accurate, science-backed natural remedy recommendations.

## Features

- **Fast Search**: Find natural alternatives to common pharmaceuticals quickly
- **OpenFDA Integration**: Search thousands of FDA-approved drugs and supplements
- **Database-First Strategy**: Intelligent caching for faster subsequent searches
- **Dark/Light Mode**: Toggle between light and dark themes for comfortable viewing
- **Search History**: Keep track of your recent searches for easy reference
- **Fuzzy Search**: Find results even when your spelling isn't perfect
- **Filtering**: Filter results by category or matching nutrients
- **Detailed Remedy Information**: Usage, dosage, precautions, and scientific references
- **Favorites System**: Save your favorite remedies for quick access
- **Mobile-Friendly Design**: Works on all devices

## Tech Stack

- **React 18**: For building the user interface
- **Next.js 15**: For server-side rendering and API routes
- **TypeScript 5**: For type safety
- **Prisma**: ORM for database operations
- **SQLite**: Database (development) - easily switchable to PostgreSQL/MySQL
- **TailwindCSS 4**: For styling
- **Framer Motion**: For animations
- **next-themes**: For dark/light mode
- **OpenFDA API**: For pharmaceutical data
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
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration (optional for basic usage)
```

4. Set up the database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
npm run prisma db seed
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── remedy/[id]/      # Remedy detail API
│   │   └── search/           # Search API
│   ├── remedy/[id]/          # Remedy detail pages
│   ├── layout.tsx            # Root layout with ThemeProvider
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── theme-provider.tsx    # Manages theme state
│   └── ui/                   # UI components
│       ├── aurora-background.tsx  # Background effect
│       ├── demo.tsx          # Demo component
│       ├── filter.tsx        # Filter component
│       ├── header.tsx        # Header component
│       ├── pagination.tsx    # Pagination component
│       ├── search.tsx        # Search component
│       └── theme-toggle.tsx  # Theme toggle button
├── hooks/                    # Custom React hooks
│   └── use-local-storage.ts  # localStorage hook
├── lib/                      # Utility functions
│   ├── db.ts                 # Prisma database utilities
│   ├── fuzzy-search.ts       # Fuzzy search implementation
│   ├── openFDA.ts            # OpenFDA API integration
│   ├── remedyMapping.ts      # Remedy matching algorithm
│   ├── types.ts              # Shared TypeScript types
│   └── utils.ts              # General utilities
├── prisma/                   # Database files
│   ├── migrations/           # Database migrations
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Database seed script
│   └── dev.db                # SQLite database (development)
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── CLAUDE.md                 # Architecture guide
└── TODO.md                   # Task tracking
```

## API Routes

### GET /api/search

Search for natural alternatives to a pharmaceutical using a three-tier strategy:
1. Database search (fastest)
2. OpenFDA API (cached to database)
3. Mock data fallback

**Parameters:**
- `query` (string): The name of the pharmaceutical to search for

**Example Request:**
```bash
curl "http://localhost:3000/api/search?query=ibuprofen"
```

**Example Response:**
```json
[
  {
    "id": "turmeric",
    "name": "Turmeric",
    "description": "Contains curcumin which has anti-inflammatory properties.",
    "imageUrl": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7",
    "category": "Herbal Remedy",
    "matchingNutrients": ["Curcumin", "Anti-inflammatory compounds"],
    "similarityScore": 0.85
  }
]
```

### GET /api/remedy/[id]

Get detailed information about a specific natural remedy.

**Parameters:**
- `id` (string): The remedy ID

**Example Request:**
```bash
curl "http://localhost:3000/api/remedy/turmeric"
```

**Example Response:**
```json
{
  "id": "turmeric",
  "name": "Turmeric",
  "description": "Contains curcumin which has anti-inflammatory properties.",
  "imageUrl": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7",
  "category": "Herbal Remedy",
  "matchingNutrients": ["Curcumin"],
  "similarityScore": 0.85,
  "usage": "Can be used in cooking, taken as a supplement, or made into a paste...",
  "dosage": "500-2,000 mg of turmeric extract per day",
  "precautions": "May interact with blood thinners...",
  "scientificInfo": "The active compound in turmeric, curcumin, inhibits...",
  "references": [
    {
      "title": "Curcumin: A Review of Its Effects on Human Health",
      "url": "https://www.mdpi.com/2072-6643/9/10/1047"
    }
  ],
  "relatedRemedies": [
    { "id": "ginger", "name": "Ginger" }
  ]
}
```

## Architecture & Database

### Database Schema

The application uses Prisma ORM with three main models:

1. **Pharmaceutical** - Stores drug/supplement information
   - FDA ID, name, description, category
   - Ingredients and benefits (JSON arrays)
   - Usage, warnings, interactions

2. **NaturalRemedy** - Stores natural alternative information
   - Name, description, category, image
   - Ingredients, benefits, usage, dosage
   - Precautions, scientific info, references
   - Evidence level (Strong, Moderate, Limited, Traditional)

3. **NaturalRemedyMapping** - Links pharmaceuticals to remedies
   - Similarity score (0-1)
   - Matching nutrients
   - Replacement type (Alternative, Complementary, Supportive)

### Search Strategy

The app implements an intelligent three-tier search:

1. **Database First**: Searches local database for cached pharmaceuticals and their remedy mappings (instant results)
2. **OpenFDA API**: If not in database, queries FDA API and automatically caches results
3. **Mock Data Fallback**: Uses in-memory data for development/testing

### Key Features

#### Database Integration
- ✅ Prisma ORM with type-safe queries
- ✅ Automatic caching of FDA API results
- ✅ Efficient JSON field parsing for SQLite
- ✅ Database-first search strategy

#### Search & Discovery
- ✅ Fuzzy matching with Levenshtein distance
- ✅ Spelling correction and query normalization
- ✅ Relevance scoring for results
- ✅ Search history (localStorage)

#### User Experience
- ✅ Dark/Light mode with system preference detection
- ✅ Favorites system (localStorage)
- ✅ Detailed remedy pages with scientific references
- ✅ Responsive design for all screen sizes
- ✅ Loading states and error handling

#### Developer Experience
- ✅ Full TypeScript support with shared types
- ✅ ESLint configuration
- ✅ Environment variable templates
- ✅ Comprehensive documentation (CLAUDE.md, TODO.md)

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma Studio GUI
npm run prisma db seed  # Seed database with data
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:./dev.db"              # SQLite for dev
OPENAI_API_KEY="your-key"                 # Optional: AI features
OPENFDA_API_KEY="your-key"                # Optional: higher rate limits
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [TODO.md](TODO.md) for a list of planned features and improvements.

## Development Roadmap

See [TODO.md](TODO.md) for the complete roadmap. Key priorities:

- [ ] Expand database seed with more remedies
- [ ] Add testing infrastructure (Vitest)
- [ ] Implement user authentication
- [ ] Add AI-powered remedy matching
- [ ] Mobile app (PWA or React Native)

## Documentation

- [CLAUDE.md](CLAUDE.md) - Architecture and implementation guide
- [TODO.md](TODO.md) - Task tracking and roadmap
- [COMPLETED_TASKS.md](COMPLETED_TASKS.md) - Completed work summary

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

**Important**: This application is for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication changes. Never disregard professional medical advice or delay seeking it because of information you have read in this application.
