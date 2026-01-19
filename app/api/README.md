# Remedi API Documentation

This document provides comprehensive documentation for all Remedi API endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Search API](#search-api)
- [Search History API](#search-history-api)
- [Favorites API](#favorites-api)
- [Filter Preferences API](#filter-preferences-api)
- [Remedy Details API](#remedy-details-api)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Authentication

Currently, all endpoints support session-based access for anonymous users. Session IDs are UUID v4 strings stored in the client's localStorage.

**Future**: User authentication will be added, allowing both `sessionId` and `userId` parameters.

## Search API

### Search for Natural Remedies

Search for natural remedies based on a pharmaceutical drug or supplement name.

**Endpoint**: `GET /api/search`

**Query Parameters**:
- `query` (required): Search query string (1-100 characters)
- `sessionId` (optional): Session ID for tracking search history
- `userId` (optional): User ID (for authenticated users)

**Example Request**:
```bash
curl "http://localhost:3000/api/search?query=ibuprofen&sessionId=123e4567-e89b-12d3-a456-426614174000"
```

**Example Response**:
```json
[
  {
    "id": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
    "name": "Turmeric",
    "description": "Powerful anti-inflammatory spice containing curcumin",
    "imageUrl": "https://images.unsplash.com/...",
    "category": "Spice",
    "matchingNutrients": ["Curcumin", "Anti-inflammatory compounds"],
    "similarityScore": 0.85
  }
]
```

**Search Strategy**:
1. Database search (fastest)
2. FDA OpenFDA API (external)
3. Mock data fallback

**Features**:
- Automatic query normalization
- Spelling variant handling
- Search history tracking (when sessionId provided)

---

## Search History API

### Save Search History

Records a search query for analytics and user history.

**Endpoint**: `POST /api/search-history`

**Request Body**:
```json
{
  "query": "ibuprofen",
  "resultsCount": 2,
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": null
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Search history saved successfully"
  }
}
```

**Note**: Search history is automatically tracked when using the search API with a sessionId parameter.

### Get Search History

Retrieve recent searches for a session or user.

**Endpoint**: `GET /api/search-history`

**Query Parameters**:
- `sessionId` (optional): Session ID
- `userId` (optional): User ID
- `limit` (optional): Number of results (default: 10, max: 100)
- `popular` (optional): Set to "true" to get popular searches instead

**Example Request**:
```bash
curl "http://localhost:3000/api/search-history?sessionId=123e4567-e89b-12d3-a456-426614174000&limit=5"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "abc-123",
        "query": "ibuprofen",
        "resultsCount": 2,
        "createdAt": "2025-10-26T05:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Get Popular Searches

Retrieve most frequently searched terms across all users.

**Endpoint**: `GET /api/search-history?popular=true`

**Query Parameters**:
- `popular`: "true" (required)
- `limit` (optional): Number of results (default: 5)

**Example Response**:
```json
{
  "success": true,
  "data": {
    "popular": [
      { "query": "ibuprofen", "count": 45 },
      { "query": "vitamin d", "count": 32 },
      { "query": "melatonin", "count": 28 }
    ]
  }
}
```

### Clear Search History

Delete all search history for a session or user.

**Endpoint**: `DELETE /api/search-history`

**Query Parameters**:
- `sessionId` (optional): Session ID
- `userId` (optional): User ID

**Note**: At least one of sessionId or userId must be provided.

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Search history cleared successfully",
    "deletedCount": 15
  }
}
```

---

## Favorites API

### Add Favorite

Add a natural remedy to favorites.

**Endpoint**: `POST /api/favorites`

**Request Body**:
```json
{
  "remedyId": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
  "remedyName": "Turmeric",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "notes": "Works great for joint pain",
  "collectionName": "Pain Relief"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "favorite": {
      "id": "fav-123",
      "remedyId": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
      "remedyName": "Turmeric",
      "notes": "Works great for joint pain",
      "collectionName": "Pain Relief",
      "createdAt": "2025-10-26T05:30:00.000Z",
      "updatedAt": "2025-10-26T05:30:00.000Z"
    },
    "message": "Remedy added to favorites"
  }
}
```

**Error (409 Conflict)**:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "This remedy is already in your favorites",
    "statusCode": 409
  }
}
```

### Get Favorites

Retrieve all favorites for a session or user.

**Endpoint**: `GET /api/favorites`

**Query Parameters**:
- `sessionId` (optional): Session ID
- `userId` (optional): User ID
- `collectionName` (optional): Filter by collection name
- `collections` (optional): Set to "true" to get list of collection names
- `check` (optional): Remedy ID to check if favorited

**Example Request (Get all favorites)**:
```bash
curl "http://localhost:3000/api/favorites?sessionId=123e4567-e89b-12d3-a456-426614174000"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "fav-123",
        "remedyId": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
        "remedyName": "Turmeric",
        "notes": "Works great for joint pain",
        "collectionName": "Pain Relief",
        "createdAt": "2025-10-26T05:30:00.000Z",
        "updatedAt": "2025-10-26T05:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Example Request (Get collections)**:
```bash
curl "http://localhost:3000/api/favorites?sessionId=123e4567-e89b-12d3-a456-426614174000&collections=true"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "collections": ["Pain Relief", "Sleep Aid", "Digestion"]
  }
}
```

**Example Request (Check if favorited)**:
```bash
curl "http://localhost:3000/api/favorites?sessionId=123e4567-e89b-12d3-a456-426614174000&check=2948e6c5-b2bf-45f6-90ea-88e1e8cef15b"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "isFavorite": true,
    "remedyId": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b"
  }
}
```

### Update Favorite

Update notes or collection name for a favorite.

**Endpoint**: `PUT /api/favorites`

**Request Body**:
```json
{
  "id": "fav-123",
  "notes": "Updated notes about this remedy",
  "collectionName": "New Collection"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "favorite": {
      "id": "fav-123",
      "remedyId": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
      "remedyName": "Turmeric",
      "notes": "Updated notes about this remedy",
      "collectionName": "New Collection",
      "createdAt": "2025-10-26T05:30:00.000Z",
      "updatedAt": "2025-10-26T05:35:00.000Z"
    },
    "message": "Favorite updated successfully"
  }
}
```

### Delete Favorite

Remove a remedy from favorites.

**Endpoint**: `DELETE /api/favorites`

**Query Parameters**:
- `id` (required): Favorite ID (UUID)

**Example Request**:
```bash
curl -X DELETE "http://localhost:3000/api/favorites?id=fav-123"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Favorite removed successfully"
  }
}
```

---

## Filter Preferences API

### Save Filter Preferences

Save or update filter preferences for a session or user.

**Endpoint**: `POST /api/filter-preferences`

**Request Body**:
```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "categories": ["Spice", "Herbal Remedy"],
  "nutrients": ["Curcumin", "Antioxidants"],
  "evidenceLevels": ["Strong", "Moderate"],
  "sortBy": "similarity",
  "sortOrder": "desc"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "preferences": {
      "id": "pref-123",
      "categories": ["Spice", "Herbal Remedy"],
      "nutrients": ["Curcumin", "Antioxidants"],
      "evidenceLevels": ["Strong", "Moderate"],
      "sortBy": "similarity",
      "sortOrder": "desc",
      "createdAt": "2025-10-26T05:30:00.000Z",
      "updatedAt": "2025-10-26T05:30:00.000Z"
    },
    "message": "Filter preferences saved successfully"
  }
}
```

### Get Filter Preferences

Retrieve saved filter preferences.

**Endpoint**: `GET /api/filter-preferences`

**Query Parameters**:
- `sessionId` (optional): Session ID
- `userId` (optional): User ID

**Note**: At least one of sessionId or userId must be provided.

**Example Request**:
```bash
curl "http://localhost:3000/api/filter-preferences?sessionId=123e4567-e89b-12d3-a456-426614174000"
```

**Example Response (with saved preferences)**:
```json
{
  "success": true,
  "data": {
    "preferences": {
      "id": "pref-123",
      "categories": ["Spice", "Herbal Remedy"],
      "nutrients": ["Curcumin", "Antioxidants"],
      "evidenceLevels": ["Strong", "Moderate"],
      "sortBy": "similarity",
      "sortOrder": "desc",
      "createdAt": "2025-10-26T05:30:00.000Z",
      "updatedAt": "2025-10-26T05:30:00.000Z"
    },
    "isDefault": false
  }
}
```

**Example Response (no saved preferences)**:
```json
{
  "success": true,
  "data": {
    "preferences": {
      "categories": [],
      "nutrients": [],
      "evidenceLevels": [],
      "sortBy": null,
      "sortOrder": null
    },
    "isDefault": true
  }
}
```

### Clear Filter Preferences

Reset filter preferences to default.

**Endpoint**: `DELETE /api/filter-preferences`

**Query Parameters**:
- `sessionId` (optional): Session ID
- `userId` (optional): User ID

**Note**: At least one of sessionId or userId must be provided.

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Filter preferences cleared successfully"
  }
}
```

---

## Remedy Details API

### Get Remedy by ID

Retrieve detailed information about a specific natural remedy.

**Endpoint**: `GET /api/remedy/[id]`

**Path Parameters**:
- `id` (required): Remedy ID (UUID or slug format)

**Example Request**:
```bash
curl "http://localhost:3000/api/remedy/2948e6c5-b2bf-45f6-90ea-88e1e8cef15b"
```

**Example Response**:
```json
{
  "id": "2948e6c5-b2bf-45f6-90ea-88e1e8cef15b",
  "name": "Turmeric",
  "description": "Powerful anti-inflammatory spice containing curcumin",
  "category": "Spice",
  "ingredients": ["Curcumin", "Essential oils"],
  "benefits": ["Anti-inflammatory", "Antioxidant", "Pain relief"],
  "imageUrl": "https://images.unsplash.com/...",
  "usage": "Add to food or take as supplement",
  "dosage": "500mg-2000mg daily",
  "precautions": "May interact with blood thinners",
  "scientificInfo": "Contains curcuminoids with proven anti-inflammatory properties",
  "references": [
    {
      "title": "Study on turmeric benefits",
      "url": "https://pubmed.ncbi.nlm.nih.gov/...",
      "year": 2023
    }
  ],
  "relatedRemedies": [
    {
      "id": "ginger-id",
      "name": "Ginger",
      "reason": "Similar anti-inflammatory properties"
    }
  ],
  "evidenceLevel": "Strong"
}
```

---

## Error Handling

All API endpoints use standardized error responses.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": {}
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_INPUT` | 400 | Request validation failed |
| `MISSING_PARAMETER` | 400 | Required parameter not provided |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate favorite) |
| `INTERNAL_ERROR` | 500 | Server error occurred |
| `DATABASE_ERROR` | 500 | Database operation failed |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "query: Query cannot be empty",
    "statusCode": 400
  }
}
```

---

## Response Format

All successful API responses follow this format:

```typescript
{
  success: true,
  data: T,           // Response data (varies by endpoint)
  metadata?: {       // Optional metadata
    page?: number,
    pageSize?: number,
    total?: number
  }
}
```

---

## Client-Side Usage

### Session Management

Use the session utility to manage anonymous user sessions:

```typescript
import { getSessionId } from '@/lib/session';

// Get or create session ID
const sessionId = getSessionId();

// Use in API calls
fetch(`/api/search?query=ibuprofen&sessionId=${sessionId}`);
```

### TypeScript Types

All API validation schemas and types are available in `lib/validations/api.ts`:

```typescript
import type {
  SearchQuery,
  AddFavorite,
  SaveFilterPreferences
} from '@/lib/validations/api';
```

---

## Rate Limiting

Currently, no rate limiting is implemented. This will be added in a future update.

**Planned**: 100 requests per minute per session/IP.

---

## Changelog

### 2025-10-26
- Added Search History API
- Added Favorites API with full CRUD operations
- Added Filter Preferences API
- Integrated search history tracking into Search API
- Created session management utility

### Previous
- Initial API implementation
- Search endpoint with multi-tier strategy
- Remedy details endpoint
