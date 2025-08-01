# CRM Application

A modern contact management application built with Next.js, Supabase, and TypeScript.

## Features

### Chat System with Image Support
- **AI-powered chat interface** with Claude Sonnet 4
- **Image attachment support** - Upload and analyze images in conversations
- **File upload capabilities** - Support for images, text files, audio, and video
- **Context-aware responses** - AI understands current page context and data
- **Note editing capabilities** - Direct note creation and editing through chat
- **Web search integration** - AI can search the web for additional information

### Supported Image Formats
- JPEG/JPG
- PNG
- GIF
- WebP

### File Upload Features
- Drag and drop or click to upload
- Multiple file selection
- File type validation
- File size display
- Image preview indicators
- Easy file removal

### Chat Capabilities
- **Context-aware responses** based on current page data
- **Note management** - Create, view, edit, and modify notes
- **Web search** - AI can search the web for information
- **Tool execution** - AI can perform actions on your data
- **Conversation history** - Persistent chat sessions
- **Real-time updates** - Instant message delivery

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure your environment variables:
   - `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude access
   - Supabase configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

### Chat with Images
1. Open the chat interface
2. Type your message
3. Click the paperclip icon to attach files
4. Select image files (JPEG, PNG, GIF, WebP)
5. Send your message - the AI will analyze both text and images

### Note Management
- Ask the AI to create new notes
- Request note modifications
- View existing notes
- Edit note content directly through chat

### Context Awareness
The AI understands your current page context:
- Current data filters
- Visible data samples
- Page navigation state
- Recent conversation history

## API Endpoints

### `/api/chat`
Handles chat messages with support for:
- Text messages
- Image attachments
- File uploads
- Context-aware responses
- Tool execution

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Supabase** - Database and authentication
- **Anthropic Claude** - AI chat capabilities
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

Required environment variables:

```env
# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
