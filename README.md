# SDET Technical Challenge: Afori Test API

## Overview

This technical challenge focuses on testing a Node.js backend application built with Nest.js that manages customer data and integrates with an AI agent. The application includes a RESTful API, WebSocket communication, and a client frontend. Your task is to create a comprehensive test suite that ensures the quality and reliability of all components.

## System Architecture

The system consists of three main components:

1. **REST API (Nest.js Backend)**
   - Customer data management (CRUD operations)
   - Authentication system (JWT-based)
   - AI agent integration for natural language queries
   - PostgreSQL database integration

2. **WebSocket Server (Socket.io)**
   - Real-time streaming of AI responses
   - Authentication via JWT
   - Event-based communication

3. **Client Frontend**
   - Web interface for interacting with the API
   - Real-time updates via WebSocket
   - Authentication handling

*Carfully Read the file [README BACKEND](/backend/README.md) to understand how to set-up the envirormen*

## Challenge Requirements

### 1. Test Plan

Create a comprehensive test plan that includes:

- Test strategy and approach
- Test environment setup
- Test data management
- Test cases organization
- Risk assessment
- Test execution schedule
- Reporting strategy

### 2. Automated Test Suite

Develop automated tests covering:

#### Unit Testing
- Implemet unit testing using jest
- Include unit testing only for the folder `agent` and `agent/steps`

#### API Testing
- Authentication flows
- CRUD operations for customer data
- Error handling and edge cases
- API response validation
- Performance testing (response times, load testing)

#### WebSocket Testing
- Connection establishment
- Authentication
- Real-time message streaming
- Event handling
- Connection error scenarios
- Message format validation

#### Integration Testing
- End-to-end workflows using the client
- Component interaction
- Data flow validation
- Error propagation

### 3. Test Framework Requirements

Your test framework should:

- Use modern testing tools and frameworks
- Implement Page Object Model (POM) or similar design patterns
- Include proper logging and reporting
- Support parallel test execution
- Handle test data management
- Include CI/CD integration examples

### 4. Quality Metrics

Define and implement:

- Test coverage metrics
- Performance benchmarks
- Reliability metrics
- Code quality standards
- Documentation requirements

## Deliverables

1. **GitHub Repository** containing:
   - Complete test suite code
   - Test documentation
   - Setup instructions
   - Test execution guide
   - CI/CD configuration

2. **Test Documentation**:
   - Test plan
   - Test cases
   - Test results
   - Bug reports (if any)
   - Performance test results

3. **Code Quality**:
   - Clean, maintainable code
   - Proper error handling
   - Comprehensive logging
   - Clear documentation
   - Follow best practices

## Technical Requirements

### Required Technologies
- TypeScript/JavaScript
- Testing frameworks (e.g., Jest, Cypress, Playwright)
- API testing tools (e.g., Supertest, Postman)
- WebSocket testing libraries
- CI/CD tools (e.g., GitHub Actions, Jenkins)
- Docker for environment setup

### Optional Technologies
- Performance testing tools (e.g., k6, JMeter)
- Visual testing tools
- Security testing tools
- Accessibility testing tools

## Evaluation Criteria

Your submission will be evaluated based on:

1. **Test Coverage**
   - Completeness of test scenarios
   - Edge case coverage
   - Error scenario coverage

2. **Code Quality**
   - Clean code principles
   - Design patterns usage
   - Maintainability
   - Documentation

3. **Technical Implementation**
   - Framework selection
   - Architecture design
   - Best practices adherence
   - Performance considerations

4. **Documentation**
   - Clarity and completeness
   - Setup instructions
   - Usage examples
   - Maintenance guidelines

## Submission Guidelines

1. Create a public GitHub repository
2. Include all required deliverables
3. Provide clear setup and execution instructions
4. Document any assumptions or limitations
5. Include a README with:
   - Project overview
   - Setup instructions
   - Test execution guide
   - Results interpretation
   - Future improvements

## Timeline

- Repository setup and initial planning: 1 day
- Test framework implementation: 2-3 days
- Test case development: 2-3 days
- Documentation and reporting: 1 day
- Review and improvements: 1 day

Total estimated time: 7-9 days

## Getting Started

1. Fork the original repository
2. Set up your development environment
3. Review the system architecture and requirements
4. Create your test plan
5. Implement your test suite
6. Document your work
7. Submit your solution

## Notes

- Focus on quality over quantity
- Document any assumptions or limitations
- Consider edge cases and error scenarios
- Implement proper logging and reporting
- Follow testing best practices
- Consider performance and scalability

Good luck with the challenge! We look forward to reviewing your solution. 