// Initialize an array to store places
let places = JSON.parse(localStorage.getItem('places')) || [];

const form = document.getElementById('place-form');
const captureLocationBtn = document.getElementById('capture-location');
const locationStatus = document.getElementById('location-status');
const savedPlacesDiv = document.getElementById('saved-places');
const downloadJsonBtn = document.getElementById('download-json');

let currentLat = null;
let currentLng = null;

// Function to update the saved places display
function updateSavedPlaces() {
    savedPlacesDiv.innerHTML = '';

    places.forEach((place, index) => {
        const placeDiv = document.createElement('div');
        placeDiv.className = 'saved-place';

        const placeHTML = `
            <h3>${place.name}</h3>
            <p>${place.info}</p>
            <p>Lat: ${place.lat}, Lng: ${place.lng}</p>
            <button data-index="${index}" class="delete-place">Delete</button>
        `;

        placeDiv.innerHTML = placeHTML;
        savedPlacesDiv.appendChild(placeDiv);
    });

    // Attach delete event listeners
    document.querySelectorAll('.delete-place').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            places.splice(index, 1);
            saveToLocalStorage();
            updateSavedPlaces();
        });
    });
}

// Function to save places to local storage
function saveToLocalStorage() {
    localStorage.setItem('places', JSON.stringify(places));
}

// Capture location
captureLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                locationStatus.textContent = `Location: Lat ${currentLat.toFixed(5)}, Lng ${currentLng.toFixed(5)}`;
            },
            (error) => {
                console.error('Error capturing location:', error);
                alert('Unable to capture location. Please ensure location services are enabled.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Handle form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('place-name').value.trim();
    const info = document.getElementById('place-info').value.trim();

    if (currentLat === null || currentLng === null) {
        alert('Please capture your location first.');
        return;
    }

    const newPlace = {
        name,
        info,
        lat: currentLat,
        lng: currentLng
    };

    places.push(newPlace);
    saveToLocalStorage();
    updateSavedPlaces();

    // Reset the form
    form.reset();
    locationStatus.textContent = 'Location: Not captured yet';
    currentLat = null;
    currentLng = null;
});

// Download JSON file
downloadJsonBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(places, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'places.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Initial rendering of saved places
updateSavedPlaces();
