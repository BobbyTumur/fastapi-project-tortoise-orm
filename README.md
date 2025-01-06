# FastAPI Backend with Tortoise ORM and Async Functionality

## Features

### Backend Logic

- **User Management**:
  - No signup functionality; admins add users.
  - Users receive an invite to set up their password.
  - Users cannot delete themselves or change their email; these actions are restricted to admins.
- **Authentication**:
  - JWT-based authentication with access and refresh tokens.
  - Refresh tokens are stored as `HttpOnly` cookies for added security.

### API and Database Handling

- Fully asynchronous API and database interactions:
  - **Async API Handling**: Built with FastAPI for high performance.
  - **Async Database I/O**: Powered by Tortoise ORM with asynchronous database operations.
- **Testing**:
  - API routes are tested using `httpx.AsyncClient` for comprehensive and efficient async testing.
- **WebSocket Endpoint**:
  - Designed to interact with OpenAI services, enabling real-time communication.

---

## Traefik Configuration

### Features

- **DNS Challenge**:
  - SSL certificates are automatically managed via DNS challenge using AWS Route 53 access keys.
- **Redirection**:
  - Regex-based logic to redirect traffic from the naked domain (`example.com`) to the `www` subdomain (`www.example.com`).

---

## Tools and Technologies

- **Backend**: FastAPI, Tortoise ORM
- **Testing**: `httpx.AsyncClient`
- **Authentication**: JWT with `HttpOnly` cookies
- **WebSockets**: Real-time endpoint for OpenAI integration
- **Traefik**: Reverse proxy with automatic SSL management and domain redirection
- **AWS Route 53**: DNS hosting for domain management

---

## Example Use Cases

- Admin invites users to set up their accounts securely.
- Users access APIs and WebSocket services with robust authentication mechanisms.
- Traefik handles domain-level redirections and SSL with minimal configuration effort.

This architecture ensures high performance, scalability, and security for modern web applications.
