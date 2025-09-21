const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketUtils = require('../../utils/ticketUtils');
const TicketEmbeds = require('../../utils/embedBuilder');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a new support ticket'),
    
    async execute(interaction) {
        try {
            // Check if user has reached max tickets
            const userTickets = await TicketUtils.getUserOpenTickets(interaction.user.id, interaction.guild.id);
            
            if (userTickets.length >= config.maxTicketsPerUser) {
                return interaction.reply({
                    embeds: [TicketEmbeds.errorEmbed(config.messages.maxTicketsReached)],
                    ephemeral: true
                });
            }
            
            // Create select menu for ticket type
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_type_select')
                .setPlaceholder('Select ticket type')
                .addOptions(config.ticketTypes.map(type => ({
                    label: type.label,
                    value: type.value,
                    description: type.description,
                    emoji: type.emoji
                })));
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            const embed = TicketEmbeds.infoEmbed(
                '🎫 Create Support Ticket',
                'Please select the type of support you need from the dropdown menu below.',
                [
                    { name: 'Your Open Tickets', value: `${userTickets.length}/${config.maxTicketsPerUser}`, inline: true }
                ]
            );
            
            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
            
            // Collector for select menu
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.customId === 'ticket_type_select' && i.user.id === interaction.user.id,
                time: 60000
            });
            
            collector.on('collect', async i => {
                try {
                    await i.deferUpdate();
                    
                    const ticketType = i.values[0];
                    const ticketId = await TicketUtils.getNextTicketId(interaction.guild.id);
                    
                    // Create ticket channel
                    const ticketChannel = await TicketUtils.createTicketChannel(
                        interaction.guild,
                        interaction.user,
                        ticketType,
                        ticketId
                    );
                    
                    // Create ticket in database
                    const ticket = await Ticket.create({
                        ticketId,
                        channelId: ticketChannel.id,
                        guildId: interaction.guild.id,
                        userId: interaction.user.id,
                        username: interaction.user.username,
                        ticketType,
                        status: 'open'
                    });
                    
                    // Send welcome message in ticket channel
                    const welcomeEmbed = TicketEmbeds.welcomeEmbed(interaction.user, ticketType, ticketId);
                    
                    const controlPanel = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                .setLabel('Close Ticket')
                                .setEmoji('🔒')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('claim_ticket')
                                .setLabel('Claim Ticket')
                                .setEmoji('🙋')
                                .setStyle(ButtonStyle.Primary)
                        );
                    
                    await ticketChannel.send({
                        content: `${interaction.user} | ${config.staffRoles.map(r => `<@&${r}>`).join(' ')}`,
                        embeds: [welcomeEmbed],
                        components: [controlPanel]
                    });
                    
                    // Update interaction
                    await i.editReply({
                        embeds: [TicketEmbeds.ticketCreatedEmbed(ticketChannel, interaction.user)],
                        components: []
                    });
                    
                    // Log ticket creation
                    await TicketUtils.logTicketAction(
                        interaction.guild,
                        'Created',
                        ticket,
                        interaction.user
                    );
                    
                    collector.stop();
                } catch (error) {
                    console.error('Error creating ticket:', error);
                    await i.editReply({
                        embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                        components: []
                    });
                }
            });
            
            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        embeds: [TicketEmbeds.errorEmbed('Ticket creation timed out.')],
                        components: []
                    });
                }
            });
            
        } catch (error) {
            console.error('Error in ticket command:', error);
            await interaction.reply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                ephemeral: true
            });
        }
    }
};