<div align="center">

# 💬 ChatDB

### Store, Search, and Chat with Your AI Conversations

A modern, full-stack Next.js application for managing ChatGPT conversations, chatting with local LLMs (Ollama & LM Studio), and searching through your chat history with MongoDB Atlas.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 📤 **ChatGPT Data Upload**

- Upload exported ChatGPT conversations.json files directly to MongoDB
- Automatic data cleaning and deduplication
- Track insertion and modification stats
- Drag-and-drop interface

### 💬 **Local LLM Chat**

- **Ollama Integration** - Chat with local Ollama models
- **LM Studio Integration** - Connect to LM Studio server
- Real-time streaming responses
- Performance metrics (tokens/sec, response time)
- Save conversations to database
- Model selection and management

### 🔍 **Powerful Search**

- Full-text search across all conversations
- Search by message content
- Filter by source (ChatGPT, Ollama, LM Studio)
- View matched messages with context
- Click to view full conversations

### 📚 **Conversation Manager**

- Browse all stored conversations
- Filter and search by title or ID
- View detailed conversation metadata
- Modal view with formatted messages
- Markdown rendering with syntax highlighting
- Dark mode support

### 🎨 **Modern UI/UX**

- Clean, responsive design
- Dark mode toggle
- Smooth animations and transitions
- Mobile-friendly interface
- Next.js 16 optimized

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm/pnpm/yarn
- MongoDB Atlas account (or local MongoDB)
- Ollama installed (optional, for local LLM chat)
- LM Studio installed (optional, for local LLM chat)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/chatdb.git
   cd chatdb
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB=chatdb

   # Ollama Configuration (optional)
   OLLAMA_URL=http://localhost:11434

   # LM Studio Configuration (optional)
   LMSTUDIO_URL=http://localhost:1234
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## � Docker Setup

For local testing and containerized deployment, this project includes Docker support with `Dockerfile` and `compose.yaml`.

### Docker Prerequisites

- Docker and Docker Compose installed on your system
- Environment variables configured (see below)

### Environment Configuration

> **⚠️ SECURITY WARNING**  
> **DO NOT COPY .env FILES DIRECTLY TO DOCKER CONTAINERS!**
>
> The current Dockerfile copies the .env file to the container, which is a security risk. Instead, use Docker environment variables or Docker secrets for production deployments. This setup is only for local testing purposes.

### Running with Docker

1. **Build and run the container**

   ```bash
   docker compose up --build
   ```

2. **Run in detached mode**

   ```bash
   docker compose up -d --build
   ```

3. **Stop the container**

   ```bash
   docker compose down
   ```

### Docker Configuration

The setup includes:

- **Multi-stage build** for optimized image size
- **Node.js 22** with **pnpm** package manager
- **Production environment** configuration
- **Port 8100** exposed for the Next.js application

### Environment Variables for Docker

Make sure your `.env` file contains the required variables before building:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=chatdb
OLLAMA_URL=http://host.docker.internal:11434
LMSTUDIO_URL=http://host.docker.internal:1234
```

**Note:** Use `host.docker.internal` instead of `localhost` when running in Docker to access services on your host machine.

### Docker Files

- `Dockerfile` - Multi-stage build configuration
- `compose.yaml` - Docker Compose service definition

---

## �📖 API Documentation

### 🔹 Conversations API

#### **GET** `/api/conversations`

Retrieve all conversations from the database.

**Response:**

```json
{
  "success": true,
  "conversations": [
    {
      "_id": "...",
      "conversation_id": "abc123",
      "title": "Conversation Title",
      "source": "chatgpt",
      "messages": [...],
      "message_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **GET** `/api/conversations/[id]`

Get a specific conversation by ID.

**Response:**

```json
{
  "success": true,
  "conversation": {
    "conversation_id": "abc123",
    "title": "Conversation Title",
    "messages": [
      {
        "role": "user",
        "content": "Hello!",
        "timestamp": 1234567890
      },
      {
        "role": "assistant",
        "content": "Hi there!",
        "timestamp": 1234567891
      }
    ]
  }
}
```

---

### 🔹 Upload API

#### **POST** `/api/upload`

Upload ChatGPT conversations to MongoDB.

**Request Body:**

```json
{
  "conversations": [...],
  "cleanData": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Saved 5 conversations (cleaned data)",
  "inserted": 5,
  "modified": 0,
  "cleanData": true
}
```

---

### 🔹 Search API

#### **POST** `/api/search`

Search through conversation messages.

**Request Body:**

```json
{
  "query": "search term",
  "collection": "all" // or "chatgpt", "ollama", "lmstudio"
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "conversation_id": "abc123",
      "title": "Conversation Title",
      "source": "chatgpt",
      "matchedMessage": "Message containing search term...",
      "messageIndex": 5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 🔹 Ollama Chat API

#### **POST** `/api/chat`

Send messages to Ollama models.

**Request Body:**

```json
{
  "messages": [{ "role": "user", "content": "Hello!" }],
  "model": "llama2"
}
```

**Response:**

```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Hi there!"
  },
  "model": "llama2",
  "responseTime": 1.23,
  "tokensPerSecond": 45.67,
  "metrics": {
    "eval_count": 50,
    "eval_duration": 1000000000
  }
}
```

#### **GET** `/api/chat/models`

List available Ollama models.

**Response:**

```json
{
  "success": true,
  "models": [
    {
      "name": "llama2",
      "modified_at": "2024-01-01T00:00:00Z",
      "size": 3825819519
    }
  ]
}
```

#### **POST** `/api/chat/save`

Save an Ollama conversation to the database.

**Request Body:**

```json
{
  "title": "My Chat",
  "messages": [...],
  "model": "llama2"
}
```

---

### 🔹 LM Studio Chat API

#### **POST** `/api/lmstudio/chat`

Send messages to LM Studio models.

**Request Body:**

```json
{
  "messages": [{ "role": "user", "content": "Hello!" }],
  "model": "local-model"
}
```

#### **GET** `/api/lmstudio/models`

List available LM Studio models.

#### **POST** `/api/lmstudio/save`

Save an LM Studio conversation to the database.

---

## 🗂️ Project Structure

```
chatdb/
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/              # Ollama endpoints
│   │   ├── conversations/     # Conversation management
│   │   ├── lmstudio/          # LM Studio endpoints
│   │   ├── search/            # Search functionality
│   │   └── upload/            # Upload handler
│   ├── chat/                  # Ollama chat UI
│   ├── lmstudio/              # LM Studio chat UI
│   ├── conversations/         # Conversation browser
│   │   └── [id]/             # Individual conversation view
│   ├── search/                # Search interface
│   ├── components/            # Reusable components
│   │   ├── Header.tsx
│   │   └── MarkdownMessage.tsx
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Upload page
│   └── globals.css            # Global styles
├── lib/
│   ├── mongodb.ts             # MongoDB connection
│   └── chatgpt.ts             # ChatGPT data processing
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** MongoDB Atlas
- **Markdown:** react-markdown with syntax highlighting
- **LLM Integration:** Ollama, LM Studio
- **State Management:** React Hooks

---

## 📝 Usage Guide

### 1️⃣ **Upload ChatGPT Data**

1. Export your ChatGPT data from Settings → Data Controls → Export
2. Wait for the email with your data export
3. Extract the `conversations.json` file
4. Drag and drop or click to upload on the homepage
5. View upload stats (inserted/modified counts)

### 2️⃣ **Chat with Local LLMs**

**Ollama:**

1. Install and run Ollama locally
2. Pull a model: `ollama pull llama2`
3. Navigate to `/chat` in the app
4. Select your model and start chatting
5. Save conversations to database

**LM Studio:**

1. Install and run LM Studio
2. Load a model and start the server
3. Navigate to `/lmstudio` in the app
4. Start chatting and save conversations

### 3️⃣ **Search Conversations**

1. Go to `/search`
2. Enter your search query
3. Filter by source (All, ChatGPT, Ollama, LM Studio)
4. Click results to view full conversations

### 4️⃣ **Browse Conversations**

1. Navigate to `/conversations`
2. Search by title or ID
3. Click any conversation to view details
4. View formatted messages with markdown support

---

## 🌙 Dark Mode

The application automatically detects and respects your system's dark mode preference. Toggle between light and dark modes seamlessly.

---

## 🔒 Environment Variables

| Variable       | Description               | Required | Default                  |
| -------------- | ------------------------- | -------- | ------------------------ |
| `MONGODB_URI`  | MongoDB connection string | ✅ Yes   | -                        |
| `MONGODB_DB`   | Database name             | ✅ Yes   | -                        |
| `OLLAMA_URL`   | Ollama API endpoint       | ❌ No    | `http://localhost:11434` |
| `LMSTUDIO_URL` | LM Studio API endpoint    | ❌ No    | `http://localhost:1234`  |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by modern design principles
- Thanks to the open-source community

---

<div align="center">

Made with ❤️ by [dedkola](https://github.com/dedkola)

⭐ Star this repo if you find it helpful!

</div>
