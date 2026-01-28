// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let currentAdmin = null;
let currentBooking = null;
let selectedPaymentMethod = 'card';
let editingTripId = null;
let allBookings = [];
let customerStats = {};

// Trip data with full details
const tripData = {
    mozambique: {
        id: 'mozambique',
        name: 'Mozambique Paradise',
        location: 'Mozambique',
        duration: '7 Days',
        basePrice: 12500,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
        description: 'Experience pristine beaches, crystal clear waters, and vibrant marine life on this 7-day tropical getaway.'
    },
    capetown: {
        id: 'capetown',
        name: 'Cape Town Explorer',
        location: 'South Africa',
        duration: '5 Days',
        basePrice: 8900,
        image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600',
        description: 'Discover the Mother City with Table Mountain views, wine tours, and stunning coastal drives.'
    },
    zanzibar: {
        id: 'zanzibar',
        name: 'Zanzibar Island Escape',
        location: 'Tanzania',
        duration: '6 Days',
        basePrice: 10200,
        image: 'https://images.unsplash.com/photo-1568408310668-b022b9e13718?w=600',
        description: 'Immerse yourself in the spice islands with historic Stone Town and white sand beaches.'
    },
    'victoria-falls': {
        id: 'victoria-falls',
        name: 'Victoria Falls Adventure',
        location: 'Zimbabwe/Zambia',
        duration: '4 Days',
        basePrice: 9800,
        image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600',
        description: 'Witness one of the Seven Natural Wonders with thrilling activities and wildlife safaris.'
    },
    mauritius: {
        id: 'mauritius',
        name: 'Mauritius Luxury Retreat',
        location: 'Mauritius',
        duration: '8 Days',
        basePrice: 15600,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
        description: 'Indulge in luxury resorts, turquoise lagoons, and world-class diving experiences.'
    },
    kruger: {
        id: 'kruger',
        name: 'Kruger Safari Experience',
        location: 'South Africa',
        duration: '5 Days',
        basePrice: 11400,
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600',
        description: 'Encounter the Big Five on guided game drives through Africa\'s premier wildlife reserve.'
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavigation();
    initContactForm();
    initAuthForms();
    initBookingForm();
    initCheckout();
    initAdminPortal();
    checkUserSession();
    loadStoredData();
    setMinDate();
});

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId !== '#') {
                    scrollToSection(targetId.substring(1));
                }
                navMenu.classList.remove('active');
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // User/Admin button - single button that handles both
    const userBtn = document.getElementById('userBtn');
    userBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser || currentAdmin) {
            handleLogout();
        } else {
            openModal('loginModal');
        }
    });
    
    // Remove separate admin button functionality since we use one login
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentAdmin) {
                openModal('adminDashboard');
                if (typeof refreshAdminData === 'function') {
                    refreshAdminData();
                }
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveLink);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const sectionTop = section.offsetTop - navHeight;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// AUTHENTICATION
// ============================================
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('Login attempt:', email); // Debug log
    
    // Check if this is an admin login attempt (exact match)
    if (email === 'admin@travelmavericks.com' && password === 'admin123') {
        console.log('Admin login detected!'); // Debug log
        
        // Clear any existing user session
        currentUser = null;
        localStorage.removeItem('user');
        
        // Handle as admin login
        currentAdmin = {
            email: email,
            name: 'Administrator',
            role: 'admin'
        };
        
        localStorage.setItem('admin', JSON.stringify(currentAdmin));
        updateAdminUI();
        closeModal('loginModal');
        showNotification('Welcome Administrator!', 'success');
        
        // Simple direct approach to open admin dashboard
        setTimeout(() => {
            console.log('Opening admin dashboard...');
            const modal = document.getElementById('adminDashboard');
            if (modal) {
                // Force modal to show
                modal.style.display = 'flex';
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Admin dashboard opened');
                
                // Show overview section by default
                setTimeout(() => {
                    const overviewSection = document.getElementById('adminOverview');
                    if (overviewSection) {
                        overviewSection.classList.add('active');
                    }
                    // Try to initialize data
                    try {
                        if (typeof refreshAdminData === 'function') {
                            refreshAdminData();
                        } else {
                            console.log('Basic admin initialization...');
                            // Basic initialization
                            if (document.getElementById('totalBookings')) {
                                document.getElementById('totalBookings').textContent = allBookings.length || 0;
                            }
                            if (document.getElementById('totalCustomers')) {
                                document.getElementById('totalCustomers').textContent = Object.keys(customerStats).length || 0;
                            }
                        }
                    } catch (error) {
                        console.error('Error initializing admin data:', error);
                    }
                }, 100);
            } else {
                console.error('Admin dashboard not found');
                alert('Admin dashboard not available. Please check the console for errors.');
            }
        }, 500);
        return; // Important: exit here for admin login
    }
    
    // Regular user authentication (only if not admin)
    if (email && password) {
        console.log('Regular user login'); // Debug log
        
        // Clear any existing admin session
        currentAdmin = null;
        localStorage.removeItem('admin');
        
        currentUser = {
            email: email,
            name: email.split('@')[0]
        };
        
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUI();
        updateAdminUI(); // Hide admin button
        closeModal('loginModal');
        showNotification('Welcome back! You are now logged in.', 'success');
        
        // If there was a pending booking, proceed with it
        if (currentBooking) {
            openModal('bookingModal');
        } else {
            // Scroll to trips section for regular users
            setTimeout(() => {
                scrollToSection('trips');
            }, 500);
        }
    } else {
        showNotification('Please enter valid login credentials.', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (name && email && password) {
        currentUser = {
            email: email,
            name: name
        };
        
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUI();
        closeModal('signupModal');
        showNotification('Account created successfully! You are now logged in.', 'success');
        
        // If there was a pending booking, proceed with it
        if (currentBooking) {
            openModal('bookingModal');
        }
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Demo admin credentials
    if (email === 'admin@travelmavericks.com' && password === 'admin123') {
        currentAdmin = {
            email: email,
            name: 'Administrator',
            role: 'admin'
        };
        
        localStorage.setItem('admin', JSON.stringify(currentAdmin));
        updateAdminUI();
        closeModal('adminLoginModal');
        showNotification('Welcome Administrator!', 'success');
        openModal('adminDashboard');
        refreshAdminData();
    } else {
        showNotification('Invalid admin credentials!', 'error');
    }
}

function handleLogout() {
    const wasAdmin = !!currentAdmin;
    
    currentUser = null;
    currentAdmin = null;
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    updateUserUI();
    updateAdminUI();
    
    if (wasAdmin) {
        closeModal('adminDashboard');
        showNotification('Admin logged out successfully.', 'success');
        // Scroll to home for logged out admin
        scrollToSection('home');
    } else {
        showNotification('You have been logged out.', 'success');
    }
}

function checkUserSession() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
    
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        updateAdminUI();
        // Don't auto-open admin dashboard on page load
        // Let admin manually open it when ready
    }
}

function updateUserUI() {
    const userBtn = document.getElementById('userBtn');
    if (currentAdmin) {
        userBtn.innerHTML = `<i class="fas fa-user-shield"></i> Administrator`;
        userBtn.title = 'Click to logout';
    } else if (currentUser) {
        userBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
        userBtn.title = 'Click to logout';
    } else {
        userBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
        userBtn.title = 'Click to login';
    }
}

function updateAdminUI() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        if (currentAdmin) {
            adminBtn.style.display = 'block';
            adminBtn.innerHTML = `<i class="fas fa-cog"></i> Dashboard`;
            adminBtn.title = 'Open Admin Dashboard';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

function switchToSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

function switchToLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}

// ============================================
// BOOKING SYSTEM
// ============================================
function openBooking(tripId) {
    // Check if user is logged in
    if (!currentUser) {
        currentBooking = tripData[tripId];
        showNotification('Please login to book a trip.', 'info');
        openModal('loginModal');
        return;
    }
    
    const trip = tripData[tripId];
    if (!trip) return;
    
    currentBooking = trip;
    
    // Populate booking modal
    document.getElementById('bookingTitle').textContent = `Book Your Trip to ${trip.name}`;
    document.getElementById('bookingDestination').textContent = trip.name;
    document.getElementById('bookingDuration').textContent = trip.duration;
    document.getElementById('bookingLocation').textContent = trip.location;
    document.getElementById('bookingPrice').textContent = `R ${trip.basePrice.toLocaleString()}`;
    document.getElementById('bookingImage').src = trip.image;
    document.getElementById('bookingImage').alt = trip.name;
    
    // Pre-fill user data if logged in
    if (currentUser) {
        document.getElementById('bookingName').value = currentUser.name || '';
        document.getElementById('bookingEmail').value = currentUser.email || '';
    }
    
    openModal('bookingModal');
}

function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const travelersInput = document.getElementById('bookingTravelers');
    const accommodationSelect = document.getElementById('bookingAccommodation');
    
    // Update price when travelers or accommodation changes
    travelersInput.addEventListener('input', updateBookingPrice);
    accommodationSelect.addEventListener('change', updateBookingPrice);
    
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

function updateBookingPrice() {
    if (!currentBooking) return;
    
    const travelers = parseInt(document.getElementById('bookingTravelers').value) || 1;
    const accommodation = document.getElementById('bookingAccommodation').value;
    
    let accommodationPrice = 0;
    if (accommodation === 'deluxe') accommodationPrice = 2000;
    if (accommodation === 'luxury') accommodationPrice = 5000;
    
    const totalPrice = (currentBooking.basePrice + accommodationPrice) * travelers;
    document.getElementById('bookingPrice').textContent = `R ${totalPrice.toLocaleString()}`;
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingDetails = {
        trip: currentBooking,
        name: document.getElementById('bookingName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        travelers: parseInt(document.getElementById('bookingTravelers').value),
        date: document.getElementById('bookingDate').value,
        accommodation: document.getElementById('bookingAccommodation').value,
        notes: document.getElementById('bookingNotes').value
    };
    
    // Store booking details
    currentBooking = { ...currentBooking, ...bookingDetails };
    
    // Move to checkout
    closeModal('bookingModal');
    openCheckout();
}

// ============================================
// CHECKOUT
// ============================================
function initCheckout() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const completePaymentBtn = document.getElementById('completePaymentBtn');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', handlePaymentMethodChange);
    });
    
    completePaymentBtn.addEventListener('click', handlePaymentComplete);
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // CVV validation
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    }
}

function openCheckout() {
    if (!currentBooking) return;
    
    const accommodationLabels = {
        'standard': 'Standard',
        'deluxe': 'Deluxe',
        'luxury': 'Luxury'
    };
    
    const accommodationPrices = {
        'standard': 0,
        'deluxe': 2000,
        'luxury': 5000
    };
    
    const basePrice = currentBooking.trip.basePrice;
    const accommodationUpgrade = accommodationPrices[currentBooking.accommodation] || 0;
    const totalPerPerson = basePrice + accommodationUpgrade;
    const total = totalPerPerson * currentBooking.travelers;
    
    // Populate checkout summary
    document.getElementById('checkoutTripName').textContent = currentBooking.trip.name;
    document.getElementById('checkoutTravelers').textContent = currentBooking.travelers;
    document.getElementById('checkoutAccommodation').textContent = accommodationLabels[currentBooking.accommodation] || 'Standard';
    document.getElementById('checkoutDate').textContent = formatDate(currentBooking.date);
    document.getElementById('checkoutBasePrice').textContent = `R ${(basePrice * currentBooking.travelers).toLocaleString()}`;
    document.getElementById('checkoutUpgradePrice').textContent = `R ${(accommodationUpgrade * currentBooking.travelers).toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `R ${total.toLocaleString()}`;
    
    openModal('checkoutModal');
    
    // Initialize PayPal if not already done
    if (typeof paypal !== 'undefined' && document.getElementById('paypal-button-container').children.length === 0) {
        initPayPal(total);
    }
}

function handlePaymentMethodChange(e) {
    selectedPaymentMethod = e.target.value;
    
    // Hide all payment forms
    document.getElementById('cardPaymentForm').style.display = 'none';
    document.getElementById('paypalPaymentForm').style.display = 'none';
    document.getElementById('eftPaymentForm').style.display = 'none';
    
    // Show selected payment form
    if (selectedPaymentMethod === 'card') {
        document.getElementById('cardPaymentForm').style.display = 'block';
    } else if (selectedPaymentMethod === 'paypal') {
        document.getElementById('paypalPaymentForm').style.display = 'block';
    } else if (selectedPaymentMethod === 'eft') {
        document.getElementById('eftPaymentForm').style.display = 'block';
    }
}

function handlePaymentComplete() {
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            showNotification('Please fill in all card details.', 'error');
            return;
        }
        
        if (cardNumber.replace(/\s/g, '').length < 13) {
            showNotification('Please enter a valid card number.', 'error');
            return;
        }
        
        if (cardCvv.length < 3) {
            showNotification('Please enter a valid CVV.', 'error');
            return;
        }
    }
    
    // Process payment (simulate success)
    completeBooking();
}

function completeBooking() {
    const bookingRef = generateBookingReference();
    
    // Store booking data
    const booking = {
        reference: bookingRef,
        customer: currentBooking.name,
        email: currentBooking.email,
        phone: currentBooking.phone,
        trip: currentBooking.trip,
        travelers: currentBooking.travelers,
        date: currentBooking.date,
        accommodation: currentBooking.accommodation,
        notes: currentBooking.notes,
        status: 'confirmed',
        paymentMethod: selectedPaymentMethod,
        bookedAt: new Date().toISOString(),
        totalAmount: calculateBookingTotal(currentBooking)
    };
    
    // Add to bookings array
    allBookings.push(booking);
    
    // Update customer stats
    updateCustomerStats(currentBooking.email, booking.totalAmount);
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(allBookings));
    localStorage.setItem('customerStats', JSON.stringify(customerStats));
    
    closeModal('checkoutModal');
    
    // Show success modal
    document.getElementById('bookingReference').textContent = bookingRef;
    openModal('successModal');
    
    // Reset booking
    currentBooking = null;
}

function initPayPal(amount) {
    // Note: Replace 'YOUR_PAYPAL_CLIENT_ID' in the HTML with actual PayPal client ID
    if (typeof paypal === 'undefined') return;
    
    try {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: 'ZAR',
                            value: amount.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    completeBooking();
                });
            },
            onError: function(err) {
                showNotification('Payment failed. Please try again.', 'error');
            }
        }).render('#paypal-button-container');
    } catch (error) {
        console.log('PayPal SDK not loaded');
    }
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactSubmit);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    // Simulate form submission
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    e.target.reset();
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Ensure modal is visible
        document.body.style.overflow = 'hidden';
        console.log('Modal opened successfully:', modalId);
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Modal closed:', modalId);
    } else {
        console.error('Modal not found for closing:', modalId);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-ZA', options);
}

function generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'TM-';
    for (let i = 0; i < 8; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

function setMinDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
}

// ============================================
// ADMIN PORTAL FUNCTIONS
// ============================================
function initAdminPortal() {
    const tripForm = document.getElementById('tripForm');
    if (tripForm) {
        tripForm.addEventListener('submit', handleTripFormSubmit);
    }
}

function showAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`admin${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`);
    if (section) {
        section.classList.add('active');
    }
    
    // Activate nav button
    const navBtn = document.querySelector(`[onclick="showAdminSection('${sectionName}')"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Refresh data for the section
    switch (sectionName) {
        case 'overview':
            refreshOverviewStats();
            break;
        case 'trips':
            refreshTripsTable();
            break;
        case 'bookings':
            refreshBookingsTable();
            break;
        case 'customers':
            refreshCustomersTable();
            break;
        case 'analytics':
            refreshAnalytics();
            break;
    }
}

function refreshAdminData() {
    refreshOverviewStats();
    refreshTripsTable();
    refreshBookingsTable();
    refreshCustomersTable();
    refreshAnalytics();
}

function refreshOverviewStats() {
    const totalBookings = allBookings.length;
    const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalCustomers = Object.keys(customerStats).length;
    const loyalCustomers = Object.values(customerStats).filter(stats => stats.bookingCount >= 3).length;
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = `R ${totalRevenue.toLocaleString()}`;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('loyalCustomers').textContent = loyalCustomers;
}

function refreshTripsTable() {
    const tbody = document.getElementById('tripsTableBody');
    tbody.innerHTML = '';
    
    Object.values(tripData).forEach(trip => {
        const bookingCount = allBookings.filter(booking => booking.trip.id === trip.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${trip.image}" alt="${trip.name}"></td>
            <td>${trip.name}</td>
            <td>${trip.location}</td>
            <td>${trip.duration}</td>
            <td>R ${trip.basePrice.toLocaleString()}</td>
            <td>${bookingCount}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-warning" onclick="editTrip('${trip.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTrip('${trip.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    const statusFilter = document.getElementById('bookingStatusFilter')?.value || 'all';
    
    tbody.innerHTML = '';
    
    let filteredBookings = allBookings;
    if (statusFilter !== 'all') {
        filteredBookings = allBookings.filter(booking => booking.status === statusFilter);
    }
    
    filteredBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.reference}</td>
            <td>${booking.customer}<br><small>${booking.email}</small></td>
            <td>${booking.trip.name}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.travelers}</td>
            <td>R ${booking.totalAmount.toLocaleString()}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-success" onclick="updateBookingStatus('${booking.reference}', 'confirmed')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateBookingStatus('${booking.reference}', 'cancelled')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    const typeFilter = document.getElementById('customerTypeFilter')?.value || 'all';
    
    tbody.innerHTML = '';
    
    let customers = Object.entries(customerStats);
    
    if (typeFilter !== 'all') {
        customers = customers.filter(([email, stats]) => {
            switch (typeFilter) {
                case 'loyal': return stats.bookingCount >= 3;
                case 'regular': return stats.bookingCount > 1 && stats.bookingCount < 3;
                case 'new': return stats.bookingCount === 1;
                default: return true;
            }
        });
    }
    
    customers.forEach(([email, stats]) => {
        const loyaltyStatus = getLoyaltyStatus(stats.bookingCount);
        const discountEligible = stats.bookingCount >= 3;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stats.name}</td>
            <td>${email}</td>
            <td>${stats.bookingCount}</td>
            <td>R ${stats.totalSpent.toLocaleString()}</td>
            <td><span class="loyalty-badge loyalty-${loyaltyStatus.toLowerCase()}">${loyaltyStatus}</span></td>
            <td>${discountEligible ? '<span style="color: var(--accent-color);"><i class="fas fa-check"></i> 15% Discount</span>' : 'No'}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-warning" onclick="viewCustomerDetails('${email}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${discountEligible ? '<button class="btn btn-sm btn-success" onclick="sendDiscountCode(\'' + email + '\')" title="Send discount code"><i class="fas fa-gift"></i></button>' : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshAnalytics() {
    refreshPopularDestinations();
    refreshMonthlyRevenue();
    refreshCustomerLoyalty();
    refreshBookingTrends();
}

function refreshPopularDestinations() {
    const container = document.getElementById('popularDestinations');
    const destinationCounts = {};
    
    allBookings.forEach(booking => {
        const tripName = booking.trip.name;
        destinationCounts[tripName] = (destinationCounts[tripName] || 0) + 1;
    });
    
    const sorted = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p>No booking data available</p>';
        return;
    }
    
    container.innerHTML = sorted.map(([name, count]) => 
        `<div class="chart-bar" style="width: ${(count / sorted[0][1]) * 100}%">
            ${name}: ${count}
        </div>`
    ).join('');
}

function refreshMonthlyRevenue() {
    const container = document.getElementById('monthlyRevenue');
    const monthlyData = {};
    
    allBookings.forEach(booking => {
        const month = new Date(booking.bookedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + booking.totalAmount;
    });
    
    const sorted = Object.entries(monthlyData).slice(-6);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p>No revenue data available</p>';
        return;
    }
    
    const maxRevenue = Math.max(...sorted.map(([,amount]) => amount));
    
    container.innerHTML = sorted.map(([month, amount]) => 
        `<div class="chart-bar" style="height: ${(amount / maxRevenue) * 100}%; min-height: 30px;">
            ${month}: R${(amount/1000).toFixed(0)}k
        </div>`
    ).join('');
}

function refreshCustomerLoyalty() {
    const container = document.getElementById('customerLoyalty');
    const loyaltyCounts = { new: 0, regular: 0, loyal: 0, vip: 0 };
    
    Object.values(customerStats).forEach(stats => {
        const status = getLoyaltyStatus(stats.bookingCount).toLowerCase();
        loyaltyCounts[status]++;
    });
    
    const total = Object.values(loyaltyCounts).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        container.innerHTML = '<p>No customer data available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(loyaltyCounts).map(([status, count]) => 
        `<div class="chart-bar loyalty-${status}" style="width: ${(count / total) * 100}%">
            ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}
        </div>`
    ).join('');
}

function refreshBookingTrends() {
    const container = document.getElementById('bookingTrends');
    const dailyBookings = {};
    
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
        dailyBookings[date] = allBookings.filter(booking => 
            booking.bookedAt.split('T')[0] === date
        ).length;
    });
    
    const maxBookings = Math.max(...Object.values(dailyBookings), 1);
    
    container.innerHTML = Object.entries(dailyBookings).map(([date, count]) => 
        `<div class="chart-bar" style="height: ${(count / maxBookings) * 100}%; min-height: 30px;">
            ${new Date(date).toLocaleDateString('en', {month: 'short', day: 'numeric'})}: ${count}
        </div>`
    ).join('');
}

// Trip Management Functions
function openTripModal(tripId = null) {
    editingTripId = tripId;
    const modal = document.getElementById('tripModal');
    const title = document.getElementById('tripModalTitle');
    const form = document.getElementById('tripForm');
    
    if (tripId && tripData[tripId]) {
        // Edit mode
        title.innerHTML = '<i class="fas fa-edit"></i> Edit Trip';
        const trip = tripData[tripId];
        document.getElementById('tripName').value = trip.name;
        document.getElementById('tripLocation').value = trip.location;
        document.getElementById('tripDuration').value = trip.duration;
        document.getElementById('tripPrice').value = trip.basePrice;
        document.getElementById('tripImage').value = trip.image;
        document.getElementById('tripDescription').value = trip.description;
    } else {
        // Add mode
        title.innerHTML = '<i class="fas fa-map-marked-alt"></i> Add New Trip';
        form.reset();
    }
    
    openModal('tripModal');
}

function handleTripFormSubmit(e) {
    e.preventDefault();
    
    const tripId = editingTripId || generateTripId();
    const tripName = document.getElementById('tripName').value;
    const tripLocation = document.getElementById('tripLocation').value;
    const tripDuration = document.getElementById('tripDuration').value;
    const tripPrice = parseInt(document.getElementById('tripPrice').value);
    const tripImage = document.getElementById('tripImage').value;
    const tripDescription = document.getElementById('tripDescription').value;
    
    const trip = {
        id: tripId,
        name: tripName,
        location: tripLocation,
        duration: tripDuration,
        basePrice: tripPrice,
        image: tripImage,
        description: tripDescription
    };
    
    // Update trip data
    tripData[tripId] = trip;
    
    // Save to localStorage
    localStorage.setItem('tripData', JSON.stringify(tripData));
    
    // Update UI
    refreshTripsTable();
    updateTripsGrid();
    
    closeModal('tripModal');
    showNotification(editingTripId ? 'Trip updated successfully!' : 'Trip added successfully!', 'success');
    
    editingTripId = null;
}

function editTrip(tripId) {
    openTripModal(tripId);
}

function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        // Check if trip has bookings
        const hasBookings = allBookings.some(booking => booking.trip.id === tripId);
        
        if (hasBookings) {
            if (!confirm('This trip has existing bookings. Deleting it may affect those bookings. Continue?')) {
                return;
            }
        }
        
        delete tripData[tripId];
        localStorage.setItem('tripData', JSON.stringify(tripData));
        
        refreshTripsTable();
        updateTripsGrid();
        showNotification('Trip deleted successfully!', 'success');
    }
}

function generateTripId() {
    return 'trip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Booking Management Functions
function updateBookingStatus(reference, status) {
    const booking = allBookings.find(b => b.reference === reference);
    if (booking) {
        booking.status = status;
        localStorage.setItem('bookings', JSON.stringify(allBookings));
        refreshBookingsTable();
        refreshOverviewStats();
        showNotification(`Booking ${status} successfully!`, 'success');
    }
}

function filterBookings() {
    refreshBookingsTable();
}

function filterCustomers() {
    refreshCustomersTable();
}

// Customer Management Functions
function updateCustomerStats(email, amount) {
    if (!customerStats[email]) {
        customerStats[email] = {
            name: currentBooking.name,
            bookingCount: 0,
            totalSpent: 0
        };
    }
    
    customerStats[email].bookingCount++;
    customerStats[email].totalSpent += amount;
}

function getLoyaltyStatus(bookingCount) {
    if (bookingCount >= 10) return 'VIP';
    if (bookingCount >= 3) return 'Loyal';
    if (bookingCount > 1) return 'Regular';
    return 'New';
}

function viewCustomerDetails(email) {
    const stats = customerStats[email];
    const customerBookings = allBookings.filter(booking => booking.email === email);
    
    alert(`Customer Details:\n\nName: ${stats.name}\nEmail: ${email}\nTotal Bookings: ${stats.bookingCount}\nTotal Spent: R ${stats.totalSpent.toLocaleString()}\nLoyalty Status: ${getLoyaltyStatus(stats.bookingCount)}\n\nRecent Bookings:\n${customerBookings.slice(-3).map(b => `${b.reference} - ${b.trip.name} (${formatDate(b.date)})`).join('\n')}`);
}

function sendDiscountCode(email) {
    const discountCode = 'LOYAL15-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // In a real app, this would send an email
    showNotification(`Discount code ${discountCode} sent to ${email}!`, 'success');
    
    // Log the discount for admin reference
    console.log(`Discount code generated for ${email}: ${discountCode} (15% off)`);
}

// Utility Functions
function calculateBookingTotal(booking) {
    const accommodationPrices = {
        'standard': 0,
        'deluxe': 2000,
        'luxury': 5000
    };
    
    const basePrice = booking.trip.basePrice;
    const accommodationUpgrade = accommodationPrices[booking.accommodation] || 0;
    const totalPerPerson = basePrice + accommodationUpgrade;
    
    // Apply loyal customer discount
    let total = totalPerPerson * booking.travelers;
    const customerStat = customerStats[booking.email];
    if (customerStat && customerStat.bookingCount >= 2) {
        total = total * 0.85; // 15% discount for returning customers
    }
    
    return Math.round(total);
}

function exportBookings() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Reference,Customer,Email,Trip,Date,Travelers,Amount,Status\n" +
        allBookings.map(booking => 
            `${booking.reference},${booking.customer},${booking.email},${booking.trip.name},${booking.date},${booking.travelers},${booking.totalAmount},${booking.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "travel_bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Bookings exported successfully!', 'success');
}

function loadStoredData() {
    // Load bookings
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
        allBookings = JSON.parse(storedBookings);
    }
    
    // Load customer stats
    const storedCustomerStats = localStorage.getItem('customerStats');
    if (storedCustomerStats) {
        customerStats = JSON.parse(storedCustomerStats);
    }
    
    // Load trip data
    const storedTripData = localStorage.getItem('tripData');
    if (storedTripData) {
        Object.assign(tripData, JSON.parse(storedTripData));
        updateTripsGrid();
    }
}

function updateTripsGrid() {
    const tripsGrid = document.getElementById('tripsGrid');
    tripsGrid.innerHTML = '';
    
    Object.values(tripData).forEach(trip => {
        const tripCard = createTripCard(trip);
        tripsGrid.appendChild(tripCard);
    });
}

function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.setAttribute('data-trip-id', trip.id);
    
    const bookingCount = allBookings.filter(booking => booking.trip.id === trip.id).length;
    const isPopular = bookingCount >= 3;
    
    card.innerHTML = `
        <div class="trip-image">
            <img src="${trip.image}" alt="${trip.name}">
            ${isPopular ? '<div class="trip-badge">Popular</div>' : ''}
        </div>
        <div class="trip-content">
            <h3>${trip.name}</h3>
            <div class="trip-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${trip.location}</span>
            </div>
            <p class="trip-description">${trip.description}</p>
            <div class="trip-details">
                <div class="trip-duration">
                    <i class="fas fa-clock"></i>
                    <span>${trip.duration}</span>
                </div>
                <div class="trip-price">
                    <span class="price-label">From</span>
                    <span class="price-value">R ${trip.basePrice.toLocaleString()}</span>
                </div>
            </div>
            <button class="btn btn-secondary btn-book" onclick="openBooking('${trip.id}')">
                Book Now
            </button>
        </div>
    `;
    
    return card;
}

// ============================================
// ANIMATIONS
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
