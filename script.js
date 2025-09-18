// AttendEase - Smart Attendance Management System
// Complete JavaScript functionality

// Global variables
let currentUser = null;
let currentUserType = null;
let isDarkMode = false;
let qrCodeInterval;
let qrCodeScanner;

// Sample data for demonstration
const sampleStudents = [
    { id: 1, rollNo: 'CS001', name: 'Shantanu Kumar', present: 42, absent: 8, activeDays: 50 },
    { id: 2, rollNo: 'CS002', name: 'Amit Kumar', present: 38, absent: 12, activeDays: 50 },
    { id: 3, rollNo: 'CS003', name: 'Shivam Sony', present: 45, absent: 5, activeDays: 50 },
    { id: 4, rollNo: 'CS004', name: 'Suryam Kumar', present: 40, absent: 10, activeDays: 50 },
    { id: 5, rollNo: 'CS005', name: 'Aniket Kumar', present: 47, absent: 3, activeDays: 50 },
    { id: 6, rollNo: 'CS006', name: 'Astha Kumari', present: 35, absent: 15, activeDays: 50 },
    { id: 7, rollNo: 'CS007', name: 'Grace Lee', present: 44, absent: 6, activeDays: 50 },
    { id: 8, rollNo: 'CS008', name: 'Henry Taylor', present: 41, absent: 9, activeDays: 50 },
    { id: 9, rollNo: 'CS009', name: 'Ivy Chen', present: 46, absent: 4, activeDays: 50 },
    { id: 10, rollNo: 'CS010', name: 'Jack Anderson', present: 39, absent: 11, activeDays: 50 }
];

// Student Dashboard Data
let studentNotifications = [
    {
        id: 1,
        type: 'free-period',
        title: 'Free Period Alert',
        message: 'You have a free period from 1:00 PM - 2:00 PM. Perfect time to review Physics notes!',
        time: '12:45 PM',
        priority: 'high',
        read: false
    },
    {
        id: 2,
        type: 'attendance',
        title: 'Attendance Warning',
        message: 'Your Physics attendance is at 72%. Attend next 3 classes to maintain 75%.',
        time: '10:30 AM',
        priority: 'medium',
        read: false
    },
    {
        id: 3,
        type: 'suggestion',
        title: 'Study Suggestion',
        message: 'Based on your schedule, consider reviewing Math Chapter 5 during your free period.',
        time: '9:15 AM',
        priority: 'low',
        read: false
    }
];

let personalRoutine = JSON.parse(localStorage.getItem('personalRoutine')) || [
    {
        id: 1,
        activity: 'Morning Exercise',
        time: '06:00',
        duration: 30,
        priority: 'high'
    },
    {
        id: 2,
        activity: 'Review Previous Day Notes',
        time: '07:30',
        duration: 45,
        priority: 'medium'
    },
    {
        id: 3,
        activity: 'Complete Math Assignment',
        time: '19:00',
        duration: 60,
        priority: 'high'
    }
];

let dailySchedule = [
    {
        id: 1,
        subject: 'Mathematics',
        time: '09:00',
        endTime: '10:00',
        room: 'Room 101',
        teacher: 'Prof. Johnson',
        status: 'completed'
    },
    {
        id: 2,
        subject: 'Physics',
        time: '10:15',
        endTime: '11:15',
        room: 'Lab 201',
        teacher: 'Dr. Smith',
        status: 'completed'
    },
    {
        id: 3,
        subject: 'Free Period',
        time: '11:30',
        endTime: '12:30',
        room: 'Library',
        teacher: '',
        status: 'current'
    },
    {
        id: 4,
        subject: 'Chemistry',
        time: '13:00',
        endTime: '14:00',
        room: 'Lab 301',
        teacher: 'Prof. Davis',
        status: 'upcoming'
    },
    {
        id: 5,
        subject: 'English',
        time: '14:15',
        endTime: '15:15',
        room: 'Room 205',
        teacher: 'Ms. Wilson',
        status: 'upcoming'
    }
];

// Theme Management
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDarkMode = true;
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').textContent = '☀️';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark');
    document.getElementById('theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Time Management
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
    
    const teacherTimeElement = document.getElementById('teacher-current-time');
    if (teacherTimeElement) {
        teacherTimeElement.textContent = timeString;
    }
    
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = timeString;
    }
    
    const scheduleDateElement = document.getElementById('schedule-date');
    if (scheduleDateElement) {
        scheduleDateElement.textContent = dateString;
    }
}

// Navigation Functions
function hideAllPages() {
    const pages = ['home-page', 'student-dashboard', 'teacher-dashboard', 'classroom-setup', 'classroom-display', 'qr-code-display'];
    pages.forEach(page => {
        document.getElementById(page).classList.add('hidden');
    });
}

function goHome() {
    hideAllPages();
    document.getElementById('home-page').classList.remove('hidden');
    currentUser = null;
    currentUserType = null;
    clearInterval(qrCodeInterval); // Stop QR code generation when going home
}

function logout() {
    goHome();
    showSuccessMessage('Logged out successfully!');
}

// Login System
function showLogin(userType) {
    currentUserType = userType;
    document.getElementById('login-title').textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Login`;
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('username').focus();
}

function hideLogin() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-form').reset();
}

// QR Code Login and Display
function showQrLogin() {
    hideAllPages();
    document.getElementById('qr-code-display').classList.remove('hidden');
    generateAndDisplayQrCode();
    qrCodeInterval = setInterval(generateAndDisplayQrCode, 5000);
}

function generateAndDisplayQrCode() {
    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = ''; // Clear previous QR code
    const timestamp = new Date().getTime(); // Dynamic data
    new QRCode(qrCodeContainer, {
        text: `attendance:${timestamp}`,
        width: 256,
        height: 256,
        colorDark: isDarkMode ? "#ffffff" : "#000000",
        colorLight: isDarkMode ? "#1f2937" : "#ffffff",
    });
    
    // Timer
    let timeLeft = 5;
    const timerElement = document.getElementById('qr-timer');
    timerElement.textContent = timeLeft;
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

// Student QR Scanner
function showQrScanner() {
    document.getElementById('qr-scanner-modal').classList.remove('hidden');
    
    qrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
    qrCodeScanner.render(onScanSuccess);
}

function hideQrScanner() {
    document.getElementById('qr-scanner-modal').classList.add('hidden');
    qrCodeScanner.clear();
}

function onScanSuccess(decodedText, decodedResult) {
    // Handle the scanned code here
    if (decodedText.startsWith("attendance:")) {
        hideQrScanner();
        showSuccessMessage("Attendance marked successfully!");
        // Here you would typically send the data to a server to record the attendance
    } else {
        showErrorMessage("Invalid QR Code for attendance.");
    }
}

// Student Dashboard Functions
function switchStudentTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.student-tab').forEach(tab => {
        tab.classList.remove('active', 'border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'dark:text-gray-400', 'dark:hover:text-gray-300');
    });
    
    event.target.classList.add('active', 'border-primary', 'text-primary');
    event.target.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'dark:text-gray-400', 'dark:hover:text-gray-300');

    // Hide all tab content
    document.querySelectorAll('.student-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    // Load content based on tab
    if (tabName === 'overview') {
        loadFreePeriodSuggestions();
    } else if (tabName === 'schedule') {
        loadDailySchedule();
    } else if (tabName === 'routine') {
        loadPersonalRoutine();
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
    
    if (!dropdown.classList.contains('hidden')) {
        loadNotifications();
    }
}

function loadNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    const unreadCount = studentNotifications.filter(n => !n.read).length;
    
    document.getElementById('notification-badge').textContent = unreadCount;
    document.getElementById('notification-badge').style.display = unreadCount > 0 ? 'flex' : 'none';

    notificationsList.innerHTML = '';

    if (studentNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                <span class="text-2xl mb-2 block">🔔</span>
                No notifications
            </div>
        `;
        return;
    }

    studentNotifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`;
        notificationElement.onclick = () => markNotificationAsRead(notification.id);
        
        const priorityColor = {
            high: 'text-red-600',
            medium: 'text-yellow-600',
            low: 'text-green-600'
        };

        const typeIcon = {
            'free-period': '⏰',
            'attendance': '📊',
            'suggestion': '💡'
        };

        notificationElement.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${typeIcon[notification.type] || '📢'}</span>
                        <h4 class="font-medium text-gray-800 dark:text-white">${notification.title}</h4>
                        ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full pulse-dot"></div>' : ''}
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${notification.message}</p>
                    <p class="text-xs ${priorityColor[notification.priority]} mt-2">${notification.time}</p>
                </div>
            </div>
        `;
        
        notificationsList.appendChild(notificationElement);
    });
}

function markNotificationAsRead(notificationId) {
    const notification = studentNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        loadNotifications();
    }
}

function loadFreePeriodSuggestions() {
    const suggestionsContainer = document.getElementById('free-period-suggestions');
    const suggestions = [
        {
            title: 'Review Physics Notes',
            description: 'Go through yesterday\'s physics lecture notes on quantum mechanics',
            priority: 'high',
            duration: '30 mins',
            icon: '📚'
        },
        {
            title: 'Complete Math Assignment',
            description: 'Finish the calculus problems due tomorrow morning',
            priority: 'high',
            duration: '45 mins',
            icon: '📝'
        },
        {
            title: 'Library Study Session',
            description: 'Find a quiet spot for focused studying and research',
            priority: 'medium',
            duration: '60 mins',
            icon: '📖'
        },
        {
            title: 'Group Discussion',
            description: 'Join study group for chemistry concepts review',
            priority: 'medium',
            duration: '40 mins',
            icon: '👥'
        },
        {
            title: 'Take a Break',
            description: 'Relax and recharge for your next class',
            priority: 'low',
            duration: '15 mins',
            icon: '☕'
        },
        {
            title: 'Practice Coding',
            description: 'Work on programming assignments and practice problems',
            priority: 'medium',
            duration: '50 mins',
            icon: '💻'
        }
    ];

    suggestionsContainer.innerHTML = '';

    suggestions.forEach(suggestion => {
        const priorityColors = {
            high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
            medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
            low: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
        };

        const suggestionElement = document.createElement('div');
        suggestionElement.className = `p-4 rounded-lg border-2 ${priorityColors[suggestion.priority]} hover:shadow-md transition-all cursor-pointer card-hover`;
        suggestionElement.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${suggestion.icon}</span>
                    <div>
                        <h4 class="font-medium text-gray-800 dark:text-white">${suggestion.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${suggestion.description}</p>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="text-xs px-2 py-1 rounded-full ${suggestion.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">${suggestion.priority.toUpperCase()}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">⏱️ ${suggestion.duration}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        suggestionsContainer.appendChild(suggestionElement);
    });
}

function loadDailySchedule() {
    const scheduleContainer = document.getElementById('daily-schedule');
    scheduleContainer.innerHTML = '';

    dailySchedule.forEach(item => {
        const statusIcons = {
            completed: '✅',
            current: '🔵',
            upcoming: '⏰'
        };

        const statusColors = {
            completed: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
            current: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
            upcoming: 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
        };

        const scheduleItem = document.createElement('div');
        scheduleItem.className = `p-4 rounded-lg border-2 ${statusColors[item.status]} transition-all card-hover`;
        scheduleItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span class="text-2xl ${item.status === 'current' ? 'pulse-dot' : ''}">${statusIcons[item.status]}</span>
                    <div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">${item.subject}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">🕐 ${item.time} - ${item.endTime}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">📍 ${item.room}${item.teacher ? ` • 👨‍🏫 ${item.teacher}` : ''}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : item.status === 'current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}">${item.status.toUpperCase()}</span>
                </div>
            </div>
        `;
        
        scheduleContainer.appendChild(scheduleItem);
    });
}

function loadPersonalRoutine() {
    const routineList = document.getElementById('routine-list');
    routineList.innerHTML = '';

    if (personalRoutine.length === 0) {
        routineList.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <span class="text-4xl mb-4 block">📝</span>
                <p>No routine items yet. Add your first activity!</p>
            </div>
        `;
        return;
    }

    personalRoutine.sort((a, b) => a.time.localeCompare(b.time));

    personalRoutine.forEach(item => {
        const priorityColors = {
            high: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
            medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
            low: 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
        };

        const priorityIcons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };

        const routineItem = document.createElement('div');
        routineItem.className = `p-4 rounded-lg border-l-4 ${priorityColors[item.priority]} bg-white dark:bg-gray-800 shadow-sm card-hover`;
        routineItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800 dark:text-white">${item.activity}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">🕐 ${item.time} • ⏱️ ${item.duration} minutes</p>
                    <span class="text-xs px-2 py-1 rounded-full mt-2 inline-flex items-center gap-1 ${item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">
                        ${priorityIcons[item.priority]} ${item.priority.toUpperCase()}
                    </span>
                </div>
                <button onclick="removeRoutineItem(${item.id})" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all transform hover:scale-110">
                    🗑️
                </button>
            </div>
        `;
        
        routineList.appendChild(routineItem);
    });
}

function removeRoutineItem(itemId) {
    personalRoutine = personalRoutine.filter(item => item.id !== itemId);
    localStorage.setItem('personalRoutine', JSON.stringify(personalRoutine));
    loadPersonalRoutine();
    showSuccessMessage('Activity removed from routine!');
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform notification-enter';
    successDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <span>✅</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        successDiv.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform notification-enter';
    errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <span>❌</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        errorDiv.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
}


// Classroom Display Functions
function showClassroomSetup() {
    hideAllPages();
    document.getElementById('classroom-setup').classList.remove('hidden');
}

function showClassroomDisplay() {
    const batch = document.getElementById('display-batch').value;
    const semester = document.getElementById('display-semester').value;

    if (!batch || !semester) {
        alert('Please select both batch and semester');
        return;
    }

    document.getElementById('display-batch-info').textContent = batch;
    document.getElementById('display-semester-info').textContent = `Semester ${semester}`;

    populateClassroomDisplay();
    hideAllPages();
    document.getElementById('classroom-display').classList.remove('hidden');
    updateCurrentTime();
}

function populateClassroomDisplay() {
    const displayStudents = document.getElementById('display-students');
    displayStudents.innerHTML = '';

    sampleStudents.forEach(student => {
        const attendancePercentage = ((student.present / student.activeDays) * 100).toFixed(1);
        const row = document.createElement('tr');
        
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        
        const statusBadge = attendancePercentage >= 85 ? 
            '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</span>' :
            attendancePercentage >= 75 ?
            '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Good</span>' :
            '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">At Risk</span>';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${student.rollNo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${student.activeDays}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${student.present}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">${student.absent}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${getAttendanceColor(attendancePercentage)}">${attendancePercentage}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${statusBadge}</td>
        `;
        displayStudents.appendChild(row);
    });
}

function getAttendanceColor(percentage) {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
}

// Teacher Dashboard Functions
function loadStudentList() {
    const selectedClass = document.getElementById('teacher-class').value;
    const selectedBatch = document.getElementById('teacher-batch').value;

    if (!selectedClass || !selectedBatch) {
        alert('Please select both class and batch');
        return;
    }

    document.getElementById('selected-class').textContent = selectedClass;
    document.getElementById('selected-batch').textContent = selectedBatch;

    const studentsGrid = document.getElementById('students-grid');
    studentsGrid.innerHTML = '';

    sampleStudents.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md card-hover';
        studentCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-gray-800 dark:text-white">${student.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${student.rollNo}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="markAttendance(${student.id}, 'present')" 
                            class="attendance-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-all transform hover:scale-105">
                        ✅ Present
                    </button>
                    <button onclick="markAttendance(${student.id}, 'absent')" 
                            class="attendance-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all transform hover:scale-105">
                        ❌ Absent
                    </button>
                </div>
            </div>
            <div id="status-${student.id}" class="mt-2 text-sm font-medium hidden"></div>
        `;
        studentsGrid.appendChild(studentCard);
    });

    document.getElementById('student-list').classList.remove('hidden');
}

function markAttendance(studentId, status) {
    const statusDiv = document.getElementById(`status-${studentId}`);
    statusDiv.classList.remove('hidden');
    statusDiv.className = `mt-2 text-sm font-medium ${status === 'present' ? 'text-green-600' : 'text-red-600'}`;
    statusDiv.textContent = status === 'present' ? '✅ Marked Present' : '❌ Marked Absent';
    
    // Add animation
    statusDiv.style.opacity = '0';
    statusDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        statusDiv.style.transition = 'all 0.3s ease';
        statusDiv.style.opacity = '1';
        statusDiv.style.transform = 'translateY(0)';
    }, 10);
}

function markAllPresent() {
    sampleStudents.forEach(student => {
        markAttendance(student.id, 'present');
    });
    showSuccessMessage('All students marked present!');
}

function resetAttendance() {
    const statusDivs = document.querySelectorAll('[id^="status-"]');
    statusDivs.forEach(div => {
        div.classList.add('hidden');
        div.textContent = '';
    });
    showSuccessMessage('Attendance reset successfully!');
}

function submitAttendance() {
    const markedStudents = document.querySelectorAll('[id^="status-"]:not(.hidden)');
    if (markedStudents.length === 0) {
        alert('Please mark attendance for at least one student');
        return;
    }
    
    // Add loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showSuccessMessage(`Attendance submitted successfully for ${markedStudents.length} students!`);
    }, 1500);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    updateCurrentTime();
    
    // Update time every second
    setInterval(updateCurrentTime, 1000);
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation (in real app, this would be server-side)
        if (username && password) {
            currentUser = username;
            hideLogin();
            hideAllPages();

            if (currentUserType === 'student') {
                document.getElementById('student-name').textContent = username;
                document.getElementById('student-dashboard').classList.remove('hidden');
                initializeStudentDashboard();
            } else if (currentUserType === 'teacher') {
                document.getElementById('teacher-name').textContent = username;
                document.getElementById('teacher-dashboard').classList.remove('hidden');
            }
            
            showSuccessMessage(`Welcome back, ${username}!`);
        }
    });

    // Routine form submission
    const routineForm = document.getElementById('routine-form');
    if (routineForm) {
        routineForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const activity = document.getElementById('routine-activity').value;
            const time = document.getElementById('routine-time').value;
            const duration = parseInt(document.getElementById('routine-duration').value);
            const priority = document.getElementById('routine-priority').value;

            const newItem = {
                id: Date.now(),
                activity,
                time,
                duration,
                priority
            };

            personalRoutine.push(newItem);
            localStorage.setItem('personalRoutine', JSON.stringify(personalRoutine));
            
            // Reset form
            routineForm.reset();
            
            // Reload routine list
            loadPersonalRoutine();
            
            // Show success message
            showSuccessMessage('Activity added to your routine!');
        });
    }

    // Contact form modal functionality
    const contactButton = document.getElementById('contact-us-button');
    const contactModal = document.getElementById('contact-form-modal');
    const contactCancelButton = document.getElementById('contact-cancel-button');
    const contactForm = document.getElementById('contact-form');

    if (contactButton) {
        contactButton.addEventListener('click', function() {
            contactModal.classList.remove('hidden');
        });
    }

    if (contactCancelButton) {
        contactCancelButton.addEventListener('click', function() {
            contactModal.classList.add('hidden');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real application, you would send the form data to a server
            showSuccessMessage('Thank you for your message! We\'ll get back to you soon.');
            contactForm.reset();
            contactModal.classList.add('hidden');
        });
    }

    // Close contact modal when clicking outside
    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === this) {
                contactModal.classList.add('hidden');
            }
        });
    }

    // Close modal when clicking outside
    document.getElementById('login-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideLogin();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC to close modal
        if (e.key === 'Escape' && !document.getElementById('login-modal').classList.contains('hidden')) {
            hideLogin();
        }

        // ESC to close contact modal
        if (e.key === 'Escape' && !contactModal.classList.contains('hidden')) {
            contactModal.classList.add('hidden');
        }

        // Ctrl/Cmd + D to toggle dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleDarkMode();
        }
    });
});

// Close notification dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notification-dropdown');
    const button = e.target.closest('button');
    
    if (dropdown && !dropdown.contains(e.target) && (!button || !button.onclick || button.onclick.toString().indexOf('toggleNotifications') === -1)) {
        dropdown.classList.add('hidden');
    }
});

// Initialize student dashboard when loaded
function initializeStudentDashboard() {
    loadFreePeriodSuggestions();
    loadNotifications();
    loadPersonalRoutine();
    loadDailySchedule();
}

// Auto-refresh classroom display every 30 seconds
setInterval(function() {
    if (!document.getElementById('classroom-display').classList.contains('hidden')) {
        populateClassroomDisplay();
        updateCurrentTime();
    }
}, 30000);

// Initialize the application
console.log('🎓 AttendEase - Smart Attendance Management System Loaded Successfully!');