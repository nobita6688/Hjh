const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketEmbeds = require('../../utils/embedBuilder');
const TicketUtils = require('../../utils/ticketUtils');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('View all open tickets')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Filter tickets by user')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        try {
            // Check staff permissions
            if (!TicketUtils.hasStaffRole(interaction.member) && !interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.noPermission)],
                    ephemeral: true
                });
            }
            
            await interaction.deferReply({ ephemeral: true });
            
            const user = interaction.options.getUser('user');
            const query = { guildId: interaction.guild.id, status: 'open' };
            
            if (user) {
                query.userId = user.id;
            }
            
            const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(25);
            
            if (tickets.length === 0) {
                return interaction.editReply({
                    embeds: [TicketEmbeds.infoEmbed(
                        '📋 No Open Tickets',
                        user ? `No open tickets found for ${user}` : 'There are currently no open tickets.'
                    )]
                });
            }
            
            await interaction.editReply({
                embeds: [TicketEmbeds.ticketListEmbed(tickets)]
            });
            
        } catch (error) {
            console.error('Error in tickets command:', error);
            await interaction.editReply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)]
            });
        }
    }
};