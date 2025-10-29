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
- Create a `.env` file in the `backend/` directory with required environment variables (see `.env.example` for template)
  - **Required**: `LLM_API_KEY`, `JWT_ACCESS_SECRET`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - See `.env.example` for all required variables
- Run `docker compose up -d` (this will fail if `.env` is missing)
- Verify that the database is running with the tables and sample data from `init_db.sql`

**Important**: No secrets are hardcoded. You must provide all environment variables via `.env` file. The `.env` file should never be committed to the repository.



### Test & Usage

How to test & use the API:

- Swagger docs for HTTP routes under `server-url/docs`. Some routes are authenticated so use the `auth/generate-token` route to get an API token, click `authorize` at the top of Swagger and paste the token in.
- A Simple custom client for socket.io under `server-url/client`. before using this go to the Swagger docs, generate an auth token then paste the response in the client.

*NOTE: you need to generate the JWT via the docs in swagger with the endpoint`/auth/generate-token`*

## Docker Image Export

This application can be exported as a Docker image for use in external projects with Cypress testing or other containerized environments.

### Quick Start

#### 1. Export Docker Image

Build and export the production Docker image:

```bash
cd backend
chmod +x export-image.sh
./export-image.sh
```

This will create a file `afori-test-api-image.tar` containing the Docker image.

#### 2. Import Docker Image in External Project

Copy the tar file to your target system, then:

```bash
chmod +x import-image.sh
./import-image.sh
```

Or manually load the image:

```bash
docker load -i afori-test-api-image.tar
```

#### 3. Run with Docker Compose

In your external project directory:

```bash
# Copy necessary files to your project
cp docker-compose.external.yml /path/to/your/project/
cp init_db.sql /path/to/your/project/

# Start the services (all variables are pre-configured)
docker-compose -f docker-compose.external.yml up
```

**Note**: 
- The `init_db.sql` file is required for database initialization. It should be in the same directory as `docker-compose.external.yml`.
- All environment variables are already configured in the file (LLM API key is hardcoded for testing purposes).
- The API will be available at `http://localhost:3000`

### Configuration

The `docker-compose.external.yml` file includes:
- **App service**: Pre-built Docker image running in production mode
- **Database service**: PostgreSQL with initialization scripts
- **Network**: Bridge network for service communication

All environment variables are pre-configured with test values. No additional setup needed!

### Using Environment Variables for CI/CD

For production or CI/CD environments, you can override environment variables using a `.env` file or environment variables:

**Option 1: Using a .env file**

Create a `.env` file in the same directory as `docker-compose.external.yml`:

```env
LLM_API_KEY=your_real_api_key_here
LLM_BASE_URL=https://api.studio.nebius.com/v1/
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct
```

**Option 2: Override via environment variables**

```bash
export LLM_API_KEY=your_real_api_key_here
docker-compose -f docker-compose.external.yml up
```

**Option 3: CI/CD with secrets (GitHub Actions example)**

For CI/CD, use the `docker-compose.external.template.yml` file which uses environment variables:

```yaml
# In your .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Load Docker image
        run: docker load -i afori-test-api-image.tar
      
      - name: Start services
        env:
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
          LLM_BASE_URL: ${{ secrets.LLM_BASE_URL }}
          LLM_MODEL: ${{ secrets.LLM_MODEL }}
        run: |
          cd /path/to/your/tests
          docker-compose -f docker-compose.external.template.yml up -d
      
      - name: Run Cypress tests
        run: npm run test:cypress
```

**Note**: The `docker-compose.external.yml` file has hardcoded values for simplicity. Use `docker-compose.external.template.yml` for CI/CD where you need to pass secrets.

### Using with Cypress Tests

Once the Docker image is running in your external project:

1. Configure your Cypress tests to point to `http://localhost:3000`
2. Generate an auth token from `/auth/generate-token` endpoint
3. Use the token in your API tests

Example Cypress configuration:

```javascript
// In your Cypress tests
const API_BASE_URL = 'http://localhost:3000';

it('should test the API', () => {
  cy.request({
    method: 'POST',
    url: `${API_BASE_URL}/auth/generate-token`,
    body: {}
  }).then((response) => {
    const token = response.body.accessToken;
    // Use token for authenticated requests
  });
});
```

### Production Dockerfile

The `Dockerfile.prod` uses a multi-stage build to:
- Build TypeScript code in the builder stage
- Copy only production dependencies and built files to final image
- Run as non-root user for security
- Optimize image size

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
