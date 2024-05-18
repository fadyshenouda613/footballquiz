let timer;
let timeRemaining = 60;

function startTimer() {
    timeRemaining = 60;
    document.getElementById('timer').textContent = timeRemaining;
    timer = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer').textContent = timeRemaining;
        if (timeRemaining <= 0) {
            switchTurn();
        }
    }, 1000);
}

function switchTurn() {
    clearInterval(timer);
    const currentPlayer = document.getElementById('currentPlayer').textContent;
    const newPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    document.getElementById('currentPlayer').textContent = newPlayer;
    toggleInputFields(newPlayer);
    startTimer();
}

function toggleInputFields(currentPlayer) {
    const player1Input = document.getElementById('player1Input');
    const player2Input = document.getElementById('player2Input');

    if (currentPlayer === 'player1') {
        player1Input.removeAttribute('disabled');
        player2Input.setAttribute('disabled', 'disabled');
    } else {
        player1Input.setAttribute('disabled', 'disabled');
        player2Input.removeAttribute('disabled');
    }
}

// Select all elements with the class 'userForm' and iterate over them
document.querySelectorAll('.userForm').forEach(form => {
    // Add a 'submit' event listener to each form
    form.addEventListener('submit', function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the trimmed value from the input element with the class 'userInput' within the current form
        const userInput = this.querySelector('.userInput').value.trim().toLowerCase();
        const player = this.getAttribute('data-player'); // Get the player identifier

        // Send a POST request to the '/submit' endpoint with the user input and player identifier
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userInput, player })
        })
            // Parse the JSON response
            .then(response => response.json())
            .then(data => {
                // Get the 'names' array from the response data
                const names = data.names;
                const scores = data.scores; // Get the updated scores
                const currentPlayer = data.currentPlayer; // Get the updated current player
                // Get the element that will play the correct sound
                const correctSound = document.getElementById('correctSound');
                // Get the element that will play the wrong sound
                const wrongSound = document.getElementById('wrongSound');

                // Update the scores on the page
                document.getElementById('player1Score').textContent = scores.player1;
                document.getElementById('player2Score').textContent = scores.player2;

                // Update the current player on the page
                switchTurn();

                // Check if a match was found
                if (names.length > 0) {
                    const item = names[0]; // Only consider the first match

                    // Select the element with the class 'item-[index + 1]'
                    const element = document.querySelector(`.item-${item.index + 1}`);
                    // If the element exists
                    if (element) {
                        // Update the text content of the '.label' element within the selected element
                        element.querySelector('.label').textContent = `${item.index + 1} - ${item.name}`;
                        // Change the background color of the selected element
                        element.style.backgroundColor = '#00ADB5';
                        // Play the correct sound when the correct answer is given
                        correctSound.play();
                    }
                } else {
                    // Play the wrong sound when no correct answers are given
                    wrongSound.play();
                }

                // Clear the input field
                this.querySelector('.userInput').value = '';

                // Reset the timer
                clearInterval(timer);
                startTimer();
            })
            // Log any errors to the console
            .catch(error => console.error('Error:', error));
    });
});

// Initial setup to disable the input fields for the player who does not start
toggleInputFields(document.getElementById('currentPlayer').textContent);

// Start the initial timer
startTimer();
