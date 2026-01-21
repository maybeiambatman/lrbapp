# REST API Examples

This directory contains REST Client files for testing the Golf Trip Manager API.

## Setup

1. **Start the backend server**:
   ```bash
   npm run dev
   ```

2. **Open any `.rest` file** and click "Send Request" above each request

## Usage

Each `.rest` file contains examples for a specific resource:

- `trips.rest` - Trip management endpoints
- `courses.rest` - Course management endpoints  
- `players.rest` - Player management endpoints
- `scores.rest` - Score entry and retrieval endpoints
- `users.rest` - User management endpoints

### Variables

The files use variables defined at the top:
- `@baseUrl` - API base URL (default: http://localhost:3001)
- `@tripId`, `@courseId`, etc. - IDs from responses

You can update these after creating resources to test specific endpoints.

## Tips

- Click "Send Request" text above each `###` separator
- Responses appear in a new panel
- Variables from responses can be captured and reused
- Use `Cmd/Ctrl + Alt + R` to send the request under cursor
