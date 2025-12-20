Add this to your script section, replacing the existing trait selection code:

document.addEventListener('click', (event) => {
    if (event.target.closest('.layer-preview')) {
        const item = event.target.closest('.layer-preview');
        const traitSection = item.closest('.border-gray-200');
        const traitType = traitSection.querySelector('h4').textContent.toLowerCase();
        const traitValue = item.textContent.trim();
        
        // Clear previous selections in this category
        traitSection.querySelectorAll('.layer-preview').forEach(el => {
            el.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-100');
        });
        
        // Highlight selected trait
        item.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-100');
        
        // Store selection
        appState.selectedTraits[traitType] = traitValue;
        
        console.log('Selected traits:', appState.selectedTraits);
    }
});
Update generateCollection() to use selected traits:
async function generateCollection() {
    console.log('Generate button clicked!');
    
    const samplesContainer = document.querySelector('.grid.grid-cols-3.gap-2');
    samplesContainer.innerHTML = '';
    document.getElementById('generation-status').classList.remove('hidden');
    
    let prompts = [];
    
    // Build prompt from selected traits
    let traitPrompt = '';
    if (Object.keys(appState.selectedTraits).length > 0) {
        traitPrompt = Object.values(appState.selectedTraits).join(' ') + ' ';
    }
    
    // If CSV uploaded, combine traits with CSV data
    if (appState.metadataFile && window.csvData) {
        prompts = window.csvData.slice(0, appState.artworkCount).map(item => {
            let csvPrompt = `${item.Personality || ''} ${item['Digital Affinity'] || ''} ${item['Energy Level'] || ''}`.trim();
            return `${traitPrompt}${csvPrompt} ${appState.prompt}`.trim();
        });
    } else {
        // Use selected traits + manual prompt
        const finalPrompt = `${traitPrompt}${appState.prompt}`.trim();
        prompts = Array(appState.artworkCount).fill(finalPrompt);
    }
    
    if (prompts.length === 0 || prompts[0].trim() === '') {
        showErrorMessage('Please enter a prompt or select traits');
        document.getElementById('generation-status').classList.add('hidden');
        return;
    }
    
    for (let i = 0; i < prompts.length; i++) {
        try {
            samplesContainer.innerHTML += `
                <div class="artwork-card rounded-lg aspect-square bg-gray-200 flex items-center justify-center" id="loading-${i}">
                    <div class="text-xs text-gray-600">Generating ${i+1}...</div>
                </div>
            `;

            const query = `?prompt=${encodeURIComponent(prompts[i])}&width=1024&height=1024`;
            const response = await fetch(`/api/generate${query}`);

            const data = await response.json();
            console.log(`Prompt ${i+1}:`, prompts[i]);
            
            const loadingElement = document.getElementById(`loading-${i}`);
            if (data.success && loadingElement) {
                loadingElement.innerHTML = `
                    <img src="${data.imageUrl}" class="h-full w-full object-contain rounded" alt="Generated NFT ${i+1}">
                `;
                loadingElement.classList.remove('bg-gray-200');
            } else if (loadingElement) {
                loadingElement.innerHTML = `<div class="text-xs text-red-500">Failed</div>`;
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
        
        document.getElementById('progress').textContent = `${Math.round(((i+1)/prompts.length)*100)}%`;
    }
    
    document.getElementById('generation-status').classList.add('hidden');
    showSuccessMessage('Collection generation complete!');
}
Add a trait preview section:
Add this right after your prompt textarea:
<!-- Selected Traits Preview -->
<div id="traits-preview" class="hidden">
    <label class="block text-sm font-medium text-gray-700 mb-1">Selected Traits</label>
    <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm" id="traits-display">
        No traits selected
    </div>
</div>
Add trait display update function:
function updateTraitsDisplay() {
    const traitsPreview = document.getElementById('traits-preview');
    const traitsDisplay = document.getElementById('traits-display');
    
    if (Object.keys(appState.selectedTraits).length > 0) {
        traitsPreview.classList.remove('hidden');
        const traitText = Object.entries(appState.selectedTraits)
            .map(([type, value]) => `${type}: ${value}`)
            .join(', ');
        traitsDisplay.textContent = traitText;
    } else {
        traitsPreview.classList.add('hidden');
    }
}

// Update the trait selection event listener to call this:
document.addEventListener('click', (event) => {
    if (event.target.closest('.layer-preview')) {
        // ... existing trait selection code ...
        
        // Add this line at the end:
        updateTraitsDisplay();
    }
});
Now you can:
Select traits by clicking them (they'll highlight in blue)
See your selected traits in a preview box
Generate