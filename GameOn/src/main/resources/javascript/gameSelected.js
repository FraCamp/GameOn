//
//  ------ PAGE INITIALIZATION ------
//

// Opens the web socket
initWebSocket(username);

// Registers the user in the list of online ones
waitForSocketConnection(ws, function(){
    let game;
    if(gameName === "connectFour") {
        game = 'connect_four';
    } else if(gameName === 'ticTacToe') {
        game = 'tic_tac_toe';
    }
    sendWebSocket(new Message("online_list_registration", game , username, null));
});

// FUNCTIONS

/**
 * Function that sends a game request to the user passed as parameter
 * @param to_username   username of the user we want to sent a game request to
 */
function sendGameRequest (to_username) // send a game request to this user
{
    if (to_username !== username) // If the user has not clicked on himself
    {
        sendWebSocket(new Message('game_request', gameName, username, to_username))
    }
}

/**
 * Function that sends a game request approval to the user passed as parameter
 * @param to_username   username of the user we want to accept the game request from
 */
function sendGameRequestAccepted (to_username) {
    sendWebSocket(new Message('game_request_accepted', gameName, username, to_username));
    // We need to wait some milliseconds, otherwise there can be some problems
    setTimeout
    (
        function () {
            if (gameName === "connectFour")
                goToConnectFourGame("red", to_username);
            else if (gameName === "ticTacToe")
            {
                goToTicTacToeGame(to_username, to_username);
            }
        }, 500
    );
}

/**
 * Override of the onMessage function written in webSocket.js
 * @param event     The event that leads to this handler
 */
ws.onmessage = function (event){
    var jsonString = JSON.parse(event.data);
    var sender = jsonString.sender;
    console.log("Message received");
    if (jsonString.type === 'game_request') // I have received a game request
    {
        // If the game request is not for the game I have selected there is an error, return
        if(jsonString.data !== gameName) return;

        // If I have already received a game request from this user, there is no need to show it
        let table = document.getElementById("gameRequests");
        for(let step = table.childNodes.length - 1; step > 1; step--) {
            let tr = table.childNodes.item(step);
            let td = tr.firstChild;
            if(td.textContent === sender) {
                return;
            }
        }

        // Otherwise, the game request is added to the list
        let tr = document.createElement("TR");

        let tdUsername = document.createElement("TD");
        tdUsername.textContent = sender;
        tr.appendChild(tdUsername);

        let button = document.createElement("BUTTON");
        button.textContent = "Accept";
        button.onclick = function() { sendGameRequestAccepted(sender); }

        let tdButton = document.createElement("TD");
        tdButton.appendChild(button);
        tr.appendChild(tdButton);

        table.appendChild(tr);
    }
    else if (jsonString.type === 'game_request_accepted')   // My opponent has accepted my game request
    {
        // If my opponent accepted a game request for a game that is not
        // the one I have selected there is an error, return
        if(jsonString.data !== gameName) return;

        // Otherwise, the game starts
        if (gameName === "connectFour")
            goToConnectFourGame("yellow", sender);
        else if (gameName === "ticTacToe")
        {
            goToTicTacToeGame(username, sender);
        }
    } else if(jsonString.type === 'list_update') // The list of online users has changed
    {
        let list = jsonString.data;

        let table = document.getElementById("online");

        // The old list has to be removed
        while(table.childNodes.length > 2) {
            table.removeChild(table.lastChild);
        }

        // Prints the new list of online users
        for (let step = 0; step < list.length; step++) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.textContent = list[step];
            td.addEventListener("click", function () {
                sendGameRequest(td.textContent);
            })

            tr.appendChild(td);
            table.appendChild(tr);
        }
    } else if(jsonString.type === 'remove_requests') {  // One of the users who sent me a game request might not be online anymore
        let table = document.getElementById("gameRequests");

        for(let step = table.childNodes.length - 1; step > 1; step--) {
            let tr = table.childNodes.item(step);
            let td = tr.firstChild;
            if(td.textContent === jsonString.data) {
                table.removeChild(tr);
            }
        }
    } else if(jsonString.type === 'sender_already_logged'){
        alert("Username already logged in!")
        document.location.href = './logout-servlet';
    }
};

/**
 * Function used to go to the Tic-Tac-Toe game page
 * @param color         My color
 * @param opponent      The username of my opponent
 */
function goToTicTacToeGame (start, opponent)
{
    let form = document.createElement("form");
    form.setAttribute('method',"post");
    form.setAttribute('action',"game-servlet");

    let startInput = document.createElement("input"); //input element, text
    startInput.setAttribute('type',"text");
    startInput.setAttribute('name', "start");
    startInput.setAttribute('value', start);

    let opponentInput = document.createElement("input"); //input element, text
    opponentInput.setAttribute('type',"text");
    opponentInput.setAttribute('name', "opponent");
    opponentInput.setAttribute('value', opponent);

    howManyMatches++;
    let howManyMatchesInput = document.createElement("input");
    howManyMatchesInput.setAttribute("type", "text");
    howManyMatchesInput.setAttribute('name', "howManyMatches");
    howManyMatchesInput.setAttribute('value', howManyMatches.toString());

    let submit = document.createElement("submit");
    submit.setAttribute('type',"submit");
    submit.setAttribute('value',"submit");
    submit.setAttribute('name', 'submitButton');

    form.appendChild(startInput);
    form.appendChild(opponentInput);
    form.append(howManyMatchesInput)
    form.appendChild(submit);
    form.style.visibility = "hidden";
    document.body.appendChild(form);
    form.submit();
}

/**
 * Function used to go to the Connect Four game page
 * @param color         My color
 * @param opponent      The username of my opponent
 */
function goToConnectFourGame (color, opponent)
{
    let form = document.createElement("form");
    form.setAttribute('method',"post");
    form.setAttribute('action',"game-servlet");

    let startInput = document.createElement("input"); //input element, text
    startInput.setAttribute('type',"text");
    startInput.setAttribute('name', "color");
    startInput.setAttribute('value', color);

    let opponentInput = document.createElement("input"); //input element, text
    opponentInput.setAttribute('type',"text");
    opponentInput.setAttribute('name', "opponent");
    opponentInput.setAttribute('value', opponent);

    howManyMatches++;
    let howManyMatchesInput = document.createElement("input");
    howManyMatchesInput.setAttribute("type", "text");
    howManyMatchesInput.setAttribute('name', "howManyMatches");
    howManyMatchesInput.setAttribute('value', howManyMatches.toString());

    let submit = document.createElement("submit");
    submit.setAttribute('type',"submit");
    submit.setAttribute('value',"submit");
    submit.setAttribute('name', 'submitButton');

    form.appendChild(startInput);
    form.appendChild(opponentInput);
    form.append(howManyMatchesInput)
    form.appendChild(submit);
    form.style.visibility = "hidden";
    document.body.appendChild(form);
    form.submit();
}