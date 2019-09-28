let element = document.body;
let io = new IO();

let screen_registration = document.getElementById('registration');
let screen_exercise_siblings = document.getElementById('exercise-siblings-ball');
let screen_evaluation = document.getElementById('evaluation-siblings-ball');
let screen_waiting = document.getElementById('waiting-room');
let screen_exercise_decision = document.getElementById('exercise-decision-making');


let sibling_choices = document.getElementById("sibling-choices");

let my_frequencies = [];
let ball = document.getElementById("siblings-ball");
//let ball_direction = -1;
//let ball_factor = 1;
let max_ball_width = 90;
//let ellapsed_cycle = 0;
// ball.style.opacity = ball_opacity;

let scheduler = new Scheduler(0, 200000);

function on_start() {
    console.log('on_start');
    ball.style.width = String(ball_width) + "%";
}

function on_tick(time_scheduled, time_called, ellapsed_inter, fps) {
//    console.log(time_scheduled)
//    console.log(time_called)

//    let frequency = my_frequencies[0];
    let frequency = 5;

    console.log(frequency)
    ball_width = max_ball_width*(1 + Math.sin(2* Math.PI/frequency*time_scheduled/1000))/2
    ball.style.width = String(ball_width) + "%";
//    ellapsed_cycle += ellapsed_inter / 1000;
//    ball_width += ball_direction * ellapsed_inter / 1000 / frequency * 100 ;
    // ball_width = Math.abs(ball_width % 100)
//    ball_width = Math.min(Math.max(ball_width, 0), 100);
//    // console.log(ball_width);
//    if (ball_width >= 100 || ball_width <= 0){
//        // ellapsed_cycle = 0;
//        ball_direction *= -1;
//    }
//        ball.style.width = String(ball_width) + "%";

}

function on_stop() {
}


function siblings_exercise() {
    console.log("siblings exercise");
    // scheduler.on('start', on_start);
    scheduler.on('tick', on_tick);
    scheduler.start();
    // scheduler.on('stop', on_stop);
}

function set_players_checkbox(player) {
    // creating checkbox element
    let checkbox = document.createElement('input');

    // Assigning the attributes
    // to created checkbox
    checkbox.type = "checkbox";
    checkbox.name = "checkbox-siblings";
    checkbox.value = player.uuid;
    checkbox.id = "checkbox-" + player.uuid;

    // creating label for checkbox
    var label = document.createElement('label');

    // assigning attributes for
    // the created label tag
    label.htmlFor = "id";

    // appending the created text to
    // the created label tag
    label.appendChild(document.createTextNode(player.name));

    // appending the checkbox
    // and label to div
    sibling_choices.appendChild(checkbox);
    sibling_choices.appendChild(label);
}

function on_submit_registration(event) {
    event.preventDefault();
    let player_name = document.getElementById('player-name').value;
    console.log(player_name + ' is registered! ');
    io.event('player_submits_registration', {'uuid': io.uuid, 'name': player_name});
    // When the form has been submitted, hide registration and show waiting page
    let welcome_message = document.getElementById("welcome-message");
    welcome_message.innerHTML = "Welcome <br> in the game <br> " + player_name + " &#128579;";
    // screen_waiting.appendChild(para);
    screen_registration.style.display = "none";
    screen_waiting.style.display = "block";
    return false
}

function on_submit_siblings(event) {
    event.preventDefault();
    let player_answer = [];
    document.getElementsByName('checkbox-siblings').forEach(
        element => {
            if (element.checked) {
                player_answer.push(element.value)
            }
        });
    console.log(player_answer);
    io.event('player_submits_evaluation', {'uuid': io.uuid, 'answer': player_answer});
    screen_evaluation.style.display = "none";
    screen_exercise_decision.style.display = "block";
    return false;
}

document.getElementById('submit-registration-form').addEventListener('click', on_submit_registration);
document.getElementById('submit-siblings').addEventListener('click', on_submit_siblings);

// document.getElementById("player-registration-form").submit();


io.on('connect', () => {

    console.log('New connection ! ');
    io.subscribe('events');
    console.log('io subscribes to events')
    io.event('player_connects', {'uuid': io.uuid});
    screen_registration.style.display = "block";

    // scheduler.start()
    // return false;
});


// 0. New connection
// 1. Display info form and send an event
// 2. Hide page registration and show page waiting
// 3. Subscribe to stream event with 'on'
// 3.a When getting the START from Game-Master, look for your uuid and launch
// breath with the right rate
// 3.b When getting the STOP from Game master, hide exercice page and show evaluation page


var temp = null
//
io.on('disconnect', () => {
    console.log('disconnected')
});

// io.on('message', (message) => { console.log(message) });
io.on('events', (event) => {
    // Get last row of data
    let keys = Object.keys(event);
    console.log(keys);
    for (let event_id in event) {
        event_label = event[event_id].label;
        event_data = JSON.parse(event[event_id].data);
        if (event_label == 'master_launches') {
            console.log('Master has launched');
            let players = JSON.parse(event_data);
            players.forEach(function (element) {
                if (element.uuid !== io.uuid) {
                    set_players_checkbox(element)
                } else {
                    my_frequencies.unshift(element.frequency)
                }
            });
            screen_waiting.style.display = "none";
            screen_exercise_siblings.style.display = "block";
            siblings_exercise()
        }
        if (event_label == 'master_stops') {
            console.log('Master has stoped');
            screen_exercise_siblings.style.display = "none";
            screen_evaluation.style.display = "block";
        }
    }
});

