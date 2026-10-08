// ============================================================
// CÓDIGO COMPANY - JavaScript Principal
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Configuración
    const config = {
        whatsapp: {
            number: '529842682364',
            message: 'Hola, me gustaría obtener más información sobre sus servicios.'
        },
        social: { whatsapp: '#', facebook: '#', instagram: '#', linkedin: '#' },
        apiUrl: '/api'
    };
    
    // ========================================
    // Navegación Móvil
    // ========================================
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');
    
    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
        
        const navLinks = navList.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => navList.classList.remove('active'));
        });
        
        window.addEventListener('scroll', () => navList.classList.remove('active'));
    }
    
    // ========================================
    // Navegación suave
    // ========================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight + 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }

    // ========================================
    // WhatsApp Float Button
    // ========================================
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappFloat = document.getElementById('whatsappFloat');
    
    function openWhatsApp() {
        const url = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message)}`;
        window.open(url, '_blank');
    }
    
    if (whatsappBtn) whatsappBtn.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    if (whatsappFloat) whatsappFloat.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    
    // Configurar enlaces sociales
    const socialLinks = {
        'social-whatsapp': `https://wa.me/${config.whatsapp.number}`,
        'social-facebook': config.social.facebook,
        'social-instagram': config.social.instagram,
        'social-linkedin': config.social.linkedin
    };
    
    Object.entries(socialLinks).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el) { el.addEventListener('click', (e) => { e.preventDefault(); if (url !== '#') window.open(url, '_blank'); }); }
    });
    
    // ========================================
    // Sistema de Notificaciones
    // ========================================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed', top: '20px', right: '20px', padding: '1rem 1.5rem',
            borderRadius: '8px', color: 'white', fontWeight: '500', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',

    // ========================================
    // Formulario de Cotización
    // ========================================
    const cotizacionForm = document.getElementById('cotizacionForm');
    
    if (cotizacionForm) {
        cotizacionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => data[key] = value);
            
            if (!data.nombre || !data.telefono || !data.email || !data.direccion || !data.tipo_inmueble || !data.tipo_servicio) {
                showNotification('Por favor, completa todos los campos requeridos.', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(`${config.apiUrl}/solicitudes-cotizacion`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showNotification('¡Solicitud enviada! Nos contactaremos pronto.', 'success');
                    this.reset();
                } else {
                    throw new Error(result.message || 'Error al enviar');
                }
            } catch (error) {
                showNotification('Hubo un error. Intenta nuevamente o contáctanos por WhatsApp.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // ========================================
    // Cargar datos de configuración
    // ========================================
    async function cargarConfiguracion() {
        try {
            const response = await fetch(`${config.apiUrl}/configuracion/publica`);
            if (response.ok) {
                const data = await response.json();
                const phoneEls = document.querySelectorAll('[id^="contact-phone"]');
                if (phoneEls.length >= 1) phoneEls[0].textContent = data.telefono1 || '';
                if (phoneEls.length >= 2) phoneEls[1].textContent = data.telefono2 || '';
                
                const emailEl = document.getElementById('contact-email');
                if (emailEl) emailEl.textContent = data.email || 'contacto@codigocompany.com';
                
                const addressEl = document.getElementById('contact-address');
                if (addressEl) addressEl.textContent = data.direccion || 'Por configurar';
                
                const hoursEl = document.getElementById('contact-hours');
                if (hoursEl) hoursEl.textContent = data.horarios || 'Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00';
            }
        } catch (error) {
            console.log('Configuración no disponible, usando valores por defecto');
        }
    }
    
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        cargarConfiguracion();
    }
    
    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        revealElements.forEach(el => revealObserver.observe(el));
    }
    
    console.log('Código Company - Sistema cargado v0.1.0');
    window.cc = { showNotification, openWhatsApp, config };
            zIndex: '10000', transform: 'translateX(120%)', transition: 'transform 0.3s ease',
            maxWidth: '400px', border: 'none', cursor: 'default',
            background: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'
        });
        
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
        }, 5000);
        
        return notification;
    }
        });
    });
    
    // ========================================
    // Highlight de navegación activa
    // ========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }, { root: null, threshold: 0.3 });
    
    sections.forEach(section => sectionObserver.observe(section));