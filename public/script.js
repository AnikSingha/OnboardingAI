const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chartContainer = document.getElementById('chart-container');
const toggleAppointmentsButton = document.getElementById('toggle-appointments');

// Generate a unique session ID
const sessionId = Date.now().toString();

// Add initial message from the AI
appendMessage("AI: Hello! Thank you for calling our business. This is the AI appointment assistant speaking. How may I help you today? Would you like to schedule an appointment or do you have any questions about our services?");

// Fetch and display appointments
fetchAppointments();

async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        appendMessage('You: ' + message);
        userInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, sessionId }),
            });

            if (!response.ok) {
                throw new Error('Network response error');
            }

            const data = await response.json();
            appendMessage('AI: ' + data.reply);
            
            // Fetch appointments and available dates after each message
            fetchAppointments();
            fetchAvailableDates();
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Error: Failed to get response from the server.');
        }
    }
}

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message');
    
    if (message.startsWith('You: ')) {
        messageElement.classList.add('user-message');
    } else if (message.startsWith('AI: ')) {
        messageElement.classList.add('ai-message');
    }
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function fetchAppointments() {
    try {
        const response = await fetch('/appointments');
        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }
        const appointments = await response.json();
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function fetchAvailableDates() {
    try {
        const response = await fetch('/available-dates');
        if (!response.ok) {
            throw new Error('Failed to load available dates');
        }
        const availableDates = await response.json();
        displayAvailableDates(availableDates);
    } catch (error) {
        console.error('Error loading available dates:', error);
    }
}

function displayAppointments(appointments) {
    chartContainer.innerHTML = '<h2>Appointment Database</h2>';
    appointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.classList.add('appointment-item');
        const utcDate = new Date(appointment.date);
        const formattedDate = formatDate(appointment.date);
        appointmentElement.innerHTML = `
            <p><strong>Name:</strong> ${appointment.customerName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
        `;
        chartContainer.appendChild(appointmentElement);
    });
}

function displayAvailableDates(availableDates) {
    const availableDatesContainer = document.getElementById('available-dates-container');
    if (!availableDatesContainer) {
        console.error('Available dates container not found');
        return;
    }
    
    availableDatesContainer.innerHTML = '<h3>Available Dates</h3>';
    if (availableDates.length === 0) {
        availableDatesContainer.innerHTML += '<p>No available dates at the moment.</p>';
        return;
    }
    
    const dateList = document.createElement('ul');
    availableDates.forEach(date => {
        const listItem = document.createElement('li');
        const utcDate = new Date(date.date);
        const formattedDate = formatDate(date.date);
        listItem.textContent = `${formattedDate} - ${date.availableSlots} slots`;
        dateList.appendChild(listItem);
    });
    availableDatesContainer.appendChild(dateList);
}

function toggleAppointments() {
    if (chartContainer.style.display === 'none' || chartContainer.style.display === '') {
        chartContainer.style.display = 'block';
    } else {
        chartContainer.style.display = 'none';
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
toggleAppointmentsButton.addEventListener('click', toggleAppointments);

// Call fetchAvailableDates when the page loads
fetchAvailableDates();

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  return new Date(date).toLocaleDateString('en-US', options);
}
