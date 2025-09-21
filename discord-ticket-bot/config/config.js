module.exports = {
    // Ticket Settings
    ticketCategory: 'TICKETS', // Category name where tickets will be created
    ticketPrefix: 'ticket-',
    maxTicketsPerUser: 3,
    
    // Staff Roles (add role IDs)
    staffRoles: [
        // 'ROLE_ID_1',
        // 'ROLE_ID_2'
    ],
    
    // Admin Roles
    adminRoles: [
        // 'ADMIN_ROLE_ID'
    ],
    
    // Ticket Types
    ticketTypes: [
        {
            label: '🔧 Technical Support',
            value: 'technical',
            description: 'Server issues, technical problems',
            emoji: '🔧'
        },
        {
            label: '💰 Billing Support',
            value: 'billing',
            description: 'Payment, invoices, billing issues',
            emoji: '💰'
        },
        {
            label: '🛒 Sales Inquiry',
            value: 'sales',
            description: 'Pre-sales questions, pricing',
            emoji: '🛒'
        },
        {
            label: '🚨 Abuse Report',
            value: 'abuse',
            description: 'Report abuse or violations',
            emoji: '🚨'
        },
        {
            label: '📋 General Support',
            value: 'general',
            description: 'Other questions and support',
            emoji: '📋'
        }
    ],
    
    // Priorities
    priorities: [
        { name: 'Low', emoji: '🟢', color: '#00ff00' },
        { name: 'Medium', emoji: '🟡', color: '#ffff00' },
        { name: 'High', emoji: '🟠', color: '#ff8800' },
        { name: 'Urgent', emoji: '🔴', color: '#ff0000' }
    ],
    
    // Colors
    colors: {
        primary: '#5865F2',
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#00bfff'
    },
    
    // Messages
    messages: {
        ticketCreated: '✅ Your ticket has been created!',
        ticketClosed: '🔒 This ticket has been closed.',
        ticketDeleted: '🗑️ This ticket will be deleted in 5 seconds.',
        noPermission: '❌ You do not have permission to use this command!',
        maxTicketsReached: '❌ You have reached the maximum number of open tickets!',
        ticketAlreadyClosed: '❌ This ticket is already closed!',
        notInTicket: '❌ This command can only be used in a ticket channel!',
        userNotFound: '❌ User not found!',
        errorOccurred: '❌ An error occurred. Please try again later.'
    },
    
    // Logs Channel
    logsChannel: null, // Set channel ID for logs
    transcriptsChannel: null // Set channel ID for transcripts
};