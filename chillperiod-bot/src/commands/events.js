import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Event from '../models/Event.js';

export const data = new SlashCommandBuilder()
    .setName('events')
    .setDescription('Find upcoming events, movies, and hackathons!')
    .addStringOption(option =>
        option.setName('category')
            .setDescription('Filter by event type')
            .setRequired(false)
            .addChoices(
                { name: 'Hackathons', value: 'Hackathon' },
                { name: 'Cultural Fests', value: 'Cultural Fest' },
                { name: 'Movies', value: 'Movie' },
                { name: 'Concerts', value: 'Concert' },
                { name: 'Parties', value: 'Party' }
            ));

export async function execute(interaction) {
    await interaction.deferReply();

    try {
        const category = interaction.options.getString('category');
        
        // Build API URL to utilize the same Aggregation Engine we built for the web app!
        // This ensures the bot also gets Unstop, Devfolio, and TMDB events automatically.
        const apiUrl = new URL('http://localhost:3000/api/events');
        if (category) {
            apiUrl.searchParams.append('category', category);
        }
        
        const response = await fetch(apiUrl.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch from Web API');
        }
        
        const events = await response.json();

        if (events.length === 0) {
            return await interaction.editReply({
                content: `No upcoming ${category ? category.toLowerCase() + 's' : 'events'} found. Use \`/addevent\` to add one!`,
                ephemeral: true
            });
        }

        const embedTitle = category ? `Upcoming ${category}s` : '🔥 Top Upcoming Events';
        
        const embed = new EmbedBuilder()
            .setTitle(embedTitle)
            .setDescription('Here is what\'s happening around you:')
            .setColor('#8b5cf6')
            .setTimestamp();

        // Take top 5 events
        const topEvents = events.slice(0, 5);

        for (const [index, event] of topEvents.entries()) {
            const dateStr = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // Add emoji based on category
            const icons = {
                'Hackathon': '💻', 'Cultural Fest': '🎭', 'Movie': '🍿', 'Concert': '🎤', 'Party': '🎉'
            };
            const icon = icons[event.category] || '📍';
            
            embed.addFields({
                name: `${index + 1}. ${icon} ${event.title}`,
                value: `**Date:** ${dateStr}\n**Location:** ${event.venue}\n**Price:** ${event.price || 'Free'}\n[Register/Book Here](${event.bookingUrl || 'https://chillperiod.app/explore'})`
            });
        }

        embed.setFooter({ text: 'Powered by ChillPeriod Explore • See more on the web app!' });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error fetching events:', error);
        await interaction.editReply({
            content: 'Sorry, there was an error fetching the events. The web server might be offline.',
            ephemeral: true
        });
    }
}
