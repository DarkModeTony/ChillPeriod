import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Event from '../models/Event.js';

export const data = new SlashCommandBuilder()
    .setName('addevent')
    .setDescription('Add a new local event, college fest, or party to ChillPeriod!')
    .addStringOption(option =>
        option.setName('title')
            .setDescription('The name of the event')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('venue')
            .setDescription('Where is it happening?')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('date')
            .setDescription('When? (e.g. 2024-05-20)')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('category')
            .setDescription('What kind of event?')
            .setRequired(true)
            .addChoices(
                { name: 'Hackathon', value: 'Hackathon' },
                { name: 'Cultural Fest', value: 'Cultural Fest' },
                { name: 'Concert', value: 'Concert' },
                { name: 'Private Party', value: 'Party' },
                { name: 'Other', value: 'Other' }
            ))
    .addStringOption(option =>
        option.setName('link')
            .setDescription('Booking or Registration Link')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const title = interaction.options.getString('title');
        const venue = interaction.options.getString('venue');
        const dateStr = interaction.options.getString('date');
        const category = interaction.options.getString('category');
        const link = interaction.options.getString('link');

        // Simple date validation
        const eventDate = new Date(dateStr);
        if (isNaN(eventDate.getTime())) {
             return await interaction.editReply({
                content: '❌ Invalid date format. Please use YYYY-MM-DD (e.g. 2024-05-20)',
                ephemeral: true
             });
        }

        // We could post directly to DB or call our Web API. Calling Web API is safer to keep logic centralized
        const newEvent = new Event({
            title,
            venue,
            date: eventDate,
            category,
            bookingUrl: link || '',
            source: 'Community',
            addedBy: {
                discordId: interaction.user.id,
                username: interaction.user.username
            }
        });

        await newEvent.save();

        const embed = new EmbedBuilder()
            .setTitle('🎉 Event Added Successfully!')
            .setDescription(`**${title}** has been added to the ChillPeriod Explore page.`)
            .setColor('#10b981')
            .addFields(
                { name: 'Category', value: category, inline: true },
                { name: 'Date', value: eventDate.toLocaleDateString(), inline: true },
                { name: 'Venue', value: venue, inline: true }
            );

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Error adding event:', error);
        await interaction.editReply({
            content: 'Sorry, there was an error saving your event. Ensure the database is connected.',
            ephemeral: true
        });
    }
}
