// Main JavaScript for WarpX Generator

// DOM Elements
const darkModeSwitch = document.getElementById('darkModeSwitch');
const aliasInput = document.getElementById('alias');
const checkAliasBtn = document.getElementById('checkAliasBtn');
const aliasAvailabilityResult = document.getElementById('aliasAvailabilityResult');
const customStyleCheck = document.getElementById('customStyleCheck');
const stylingOptions = document.getElementById('stylingOptions');
const examplePrompts = document.querySelectorAll('.example-prompt');
const promptTextarea = document.getElementById('prompt');
const resultContainer = document.getElementById('resultContainer');

// Local Storage Keys
const WARPS_STORAGE_KEY = 'warpx_user_warps';
const DARK_MODE_KEY = 'warpx_dark_mode';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  initLocalStorage();
  setupEventListeners();
});

// Initialize Dark Mode
function initDarkMode() {
  const isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeSwitch) darkModeSwitch.checked = true;
  } else {
    document.body.classList.remove('dark-mode');
    if (darkModeSwitch) darkModeSwitch.checked = false;
  }
}

// Initialize Local Storage
function initLocalStorage() {
  // Create warps storage if it doesn't exist
  if (!localStorage.getItem(WARPS_STORAGE_KEY)) {
    localStorage.setItem(WARPS_STORAGE_KEY, JSON.stringify([]));
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Dark Mode Toggle
  if (darkModeSwitch) {
    darkModeSwitch.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        localStorage.setItem(DARK_MODE_KEY, 'true');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem(DARK_MODE_KEY, 'false');
      }
    });
  }

  // Custom Style Checkbox
  if (customStyleCheck) {
    customStyleCheck.addEventListener('change', function() {
      if (this.checked) {
        stylingOptions.style.display = 'flex';
      } else {
        stylingOptions.style.display = 'none';
      }
    });
  }

  // Example Prompts
  examplePrompts.forEach(prompt => {
    prompt.addEventListener('click', function() {
      const promptText = this.getAttribute('data-prompt');
      if (promptTextarea) {
        promptTextarea.value = promptText;
        promptTextarea.focus();
      }
    });
  });

  // Check Alias Availability
  if (checkAliasBtn && aliasInput) {
    checkAliasBtn.addEventListener('click', function() {
      const alias = aliasInput.value.trim();
      if (!alias) {
        aliasAvailabilityResult.innerHTML = '<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Please enter an alias to check.</span>';
        return;
      }

      // Show loading state
      aliasAvailabilityResult.innerHTML = '<span class="text-info"><i class="fas fa-spinner fa-spin"></i> Checking availability...</span>';

      // Call the API to check alias availability
      fetch(`/check-alias?alias=${encodeURIComponent(alias)}`)
        .then(response => response.json())
        .then(data => {
          if (data.available) {
            aliasAvailabilityResult.innerHTML = '<span class="text-success"><i class="fas fa-check-circle"></i> Alias is available!</span>';
          } else {
            aliasAvailabilityResult.innerHTML = '<span class="text-danger"><i class="fas fa-times-circle"></i> Alias is already taken.</span>';
          }
        })
        .catch(error => {
          console.error('Error checking alias:', error);
          aliasAvailabilityResult.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-circle"></i> Error checking alias. Please try again.</span>';
        });
    });
  }

  // Handle form submissions to store warps in local storage
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function() {
      // Add a hidden field with timestamp for tracking
      const timestampField = document.createElement('input');
      timestampField.type = 'hidden';
      timestampField.name = 'timestamp';
      timestampField.value = new Date().toISOString();
      this.appendChild(timestampField);
    });
  });

  // Initialize copy buttons
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-copy-target');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        navigator.clipboard.writeText(targetElement.value || targetElement.textContent)
          .then(() => {
            // Show success state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(() => {
              this.innerHTML = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      } else {
        // Try direct copy attribute if target element not found
        const directCopy = this.getAttribute('data-copy');
        if (directCopy) {
          navigator.clipboard.writeText(directCopy)
            .then(() => {
              // Show success state
              const originalText = this.innerHTML;
              this.innerHTML = '<i class="fas fa-check"></i> Copied!';
              
              setTimeout(() => {
                this.innerHTML = originalText;
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
            });
        }
      }
    });
  });
}

// Save warp to local storage
function saveWarpToLocalStorage(warpData) {
  try {
    // Get existing warps
    const warps = JSON.parse(localStorage.getItem(WARPS_STORAGE_KEY) || '[]');
    
    // Add new warp to the beginning of the array
    warps.unshift({
      ...warpData,
      savedAt: new Date().toISOString()
    });
    
    // Save back to local storage
    localStorage.setItem(WARPS_STORAGE_KEY, JSON.stringify(warps));
    
    // Show notification
    showStorageNotification('Warp saved to local storage');
    
    return true;
  } catch (error) {
    console.error('Error saving warp to local storage:', error);
    return false;
  }
}

// Get warps from local storage
function getWarpsFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem(WARPS_STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error getting warps from local storage:', error);
    return [];
  }
}

// Delete warp from local storage
function deleteWarpFromLocalStorage(txHash) {
  try {
    // Get existing warps
    let warps = JSON.parse(localStorage.getItem(WARPS_STORAGE_KEY) || '[]');
    
    // Filter out the warp with the given txHash
    warps = warps.filter(warp => warp.txHash !== txHash);
    
    // Save back to local storage
    localStorage.setItem(WARPS_STORAGE_KEY, JSON.stringify(warps));
    
    // Show notification
    showStorageNotification('Warp removed from local storage');
    
    return true;
  } catch (error) {
    console.error('Error deleting warp from local storage:', error);
    return false;
  }
}

// Show storage notification
function showStorageNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'storage-indicator';
  notification.innerHTML = `<i class="fas fa-save me-2"></i>${message}`;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Remove after animation completes
  setTimeout(() => {
    notification.remove();
  }, 3500);
}

// If there's a result container, store the warp data
if (resultContainer) {
  const warpLink = resultContainer.querySelector('input[value^="https://"]')?.value;
  const txHash = resultContainer.querySelector('.card-body')?.textContent.match(/Transaction Hash: ([a-f0-9]+)/i)?.[1];
  
  if (warpLink && txHash) {
    const alias = resultContainer.querySelector('.card-body')?.textContent.match(/Alias: ([a-zA-Z0-9-_]+)/i)?.[1];
    const prompt = document.getElementById('prompt')?.value;
    
    const warpData = {
      txHash,
      warpLink,
      alias: alias || null,
      prompt: prompt || 'Custom Warp',
      createdAt: new Date().toISOString()
    };
    
    saveWarpToLocalStorage(warpData);
  }
}

// Warp Storage Functionality
window.warpStorage = {
  getWarps: function() {
    try {
      const warps = localStorage.getItem('warps');
      return warps ? JSON.parse(warps) : [];
    } catch (error) {
      console.error('Error getting warps from local storage:', error);
      return [];
    }
  },
  
  saveWarp: function(warp) {
    try {
      if (!warp || !warp.txHash) {
        console.error('Cannot save warp without txHash');
        return false;
      }
      
      const warps = this.getWarps();
      
      // Check if warp already exists
      const existingIndex = warps.findIndex(w => w.txHash === warp.txHash);
      
      if (existingIndex >= 0) {
        // Update existing warp
        warps[existingIndex] = {...warps[existingIndex], ...warp};
      } else {
        // Add new warp
        warps.push({
          ...warp,
          savedAt: new Date().toISOString()
        });
      }
      
      // Save to local storage
      localStorage.setItem('warps', JSON.stringify(warps));
      
      // Show indicator
      this.showStorageIndicator('Warp saved to local storage');
      
      return true;
    } catch (error) {
      console.error('Error saving warp to local storage:', error);
      return false;
    }
  },
  
  deleteWarp: function(txHash) {
    try {
      if (!txHash) return false;
      
      const warps = this.getWarps();
      const filteredWarps = warps.filter(warp => warp.txHash !== txHash);
      
      if (filteredWarps.length === warps.length) {
        return false; // Nothing was deleted
      }
      
      localStorage.setItem('warps', JSON.stringify(filteredWarps));
      this.showStorageIndicator('Warp removed from local storage');
      
      return true;
    } catch (error) {
      console.error('Error deleting warp from local storage:', error);
      return false;
    }
  },
  
  showStorageIndicator: function(message) {
    // Create and show a floating indicator
    const indicator = document.createElement('div');
    indicator.className = 'storage-indicator';
    indicator.textContent = message;
    document.body.appendChild(indicator);
    
    // Remove after animation completes
    setTimeout(() => {
      indicator.remove();
    }, 3500);
  }
};

// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  if (darkModeToggle) {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      darkModeToggle.checked = false;
    } else if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
      document.body.classList.remove('light-mode');
      darkModeToggle.checked = true;
    }
    
    // Toggle theme when checkbox changes
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }
  
  // Example prompts functionality
  const examplePrompts = document.querySelectorAll('.example-prompt');
  const promptInput = document.getElementById('prompt');
  
  if (examplePrompts.length > 0 && promptInput) {
    examplePrompts.forEach(example => {
      example.addEventListener('click', function() {
        const promptText = this.getAttribute('data-prompt');
        promptInput.value = promptText;
        promptInput.focus();
        
        // Trigger input event to update preview if applicable
        const inputEvent = new Event('input', { bubbles: true });
        promptInput.dispatchEvent(inputEvent);
      });
    });
  }
  
  // Create particles background
  createParticlesBackground();
});

// Create particles background
function createParticlesBackground() {
  const particlesContainer = document.querySelector('.particles-container');
  if (!particlesContainer) return;
  
  // Clear existing particles
  particlesContainer.innerHTML = '';
  
  // Create new particles
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particlesContainer.appendChild(particle);
  }
}

// WarpX UI Helper Functions

// QR Code generation for result display
document.addEventListener('DOMContentLoaded', function() {
  // Generate QR code if result exists
  const resultContainer = document.getElementById('resultContainer');
  if (resultContainer) {
    const warpLink = document.getElementById('warpLink').value;
    const qrcodeContainer = document.getElementById('qrcode');
    
    if (qrcodeContainer && warpLink) {
      // Clear previous QR code if any
      qrcodeContainer.innerHTML = '';
      
      try {
        // Generate new QR code with better visibility
        new QRCode(qrcodeContainer, {
          text: warpLink,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
        
        // Ensure QR code is visible by adding a border
        const qrImage = qrcodeContainer.querySelector('img');
        if (qrImage) {
          qrImage.style.border = '1px solid #ddd';
          qrImage.style.borderRadius = '4px';
          qrImage.style.display = 'block';
          qrImage.style.margin = '0 auto';
          qrImage.style.maxWidth = '100%';
          qrImage.style.height = 'auto';
        }
        
        console.log('QR code generated successfully');
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback method if the QR code library fails
        qrcodeContainer.innerHTML = `
          <div style="padding: 10px; background-color: white; border-radius: 8px; display: inline-block;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(warpLink)}" 
                 alt="QR Code" style="display: block; max-width: 100%; height: auto;" />
          </div>
        `;
      }
      
      // Add a copy button for the QR code
      const qrCopyBtn = document.createElement('button');
      qrCopyBtn.className = 'btn btn-sm btn-outline-light mt-2';
      qrCopyBtn.innerHTML = '<i class="fas fa-copy me-2"></i>Copy Link';
      qrCopyBtn.setAttribute('data-copy-target', 'warpLink');
      qrCopyBtn.onclick = function() {
        navigator.clipboard.writeText(warpLink)
          .then(() => {
            this.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-copy me-2"></i>Copy Link';
            }, 2000);
          });
      };
      
      // Add the button after the QR code container
      qrcodeContainer.parentNode.appendChild(qrCopyBtn);
    }
    
    // Store warp in local storage
    const txHash = document.getElementById('txHash')?.value;
    const alias = document.getElementById('alias')?.value;
    const prompt = document.querySelector('textarea[name="prompt"]')?.value;
    
    if (txHash && warpLink) {
      const warpData = {
        txHash,
        warpLink,
        alias: alias || null,
        prompt: prompt || 'Custom Warp',
        createdAt: new Date().toISOString()
      };
      
      // Initialize local storage helper
      window.warpStorage = {
        saveWarp: function(warpData) {
          try {
            // Get existing warps from localStorage
            const storedWarps = localStorage.getItem('warpx-data');
            let warps = storedWarps ? JSON.parse(storedWarps) : [];
            
            // Add new warp to the list
            warps.unshift(warpData);
            
            // Limit to 50 warps
            if (warps.length > 50) {
              warps = warps.slice(0, 50);
            }
            
            // Store back to localStorage
            localStorage.setItem('warpx-data', JSON.stringify(warps));
            
            // Show a success indicator
            const indicator = document.createElement('div');
            indicator.className = 'storage-indicator';
            indicator.textContent = 'Warp saved to local storage';
            document.body.appendChild(indicator);
            
            // Remove the indicator after animation completes
            setTimeout(() => {
              document.body.removeChild(indicator);
            }, 3500);
            
            return true;
          } catch (error) {
            console.error('Error saving warp to localStorage:', error);
            return false;
          }
        }
      };
      
      // Save to local storage
      window.warpStorage.saveWarp(warpData);
    }
  }

  // Custom style checkbox
  const customStyleCheck = document.getElementById('customStyleCheck');
  const stylingOptions = document.getElementById('stylingOptions');
  
  if (customStyleCheck && stylingOptions) {
    customStyleCheck.addEventListener('change', function() {
      stylingOptions.style.display = this.checked ? 'flex' : 'none';
    });
  }

  // Check alias availability
  const checkAliasBtn = document.getElementById('checkAliasBtn');
  const aliasInput = document.getElementById('alias');
  const aliasAvailabilityResult = document.getElementById('aliasAvailabilityResult');
  
  if (checkAliasBtn && aliasInput && aliasAvailabilityResult) {
    checkAliasBtn.addEventListener('click', function() {
      const alias = aliasInput.value.trim();
      if (!alias) {
        aliasAvailabilityResult.innerHTML = '<span class="text-warning"><i class="fas fa-exclamation-circle me-2"></i>Please enter an alias</span>';
        return;
      }
      
      aliasAvailabilityResult.innerHTML = '<span class="text-info"><i class="fas fa-spinner fa-spin me-2"></i>Checking...</span>';
      
      fetch(`/check-alias?alias=${encodeURIComponent(alias)}`)
        .then(response => response.json())
        .then(data => {
          if (data.available) {
            aliasAvailabilityResult.innerHTML = '<span class="text-success"><i class="fas fa-check-circle me-2"></i>Alias is available!</span>';
          } else {
            aliasAvailabilityResult.innerHTML = '<span class="text-danger"><i class="fas fa-times-circle me-2"></i>Alias is already taken</span>';
          }
        })
        .catch(error => {
          console.error('Error checking alias:', error);
          aliasAvailabilityResult.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error checking alias</span>';
        });
    });
  }
}); 