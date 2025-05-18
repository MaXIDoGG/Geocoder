let myMap;
ymaps.ready(init);
function init(){
    // Создание карты.
    myMap = new ymaps.Map("map", {
        // воспользуйтесь инструментом Определение координат.
        center: [55.76, 37.64],
        zoom: 7
    });
}

const geocodeForm = document.getElementById('geocodeForm')
let points = document.getElementById('points')
geocodeForm.addEventListener('submit', handleFormSubmit)

function handleFormSubmit(event) {
    event.preventDefault()
    const formData = new FormData(geocodeForm);
    let address = formData.get('address');
    let myGeocoder = ymaps.geocode(address);
    myGeocoder.then(function (res) {
        let nearest = res.geoObjects.get(0);
        let name = nearest.properties.get('name');
        

        result = confirm(`Поставить точку "${name}" ?`);
        if (result) {
            nearest.properties.set('iconContent', name);
            nearest.options.set('preset', 'islands#redStretchyIcon');
            myMap.geoObjects.add(nearest);
            let li = document.createElement("li");
            li.classList.add("list-group-item");
            li.appendChild(document.createTextNode(`${name} (${nearest.geometry.getCoordinates()})`));
            let button = document.createElement("button");
            button.classList.add("btn-close");
            li.appendChild(button);
            points.appendChild(li);
        }
    });   
}