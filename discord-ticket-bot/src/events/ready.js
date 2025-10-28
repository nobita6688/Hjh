module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} is online!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);
        
        // Set bot activity
        const activities = [
            { name: 'Support Tickets', type: 3 }, // Watching
            { name: '/ticket for help', type: 2 }, // Listening
            { name: `${client.guilds.cache.size} servers`, type: 5 } // Competing
        ];
        
        let activityIndex = 0;
        
        // Change activity every 30 seconds
        setInterval(() => {
            const activity = activities[activityIndex];
            client.user.setActivity(activity.name, { type: activity.type });
            activityIndex = (activityIndex + 1) % activities.length;
        }, 30000);
        
        // Set initial activity
        client.user.setActivity(activities[0].name, { type: activities[0].type });
    }
};