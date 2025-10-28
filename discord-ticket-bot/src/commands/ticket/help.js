const { SlashCommandBuilder } = require('discord.js');
const TicketEmbeds = require('../../utils/embedBuilder');
const TicketUtils = require('../../utils/ticketUtils');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information about the ticket bot'),
    
    async execute(interaction) {
        const isStaff = TicketUtils.hasStaffRole(interaction.member);
        const isAdmin = TicketUtils.hasAdminRole(interaction.member) || interaction.member.permissions.has('Administrator');
        
        const fields = [
            {
                name: '👤 User Commands',
                value: '`/ticket` - Create a new support ticket\n`/close [reason]` - Close your ticket\n`/add <user>` - Add a user to your ticket\n`/remove <user>` - Remove a user from your ticket',
                inline: false
            }
        ];
        
        if (isStaff || isAdmin) {
            fields.push({
                name: '👮 Staff Commands',
                value: '`/tickets [user]` - View all open tickets\n`/stats` - View ticket statistics\n`/close [reason]` - Close any ticket',
                inline: false
            });
        }
        
        if (isAdmin) {
            fields.push({
                name: '👑 Admin Commands',
                value: '`/panel <channel>` - Create a ticket panel\n`/forceclose <ticket_id> [reason]` - Force close a ticket',
                inline: false
            });
        }
        
        fields.push({
            name: '📋 Ticket Types',
            value: config.ticketTypes.map(type => `${type.emoji} **${type.label}** - ${type.description}`).join('\n'),
            inline: false
        });
        
        const helpEmbed = TicketEmbeds.infoEmbed(
            '📖 Ticket Bot Help',
            'This bot provides a comprehensive ticket system for support and assistance.',
            fields
        );
        
        await interaction.reply({
            embeds: [helpEmbed],
            ephemeral: true
        });
    }
};