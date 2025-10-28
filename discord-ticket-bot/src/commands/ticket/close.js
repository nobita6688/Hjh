const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketUtils = require('../../utils/ticketUtils');
const TicketEmbeds = require('../../utils/embedBuilder');
const config = require('../../../config/config');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for closing the ticket')
                .setRequired(false)
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
            
            // Check if ticket is already closed
            if (ticket.status === 'closed') {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.ticketAlreadyClosed)],
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
            
            const reason = interaction.options.getString('reason') || 'No reason provided';
            
            // Create confirmation buttons
            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close')
                        .setLabel('Confirm Close')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_close')
                        .setLabel('Cancel')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            const confirmEmbed = TicketEmbeds.infoEmbed(
                '⚠️ Confirm Ticket Closure',
                `Are you sure you want to close this ticket?\n\n**Reason:** ${reason}`,
                [
                    { name: 'Ticket ID', value: `#${ticket.ticketId}`, inline: true },
                    { name: 'Closed By', value: `${interaction.user}`, inline: true }
                ]
            );
            
            await interaction.reply({
                embeds: [confirmEmbed],
                components: [confirmRow]
            });
            
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => ['confirm_close', 'cancel_close'].includes(i.customId) && i.user.id === interaction.user.id,
                time: 30000
            });
            
            collector.on('collect', async i => {
                if (i.customId === 'confirm_close') {
                    await i.deferUpdate();
                    
                    // Generate transcript
                    const transcript = await createTranscript(interaction.channel, {
                        limit: -1,
                        filename: `ticket-${ticket.ticketId}-transcript.html`,
                        saveImages: true,
                        poweredBy: false
                    });
                    
                    // Send transcript to logs channel if configured
                    if (config.transcriptsChannel) {
                        const transcriptsChannel = interaction.guild.channels.cache.get(config.transcriptsChannel);
                        if (transcriptsChannel) {
                            await transcriptsChannel.send({
                                embeds: [TicketEmbeds.transcriptEmbed(ticket, interaction.channel.messages.cache.size)],
                                files: [transcript]
                            });
                        }
                    }
                    
                    // Update ticket status
                    ticket.status = 'closed';
                    ticket.closedBy = interaction.user.id;
                    ticket.closedAt = new Date();
                    await ticket.save();
                    
                    // Send closed message
                    await i.editReply({
                        embeds: [TicketEmbeds.ticketClosedEmbed(interaction.user, reason)],
                        components: []
                    });
                    
                    // Log ticket closure
                    await TicketUtils.logTicketAction(
                        interaction.guild,
                        'Closed',
                        ticket,
                        interaction.user,
                        { reason }
                    );
                    
                    // Delete channel after delay
                    setTimeout(async () => {
                        try {
                            await interaction.channel.delete();
                        } catch (error) {
                            console.error('Error deleting ticket channel:', error);
                        }
                    }, 10000);
                    
                } else if (i.customId === 'cancel_close') {
                    await i.update({
                        embeds: [TicketEmbeds.infoEmbed('❌ Cancelled', 'Ticket closure has been cancelled.')],
                        components: []
                    });
                }
                
                collector.stop();
            });
            
            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        embeds: [TicketEmbeds.errorEmbed('Ticket closure timed out.')],
                        components: []
                    });
                }
            });
            
        } catch (error) {
            console.error('Error in close command:', error);
            await interaction.reply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                ephemeral: true
            });
        }
    }
};