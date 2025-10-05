#!/usr/bin/env python3
"""
Example usage of the Python Bot
This file demonstrates different ways to use the bot
"""

import asyncio
import sys
import os

# Add current directory to path to import bot
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bot import PythonBot, DiscordBot, TelegramBot

async def example_console_bot():
    """Example of running a console bot"""
    print("=== Console Bot Example ===")
    
    bot = PythonBot("config.json")
    
    # You can customize the bot before starting
    bot.config.config['bot_name'] = "My Custom Bot"
    bot.config.config['responses']['greeting'] = "Hi there! I'm your custom bot!"
    
    # Start the bot (this will run the interactive loop)
    await bot.start()

async def example_discord_bot():
    """Example of running a Discord bot"""
    print("=== Discord Bot Example ===")
    
    # You need to provide a valid Discord bot token
    token = "YOUR_DISCORD_BOT_TOKEN_HERE"
    
    if token == "YOUR_DISCORD_BOT_TOKEN_HERE":
        print("Please set your Discord bot token in the code")
        return
    
    bot = DiscordBot(token, "config.json")
    await bot.start()

async def example_telegram_bot():
    """Example of running a Telegram bot"""
    print("=== Telegram Bot Example ===")
    
    # You need to provide a valid Telegram bot token
    token = "YOUR_TELEGRAM_BOT_TOKEN_HERE"
    
    if token == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("Please set your Telegram bot token in the code")
        return
    
    bot = TelegramBot(token, "config.json")
    await bot.start()

def example_custom_commands():
    """Example of adding custom commands"""
    print("=== Custom Commands Example ===")
    
    class CustomBot(PythonBot):
        def __init__(self, config_file="config.json"):
            super().__init__(config_file)
            # Add custom commands to config
            self.config.config['commands']['calc'] = "Perform basic calculations"
            self.config.config['commands']['reverse'] = "Reverse a string"
        
        async def process_command(self, command: str) -> str:
            # Handle custom commands
            if command.startswith('calc '):
                try:
                    expression = command[5:]
                    result = eval(expression)  # Note: eval is dangerous in production
                    return f"Result: {result}"
                except:
                    return "Invalid expression"
            
            elif command.startswith('reverse '):
                text = command[8:]
                return f"Reversed: {text[::-1]}"
            
            # Fall back to parent class for other commands
            return await super().process_command(command)
    
    # Usage
    bot = CustomBot()
    print("Custom bot created with calc and reverse commands")
    print("Try: calc 2+2 or reverse hello")

def example_batch_commands():
    """Example of running multiple commands programmatically"""
    print("=== Batch Commands Example ===")
    
    async def run_commands():
        bot = PythonBot("config.json")
        
        # Simulate running commands
        test_commands = [
            "hello",
            "time",
            "joke",
            "quote",
            "status"
        ]
        
        for cmd in test_commands:
            response = await bot.process_command(cmd)
            print(f"Command: {cmd}")
            print(f"Response: {response}")
            print("-" * 40)
    
    # Run the example
    asyncio.run(run_commands())

def example_configuration():
    """Example of working with configuration"""
    print("=== Configuration Example ===")
    
    from bot import BotConfig
    
    # Create a custom config
    config = BotConfig("custom_config.json")
    
    # Modify settings
    config.config['bot_name'] = "Test Bot"
    config.config['debug'] = True
    config.config['commands']['test'] = "Test command"
    
    # Save the configuration
    config.save_config()
    
    print("Custom configuration saved to custom_config.json")
    print(f"Bot name: {config.config['bot_name']}")
    print(f"Debug mode: {config.config['debug']}")

def main():
    """Main function to run examples"""
    print("Python Bot Examples")
    print("===================")
    print()
    
    while True:
        print("Choose an example to run:")
        print("1. Console Bot")
        print("2. Discord Bot (requires token)")
        print("3. Telegram Bot (requires token)")
        print("4. Custom Commands")
        print("5. Batch Commands")
        print("6. Configuration")
        print("7. Exit")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            asyncio.run(example_console_bot())
        elif choice == "2":
            asyncio.run(example_discord_bot())
        elif choice == "3":
            asyncio.run(example_telegram_bot())
        elif choice == "4":
            example_custom_commands()
        elif choice == "5":
            example_batch_commands()
        elif choice == "6":
            example_configuration()
        elif choice == "7":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")
        
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()