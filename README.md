# Real-Time Collaborative Text Editor

A real-time collaborative text editor built with Next.js, Firebase, and WebSocket technology. Multiple users can simultaneously edit documents, chat in real-time, and track document version history.

## Features

- 📝 Real-time collaborative document editing
- 💬 Live chat functionality
- 🔄 Document version history
- 🔒 User authentication
- 👥 Multiple user support
- 📱 Responsive design
- 🌐 WebSocket communication
- 🔥 Firebase integration

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - TailwindCSS
  - TipTap Editor

- **Backend:**
  - Firebase (Database & Authentication)
  - WebSocket Server (Real-time communication)
  - Express (Health checks)

- **Authentication:**
  - NextAuth.js
  - Firebase Authentication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/real-time-text-editor.git

cd real-time-text-editor

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```	

4. 4. Configure Firebase:
   - Create a Firebase project
   - Download service account key
   - Add Firebase configuration to environment variables

### Environment Variables

Required variables:
- `NEXTAUTH_SECRET`: Random string for NextAuth.js
- `NEXTAUTH_URL`: Your application URL
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

### Development

Run the development server:

```bash
npm run dev
```

Run the WebSocket server:

```bash
npm run ws
```

### Deployment

#### Frontend (Vercel)
1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

#### WebSocket Server (Railway)
1. Push your code to GitHub
2. Import project to Railway
3. Configure environment variables
4. Deploy

## Features in Detail

### Real-time Collaboration
- Multiple users can edit the same document simultaneously
- Changes are synchronized in real-time across all connected clients
- Visual indicators show other users' cursor positions

### Document Version History
- Automatic version tracking
- Ability to view and restore previous versions
- Track changes with timestamps and user information

### Live Chat
- Real-time chat functionality per document
- User presence indicators
- Message history

### Authentication
- Secure user authentication
- Protected routes and API endpoints
- User session management

## Project Structure

real-time-text-editor/
├── app/ # Next.js app directory
├── components/ # React components
├── lib/ # Utility functions and configurations
├── public/ # Static assets
├── server/ # WebSocket server
├── styles/ # CSS styles
└── types/ # TypeScript type definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TipTap](https://tiptap.dev/) for the rich text editor
- [Next.js](https://nextjs.org/) for the React framework
- [Firebase](https://firebase.google.com/) for backend services
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) for real-time communication

## Support

For support, email johannderbiel@gmail.com or open an issue in the repository.