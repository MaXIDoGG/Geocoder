let myMap;
ymaps.ready(init);
function init() {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    });
}

const geocodeForm = document.getElementById('geocodeForm')
let pointsList = document.getElementById('points')
geocodeForm.addEventListener('submit', handleFormSubmit)

const markers = [];

function deletePoint(index) {
    myMap.geoObjects.remove(markers[index]);
    markers.splice(index, 1);
    rebuildPointsList();
}

function rebuildPointsList() {
    const header = pointsList.querySelector('.disabled');
    pointsList.innerHTML = '';
    pointsList.appendChild(header);

    markers.forEach((marker, index) => {
        const name = marker.properties.get('name');
        const coords = marker.geometry.getCoordinates();

        const pointLi = document.createElement('li');
        pointLi.className = 'list-group-item d-flex justify-content-between align-items-center';

        pointLi.innerHTML = `
            ${name} (${coords})
            <button class="btn-close" aria-label="Удалить"></button>
        `;

        pointLi.querySelector('.btn-close').addEventListener('click', () => deletePoint(index));
        pointsList.appendChild(pointLi);
    });
}

function addPoint(point) {
    const name = point.properties.get('name');
    point.properties.set('iconContent', name);
    const result = confirm(`Поставить точку "${name}"?`);

    if (result) {
        myMap.geoObjects.add(point);
        markers.push(point);
        rebuildPointsList();
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
