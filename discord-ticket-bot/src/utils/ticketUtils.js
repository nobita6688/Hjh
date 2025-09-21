const { PermissionFlagsBits, ChannelType } = require('discord.js');
const Ticket = require('../models/Ticket');
const TicketCounter = require('../models/TicketCounter');
const config = require('../../config/config');

class TicketUtils {
    static async getNextTicketId(guildId) {
        let counter = await TicketCounter.findOne({ guildId });
        
        if (!counter) {
            counter = await TicketCounter.create({ guildId, count: 1 });
            return 1;
        }
        
        counter.count += 1;
        await counter.save();
        return counter.count;
    }
    
    static async createTicketChannel(guild, user, ticketType, ticketId) {
        const category = guild.channels.cache.find(
            c => c.name.toUpperCase() === config.ticketCategory.toUpperCase() && c.type === ChannelType.GuildCategory
        );
        
        if (!category) {
            throw new Error('Ticket category not found! Please create a category named: ' + config.ticketCategory);
        }
        
        const channelName = `${config.ticketPrefix}${ticketId}`;
        
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                ...config.staffRoles.map(roleId => ({
                    id: roleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.ManageMessages
                    ]
                }))
            ],
            topic: `Support ticket for ${user.username} | Type: ${ticketType} | ID: ${ticketId}`
        });
        
        return channel;
    }
    
    static async getUserOpenTickets(userId, guildId) {
        return await Ticket.find({
            userId,
            guildId,
            status: 'open'
        });
    }
    
    static async isTicketChannel(channelId) {
        const ticket = await Ticket.findOne({ channelId, status: 'open' });
        return ticket;
    }
    
    static hasStaffRole(member) {
        return config.staffRoles.some(roleId => member.roles.cache.has(roleId));
    }
    
    static hasAdminRole(member) {
        return config.adminRoles.some(roleId => member.roles.cache.has(roleId));
    }
    
    static async logTicketAction(guild, action, ticket, performer, details = {}) {
        if (!config.logsChannel) return;
        
        const logsChannel = guild.channels.cache.get(config.logsChannel);
        if (!logsChannel) return;
        
        const { EmbedBuilder } = require('discord.js');
        
        const logEmbed = new EmbedBuilder()
            .setTitle(`Ticket ${action}`)
            .setColor(this.getActionColor(action))
            .addFields(
                { name: 'Ticket ID', value: `#${ticket.ticketId}`, inline: true },
                { name: 'User', value: `<@${ticket.userId}>`, inline: true },
                { name: 'Action By', value: `${performer}`, inline: true },
                { name: 'Ticket Type', value: ticket.ticketType, inline: true },
                { name: 'Action', value: action, inline: true },
                { name: 'Time', value: new Date().toLocaleString(), inline: true }
            )
            .setTimestamp();
            
        if (details.reason) {
            logEmbed.addFields({ name: 'Reason', value: details.reason, inline: false });
        }
        
        await logsChannel.send({ embeds: [logEmbed] });
    }
    
    static getActionColor(action) {
        const colors = {
            'Created': config.colors.success,
            'Closed': config.colors.error,
            'Claimed': config.colors.info,
            'Reopened': config.colors.warning,
            'User Added': config.colors.info,
            'User Removed': config.colors.warning
        };
        return colors[action] || config.colors.primary;
    }
    
    static async generateTranscript(ticket) {
        const messages = ticket.messages.sort((a, b) => a.timestamp - b.timestamp);
        
        let transcript = `Ticket Transcript - #${ticket.ticketId}\n`;
        transcript += `Created by: ${ticket.username} (${ticket.userId})\n`;
        transcript += `Type: ${ticket.ticketType}\n`;
        transcript += `Created at: ${new Date(ticket.createdAt).toLocaleString()}\n`;
        transcript += `Closed at: ${new Date().toLocaleString()}\n`;
        transcript += `\n${'='.repeat(50)}\n\n`;
        
        messages.forEach(msg => {
            transcript += `[${new Date(msg.timestamp).toLocaleString()}] ${msg.username}: ${msg.content}\n`;
        });
        
        return transcript;
    }
}

module.exports = TicketUtils;