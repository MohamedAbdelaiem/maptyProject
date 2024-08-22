'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const Reset=document.querySelector('.reset');
const Sort=document.querySelector('.sort');
const check=document.querySelector('.check');

let map;
let mapE;
let orig=[];

class work_out {
  constructor(coords, distance, duration) {
    this.date = new Date();
    this.id = (Date.now() + '').slice(-10);
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration;
    this.clicks = 0;
  }
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}

let w = new work_out();

class running extends work_out {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = 'running';
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class cycling extends work_out {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts;
  #sorted;

  constructor() {
    this.#workouts = [];
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    Reset.addEventListener('click',this.reset);
    Sort.addEventListener('click',this.sort.bind(this));
    this.#sorted=false;



    this._getLocalStorage();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      ); //get current poistion of the user
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
        this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#mapEvent =
      //event created by leaflet
      this.#map.on('click', this._showForm.bind(this));

    this._renderWorkoutMarker(this.#workouts);
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    inputDistance.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        if (inputType.value === 'running') {
          inputCadence.focus();
        } else {
          inputElevation.focus();
        }
      }
    });

    inputDuration.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowRight') {
        if (inputType.value === 'running') {
          inputCadence.focus();
        } else {
          inputElevation.focus();
        }
      }
    });

    inputCadence.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowUp') {
        inputDistance.focus();
      }
    });

    inputElevation.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowLeft') {
        inputDuration.focus();
      }
    });

    inputElevation.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowUp') {
        inputDistance.focus();
      }
    });

    inputDuration.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowUp') {
        inputType.focus();
      }
    });

    inputCadence.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowLeft') {
        inputDuration.focus();
      }
    });

    inputElevation.addEventListener('keydown', function (e) {
      if (e.key == 'ArrowLeft') {
        inputCadence.focus();
      }
    });

    inputDistance.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        inputType.focus();
      }
    });
  }

  _hideform() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validinputs = function (...inputs) {
      return inputs.every(inp => {
        return Number.isFinite(inp) && inp > 0;
      });
    };
    e.preventDefault();
    let type = inputType.value;
    let distance = +inputDistance.value;
    let duration = +inputDuration.value;
    let cadence = +inputCadence.value;
    let elevation = +inputElevation.value;

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    if (type === 'running') {
      let workout = new running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      let workout = new cycling([lat, lng], distance, duration, elevation);
    }
    if (type === 'running') {
      if (!validinputs(distance, duration, cadence)) {
        alert('Enter a valid number');
        return;
      }
      workout = new running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }
    if (type === 'cycling') {
      if (!validinputs(distance, duration, elevation)) {
        alert('Enter a valid number');
        return;
      }
      workout = new cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
    }
    this._renderWorkoutMarker(this.#workouts);
    this._renderWorkOut(workout);
    this._hideform();
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    workout.forEach(marker => {
      L.marker(marker.coords) //create the marker
        .addTo(this.#map) //add
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${marker.type}-popup`,
          })
        ) //message
        .setPopupContent(
          `${marker.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${marker.description}`
        )
        .openPopup();
    });
  }

  _renderWorkOut(work_out) {
    let html = `<li class="workout workout--${work_out.type}"  data-id= "${
      work_out.id
    }">
          <h2 class="workout__title">${work_out.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              work_out.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${work_out.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${work_out.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `;

    if (work_out.type === 'running') {
      html += `<div class="workout__details ">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${work_out.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶</span>
          <span class="workout__value">${work_out.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`;
    }
    if (work_out.type === 'cycling') {
      html += `<div class="workout__details ">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${work_out.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${work_out.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // workout.click();
    console.log(workout);
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts)); //in the browser
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts')); //get items from local
    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkOut(work);
    });
  }

  reset(e){
    e.preventDefault();
    localStorage.removeItem('workouts');
    location.reload();
  }

  sort(e) {
    e.preventDefault();

    // Toggle sorting flag
    this.#sorted = !this.#sorted;

    // If sorted, sort workouts by distance; otherwise, restore original order
    if (this.#sorted) {
      check.textContent='✅'
        orig = [...this.#workouts];  // Keep a copy of the original order
        this.#workouts.sort((a, b) => a.distance - b.distance);
    } else {
        check.textContent='❌'
        this.#workouts = [...orig];
    }

    // Clear existing workouts from the UI
    // containerWorkouts.innerHTML = '';

    // Re-render workouts in the current order
    this.#workouts.forEach(work => {
        this._renderWorkOut(work);
    });

    // Update markers on the map
    this.#map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            this.#map.removeLayer(layer);
        }
    });
    this._renderWorkoutMarker(this.#workouts);

    // Update localStorage with the new order
    this._setLocalStorage();
}

}

//Leaf let
const app = new App();
