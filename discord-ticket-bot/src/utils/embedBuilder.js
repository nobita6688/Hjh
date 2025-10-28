const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

class TicketEmbeds {
    static welcomeEmbed(user, ticketType, ticketId) {
        const typeInfo = config.ticketTypes.find(t => t.value === ticketType);
        
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${typeInfo.emoji} Ticket #${ticketId}`)
            .setDescription(`**Welcome ${user}!**\n\nThank you for creating a ticket. Our support team will assist you shortly.\n\n**Ticket Type:** ${typeInfo.label}\n**Created by:** ${user}\n**Status:** 🟢 Open`)
            .addFields(
                { name: '📝 Guidelines', value: '• Please describe your issue in detail\n• Provide any relevant information\n• Be patient, our team will respond soon\n• Do not ping staff members', inline: false },
                { name: '⚡ Quick Actions', value: '`/close` - Close this ticket\n`/add` - Add a user to ticket\n`/remove` - Remove a user from ticket', inline: false }
            )
            .setFooter({ text: 'Hosting Support System' })
            .setTimestamp();
    }
    
    static ticketClosedEmbed(closedBy, reason) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('🔒 Ticket Closed')
            .setDescription(`This ticket has been closed by ${closedBy}`)
            .addFields(
                { name: 'Reason', value: reason || 'No reason provided', inline: false },
                { name: 'Closed At', value: new Date().toLocaleString(), inline: true }
            )
            .setFooter({ text: 'This channel will be deleted in 10 seconds' })
            .setTimestamp();
    }
    
    static ticketCreatedEmbed(channel, user) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('✅ Ticket Created Successfully')
            .setDescription(`Your support ticket has been created!`)
            .addFields(
                { name: 'Ticket Channel', value: `${channel}`, inline: true },
                { name: 'Created By', value: `${user}`, inline: true }
            )
            .setFooter({ text: 'Please check your ticket channel' })
            .setTimestamp();
    }
    
    static transcriptEmbed(ticket, messageCount) {
        return new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(`📄 Ticket Transcript - #${ticket.ticketId}`)
            .setDescription('Ticket conversation transcript')
            .addFields(
                { name: 'Ticket ID', value: `#${ticket.ticketId}`, inline: true },
                { name: 'Created By', value: `<@${ticket.userId}>`, inline: true },
                { name: 'Ticket Type', value: ticket.ticketType, inline: true },
                { name: 'Total Messages', value: `${messageCount}`, inline: true },
                { name: 'Created At', value: new Date(ticket.createdAt).toLocaleString(), inline: true },
                { name: 'Closed At', value: new Date().toLocaleString(), inline: true }
            )
            .setFooter({ text: 'Hosting Support System' })
            .setTimestamp();
    }
    
    static errorEmbed(message) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription(message)
            .setTimestamp();
    }
    
    static successEmbed(title, message) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`✅ ${title}`)
            .setDescription(message)
            .setTimestamp();
    }
    
    static infoEmbed(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
            
        if (fields.length > 0) {
            embed.addFields(fields);
        }
        
        return embed;
    }
    
    static ticketListEmbed(tickets) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('📋 Active Tickets')
            .setDescription(`Total active tickets: ${tickets.length}`)
            .setTimestamp();
            
        tickets.forEach(ticket => {
            const typeInfo = config.ticketTypes.find(t => t.value === ticket.ticketType);
            embed.addFields({
                name: `${typeInfo.emoji} Ticket #${ticket.ticketId}`,
                value: `**User:** <@${ticket.userId}>\n**Type:** ${typeInfo.label}\n**Status:** ${ticket.status}\n**Created:** ${new Date(ticket.createdAt).toLocaleString()}`,
                inline: true
            });
        });
        
        return embed;
    }
    
    static statsEmbed(stats) {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('📊 Ticket Statistics')
            .setDescription('Overall ticket system statistics')
            .addFields(
                { name: '🎫 Total Tickets', value: `${stats.total}`, inline: true },
                { name: '🟢 Open Tickets', value: `${stats.open}`, inline: true },
                { name: '🔒 Closed Tickets', value: `${stats.closed}`, inline: true },
                { name: '📅 Today\'s Tickets', value: `${stats.today}`, inline: true },
                { name: '📈 This Week', value: `${stats.thisWeek}`, inline: true },
                { name: '📊 This Month', value: `${stats.thisMonth}`, inline: true }
            )
            .setFooter({ text: 'Hosting Support System' })
            .setTimestamp();
    }
}

module.exports = TicketEmbeds;