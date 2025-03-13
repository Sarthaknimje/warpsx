// WarpX UI Enhancement Script

document.addEventListener('DOMContentLoaded', function() {
  // Apply modern UI enhancements
  enhanceUIForModernDesign();
  
  // Dark mode toggle - always enabled by default
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  if (darkModeSwitch) {
    // Always enable dark mode by default
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-theme');
    darkModeSwitch.checked = true;
    localStorage.setItem('darkMode', 'true');
    
    // Add data attribute to indicate forced dark mode
    document.documentElement.setAttribute('data-forced-theme', 'dark');
    
    // Toggle dark mode (but restore to dark if user turns it off)
    darkModeSwitch.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('darkMode', 'true');
      } else {
        // Alert the user that the site is designed for dark mode
        alert('This site is designed to be used in dark mode for the best experience.');
        // Force back to dark mode
        setTimeout(() => {
          document.body.classList.add('dark-mode');
          document.documentElement.classList.add('dark-theme');
          this.checked = true;
          localStorage.setItem('darkMode', 'true');
        }, 100);
      }
    });
  }
  
  // Function to enhance UI for modern design
  function enhanceUIForModernDesign() {
    // Add animation to card elements
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.add('fade-in');
      // Add modern-card class if not already present
      if (!card.classList.contains('modern-card')) {
        card.classList.add('modern-card');
      }
    });
    
    // Enhance form controls with modern styling
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
      if (!control.classList.contains('modern-input')) {
        control.classList.add('modern-input');
      }
    });
    
    // Enhance primary buttons
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
      if (!button.classList.contains('modern-button')) {
        button.classList.add('modern-button');
      }
    });
  }
  
  // Custom styling toggle
  const customStyleCheck = document.getElementById('customStyleCheck');
  const stylingOptions = document.getElementById('stylingOptions');
  
  if (customStyleCheck && stylingOptions) {
    customStyleCheck.addEventListener('change', function() {
      if (this.checked) {
        stylingOptions.style.display = 'flex';
        // Add animation class
        stylingOptions.classList.add('fade-in-down');
        // Remove animation class after animation completes
        setTimeout(() => {
          stylingOptions.classList.remove('fade-in-down');
        }, 500);
      } else {
        // Add fade out animation
        stylingOptions.classList.add('fade-out');
        setTimeout(() => {
          stylingOptions.style.display = 'none';
          stylingOptions.classList.remove('fade-out');
        }, 300);
      }
    });
  }
  
  // Example prompts
  const examplePrompts = document.querySelectorAll('.example-prompt');
  const promptTextarea = document.getElementById('prompt');
  
  if (examplePrompts.length > 0 && promptTextarea) {
    examplePrompts.forEach(example => {
      example.addEventListener('click', function() {
        const promptText = this.getAttribute('data-prompt');
        promptTextarea.value = promptText;
        
        // Scroll to prompt textarea
        promptTextarea.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on textarea
        promptTextarea.focus();
        
        // Add pulse animation to the textarea
        promptTextarea.classList.add('pulse');
        setTimeout(() => {
          promptTextarea.classList.remove('pulse');
        }, 2000);
      });
    });
  }
  
  // Real-time alias availability check
  const aliasInput = document.getElementById('alias');
  const checkAliasBtn = document.getElementById('checkAliasBtn');
  const aliasAvailabilityResult = document.getElementById('aliasAvailabilityResult');
  
  if (aliasInput && checkAliasBtn && aliasAvailabilityResult) {
    // Debounce function to limit API calls
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }
    
    // Check alias availability
    const checkAlias = debounce(function() {
      const alias = aliasInput.value.trim();
      
      if (alias.length === 0) {
        aliasAvailabilityResult.innerHTML = '';
        return;
      }
      
      // Show loading indicator
      aliasAvailabilityResult.innerHTML = '<span class="text-secondary">Checking availability...</span>';
      
      // Make API call to check alias availability
      fetch(`/api/check-alias/${encodeURIComponent(alias)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            if (data.available) {
              aliasAvailabilityResult.innerHTML = '<span class="text-success">✓ Alias is available</span>';
            } else {
              aliasAvailabilityResult.innerHTML = '<span class="text-danger">✗ Alias is already taken</span>';
            }
            
            if (data.warning) {
              aliasAvailabilityResult.innerHTML += `<br><span class="text-warning">${data.warning}</span>`;
            }
          } else {
            aliasAvailabilityResult.innerHTML = `<span class="text-danger">Error: ${data.error || 'Unknown error'}</span>`;
          }
        })
        .catch(error => {
          console.error('Error checking alias:', error);
          aliasAvailabilityResult.innerHTML = '<span class="text-warning">Could not check availability, but you can try to use it</span>';
        });
    }, 500);
    
    // Check on button click
    checkAliasBtn.addEventListener('click', checkAlias);
    
    // Check as user types (with debounce)
    aliasInput.addEventListener('input', checkAlias);
  }
  
  // Form submission animation
  const warpForm = document.querySelector('form[action="/generate"]');
  const resultContainer = document.getElementById('resultContainer');
  
  if (warpForm) {
    warpForm.addEventListener('submit', function(e) {
      // Don't prevent default submission, but add loading animation
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        submitBtn.disabled = true;
      }
    });
  }
  
  // Show result container with animation if it exists
  if (resultContainer) {
    // Add show class after a small delay for animation
    setTimeout(() => {
      resultContainer.classList.add('show');
    }, 100);
  }
  
  // Add copy button functionality for warp links
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  if (copyButtons.length > 0) {
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const textToCopy = this.getAttribute('data-copy');
        
        // Create temporary textarea to copy text
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // Change button text temporarily
        const originalText = this.innerHTML;
        this.innerHTML = '✓ Copied!';
        
        setTimeout(() => {
          this.innerHTML = originalText;
        }, 2000);
      });
    });
  }
  
  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}); 