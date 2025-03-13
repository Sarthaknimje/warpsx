// WarpX UI Enhancement Script

document.addEventListener('DOMContentLoaded', function() {
  // Always enable dark mode
  document.body.classList.add('dark-mode');
  document.documentElement.classList.add('dark-theme');
  
  // Store the dark mode preference in local storage
  localStorage.setItem('darkMode', 'enabled');

  // Initialize QR code if needed
  initQRCode();
  
  // Initialize example prompts
  initExamplePrompts();
  
  // Initialize alias checking
  initAliasChecking();
  
  // Add animations and modern UI enhancements
  enhanceUIForModernDesign();
  
  // Dark mode toggle - always enabled by default
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  if (darkModeSwitch) {
    // Always enable dark mode by default
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
  
  // Custom styling toggle
  const customStyleCheck = document.getElementById('customStyleCheck');
  const stylingOptions = document.getElementById('stylingOptions');
  
  if (customStyleCheck && stylingOptions) {
    customStyleCheck.addEventListener('change', function() {
      if (this.checked) {
        stylingOptions.style.display = 'flex';
        stylingOptions.style.opacity = '0';
        stylingOptions.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          stylingOptions.style.opacity = '1';
          stylingOptions.style.transform = 'translateY(0)';
          stylingOptions.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 10);
      } else {
        stylingOptions.style.opacity = '0';
        stylingOptions.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          stylingOptions.style.display = 'none';
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

// Initialize QR code generator
function initQRCode() {
  const warpLinkElement = document.getElementById('warpLink');
  const qrcodeElement = document.getElementById('qrcode');
  
  if (warpLinkElement && qrcodeElement) {
    const warpLink = warpLinkElement.value;
    
    if (warpLink) {
      // Clear previous QR code
      qrcodeElement.innerHTML = '';
      
      // Generate QR code
      new QRCode(qrcodeElement, {
        text: warpLink,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }
}

// Initialize example prompts
function initExamplePrompts() {
  const exampleButtons = document.querySelectorAll('.example-prompt-btn');
  const promptTextarea = document.getElementById('prompt');
  
  if (exampleButtons.length > 0 && promptTextarea) {
    exampleButtons.forEach(button => {
      button.addEventListener('click', function() {
        const prompt = this.getAttribute('data-prompt');
        promptTextarea.value = prompt;
        promptTextarea.focus();
        
        // Add animation
        this.classList.add('clicked');
        setTimeout(() => {
          this.classList.remove('clicked');
        }, 300);
      });
    });
  }
}

// Initialize alias checking
function initAliasChecking() {
  const checkButtons = [
    { button: document.getElementById('checkAliasBtn'), input: document.getElementById('alias'), result: document.getElementById('aliasAvailabilityResult') },
    { button: document.getElementById('checkDirectAliasBtn'), input: document.getElementById('directAlias'), result: document.getElementById('directAliasAvailabilityResult') }
  ];
  
  checkButtons.forEach(({ button, input, result }) => {
    if (button && input && result) {
      button.addEventListener('click', function() {
        const alias = input.value.trim();
        
        if (!alias) {
          result.innerHTML = '<span class="text-warning"><i class="fas fa-exclamation-circle me-2"></i>Please enter an alias</span>';
          return;
        }
        
        // Add loading animation
        result.innerHTML = '<span class="text-info"><i class="fas fa-spinner fa-spin me-2"></i>Checking...</span>';
        button.disabled = true;
        
        // Check alias availability
        fetch(`/check-alias?alias=${encodeURIComponent(alias)}`)
          .then(response => response.json())
          .then(data => {
            if (data.available) {
              result.innerHTML = '<span class="text-success"><i class="fas fa-check-circle me-2"></i>Alias is available!</span>';
            } else {
              result.innerHTML = '<span class="text-danger"><i class="fas fa-times-circle me-2"></i>Alias is already taken</span>';
            }
          })
          .catch(error => {
            console.error('Error checking alias:', error);
            result.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error checking alias</span>';
          })
          .finally(() => {
            button.disabled = false;
          });
      });
    }
  });
}

// Add animations and modern UI enhancements
function enhanceUIForModernDesign() {
  // Add card animations
  const cards = document.querySelectorAll('.app-content, .result-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
  });
  
  // Enhanced form controls
  const formControls = document.querySelectorAll('.form-control, .app-input');
  formControls.forEach(control => {
    control.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');
    });
    
    control.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focused');
    });
  });
  
  // Add hover effects to buttons
  const buttons = document.querySelectorAll('.generate-btn, .check-btn, .nav-btn, .tab-btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s ease';
    });
  });
  
  // Custom style toggle animation
  const customStyleCheck = document.getElementById('customStyleCheck');
  const stylingOptions = document.getElementById('stylingOptions');
  
  if (customStyleCheck && stylingOptions) {
    customStyleCheck.addEventListener('change', function() {
      if (this.checked) {
        stylingOptions.style.display = 'flex';
        stylingOptions.style.opacity = '0';
        stylingOptions.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          stylingOptions.style.opacity = '1';
          stylingOptions.style.transform = 'translateY(0)';
          stylingOptions.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 10);
      } else {
        stylingOptions.style.opacity = '0';
        stylingOptions.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          stylingOptions.style.display = 'none';
        }, 300);
      }
    });
  }
} 