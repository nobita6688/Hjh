const Ticket = require('../models/Ticket');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Check if message is in a ticket channel
        const ticket = await Ticket.findOne({ 
            channelId: message.channel.id,
            status: 'open'
        });
        
        if (!ticket) return;
        
        // Store message in ticket (for transcript purposes)
        ticket.messages.push({
            userId: message.author.id,
            username: message.author.username,
            content: message.content,
            timestamp: new Date()
        });
        
        // Limit stored messages to last 100 to prevent database bloat
        if (ticket.messages.length > 100) {
            ticket.messages = ticket.messages.slice(-100);
        }
        
        await ticket.save();
    }
};