const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketUtils = require('../../utils/ticketUtils');
const TicketEmbeds = require('../../utils/embedBuilder');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to the ticket')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add to the ticket')
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
            
            const userToAdd = interaction.options.getUser('user');
            
            // Check if user is already in the ticket
            const permissions = interaction.channel.permissionOverwrites.cache.get(userToAdd.id);
            if (permissions && permissions.allow.has('ViewChannel')) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed('This user already has access to the ticket!')],
                    ephemeral: true
                });
            }
            
            // Add user to ticket
            await interaction.channel.permissionOverwrites.create(userToAdd.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true
            });
            
            await interaction.reply({
                embeds: [TicketEmbeds.successEmbed(
                    'User Added',
                    `${userToAdd} has been added to the ticket by ${interaction.user}`
                )]
            });
            
            // Log action
            await TicketUtils.logTicketAction(
                interaction.guild,
                'User Added',
                ticket,
                interaction.user,
                { addedUser: userToAdd.tag }
            );
            
        } catch (error) {
            console.error('Error in add command:', error);
            await interaction.reply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                ephemeral: true
            });
        }
    }
};