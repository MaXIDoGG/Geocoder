let myMap;
let pointsList;
const markers = [];
let editModal;
let currentEditIndex = -1;

ymaps.ready(init);

function init() {
    myMap = new ymaps.Map("map", {
        center: [55.030204, 82.92043],
        zoom: 7
    });

    pointsList = document.getElementById('points');
    const geocodeForm = document.getElementById('geocodeForm');
    geocodeForm.addEventListener('submit', handleFormSubmit);

    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedPoint);

    loadPointsFromDb();
}


async function loadPointsFromDb() {
    try {
        const response = await fetch('/MapPoints');
        if (response.ok) {
            const points = await response.json();
            points.forEach(point => {
                addMarkerFromDb(point);
            });
            rebuildPointsList();
        }
    } catch (error) {
        console.error('Error loading points:', error);
    }
}

function addMarkerFromDb(point) {
    const marker = new ymaps.Placemark(
        [point.latitude, point.longitude],
        {
            name: point.name,
            balloonContent: point.name
        },
        {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        }
    );

    markers.push({
        id: point.id,
        marker: marker,
        name: point.name
    });

    myMap.geoObjects.add(marker);
}

function rebuildPointsList() {
    const header = pointsList.querySelector('.disabled');
    pointsList.innerHTML = '';
    if (header) pointsList.appendChild(header);

    markers.forEach((point, index) => {
        const pointLi = document.createElement('li');
        pointLi.className = 'list-group-item d-flex justify-content-between align-items-center';

        pointLi.innerHTML = `
            ${point.name} (${point.marker.geometry.getCoordinates()})
            <span>
                <button class="btn btn-sm btn-outline-primary edit-btn me-2" aria-label="Редактировать">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-close me-2" aria-label="Удалить"></button>
            </span>
        `;

        pointLi.querySelector('.btn-close').addEventListener('click', () => deletePoint(index));
        pointLi.querySelector('.edit-btn').addEventListener('click', () => editPoint(index));
        pointsList.appendChild(pointLi);
    });
}

function editPoint(index) {
    currentEditIndex = index;
    const point = markers[index];

    // Заполняем форму редактирования текущими значениями
    document.getElementById('editName').value = point.name;
    const coords = point.marker.geometry.getCoordinates();
    document.getElementById('editLatitude').value = coords[0];
    document.getElementById('editLongitude').value = coords[1];

    // Показываем модальное окно
    editModal.show();
}

async function saveEditedPoint() {
    if (currentEditIndex === -1) return;

    const point = markers[currentEditIndex];
    const newName = document.getElementById('editName').value;
    const newLat = parseFloat(document.getElementById('editLatitude').value);
    const newLon = parseFloat(document.getElementById('editLongitude').value);

    if (!newName || isNaN(newLat) || isNaN(newLon)) {
        alert('Пожалуйста, введите корректные данные');
        return;
    }

    try {
        const updated = await updatePointInDb(point.id, newName, newLat, newLon);
        if (updated) {
            point.name = newName;
            point.marker.properties.set('name', newName);
            point.marker.properties.set('balloonContent', newName);
            point.marker.geometry.setCoordinates([newLat, newLon]);

            rebuildPointsList();
            editModal.hide();
        }
    } catch (error) {
        console.error('Error updating point:', error);
        alert('Ошибка при обновлении точки');
    }
}

async function updatePointInDb(id, name, lat, lon) {
    try {
        const mapPoint = {
            Id: id,
            Name: name,
            Latitude: lat,
            Longitude: lon
        };

        const response = await fetch('/MapPoints/Edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapPoint)
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error updating point:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


async function addPoint(ymapsPoint) {
    const name = ymapsPoint.properties.get('name');
    const result = confirm(`Поставить точку "${name}"?`);

    if (result) {
        const coords = ymapsPoint.geometry.getCoordinates();
        await myMap.panTo(coords)
        const savedPoint = await addPointToDb(name, coords[0], coords[1]);

        if (savedPoint) {
            createMarker(savedPoint.id, savedPoint.name, coords);
            rebuildPointsList();
        }
    }
}

function createMarker(id, name, coords) {
    const marker = new ymaps.Placemark(coords, {
        name: name,
        balloonContent: name
    }, {
        preset: 'islands#icon',
        iconColor: '#0095b6'
    });

    markers.push({ id, marker, name });
    myMap.geoObjects.add(marker);
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

async function addPointToDb(name, lat, lon) {
    try {
        const mapPoint = {
            Name: name,
            Latitude: lat,
            Longitude: lon
        };

        const response = await fetch('/MapPoints/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapPoint)
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error creating point:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function deletePoint(index) {
    const point = markers[index];
    try {
        const response = await fetch(`/MapPoints/Delete/${point.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            myMap.geoObjects.remove(point.marker);
            markers.splice(index, 1);
            rebuildPointsList();
        } else {
            console.error('Error deleting point:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
