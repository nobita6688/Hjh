const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketEmbeds = require('../../utils/embedBuilder');
const TicketUtils = require('../../utils/ticketUtils');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View ticket statistics'),
    
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
            
            // Get statistics
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const stats = {
                total: await Ticket.countDocuments({ guildId: interaction.guild.id }),
                open: await Ticket.countDocuments({ guildId: interaction.guild.id, status: 'open' }),
                closed: await Ticket.countDocuments({ guildId: interaction.guild.id, status: 'closed' }),
                today: await Ticket.countDocuments({ 
                    guildId: interaction.guild.id, 
                    createdAt: { $gte: today } 
                }),
                thisWeek: await Ticket.countDocuments({ 
                    guildId: interaction.guild.id, 
                    createdAt: { $gte: thisWeek } 
                }),
                thisMonth: await Ticket.countDocuments({ 
                    guildId: interaction.guild.id, 
                    createdAt: { $gte: thisMonth } 
                })
            };
            
            await interaction.editReply({
                embeds: [TicketEmbeds.statsEmbed(stats)]
            });
            
        } catch (error) {
            console.error('Error in stats command:', error);
            await interaction.editReply({
                embeds: [TicketEmbeds.errorEmbed(config.messages.errorOccurred)]
            });
        }
    }
};