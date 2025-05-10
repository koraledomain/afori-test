# Afori Test API

## Table of Contents

- [Project Description](#project-description)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Test & Usage](#test--usage)
- [Project Structure](#project-structure)
- [Real-time Streaming with Socket.io](#real-time-streaming-with-socketio)
  - [Features](#features)
  - [Connection](#connection)
  - [Authentication](#authentication)
  - [Events](#events)
    - [Client to Server](#client-to-server)
    - [Server to Client](#server-to-client)
  - [Example Client](#example-client)
  - [Implementation Details](#implementation-details)
- [AI Agent Process](#ai-agent-process)
  - [Architecture Overview](#architecture-overview)
  - [Implementation Details](#implementation-details-1)
  - [Real-time Streaming](#real-time-streaming)
  - [Shared State Architecture](#shared-state-architecture)

## Project Description

a Node.js backend using Nest.js that manages customer data and leverages a Large Language Model (LLM) to answer questions about that data. The application uses a PostgreSQL database (set up via Docker Compose) to store information about **Customers** and their related entities (such as orders and addresses). There's a RESTful API for performing CRUD operations on customer data. It is auth protected. AI agent (using **LangChain**) that can respond to natural language queries about the customers in the database. Additionally, the server should support real-time streaming of the AI agent's responses using **socket.io**, so that results can be sent to clients token-by-token as the LLM generates an answer.
A client is also created for ease of use and testing under `server-url/client`

## Setup Instructions

### Prerequisites

Ensure you have the following installed on your development machine:

- **Node.js** (v22 or above) and npm.
- **Docker and Docker Compose** for running the PostgreSQL database.
- An **LLM API key** we will provide you a testing API key.

### Setup

To setup the project follow these steps:

- Clone the repository
- Include `LLM_API_KEY` in the `docker-compose.yml`
- run `docker compose up -d`
- verify that the database is running with the tables and sample data from `init_db.sql`



### Test & Usage

How to test & use the API:

- Swagger docs for HTTP routes under `server-url/docs`. Some routes are authenticated so use the `auth/generate-token` route to get an API token, click `authorize` at the top of Swagger and paste the token in.
- A Simple custom client for socket.io under `server-url/client`. before using this go to the Swagger docs, generate an auth token then paste the response in the client.

*NOTE: you need to generate the JWT via the docs in swagger with the endpoint`/auth/generate-token`*

## Project Structure

The application follows a modular architecture based on NestJS best practices, with clear separation of concerns:

#### Core Modules

- **AppModule**: The main application module that integrates all other modules.
- **CommonModule**: Provides shared functionality across the application:
  - **DatabaseModule**: Configures TypeORM connection to PostgreSQL using environment variables.
  - **ConfigModule**: Manages application configuration and environment variables.

#### Feature Modules

- **CustomerModule**: Handles CRUD operations for customer data and related entities.
- **AuthModule**: Manages authentication and authorization:

  - **AuthService**: Generates JWT tokens for API access.
  - **ApiKeyHttpGuard**: Protects REST endpoints, verifying JWT in x-api-key header.
  - **ApiKeyWsGuard**: Secures WebSocket connections with the same JWT verification.
  - **PublicDecorator**: Allows marking specific endpoints as public (no auth required).

- **AgentModule**: Implements the AI agent for natural language processing:

  - **AgentService**: Orchestrates the step-by-step processing pipeline.
  - **Step Implementations**: Specialized steps (AnalyzeQuestionStep, GenerateSqlStep, RunQueryStep, FormatAnswerStep) for processing questions.

- **LlmModule**: Abstracts large language model services:

  - **OpenAIChatProvider**: Implementation for OpenAI's chat API with streaming support.
  - **Provider Tokens**: Dependency injection pattern for swappable LLM providers.

- **StreamingModule**: Provides abstractions for handling real-time streaming data:

  - **StreamHandler Interface**: Defines standard methods for handling streaming data across different transport mechanisms.

- **SocketModule**: Implements real-time communication:
  - **SocketGateway**: Handles WebSocket events and client connections.
  - **SocketService**: Manages streaming of agent responses to connected clients.
  - **SocketAdapter**: Custom adapter for authentication integration.

## Real-time Streaming with Socket.io

This API supports real-time streaming of LLM responses using Socket.io. Instead of waiting for a complete response, clients can receive partial responses as they are generated, providing a more interactive experience.

### Features

- Authenticated socket connections using JWT tokens
- Real-time streaming of LLM responses as they are generated
- Step-by-step progress updates as the agent processes the query
- Support for multiple concurrent client connections

### Connection

Connect to the Socket.io server using:

```javascript
const socket = io('ws://localhost:3000', {
  extraHeaders: {
    'x-api-key': 'your-jwt-token',
  },
});
```

### Authentication

Socket connections are authenticated using the same JWT tokens used for REST API authentication. This ensures consistent security across all parts of the application.

Authenticate using one of these methods:

1. Query parameter: `?apiKey=your-jwt-token`
2. X-API-Key header: Set the 'x-api-key' header with your JWT token

To obtain a JWT token, use the authentication endpoints in the REST API.

### Events

#### Client to Server

- `question`: Send a question to the agent
  ```javascript
  socket.emit('question', { question: 'How many customers are in Germany?' });
  ```

#### Server to Client

- `agentProcessing`: Indicates the agent has started processing
- `agentStepStart`: Emitted when a step in the agent's process begins
- `agentStepChunk`: Contains chunks of data as they're generated for each step
- `agentStepComplete`: Emitted when a step in the agent's process completes
  - Steps: 'analysis', 'sqlQuery', 'queryResult'
- `agentComplete`: The entire process is complete
- `error`: Emitted when an error occurs

### Example Client

A complete example client implementation is available in `sever-url/client`. To test:

1. Start the server
2. Obtain a JWT token from the authentication endpoint
3. Open `server-url/client` in a browser
4. Enter your JWT token and connect
5. Ask a question and see the real-time response

### Implementation Details

The streaming implementation uses LangChain's streaming capabilities with custom callbacks to emit events as tokens are generated. Each step of the agent's process (analysis, SQL generation, database query, and answer formatting) emits events to keep the client informed of progress.

Authentication is handled using the same JWT mechanism as the REST API, ensuring consistent security across the application.

## AI Agent Process

The AI agent processes natural language questions about customer data through a structured, multi-step pipeline that leverages LangChain and OpenAI based API. The process follows these key steps:

### Architecture Overview

The agent employs a modular architecture with distinct processing steps:

1. **Question Analysis**: Analyzes the user's query to determine relevant database tables and fields
2. **SQL Generation**: Creates a valid SQL query based on the analysis
3. **Query Execution**: Runs the generated SQL against the PostgreSQL database
4. **Answer Formatting**: Transforms raw query results into natural language responses

### Implementation Details

#### Core Components

- **AgentService**: Orchestrates the entire process flow, maintaining the agent state between steps
- **OpenAIChatProvider**: Provides the LLM interface with streaming capabilities
- **Step Implementations**: Individual specialized steps handling different parts of the process

#### Step-by-Step Process

1. **Question Analysis (`AnalyzeQuestionStep`)**

   - Takes the user's natural language question and database schema
   - Prompts the LLM to identify which tables and fields are needed to answer
   - Produces a detailed analysis of the data requirements

2. **SQL Generation (`GenerateSqlStep`)**

   - Uses the question, database schema, and previous analysis
   - Instructs the LLM to produce valid PostgreSQL syntax with proper table/column names
   - Cleans the resulting SQL query of any markdown formatting

3. **Query Execution (`RunQueryStep`)**

   - Executes the generated SQL query against the database
   - Handles query errors and formats the results

4. **Answer Formatting (`FormatAnswerStep`)**
   - Takes the original question, SQL query, and query results
   - Prompts the LLM to generate a clear, concise answer
   - Returns the natural language response

### Real-time Streaming

Each step supports real-time streaming using Socket.io:

- The LLM provider streams tokens as they're generated
- Each step reports its progress through events
- Clients receive incremental updates as the answer develops

This architecture allows the application to provide immediate feedback to users while maintaining a structured approach to question answering.

### Shared State Architecture

The agent utilizes a shared state pattern to maintain context throughout the processing pipeline:

- The `AgentState` interface provides a centralized data structure passed between steps
- Each step receives the current state, processes it, and adds its output to the same state object
- The state contains the following key elements:
  - `sqlDb`: The LangChain SQL database connection
  - `dbSchema`: Cached database schema information
  - `question`: The original user question
  - `analysis`: Output from the question analysis step
  - `sqlQuery`: Generated SQL query
  - `queryResult`: Raw query execution results
  - `answer`: Final formatted answer

This state-sharing approach enables:

- Progressive enrichment of context as the question moves through the pipeline
- Each step to build upon previous steps' outputs
- Simplified data flow management without complex dependency injection
- Complete visibility of the full processing chain for debugging and streaming
