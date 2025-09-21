const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketUtils = require('../../utils/ticketUtils');
const TicketEmbeds = require('../../utils/embedBuilder');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from the ticket')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove from the ticket')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        try {
            // Check if command is used in a ticket channel
            const ticket = await TicketUtils.isTicketChannel(interaction.channel.id);
            
            if (!ticket) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.notInTicket)],
                    ephemeral: true
                });
            }
            
            // Check permissions
            const isOwner = ticket.userId === interaction.user.id;
            const isStaff = TicketUtils.hasStaffRole(interaction.member);
            
            if (!isOwner && !isStaff) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.noPermission)],
                    ephemeral: true
                });
            }
            
            const userToRemove = interaction.options.getUser('user');
            
            // Check if trying to remove ticket owner
            if (userToRemove.id === ticket.userId) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed('Cannot remove the ticket owner!')],
                    ephemeral: true
                });
            }
            
            // Check if user has access to the ticket
            const permissions = interaction.channel.permissionOverwrites.cache.get(userToRemove.id);
            if (!permissions || !permissions.allow.has('ViewChannel')) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed('This user does not have access to the ticket!')],
                    ephemeral: true
                });
            }
            
            // Remove user from ticket
            await interaction.channel.permissionOverwrites.delete(userToRemove.id);
            
            await interaction.reply({
                embeds: [TicketEmbeds.successEmbed(
                    'User Removed',
                    `${userToRemove} has been removed from the ticket by ${interaction.user}`
                )]
            });
            
            // Log action
            await TicketUtils.logTicketAction(
                interaction.guild,
                'User Removed',
                ticket,
                interaction.user,
                { removedUser: userToRemove.tag }
            );
            
        } catch (error) {
            console.error('Error in remove command:', error);
            await interaction.reply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                ephemeral: true
            });
        }
    }
};