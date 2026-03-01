async function testImportValidation() {
  const payload = {
    spots: [
      {
        name: 'Test Cafe',
        description: 'A test cafe',
        category: 'cafe',
        vibe: 'social',
        budget: 'cheap',
        distance: 100, // Number instead of string
        address: '123 Test St',
        lat: 28.6,
        lng: 77.2,
      }
    ],
    college: 'BPIT'
  };

  try {
    const res = await fetch('http://localhost:3000/api/spots/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Raw Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testImportValidation();
