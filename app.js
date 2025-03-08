// API endpoint
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://your-app-name.onrender.com/api';

// Constants
const CONFESSIONS_PER_PAGE = 5;

// DOM Elements
const confessionForm = document.getElementById('confessionForm');
const confessionsList = document.getElementById('confessionsList');
const paginationContainer = document.getElementById('pagination');

// Event Listeners
confessionForm.addEventListener('submit', handleConfessionSubmit);

// Functions
async function handleConfessionSubmit(e) {
    e.preventDefault();
    
    const toName = document.getElementById('toName').value;
    const message = document.getElementById('message').value;
    const fromName = document.getElementById('fromName').value || 'Anonymous';

    try {
        await saveConfession(toName, message, fromName);
        confessionForm.reset();
        loadConfessions(1);
        showNotification('Your confession has been sent! ❤️');
    } catch (error) {
        showNotification('Failed to send confession. Please try again.', 'error');
        console.error('Error:', error);
    }
}

async function saveConfession(toName, message, fromName) {
    const response = await fetch(`${API_URL}/confessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_name: toName, message, from_name: fromName })
    });

    if (!response.ok) {
        throw new Error('Failed to save confession');
    }

    return response.json();
}

async function loadConfessions(page = 1) {
    try {
        const response = await fetch(`${API_URL}/confessions?page=${page}`);
        if (!response.ok) {
            throw new Error('Failed to load confessions');
        }
        
        const data = await response.json();
        displayConfessions(data.confessions);
        renderPagination(page, data.total_pages);
    } catch (error) {
        console.error('Error loading confessions:', error);
        showNotification('Failed to load confessions', 'error');
    }
}

function displayConfessions(confessions) {
    confessionsList.innerHTML = confessions.map(confession => `
        <div class="confession-card">
            <div class="confession-to">Dear ${escapeHtml(confession.to_name)},</div>
            <div class="confession-message">${escapeHtml(confession.message)}</div>
            <div class="confession-from">From: ${escapeHtml(confession.from_name)}</div>
        </div>
    `).join('');
}

// Remove updatePagination function as it's no longer needed
// Pagination is now handled directly in loadConfessions


function renderPagination(currentPage, totalPages) {
    let paginationHtml = '';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button 
                ${i === currentPage ? 'class="active"' : ''}
                onclick="loadConfessions(${i})"
            >
                ${i}
            </button>
        `;
    }
    
    paginationContainer.innerHTML = paginationHtml;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Load initial confessions
loadConfessions(1);