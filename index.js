let deviceHeading = 0; // Store the device's current heading

// Handle device orientation
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        if (event.webkitCompassHeading !== undefined) {
            deviceHeading = event.webkitCompassHeading; // iOS-specific
        } else if (event.alpha !== null) {
            deviceHeading = 360 - event.alpha; // Normalize for Android (reverse direction)
        }
    });
} else {
    console.warn('DeviceOrientationEvent is not supported on this device.');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// GPS-based bearing calculation
function calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const λ1 = lon1 * (Math.PI / 180);
    const λ2 = lon2 * (Math.PI / 180);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

    const θ = Math.atan2(y, x);
    return (θ * (180 / Math.PI) + 360) % 360; // Bearing in degrees
}

function formatDistanceWithTime(distanceInMeters) {
    const walkingSpeedMetersPerMinute = 83.33; // Average walking speed in meters per minute
    const walkingTimeMinutes = distanceInMeters / walkingSpeedMetersPerMinute;

    const distanceText = distanceInMeters < 1000
        ? `${distanceInMeters.toFixed(1)} meters`
        : `${(distanceInMeters / 1000).toFixed(2)} kilometers`;

    const hours = Math.floor(walkingTimeMinutes / 60);
    const minutes = Math.round(walkingTimeMinutes % 60);

    let timeText = '';
    if (walkingTimeMinutes < 1) {
        timeText = "Less than 1 min walk";
    } else {
        if (hours > 0) {
            timeText += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        timeText += `${minutes} min walk`;
    }

    return `${distanceText} (${timeText})`;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Create and rotate the arrow based on bearing and device heading
function createArrowElement(bearing) {
    const arrow = document.createElement('img');
    arrow.src = 'assets/images/arrow.svg';
    arrow.alt = 'Direction Arrow';
    arrow.className = 'arrow';

    const adjustedBearing = (bearing - deviceHeading + 360) % 360; // Adjust for device heading
    arrow.style.transform = `rotate(${adjustedBearing}deg)`;
    return arrow;
}

// Update the list of places and calculate bearings
function updatePlaces(userLat, userLng) {
    const placesDiv = document.getElementById('places');
    placesDiv.innerHTML = '';

    const sortedPlaces = places.map(place => {
        const distance = calculateDistance(userLat, userLng, place.lat, place.lng);
        return { ...place, distance };
    }).sort((a, b) => a.distance - b.distance);

    let nearestPlace = null;

    sortedPlaces.forEach(place => {
        const bearing = calculateBearing(userLat, userLng, place.lat, place.lng);
        const adjustedBearing = (bearing - deviceHeading + 360) % 360;

        const placeDiv = document.createElement('div');
        placeDiv.className = 'place';

        const arrow = createArrowElement(adjustedBearing);
        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = `
                <h3>${place.name}</h3>
                <p class="distance">${formatDistanceWithTime(place.distance)}</p>
            `;

        placeDiv.appendChild(arrow);
        placeDiv.appendChild(details);
        placesDiv.appendChild(placeDiv);

        if (place.distance < (nearestPlace?.distance || Infinity)) {
            nearestPlace = { ...place, bearing: adjustedBearing };
        }
    });

    updateInfoPanel(nearestPlace);
}

function updateInfoPanel(nearestPlace) {
    const infoDiv = document.getElementById('info');
    const distanceContainer = document.getElementById('nearest-distance');
    // distanceContainer.innerHTML = '';

    if (nearestPlace) {
        document.getElementById('nearest-name').innerHTML = `<h3>${nearestPlace.name}</h3>`;
        document.getElementById('nearest-distance').textContent = `${formatDistanceWithTime(nearestPlace.distance)}`;
        document.getElementById('nearest-img').innerHTML = `<img src="places/images/${nearestPlace.img}" alt="${nearestPlace.name}" />`;
        document.getElementById('nearest-info').innerText = `${nearestPlace.info}`;

        const nearestArrow = createArrowElement(nearestPlace.bearing);
        distanceContainer.prepend(nearestArrow);

        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
}

// Continuously update location
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Update places and recalculate directions
            updatePlaces(userLat, userLng);

            // Use GPS heading if available
            if (position.coords.heading !== null) {
                deviceHeading = position.coords.heading;
            }
        },
        (error) => {
            console.error('Error obtaining location:', error);
            // alert('Unable to retrieve your location. Please enable location services.');
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
    );
} else {
    alert('Geolocation is not supported by your browser.');
}


function textToSpeech() {
    let textToSpeak = document.getElementById('nearest-info').textContent;
    speechSynthesis.speak(new SpeechSynthesisUtterance(textToSpeak));
}

// Notify users to calibrate compass
//alert('If the direction is inaccurate, please calibrate your compass by moving your device in a figure-8 motion.');