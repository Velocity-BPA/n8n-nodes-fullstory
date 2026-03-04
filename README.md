# n8n-nodes-fullstory

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node enables seamless integration with FullStory's digital experience analytics platform. With 5 resource implementations (Users, Events, Sessions, Segments, and additional endpoints), you can analyze user behavior, track events, manage user sessions, and extract valuable insights from your digital experiences directly within your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![FullStory API](https://img.shields.io/badge/FullStory-API%20Integration-orange)
![Digital Analytics](https://img.shields.io/badge/Analytics-Digital%20Experience-green)
![User Behavior](https://img.shields.io/badge/Tracking-User%20Behavior-purple)

## Features

- **User Management** - Retrieve and manage user data, profiles, and behavioral analytics
- **Event Tracking** - Access custom events, page views, and user interactions across your applications
- **Session Analytics** - Extract detailed session recordings, metadata, and user journey information
- **Segment Management** - Create, update, and manage user segments for targeted analysis
- **Comprehensive Search** - Query users, sessions, and events with advanced filtering capabilities
- **Real-time Data Access** - Retrieve live user behavior data and analytics insights
- **Automated Reporting** - Generate custom reports and export analytics data for further processing
- **Workflow Integration** - Seamlessly connect FullStory insights with other tools in your n8n automation workflows

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-fullstory`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-fullstory
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-fullstory.git
cd n8n-nodes-fullstory
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-fullstory
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your FullStory API key from the FullStory dashboard | Yes |
| Organization ID | Your FullStory organization identifier | Yes |
| Environment | FullStory environment (production/staging) | No |

## Resources & Operations

### 1. Users

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a specific user by ID or email |
| List | Get a list of users with optional filtering |
| Search | Search users by custom criteria and attributes |
| Get Properties | Retrieve custom user properties and metadata |
| Update Properties | Update custom user properties |

### 2. Events

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a specific event by ID |
| List | Get events for a user or session |
| Search | Search events by type, timestamp, or custom properties |
| Create | Send custom events to FullStory |
| Get Types | Retrieve available event types |
| Get Properties | Get event properties and metadata |

### 3. Sessions

| Operation | Description |
|-----------|-------------|
| Get | Retrieve detailed session information |
| List | Get sessions for a specific user or time period |
| Search | Search sessions by duration, pages visited, or custom criteria |
| Get Recording | Access session recording URL and metadata |
| Get Events | Retrieve all events within a specific session |
| Get Heatmap | Get heatmap data for session pages |

### 4. Segments

| Operation | Description |
|-----------|-------------|
| Get | Retrieve segment details and criteria |
| List | Get all available segments |
| Create | Create new user segments |
| Update | Modify existing segment criteria |
| Delete | Remove segments |
| Get Users | Get users belonging to a specific segment |

### 5. Analytics

| Operation | Description |
|-----------|-------------|
| Get Metrics | Retrieve key performance metrics |
| Get Funnel | Access funnel analysis data |
| Get Heatmaps | Retrieve page heatmap information |
| Export Data | Export analytics data in various formats |
| Get Reports | Access pre-built analytics reports |

## Usage Examples

```javascript
// Get user session data for behavior analysis
{
  "operation": "search",
  "resource": "sessions",
  "userId": "user_12345",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeEvents": true
}
```

```javascript
// Create a custom event for tracking
{
  "operation": "create",
  "resource": "events",
  "eventName": "feature_usage",
  "userId": "user_12345",
  "properties": {
    "feature": "advanced_search",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

```javascript
// Search for users in a specific segment
{
  "operation": "getUsers",
  "resource": "segments",
  "segmentId": "segment_abc123",
  "limit": 100,
  "includeProperties": true
}
```

```javascript
// Get comprehensive session recording data
{
  "operation": "getRecording",
  "resource": "sessions",
  "sessionId": "session_xyz789",
  "includeHeatmap": true,
  "includeEvents": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid API key or expired credentials | Verify API key in FullStory dashboard and update credentials |
| 403 Forbidden | Insufficient permissions for requested operation | Check API key permissions and organization access rights |
| 404 Not Found | User, session, or resource does not exist | Verify resource IDs and ensure data exists in FullStory |
| 429 Rate Limited | Too many API requests in short time period | Implement delays between requests or reduce request frequency |
| 422 Invalid Parameters | Invalid query parameters or request format | Review API documentation and validate all required parameters |
| 500 Server Error | FullStory service temporarily unavailable | Retry request after delay or check FullStory status page |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-fullstory/issues)
- **FullStory API Documentation**: [FullStory Developer Hub](https://developer.fullstory.com/)
- **FullStory Community**: [FullStory Help Center](https://help.fullstory.com/)