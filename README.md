# n8n-nodes-fullstory

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for FullStory, the digital experience intelligence platform. This node enables workflow automation with 10 resources and 60+ operations for user management, event tracking, session replay, error analysis, page analytics, and more.

![n8n Version](https://img.shields.io/badge/n8n-%3E%3D1.0.0-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **User Management**: Create, update, get, list, search, merge, and delete users with custom properties
- **Event Tracking**: Track custom events with full context support; manage event definitions
- **Session Replay**: Access session details, generate replay URLs, search sessions, manage notes
- **Segment Management**: Full CRUD for segments with user/session membership and exports
- **Webhook Management**: Complete webhook lifecycle including deliveries and retries
- **Data Export**: Create exports, monitor status, download results, manage operations
- **Notes**: Create, search, and manage notes on sessions and users
- **Error Analytics**: View, search, and group captured JavaScript/network errors
- **Page Analytics**: Access page metrics, heatmaps, and session data
- **Integrations**: Manage third-party integration configurations
- **Trigger Support**: Receive real-time webhook events from FullStory

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-fullstory` in the package name field
5. Accept the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-fullstory
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-fullstory.git
cd n8n-nodes-fullstory

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-fullstory

# Restart n8n
```

## Credentials Setup

### FullStory API

| Field | Description |
|-------|-------------|
| **API Key** | Your FullStory API key. Create one in Settings > Integrations > API Keys |
| **Data Center** | Select your data center region (US or EU) |

### Permission Levels

- **Standard**: Basic read/write operations
- **Admin**: Extended permissions including user deletion
- **Architect**: Full access including webhook management

## Resources & Operations

### User (V2 API)

| Operation | Description |
|-----------|-------------|
| **Create** | Create or update a user with custom properties |
| **Get** | Retrieve user details by FullStory ID |
| **Get by UID** | Retrieve user by your system's user ID |
| **Update** | Update user display name, email, or properties |
| **Batch Create** | Create or update multiple users in a single request |
| **Delete** | Delete a user and all associated data |
| **List** | List all users with pagination |
| **Search** | Search users by properties |
| **Get Sessions** | Get all sessions for a user |
| **Merge** | Merge two user profiles |

### Event (V2 API)

| Operation | Description |
|-----------|-------------|
| **Track** | Track a custom event with optional context |
| **Batch Track** | Track multiple events in a single request |
| **List Definitions** | List all custom event definitions |
| **Get Definition** | Get event definition details |
| **Create Definition** | Create custom event schema |
| **Update Definition** | Update event schema |
| **Delete Definition** | Delete event definition |

### Session

| Operation | Description |
|-----------|-------------|
| **Get** | Get details for a specific session |
| **List** | List sessions with filters |
| **Search** | Search sessions by criteria |
| **Get Replay URL** | Generate a session replay URL |
| **Get Events** | Get events within a session |
| **Get Notes** | Get notes on a session |
| **Add Note** | Add a note to a session |
| **Delete Note** | Remove a note from a session |

### Segment

| Operation | Description |
|-----------|-------------|
| **List** | List all segments in your account |
| **Get** | Get details for a specific segment |
| **Create** | Create a new segment |
| **Update** | Update segment definition |
| **Delete** | Delete a segment |
| **Get Users** | Get users in segment |
| **Get Sessions** | Get sessions matching segment |
| **Create Export** | Create an export job for segment data |

### Webhook

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new webhook endpoint |
| **List** | List all webhook endpoints |
| **Get** | Get details for a specific endpoint |
| **Update** | Update an existing endpoint |
| **Delete** | Delete a webhook endpoint |
| **Enable** | Enable a disabled endpoint |
| **Disable** | Disable an endpoint |
| **Test** | Send test webhook payload |
| **List Deliveries** | Get webhook delivery history |
| **Retry Delivery** | Retry a failed delivery |

### Data Export

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new data export job |
| **Create Segment Export** | Create segment-specific export |
| **Get Status** | Check the status of an export job |
| **List Operations** | List all export operations |
| **Download** | Wait for completion and get download URLs |
| **Cancel** | Cancel a pending export |
| **Get Schema** | Get export data schema |

### Note

| Operation | Description |
|-----------|-------------|
| **List** | List all notes |
| **Get** | Get note details |
| **Create** | Create a note on session/user |
| **Update** | Update note content |
| **Delete** | Delete a note |
| **Search** | Search notes by content |

### Error

| Operation | Description |
|-----------|-------------|
| **List** | List captured errors |
| **Get** | Get error details |
| **Get Sessions** | Get sessions with specific error |
| **Group** | Get error groupings |
| **Search** | Search errors by message/stack |

### Page

| Operation | Description |
|-----------|-------------|
| **List** | List tracked pages |
| **Get** | Get page analytics |
| **Get Sessions** | Get sessions for page |
| **Get Heatmap** | Get page heatmap data |
| **Search** | Search pages by URL pattern |

### Integration

| Operation | Description |
|-----------|-------------|
| **List** | List configured integrations |
| **Get** | Get integration details |
| **Create** | Set up new integration |
| **Update** | Update integration config |
| **Delete** | Remove integration |
| **Test** | Test integration connection |

## Trigger Node

The FullStory Trigger node automatically manages webhook endpoints and receives events in real-time.

### Supported Events

- `note.created` - Triggered when a note is created
- `note.updated` - Note was modified
- `note.deleted` - Note was removed
- `recording.event.custom` - Custom event occurred
- `recording.completed` - Session recording completed
- `segment.entered` - User entered a segment
- `segment.exited` - User exited a segment
- `user.created` - New user identified
- `user.updated` - User properties changed
- `error.captured` - JavaScript error captured

## Usage Examples

### Track a Custom Event

```json
{
  "resource": "event",
  "operation": "track",
  "userId": "user_123",
  "eventName": "Purchase Completed",
  "properties": {
    "amount": 99.99,
    "currency": "USD",
    "product_id": "prod_456"
  }
}
```

### Create a User with Properties

```json
{
  "resource": "user",
  "operation": "create",
  "uid": "user_123",
  "displayName": "John Doe",
  "email": "john@example.com",
  "properties": {
    "plan": "enterprise",
    "company": "Acme Inc"
  }
}
```

### Generate Session Replay URL

```json
{
  "resource": "session",
  "operation": "getUrl",
  "sessionId": "5678901234:1234567890",
  "timestamp": 5000
}
```

### Create Data Export

```json
{
  "resource": "dataExport",
  "operation": "create",
  "exportType": "TYPE_EVENT",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "format": "FORMAT_CSV"
}
```

## Data Centers

| Region | Data Center | API Endpoint |
|--------|-------------|--------------|
| United States | NA1 | api.fullstory.com |
| Europe | EU1 | api.fullstory.com |

Note: The data center is encoded in your API key prefix.

## Error Handling

The node handles common FullStory API errors:

| Code | Description |
|------|-------------|
| 400 | Invalid input - check your parameters |
| 401 | Unauthorized - verify your API key |
| 403 | Forbidden - insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited - implement backoff |
| 500 | Server error - retry later |

## Rate Limits

- Default: 100 requests/minute
- Segment Export: 2 requests/minute
- The node implements exponential backoff for 429 responses

## Security Best Practices

1. **Use HTTPS** for all webhook URLs
2. **Rotate API keys** periodically
3. **Use minimum required permissions** for API keys
4. **Validate webhook payloads** in your workflows
5. **Encrypt sensitive user properties** before storing

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [FullStory Developer Docs](https://developer.fullstory.com/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-fullstory/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [FullStory](https://www.fullstory.com/) for their digital experience platform
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for their contributions and feedback
