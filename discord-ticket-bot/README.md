# Discord Ticket Bot

A comprehensive Discord ticket bot designed for hosting servers with advanced features and beautiful embeds.

## Features

### 🎫 Ticket Management
- Create tickets via slash command or panel button
- Multiple ticket types (Technical, Billing, Sales, Abuse, General)
- Priority system (Low, Medium, High, Urgent)
- Maximum tickets per user limit
- Automatic ticket numbering

### 👥 User Features
- Create support tickets
- Add/remove users from tickets
- Close own tickets with reason
- Beautiful embed messages

### 👮 Staff Features
- Claim tickets
- View all open tickets
- View ticket statistics
- Close any ticket
- Access to all ticket channels

### 👑 Admin Features
- Create ticket panels
- Force close tickets
- Configure ticket categories
- Set staff and admin roles
- Transcript system

### 📊 Additional Features
- HTML transcript generation
- Logging system for all actions
- Message tracking for transcripts
- Beautiful embeds for all interactions
- Ticket statistics dashboard

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd discord-ticket-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure the bot**
- Copy `.env.example` to `.env`
- Fill in your bot token, MongoDB URI, and other settings
```bash
cp .env.example .env
```

4. **Configure settings**
- Edit `config/config.js` to customize:
  - Staff and admin role IDs
  - Ticket types and categories
  - Colors and messages
  - Log channels

5. **Setup MongoDB**
- Make sure MongoDB is running
- The bot will automatically create necessary collections

6. **Start the bot**
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Configuration

### Environment Variables (.env)
```
DISCORD_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/ticketbot
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_guild_id_here
```

### Config File (config/config.js)
- `ticketCategory`: Category name where tickets will be created
- `staffRoles`: Array of role IDs that can manage tickets
- `adminRoles`: Array of role IDs with admin permissions
- `maxTicketsPerUser`: Maximum open tickets per user
- `logsChannel`: Channel ID for ticket logs
- `transcriptsChannel`: Channel ID for ticket transcripts

## Commands

### User Commands
- `/ticket` - Create a new support ticket
- `/close [reason]` - Close your ticket
- `/add <user>` - Add a user to your ticket
- `/remove <user>` - Remove a user from your ticket
- `/help` - Show help information

### Staff Commands
- `/tickets [user]` - View all open tickets
- `/stats` - View ticket statistics

### Admin Commands
- `/panel <channel>` - Create a ticket panel
- `/forceclose <ticket_id> [reason]` - Force close a ticket

## Setup Guide

1. **Create a Ticket Category**
   - Create a category named "TICKETS" (or customize in config.js)
   - The bot will create ticket channels in this category

2. **Set up Roles**
   - Create staff roles for ticket management
   - Add role IDs to `config/config.js`

3. **Create a Ticket Panel**
   - Use `/panel #channel` to create a ticket panel
   - Users can click the button to create tickets

4. **Configure Logging**
   - Set `logsChannel` in config for action logs
   - Set `transcriptsChannel` for ticket transcripts

## Database Schema

### Ticket Model
- `ticketId`: Unique ticket number
- `channelId`: Discord channel ID
- `userId`: Ticket creator's ID
- `ticketType`: Type of ticket
- `priority`: Ticket priority
- `status`: open/closed/deleted
- `claimedBy`: Staff member who claimed
- `messages`: Array of messages for transcript

### TicketCounter Model
- Tracks ticket numbers per guild

## License

MIT License

## Support

For support, create a ticket in our Discord server or open an issue on GitHub.