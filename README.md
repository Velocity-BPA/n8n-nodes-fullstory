# n8n-nodes-fullstory

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node that provides seamless integration with FullStory's customer experience analytics platform. This node offers 5 resources with complete CRUD operations, enabling you to manage users, events, sessions, segments, and data exports to optimize your customer experience insights and analytics workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Customer Analytics](https://img.shields.io/badge/Customer-Analytics-orange)
![Session Replay](https://img.shields.io/badge/Session-Replay-green)
![User Experience](https://img.shields.io/badge/User-Experience-purple)

## Features

- **Complete User Management** - Create, update, retrieve, and manage user profiles with custom properties and segments
- **Event Tracking** - Capture custom events, conversions, and user interactions with detailed metadata
- **Session Analytics** - Access session recordings, heatmaps, and user journey data for experience optimization
- **Advanced Segmentation** - Create and manage user segments based on behavior, properties, and custom criteria
- **Data Export Operations** - Export session data, user events, and analytics for external analysis and reporting
- **Real-time Monitoring** - Track user behavior and application performance in real-time
- **Custom Properties** - Set and manage custom user and event properties for detailed analytics
- **Comprehensive Error Handling** - Robust error management with detailed logging and retry mechanisms

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
| API Key | Your FullStory API key from Settings → API Keys | Yes |
| Organization ID | Your FullStory organization identifier | Yes |
| Environment | API environment (production/staging) | No |

## Resources & Operations

### 1. User

| Operation | Description |
|-----------|-------------|
| Create | Create a new user profile with properties and segments |
| Get | Retrieve user details by ID or email |
| Update | Update user properties, segments, or metadata |
| Delete | Remove a user profile from FullStory |
| List | Get all users with filtering and pagination options |
| Set Properties | Set custom properties for a user |
| Add to Segment | Add user to specific segments |

### 2. Event

| Operation | Description |
|-----------|-------------|
| Create | Track a custom event with properties and context |
| Get | Retrieve event details by ID |
| List | Get events with filtering by user, time range, or type |
| Update | Update event properties or metadata |
| Delete | Remove an event record |
| Track Conversion | Track conversion events with value and funnel data |
| Batch Create | Create multiple events in a single request |

### 3. Session

| Operation | Description |
|-----------|-------------|
| Get | Retrieve session details including recordings and metadata |
| List | Get sessions with filtering by user, date, or properties |
| Get Recording | Access session recording URL and playback data |
| Get Heatmap | Retrieve heatmap data for session analysis |
| Search | Search sessions by custom criteria and events |
| Export | Export session data for external analysis |

### 4. Segment

| Operation | Description |
|-----------|-------------|
| Create | Create a new user segment with rules and criteria |
| Get | Retrieve segment details and user count |
| Update | Update segment rules, name, or description |
| Delete | Remove a segment |
| List | Get all segments with metadata |
| Get Users | Retrieve users belonging to a segment |
| Evaluate | Test if a user matches segment criteria |

### 5. Export

| Operation | Description |
|-----------|-------------|
| Create | Create a new data export job |
| Get Status | Check the status of an export job |
| Download | Download completed export data |
| List | Get all export jobs with status and metadata |
| Cancel | Cancel a running export job |
| Schedule | Schedule recurring data exports |

## Usage Examples

```javascript
// Track user conversion event
{
  "event_name": "purchase_completed",
  "user_id": "user_12345",
  "properties": {
    "order_value": 129.99,
    "product_category": "electronics",
    "payment_method": "credit_card"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

```javascript
// Create user segment for high-value customers
{
  "name": "High Value Customers",
  "description": "Users with purchase value > $500",
  "rules": {
    "conditions": [
      {
        "property": "total_purchase_value",
        "operator": "greater_than",
        "value": 500
      }
    ]
  }
}
```

```javascript
// Export session data for analysis
{
  "export_type": "sessions",
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "filters": {
    "user_segment": "high_value_customers",
    "include_recordings": true
  },
  "format": "json"
}
```

```javascript
// Update user properties with custom data
{
  "user_id": "user_12345",
  "properties": {
    "subscription_plan": "premium",
    "account_type": "business",
    "signup_source": "organic_search",
    "last_login": "2024-01-15T14:22:00Z"
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key in FullStory dashboard settings |
| Rate Limit Exceeded | Too many requests sent in time window | Implement exponential backoff and retry logic |
| User Not Found | Requested user ID does not exist | Verify user ID or create user before operations |
| Segment Rules Invalid | Segment criteria contain invalid conditions | Review segment rules syntax and property names |
| Export Job Failed | Data export processing encountered an error | Check export parameters and retry with valid filters |
| Session Not Available | Requested session is not accessible or expired | Verify session ID and data retention policies |

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
- **FullStory API Documentation**: [https://developer.fullstory.com](https://developer.fullstory.com)
- **FullStory Community**: [https://help.fullstory.com](https://help.fullstory.com)