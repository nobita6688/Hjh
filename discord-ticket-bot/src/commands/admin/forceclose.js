const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketUtils = require('../../utils/ticketUtils');
const TicketEmbeds = require('../../utils/embedBuilder');
const config = require('../../../config/config');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceclose')
        .setDescription('Force close a ticket')
        .addStringOption(option =>
            option.setName('ticket_id')
                .setDescription('The ticket ID to force close')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for force closing')
                .setRequired(false)
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
            
            const ticketId = interaction.options.getString('ticket_id');
            const reason = interaction.options.getString('reason') || 'Force closed by administrator';
            
            // Find ticket
            const ticket = await Ticket.findOne({ 
                ticketId: parseInt(ticketId), 
                guildId: interaction.guild.id,
                status: 'open'
            });
            
            if (!ticket) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed('Ticket not found or already closed!')],
                    ephemeral: true
                });
            }
            
            await interaction.deferReply({ ephemeral: true });
            
            // Get ticket channel
            const ticketChannel = interaction.guild.channels.cache.get(ticket.channelId);
            
            if (ticketChannel) {
                // Generate transcript
                const transcript = await createTranscript(ticketChannel, {
                    limit: -1,
                    filename: `ticket-${ticket.ticketId}-transcript.html`,
                    saveImages: true,
                    poweredBy: false
                });
                
                // Send transcript to logs channel
                if (config.transcriptsChannel) {
                    const transcriptsChannel = interaction.guild.channels.cache.get(config.transcriptsChannel);
                    if (transcriptsChannel) {
                        await transcriptsChannel.send({
                            embeds: [TicketEmbeds.transcriptEmbed(ticket, ticketChannel.messages.cache.size)],
                            files: [transcript]
                        });
                    }
                }
                
                // Delete channel
                await ticketChannel.delete();
            }
            
            // Update ticket status
            ticket.status = 'closed';
            ticket.closedBy = interaction.user.id;
            ticket.closedAt = new Date();
            await ticket.save();
            
            // Log action
            await TicketUtils.logTicketAction(
                interaction.guild,
                'Force Closed',
                ticket,
                interaction.user,
                { reason }
            );
            
            await interaction.editReply({
                embeds: [TicketEmbeds.successEmbed(
                    'Ticket Force Closed',
                    `Ticket #${ticketId} has been force closed.\n**Reason:** ${reason}`
                )]
            });
            
        } catch (error) {
            console.error('Error in forceclose command:', error);
            await interaction.editReply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)]
            });
        }
    }
};