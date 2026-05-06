# Context
We'll build a simple operations calculator full-stack project as part of an assessment for a Senior Full-Stack role.

## The problem

Look at assessment.txt to have access to the problem statement from the recruiter team.

# Technical guidelines and standards

## Backend
- Use Go with Gin.
- Follow the 3-tier code architecture. Controller-Service-Repository with communication between layers respecting hexagonal architecture. Repository can be ignored here since we don't have a database.
- Dockerize and have a makefile to manage linting, formatting, test suite and build.
- Unit test cases for each layer properly mocking the interaction with deeper layers  + coverage report.
- Integration tests for testing endpoints without mocking inter-layer communication.
- OpenAPI specs for documenting endpoints automatically. Expose in Swagger endpoint.
- Proper README, concise and direct explaining code architecture, layer resposibilities, how to run, setup, etc.

## Front-end
- Use React with Typescript.
- Vite as package manager.
- Separate logic/state management from the UI behavior.
- Create components in an extensive but enxute way.
- Unit tests for logic/state management pieces + coverage report.
- Axios to make API calls.
- Context API to manage states should be enough for this project.
- ShadUI+Tailwind for UI components, a global scss to manage colors.
- Pretty + ESlint to enforce linting, formatting etc.
- Commands to run server, tests, linting etc.
- Dockerfile to build and up the application.
- Proper README, concise and direct explaining code architecture, layer resposibilities, how to run, setup, etc.

## In the repo
- Docker compose file to up both front-end and back-end
- README with assumptions, API examples, layout and design rationale