const textInput = document.getElementById("textInput");
const saveBtn = document.getElementById("saveBtn");
const savedContainer = document.getElementById("savedContainer");
const preview = document.getElementById('preview');
const letterCount = document.getElementById('count');
const clearAllBtn = document.getElementById('clearAllBtn');
const searchInput = document.getElementById('searchInput');
const filter = document.querySelector('.filter')
const vowels = 'AEIOUaeiou';

textInput.addEventListener('input', (e) => {
    e.preventDefault();

    const text = textInput.value;

    letterCount.textContent = text.replace(/\s/g, '').length;
    let highlighted = '';

    for (let char of text) {
        if (vowels.includes(char)) {
            highlighted += `<span class="vowel">${char}</span>`
        }else {
            highlighted += char;
        }
    }
    preview.innerHTML = highlighted;
});


saveBtn.addEventListener('click', async () => {
    const text = textInput.value;
    if (!text.trim()) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner"></span> Saving...`;
    
savedContainer.innerHTML = `
    <div class="saved-item skeleton">
        <div class="skeleton-line long"></div>
    </div>
    <div class="saved-item skeleton">
        <div class="skeleton-line long"></div>
    </div>    
    <div class="saved-item skeleton">
        <div class="skeleton-line long"></div>
    </div>
`;

    try {
        const response = await fetch('https://vowel-highlighter-backend.onrender.com//save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        await response.json();
        
        await loadSaved();
        
        textInput.value = "";
        preview.innerHTML = "";
        letterCount.textContent = 0;
        
        saveBtn.innerHTML = `<svg class="check-icon" width="64" height="64" viewBox="0 0 64 64">
  <polyline class="check" points="20,32 28,40 44,24" fill="none" stroke="#fff" stroke-width="4"/>
</svg>Done`;
        
        setTimeout(() => {
            saveBtn.innerHTML = `<span class="material-symbols-outlined">save</span>Save`;
            saveBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.log(error);
        saveBtn.innerHTML = `✕ Failed`;
        
        setTimeout(() => {
            saveBtn.innerHTML = `<span class="material-symbols-outlined">save</span>Save`;
            saveBtn.disabled = false;
        }, 1500);
    }
});


let currentSort = 'newest'; // 'newest', 'oldest', 'alphabetical'

async function loadSaved(sortBy = currentSort) {
    const response = await fetch(`/texts?sort=${sortBy}`);
    const data = await response.json();
    // ... rest of your loadSaved logic
}

async function loadSaved() {
    savedContainer.innerHTML = `
        <div class="saved-item skeleton">
            <div class="skeleton-line long"></div>
        </div>
        <div class="saved-item skeleton">
            <div class="skeleton-line long"></div>
        </div>
        <div class="saved-item skeleton">
            <div class="skeleton-line long"></div>
        </div>
    `;
    try {
        const response = await fetch('https://vowel-highlighter-backend.onrender.com//texts');
        const data = await response.json();
        savedContainer.innerHTML = '';
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('saved-item');
            let highlighted = '';
            const text = item.text;
            for (let char of text) {
                if (vowels.includes(char)) {
                    highlighted += `<span class="vowel">${char}</span>`
                } else {
                    highlighted += char;
                }
            }
            div.innerHTML = highlighted;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteBtn.style = 'border: none; background-color: transparent; cursor: pointer;'
            deleteBtn.addEventListener('click', async () => {
                const response = await fetch(`https://vowel-highlighter-backend.onrender.com//texts/${item.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    div.remove();
                }
            });
            div.appendChild(deleteBtn);
            savedContainer.appendChild(div);
        });
        
        // Clear inputs ONCE after the loop, not inside it
        textInput.value = '';
        preview.value = '';
        
    } catch(error) {
        console.log(error);
    }
}

loadSaved();



// Add this after your loadSaved() function
async function clearAll() {
    if (confirm('Are you sure you want to delete ALL saved texts? This cannot be undone!')) {
        clearAllBtn.disabled = true;
        clearAllBtn.innerHTML = `<span class="spinner"></span> Clearing all...`;
        try {
            const response = await fetch('https://vowel-highlighter-backend.onrender.com//texts', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Clear the container
                savedContainer.innerHTML = '';
                // Optional: Show a success message
                alert('All texts have been deleted');
                clearAllBtn.innerHTML = `<span class="check-icon">✓</span>Done`;
                setTimeout(() => {
                clearAllBtn.innerHTML = `<span class="material-symbols-outlined">clear_all</span>Clear All`;
                clearAllBtn.disabled = false;
            }, 1500);
            } else {
                alert('Failed to delete all texts');
            }
        } catch (error) {
            console.error('Error clearing all:', error);
            clearAllBtn.innerHTML = `✕ Failed`;
            

            alert('Error deleting texts');
        }
    }
}

clearAllBtn.addEventListener('click', clearAll);

searchInput.addEventListener('input', (e) => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const savedItems = document.querySelectorAll('.saved-item');
    
    savedItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        
        if (searchTerm === '' || itemText.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// Add filter buttons
let currentFilter = 'all'; // 'all', 'short', 'long'

function applyFilterAndSort() {
    const items = document.querySelectorAll('.saved-item');
    const searchTerm = searchInput.value.toLowerCase();
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        
        // Filter logic
        let passesFilter = true;
        if (currentFilter === 'short') passesFilter = text.length < 20;
        if (currentFilter === 'long') passesFilter = text.length >= 20;
        
        // Search logic
        const passesSearch = searchTerm === '' || text.includes(searchTerm);
        
        item.style.display = (passesFilter && passesSearch) ? 'flex' : 'none';
    });
}

filter.addEventListener('click', applyFilterAndSort);
