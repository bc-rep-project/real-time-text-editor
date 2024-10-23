# Real-time Text Editor with Chat

This project is a real-time text editor with an integrated chat feature, optimized for both desktop and mobile devices.

## Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- pip (Python package installer)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/bc-rep-project/real-time-text-editor.git
   cd real-time-text-editor
   ```

2. Install Node.js dependencies:
   ```
   cd web-app
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install websockets
   ```

## Running the Application

1. Start the Next.js server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the chat server:
   ```
   npm run chat-server
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Features

- Real-time text editing
- User authentication
- Real-time chat for each document
- File sharing in chat (up to 5MB per file)
- Typing indicators in chat
- Message search functionality
- Responsive design for desktop and mobile devices
- Touch-friendly interface for mobile users
- Dark mode support

## File Sharing

The chat feature includes file sharing capabilities:

- Users can upload and share files up to 5MB in size
- Supported file types include images, documents, and other common formats
- Shared files are displayed as clickable links in the chat
- Files are stored securely and can be accessed by all users in the document chat

To share a file:
1. Click the attachment icon in the chat input area
2. Select a file from your device
3. The file will be uploaded and shared automatically when you send your message

File upload features:
- Loading indicator during file upload
- Error handling for failed uploads
- Disabled input fields and buttons during upload to prevent multiple submissions

Note: Please be mindful of the file size limit and only share appropriate content. If you encounter any issues during file upload, an error message will be displayed, and you can try again.

## Mobile Compatibility

This application is designed to work seamlessly on both desktop and mobile devices. The user interface adapts to different screen sizes, providing an optimal experience across various devices.

### Mobile-specific features:
- Typing indicators for real-time feedback
- Touch-friendly buttons and inputs
- Swipe gestures for navigation (where applicable)
- Optimized layout for smaller screens

## Testing

To ensure the best experience across different devices, please test the application on various screen sizes and devices, including:

- Desktop browsers (Chrome, Firefox, Safari, Edge)
- iOS devices (iPhone, iPad)
- Android devices (various screen sizes)

If you encounter any issues or have suggestions for improving the mobile experience, please submit an issue or pull request.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
