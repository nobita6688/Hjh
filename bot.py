#!/usr/bin/env python3
"""
Python Bot - A versatile bot framework
Supports multiple bot types: Discord, Telegram, Slack, and general purpose bots
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class BotConfig:
    """Bot configuration management"""
    
    def __init__(self, config_file: str = "config.json"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        default_config = {
            "bot_name": "PythonBot",
            "version": "1.0.0",
            "debug": False,
            "commands": {
                "help": "Show available commands",
                "time": "Show current time",
                "weather": "Get weather information",
                "joke": "Tell a random joke",
                "quote": "Get inspirational quote"
            },
            "responses": {
                "greeting": "Hello! I'm your Python bot. How can I help you?",
                "goodbye": "Goodbye! Have a great day!",
                "error": "Sorry, I encountered an error. Please try again."
            }
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults
                    for key, value in default_config.items():
                        if key not in config:
                            config[key] = value
                    return config
            except Exception as e:
                logger.warning(f"Error loading config: {e}. Using defaults.")
                return default_config
        else:
            # Create default config file
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config: Dict[str, Any] = None):
        """Save configuration to file"""
        if config is None:
            config = self.config
        
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving config: {e}")

class PythonBot:
    """Main bot class with various functionalities"""
    
    def __init__(self, config_file: str = "config.json"):
        self.config = BotConfig(config_file)
        self.running = False
        self.command_history = []
        self.user_data = {}
        
        # Initialize bot
        logger.info(f"Initializing {self.config.config['bot_name']} v{self.config.config['version']}")
    
    async def start(self):
        """Start the bot"""
        self.running = True
        logger.info("Bot started successfully!")
        
        # Show welcome message
        print(f"\n🤖 {self.config.config['bot_name']} is now running!")
        print("Type 'help' for available commands or 'quit' to exit.\n")
        
        # Main bot loop
        while self.running:
            try:
                user_input = await self.get_user_input()
                if user_input.lower() in ['quit', 'exit', 'stop']:
                    await self.stop()
                    break
                
                response = await self.process_command(user_input)
                print(f"Bot: {response}\n")
                
            except KeyboardInterrupt:
                await self.stop()
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                print(f"Bot: {self.config.config['responses']['error']}")
    
    async def get_user_input(self) -> str:
        """Get user input asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, input, "You: ")
    
    async def process_command(self, command: str) -> str:
        """Process user commands"""
        command = command.strip().lower()
        self.command_history.append({
            'command': command,
            'timestamp': datetime.now().isoformat()
        })
        
        # Basic commands
        if command == 'help':
            return self.show_help()
        elif command == 'time':
            return self.get_current_time()
        elif command == 'weather':
            return self.get_weather()
        elif command == 'joke':
            return self.get_joke()
        elif command == 'quote':
            return self.get_quote()
        elif command == 'history':
            return self.show_command_history()
        elif command == 'status':
            return self.get_bot_status()
        elif command.startswith('echo '):
            return command[5:]  # Return everything after 'echo '
        elif command == 'hello' or command == 'hi':
            return self.config.config['responses']['greeting']
        elif command == 'bye' or command == 'goodbye':
            return self.config.config['responses']['goodbye']
        else:
            return f"I don't understand '{command}'. Type 'help' for available commands."
    
    def show_help(self) -> str:
        """Show available commands"""
        help_text = "Available commands:\n"
        for cmd, desc in self.config.config['commands'].items():
            help_text += f"  • {cmd}: {desc}\n"
        help_text += "  • history: Show command history\n"
        help_text += "  • status: Show bot status\n"
        help_text += "  • echo <text>: Echo back the text\n"
        help_text += "  • quit/exit/stop: Stop the bot"
        return help_text
    
    def get_current_time(self) -> str:
        """Get current time"""
        now = datetime.now()
        return f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def get_weather(self) -> str:
        """Get weather information (mock)"""
        # This is a mock weather function
        # In a real implementation, you would integrate with a weather API
        return "Weather: Sunny, 25°C (This is mock data. Integrate with a real weather API for actual data.)"
    
    def get_joke(self) -> str:
        """Get a random joke"""
        jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the Python programmer prefer dark mode? Because light attracts bugs!",
            "What do you call a programmer from Finland? Nerdic.",
            "Why do programmers prefer dark chocolate? Because it's bitter like their code reviews!",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem!"
        ]
        import random
        return random.choice(jokes)
    
    def get_quote(self) -> str:
        """Get an inspirational quote"""
        quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Innovation distinguishes between a leader and a follower. - Steve Jobs",
            "Code is like humor. When you have to explain it, it's bad. - Cory House",
            "First, solve the problem. Then, write the code. - John Johnson",
            "Experience is the name everyone gives to their mistakes. - Oscar Wilde"
        ]
        import random
        return random.choice(quotes)
    
    def show_command_history(self) -> str:
        """Show command history"""
        if not self.command_history:
            return "No commands in history yet."
        
        history_text = "Command History:\n"
        for i, entry in enumerate(self.command_history[-10:], 1):  # Show last 10 commands
            history_text += f"  {i}. {entry['command']} ({entry['timestamp']})\n"
        return history_text
    
    def get_bot_status(self) -> str:
        """Get bot status information"""
        status = f"Bot Status:\n"
        status += f"  Name: {self.config.config['bot_name']}\n"
        status += f"  Version: {self.config.config['version']}\n"
        status += f"  Running: {self.running}\n"
        status += f"  Commands processed: {len(self.command_history)}\n"
        status += f"  Debug mode: {self.config.config['debug']}"
        return status
    
    async def stop(self):
        """Stop the bot"""
        self.running = False
        logger.info("Bot stopped")
        print(f"\n{self.config.config['responses']['goodbye']}")

class DiscordBot(PythonBot):
    """Discord bot implementation (requires discord.py)"""
    
    def __init__(self, token: str, config_file: str = "config.json"):
        super().__init__(config_file)
        self.token = token
        self.client = None
    
    async def start(self):
        """Start Discord bot"""
        try:
            import discord
            from discord.ext import commands
            
            intents = discord.Intents.default()
            intents.message_content = True
            
            self.client = commands.Bot(command_prefix='!', intents=intents)
            
            @self.client.event
            async def on_ready():
                logger.info(f'Discord bot logged in as {self.client.user}')
                print(f"Discord bot {self.client.user} is ready!")
            
            @self.client.command(name='hello')
            async def hello(ctx):
                await ctx.send(self.config.config['responses']['greeting'])
            
            @self.client.command(name='time')
            async def time(ctx):
                await ctx.send(self.get_current_time())
            
            @self.client.command(name='joke')
            async def joke(ctx):
                await ctx.send(self.get_joke())
            
            @self.client.command(name='quote')
            async def quote(ctx):
                await ctx.send(self.get_quote())
            
            await self.client.start(self.token)
            
        except ImportError:
            logger.error("discord.py not installed. Install with: pip install discord.py")
            print("Discord bot requires discord.py. Install it with: pip install discord.py")

class TelegramBot(PythonBot):
    """Telegram bot implementation (requires python-telegram-bot)"""
    
    def __init__(self, token: str, config_file: str = "config.json"):
        super().__init__(config_file)
        self.token = token
    
    async def start(self):
        """Start Telegram bot"""
        try:
            from telegram import Update
            from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
            
            async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
                await update.message.reply_text(self.config.config['responses']['greeting'])
            
            async def time_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
                await update.message.reply_text(self.get_current_time())
            
            async def joke_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
                await update.message.reply_text(self.get_joke())
            
            async def quote_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
                await update.message.reply_text(self.get_quote())
            
            async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
                await update.message.reply_text(self.show_help())
            
            async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
                message_type = update.message.chat.type
                text = update.message.text
                
                response = await self.process_command(text)
                await update.message.reply_text(response)
            
            # Create application
            app = Application.builder().token(self.token).build()
            
            # Add handlers
            app.add_handler(CommandHandler("start", start_command))
            app.add_handler(CommandHandler("help", help_command))
            app.add_handler(CommandHandler("time", time_command))
            app.add_handler(CommandHandler("joke", joke_command))
            app.add_handler(CommandHandler("quote", quote_command))
            app.add_handler(MessageHandler(filters.TEXT, handle_message))
            
            logger.info("Telegram bot started")
            print("Telegram bot is running...")
            
            # Start the bot
            await app.run_polling()
            
        except ImportError:
            logger.error("python-telegram-bot not installed. Install with: pip install python-telegram-bot")
            print("Telegram bot requires python-telegram-bot. Install it with: pip install python-telegram-bot")

def main():
    """Main function to run the bot"""
    parser = argparse.ArgumentParser(description='Python Bot - A versatile bot framework')
    parser.add_argument('--type', choices=['console', 'discord', 'telegram'], 
                       default='console', help='Bot type to run')
    parser.add_argument('--token', help='Bot token (required for Discord/Telegram)')
    parser.add_argument('--config', default='config.json', help='Config file path')
    
    args = parser.parse_args()
    
    try:
        if args.type == 'console':
            bot = PythonBot(args.config)
            asyncio.run(bot.start())
        elif args.type == 'discord':
            if not args.token:
                print("Error: Discord bot requires --token argument")
                sys.exit(1)
            bot = DiscordBot(args.token, args.config)
            asyncio.run(bot.start())
        elif args.type == 'telegram':
            if not args.token:
                print("Error: Telegram bot requires --token argument")
                sys.exit(1)
            bot = TelegramBot(args.token, args.config)
            asyncio.run(bot.start())
    
    except KeyboardInterrupt:
        print("\nBot stopped by user")
    except Exception as e:
        logger.error(f"Error running bot: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()