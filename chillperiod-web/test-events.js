async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:3000/api/events');
        const data = await response.json();
        console.log(`Found ${data.length} events!`);
        if (data.length > 0) {
            console.log(JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
fetchEvents();
