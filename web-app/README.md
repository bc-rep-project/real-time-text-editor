
# Real-time Collaborative Text Editor

This is a real-time collaborative text editor built with Node.js, Express, and WebSockets.

## Features

- Real-time collaborative editing
- Document creation and retrieval
- WebSocket communication for instant updates

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`

## Usage

1. Open `http://21b4ce6a841c24d7f4.blackbx.ai/client1.html` in one browser window
2. Open `http://21b4ce6a841c24d7f4.blackbx.ai/client2.html` in another browser window or incognito mode
3. Start editing the document in either window and see the changes reflect in real-time in the other window

## API Endpoints

- GET /api/documents: Retrieve all documents
- POST /api/documents: Create a new document
- GET /api/documents/:id: Retrieve a specific document
- PUT /api/documents/:id: Update a specific document

## Future Improvements

- Implement user authentication and authorization
- Add more robust error handling and input validation
- Implement conflict resolution for simultaneous edits
- Add a feature to display which users are currently editing the document
- Implement versioning to allow users to revert to previous versions of the document

