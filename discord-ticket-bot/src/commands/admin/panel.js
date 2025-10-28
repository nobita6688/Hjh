const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const TicketEmbeds = require('../../utils/embedBuilder');
const TicketUtils = require('../../utils/ticketUtils');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Create a ticket panel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the panel in')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    
    async execute(interaction) {
        try {
            // Check admin permissions
            if (!TicketUtils.hasAdminRole(interaction.member) && !interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.noPermission)],
                    ephemeral: true
                });
            }
            
            const channel = interaction.options.getChannel('channel');
            
            // Create panel embed
            const panelEmbed = TicketEmbeds.infoEmbed(
                '🎫 Support Ticket System',
                'Welcome to our support system! Click the button below to create a new support ticket.\n\n**Before creating a ticket:**\n• Check our FAQ and documentation\n• Make sure you have all necessary information ready\n• Be clear and detailed in your description\n\n**Available Support Types:**',
                config.ticketTypes.map(type => ({
                    name: `${type.emoji} ${type.label}`,
                    value: type.description,
                    inline: false
                }))
            );
            
            // Create button
            const button = new ButtonBuilder()
                .setCustomId('create_ticket_panel')
                .setLabel('Create Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary);
            
            const row = new ActionRowBuilder().addComponents(button);
            
            // Send panel
            await channel.send({
                embeds: [panelEmbed],
                components: [row]
            });
            
            await interaction.reply({
                embeds: [TicketEmbeds.successEmbed('Panel Created', `Ticket panel has been created in ${channel}`)],
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Error in panel command:', error);
            await interaction.reply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                ephemeral: true
            });
        }
    }
};