// Simple navigation script
document.addEventListener('DOMContentLoaded', function() {
  // Navigation links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
  
  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  
  if (navToggle && navList) {
    navToggle.addEventListener('click', function() {
      navList.classList.toggle('show');
    });
  }
  
  // Hero buttons
  const btnReservar = document.getElementById('btn-reservar-hero');
  const btnVerMas = document.getElementById('btn-ver-mas');
  
  if (btnReservar) {
    btnReservar.addEventListener('click', function() {
      document.getElementById('reservas').scrollIntoView({behavior: 'smooth'});
    });
  }
  
  if (btnVerMas) {
    btnVerMas.addEventListener('click', function() {
      document.getElementById('conocer-mas').scrollIntoView({behavior: 'smooth'});
    });
  }
});