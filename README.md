# Python Bot 🤖

A versatile Python bot framework that supports multiple platforms including console, Discord, Telegram, and Slack.

## Features

- **Multi-platform support**: Console, Discord, Telegram, Slack
- **Configurable**: JSON-based configuration system
- **Extensible**: Easy to add new commands and features
- **Async support**: Built with asyncio for better performance
- **Logging**: Comprehensive logging system
- **Command history**: Track user interactions
- **Error handling**: Robust error handling and recovery

## Installation

1. Clone or download the bot files
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Quick Start

### Console Bot (Default)
```bash
python bot.py
```

### Discord Bot
```bash
python bot.py --type discord --token YOUR_DISCORD_BOT_TOKEN
```

### Telegram Bot
```bash
python bot.py --type telegram --token YOUR_TELEGRAM_BOT_TOKEN
```

## Configuration

Edit `config.json` to customize:
- Bot name and version
- Available commands
- Response messages
- API keys
- Logging settings

## Available Commands

- `help` - Show available commands
- `time` - Show current time
- `weather` - Get weather information (mock)
- `joke` - Tell a random joke
- `quote` - Get inspirational quote
- `history` - Show command history
- `status` - Show bot status
- `echo <text>` - Echo back your message
- `quit/exit/stop` - Stop the bot

## Examples

### Basic Console Bot
```python
from bot import PythonBot

bot = PythonBot()
await bot.start()
```

### Discord Bot
```python
from bot import DiscordBot

bot = DiscordBot("YOUR_DISCORD_TOKEN")
await bot.start()
```

### Telegram Bot
```python
from bot import TelegramBot

bot = TelegramBot("YOUR_TELEGRAM_TOKEN")
await bot.start()
```

## Adding Custom Commands

1. Add command to `config.json`:
```json
{
    "commands": {
        "mycommand": "Description of my command"
    }
}
```

2. Add handler in `process_command` method:
```python
elif command == 'mycommand':
    return self.my_custom_function()
```

## API Integration

The bot supports various API integrations:
- Weather API (OpenWeatherMap)
- AI responses (OpenAI)
- Custom webhooks

Add your API keys to `config.json`:
```json
{
    "api_keys": {
        "openweathermap": "YOUR_API_KEY",
        "openai": "YOUR_API_KEY"
    }
}
```

## Logging

Logs are saved to `bot.log` and displayed in console. Configure logging in `config.json`:
```json
{
    "logging": {
        "level": "INFO",
        "file": "bot.log",
        "max_size": "10MB",
        "backup_count": 5
    }
}
```

## Error Handling

The bot includes comprehensive error handling:
- Graceful shutdown on Ctrl+C
- Error logging and user-friendly messages
- Automatic recovery from common errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use and modify as needed.

## Support

For issues and questions:
1. Check the logs in `bot.log`
2. Review the configuration in `config.json`
3. Ensure all dependencies are installed
4. Check API keys and tokens are valid

---

**Happy Botting!** 🚀