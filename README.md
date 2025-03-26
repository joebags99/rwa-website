# Roll With Advantage Admin Dashboard

This is the admin dashboard for the Roll With Advantage website, allowing you to manage content such as NPCs, timelines, story entries, and DM advice posts.

## Features

- Secure login system 
- Dashboard with overview of content
- NPC management (CRUD operations)
- Password management
- Mobile-responsive design
- Future expandability for Timeline, Story, and DM Advice content

## Setup Instructions

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Installation

1. Clone the repository or download the files.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
PORT=5000
SESSION_SECRET=your_secure_session_secret_here
YOUTUBE_API_KEY=your_youtube_api_key_here
CHANNEL_ID=your_channel_id_here
CRIMSON_COURT_PLAYLIST_ID=your_crimson_court_playlist_id_here
DM_ADVICE_PLAYLIST_ID=your_dm_advice_playlist_id_here
FEATURED_PLAYLIST_ID=your_featured_playlist_id_here
```

4. Run the setup script to create necessary directories:

```bash
node setup.js
```

5. Start the server:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

### Directory Structure

```
roll-with-advantage/
├── data/                  # Data storage (JSON files)
│   ├── npcs.json          # NPC data
│   └── admin-config.json  # Admin credentials
├── public/                # Static files
│   ├── admin/             # Admin pages
│   │   ├── index.html     # Admin dashboard
│   │   └── login.html     # Admin login
│   ├── css/               # CSS files
│   │   ├── admin.css      # Admin styles
│   │   └── ...            # Other CSS files
│   ├── js/                # JavaScript files
│   │   ├── admin.js       # Admin functionality
│   │   └── ...            # Other JS files
│   └── ...                # Other static files
├── routes/                # Express routes
│   └── admin.js           # Admin routes
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md              # This file
```

## Usage

### Accessing the Admin Dashboard

1. Start the server.
2. Navigate to `http://localhost:5000/admin` in your web browser.
3. Log in with the default credentials:

4. Change the default password immediately for security.

### Managing NPCs

1. Navigate to the NPCs section by clicking on "NPCs" in the sidebar.
2. Create a new NPC by clicking the "Create NPC" button.
3. Fill in the required fields:
   - Name & Title
   - Importance (1-3 stars)
   - First Appearance
   - Relationship
   - Brief Description
   - Quote
   - Tags (comma-separated)
   - Optional: Image URL
4. Click "Save NPC" to create the NPC.
5. Edit or delete NPCs using the action buttons in the NPC list.

### Security

- Change the default password immediately after installation.
- Use a strong, unique SESSION_SECRET in your .env.local file.
- For production, consider implementing HTTPS.

## Customization

### Adding New Content Types

The dashboard is designed to be extended with additional content types. To add a new type:

1. Create a new JSON file in the `data` directory.
2. Add corresponding routes in `routes/admin.js`.
3. Implement the UI in the admin dashboard.

## Troubleshooting

### Common Issues

- **Login Issues**: If you forget your password, you can reset it by deleting the `data/admin-config.json` file and restarting the server. This will reset to the default credentials.
- **Page Not Found**: Ensure you're accessing the correct URL and the server is running.
- **Data Not Saving**: Check that the `data` directory has proper write permissions.

## Security Notes

- The admin authentication is designed for a local development environment.
- For production use, consider implementing:
  - HTTPS
  - More robust authentication (OAuth, etc.)
  - Rate limiting
  - Input validation and sanitization

## Future Enhancements

The admin dashboard is designed to be extended with additional features:

- Timeline management
- Story content management 
- DM Advice post creation and editing
- Media upload capabilities
- User management
- Activity logging

## License

MIT License