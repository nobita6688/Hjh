const { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../models/Ticket');
const TicketUtils = require('../utils/ticketUtils');
const TicketEmbeds = require('../utils/embedBuilder');
const config = require('../../config/config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) return;
            
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                
                const errorMessage = {
                    embeds: [TicketEmbeds.errorEmbed('There was an error executing this command!')],
                    ephemeral: true
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        
        // Handle button interactions
        if (interaction.isButton()) {
            // Panel ticket creation
            if (interaction.customId === 'create_ticket_panel') {
                // Check if user has reached max tickets
                const userTickets = await TicketUtils.getUserOpenTickets(interaction.user.id, interaction.guild.id);
                
                if (userTickets.length >= config.maxTicketsPerUser) {
                    return interaction.reply({
                        embeds: [TicketEmbeds.errorEmbed(config.messages.maxTicketsReached)],
                        ephemeral: true
                    });
                }
                
                // Show ticket type selection
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('panel_ticket_type')
                    .setPlaceholder('Select ticket type')
                    .addOptions(config.ticketTypes.map(type => ({
                        label: type.label,
                        value: type.value,
                        description: type.description,
                        emoji: type.emoji
                    })));
                
                const row = new ActionRowBuilder().addComponents(selectMenu);
                
                await interaction.reply({
                    embeds: [TicketEmbeds.infoEmbed(
                        '🎫 Create Support Ticket',
                        'Please select the type of support you need from the dropdown menu below.'
                    )],
                    components: [row],
                    ephemeral: true
                });
            }
            
            // Claim ticket
            if (interaction.customId === 'claim_ticket') {
                const ticket = await TicketUtils.isTicketChannel(interaction.channel.id);
                
                if (!ticket) return;
                
                if (!TicketUtils.hasStaffRole(interaction.member)) {
                    return interaction.reply({
                        embeds: [TicketEmbeds.errorEmbed('Only staff members can claim tickets!')],
                        ephemeral: true
                    });
                }
                
                if (ticket.claimedBy) {
                    return interaction.reply({
                        embeds: [TicketEmbeds.errorEmbed(`This ticket is already claimed by <@${ticket.claimedBy}>!`)],
                        ephemeral: true
                    });
                }
                
                ticket.claimedBy = interaction.user.id;
                ticket.claimedAt = new Date();
                await ticket.save();
                
                await interaction.reply({
                    embeds: [TicketEmbeds.successEmbed(
                        'Ticket Claimed',
                        `This ticket has been claimed by ${interaction.user}`
                    )]
                });
                
                await TicketUtils.logTicketAction(
                    interaction.guild,
                    'Claimed',
                    ticket,
                    interaction.user
                );
            }
            
            // Close ticket button
            if (interaction.customId === 'close_ticket') {
                const ticket = await TicketUtils.isTicketChannel(interaction.channel.id);
                
                if (!ticket) return;
                
                // Execute close command logic
                const closeCommand = interaction.client.commands.get('close');
                if (closeCommand) {
                    // Create a mock interaction for the close command
                    interaction.commandName = 'close';
                    interaction.options = {
                        getString: () => null
                    };
                    await closeCommand.execute(interaction);
                }
            }
        }
        
        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'panel_ticket_type') {
                await interaction.deferUpdate();
                
                const ticketType = interaction.values[0];
                const ticketId = await TicketUtils.getNextTicketId(interaction.guild.id);
                
                try {
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
                    
                    // Send welcome message
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
                    
                    await interaction.editReply({
                        embeds: [TicketEmbeds.ticketCreatedEmbed(ticketChannel, interaction.user)],
                        components: []
                    });
                    
                    await TicketUtils.logTicketAction(
                        interaction.guild,
                        'Created',
                        ticket,
                        interaction.user
                    );
                } catch (error) {
                    console.error('Error creating ticket from panel:', error);
                    await interaction.editReply({
                        embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)],
                        components: []
                    });
                }
            }
        }
    }
};