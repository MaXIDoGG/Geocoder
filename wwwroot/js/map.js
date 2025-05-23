let myMap;
ymaps.ready(init);
function init() {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    });
    loadPoints();
}

const geocodeForm = document.getElementById('geocodeForm')
let pointsList = document.getElementById('points')
geocodeForm.addEventListener('submit', handleFormSubmit)

const markers = [];

async function deletePoint(id) {
    try {
        await fetch(`/api/MapPoints/${id}`, { method: 'DELETE' });

        const index = markers.findIndex(m => m.id === id);
        if (index === -1) return;

        myMap.geoObjects.remove(markers[index].ymapPoint);

        markers.splice(index, 1);

        rebuildPointsList();
    } catch (error) {
        console.error('Error deleting point:', error);
    }
}

async function loadPoints() {
    try {
        const response = await fetch('/api/MapPoints');
        const points = await response.json();

        markers.forEach(marker => {
            myMap.geoObjects.remove(marker.ymapPoint);
        });
        markers.length = 0;

        points.forEach(point => {
            const ymapPoint = new ymaps.Placemark(
                [point.latitude, point.longitude],
                { name: point.name },
                { preset: 'islands#blueDotIcon' }
            );

            markers.push({
                id: point.id,
                ymapPoint: ymapPoint
            });

            myMap.geoObjects.add(ymapPoint);
        });

        rebuildPointsList();
    } catch (error) {
        console.error('Error loading points:', error);
    }
}

function rebuildPointsList() {
    const header = pointsList.querySelector('.disabled');
    pointsList.innerHTML = '';
    pointsList.appendChild(header);

    markers.forEach(marker => {
        const name = marker.ymapPoint.properties.get('name');
        const coords = marker.ymapPoint.geometry.getCoordinates();

        const pointLi = document.createElement('li');
        pointLi.className = 'list-group-item d-flex justify-content-between align-items-center';

        pointLi.innerHTML = `
            ${name} (${coords})
            <button class="btn-close" aria-label="Удалить"></button>
        `;
        pointLi.querySelector('.btn-close').addEventListener('click', () => deletePoint(marker.id));
        pointsList.appendChild(pointLi);
    });
}

async function addPoint(point) {
    const name = point.properties.get('name');
    const coords = point.geometry.getCoordinates();
    point.properties.set('iconContent', name);
    const result = confirm(`Поставить точку "${name}"?`);

    if (result) {
        try {
            const response = await fetch('/api/MapPoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    latitude: coords[0],
                    longitude: coords[1]
                })
            });

            const savedPoint = await response.json();

            const ymapPoint = new ymaps.Placemark(
                coords,
                { name: name },
                { preset: 'islands#blueDotIcon' }
            );

            markers.push({
                id: savedPoint.id,
                ymapPoint: ymapPoint
            });

            myMap.geoObjects.add(ymapPoint);
            rebuildPointsList();
        } catch (error) {
            console.error('Error adding point:', error);
        }
    }
}

function handleFormSubmit(event) {
    event.preventDefault()
    const formData = new FormData(geocodeForm);
    const address = formData.get('address');
    const myGeocoder = ymaps.geocode(address);
    myGeocoder.then(function (res) {
        const nearest = res.geoObjects.get(0);
        addPoint(nearest)
    });
}