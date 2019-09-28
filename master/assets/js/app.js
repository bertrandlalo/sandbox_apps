let element = document.body;
let io = new IO();
let siblings_launcher = document.querySelector("input[name=siblings-launcher]");

let n_families = 3;
//let candidate_frequencies = Array(2.5, 4, 5, 6, 7);
let candidate_frequencies = Array(4);


function random_draw(array, k = n_families) {
    let output = array;
    shuffle(output);
    return output.slice(k);
}

function random_pick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

let players = [];

siblings_launcher.addEventListener('change', function () {
    if (this.checked) {
        // Checkbox is checked..
        console.log('Checkbox is checked..')
        selected_frequencies = random_draw(candidate_frequencies, n_families);
        players.forEach(function (element) {
            console.log(element);
            element['frequency'] = random_pick(selected_frequencies);
        });
        io.event('master_launches', JSON.stringify(players));
    } else {
        // Checkbox is not checked..
        console.log('Checkbox is not checked..');
        io.event('master_stops');
    }
});

// document.getElementById("player-registration-form").submit();


function addPlayer(new_player) {

    let ul = document.getElementById("list-players");
    var li = document.createElement("li");
    li.setAttribute('id', 'li-' + new_player.uuid);
    li.appendChild(document.createTextNode(new_player.name));
    ul.appendChild(li);
    players.push({'uuid': new_player.uuid, 'name': new_player.name});
    console.log(players)
}

io.on('connect', () => {
    console.log('Master is connected ! ');
    io.subscribe('events');
    console.log('io subscribes to events')
});


function on_start() {
    console.log('on_start');
    // io.event('player_connects', {'uuid': io.uuid});
    // io.commit('events', {label: 'stim_begins', data: {rate: rate, duration: duration}});
}

function on_tick(time_scheduled, time_called, ellapsed_inter, fps) {
    // console.log('on_tick');

}

function on_stop() {

}


//
io.on('disconnect', () => {
    console.log('diconnected')
});
// io.on('message', (message) => { console.log(message) });
io.on('events', (event) => {
    temp = event;
    console.log(event)
    // Get last row of data
    let keys = Object.keys(event);
    console.log(keys);
    // let row = data[keys[keys.length - 1]];
    // // Set color
    for (let event_id in event) {
        event_label = event[event_id].label;
        event_data = JSON.parse(event[event_id].data);
        if (event_label == 'player_submits_registration') {
            addPlayer(event_data)
        }
        if (event_label == 'player_submits_evaluation') {
            document.getElementById('li-' + event_data.uuid).style.color = '#2196F3';
        }
    }
});

// dispatcher.on('player_submits_registration', () => {
//     console.log('supposed to create p ')
//     var para = document.createElement("p");
//     para.innerHTML = event.data.name + " in da game!  ";
//     document.getElementById("screen_waiting").appendChild(para);
//     // instructions.innerHTML = 'Please keep your eyes <b>open</b> and try not to move.';
// });

let scheduler = new Scheduler(10, 600000);
scheduler.on('start', on_start);
scheduler.on('tick', on_tick);
scheduler.on('stop', on_stop);