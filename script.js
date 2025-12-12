//json loading, state management
let page = 0;
let currentLang = 'id';
let libraryData = null;
let currentQuestionIndex = 1;
var xhr = new XMLHttpRequest();

// Load library.json data
async function loadLibraryData() {
  try {
    const response = await fetch('library.json');
    libraryData = await response.json();
    updateLanguage(currentLang);
  } catch (error) {
    console.error('Error loading library data:', error);
  }
}

// Update content based on selected language
function updateLanguage(lang) {
  if (!libraryData) return;
  
  currentLang = lang;
  const data = libraryData[lang];
  
  // Update navigation
  const tutorialLink = document.querySelector('#nav-tutorial');
  const aboutLink = document.querySelector('#nav-about');
  
  if (tutorialLink) {
    tutorialLink.innerHTML = `<i class="fas fa-book"></i>&nbsp;${data.menu.tutorial}`;
  }
  if (aboutLink) {
    aboutLink.innerHTML = `<i class="fas fa-circle-info"></i>&nbsp;${data.menu.about}`;
  }
  
  // Update landing page
  document.getElementById('landing-title').textContent = data.menu.description1;
  document.getElementById('landing-description').textContent = data.menu.description2;
  document.getElementById('landing-start-btn').textContent = data.menu.start;
  
  // Update result section headers
  document.getElementById('result-header').textContent = data.results.header;
  document.getElementById('result-feedback').textContent = data.results.feedback;
  document.getElementById('result-share').textContent = data.results.share;
  
  // Update current question if quiz is active
  if (document.querySelector('.quiz').style.display === 'block') {
    updateQuizQuestion();
  }
}

//timer
let timerInterval;
let timeRemaining = 300; // 5 menit
let timerActive = false;

function startTimer() {
  if (timerActive) return;
  
  timerActive = true;
  timeRemaining = 300; // Reset to 5 minutes
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerActive = false;
      onTimerComplete();
    }
  }, 1000);
  
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const timerElement = document.getElementById('timer-display');
  if (timerElement) {
    timerElement.textContent = display;
  }
  
}

function onTimerComplete() {
  alert('Time\'s up! 5 minutes have elapsed.');
  // Hide quiz and show results
  document.querySelector('.quiz').style.display = 'none';
  document.querySelector('.result').style.display = 'flex';
}

//scoring
let scores = {
  E: 0, I: 0,
  S: 0, N: 0,
  T: 0, F: 0,
  J: 0, P: 0,
};

let polarities = [
  'E', 'I', 
  'S', 'N', 
  'T', 'F', 
  'J', 'P'
];

function saveScore(polarity, option){

}

function determinePersonality(){
  let personality = '';
  
  // Determine each trait based on score
  personality += scores.E >= scores.I ? 'E' : 'I';
  personality += scores.S >= scores.N ? 'S' : 'N';
  personality += scores.T >= scores.F ? 'T' : 'F';
  personality += scores.J >= scores.P ? 'J' : 'P';
  
  return personality;
}

//background particles
const bg = document.querySelector('.background');
const count = Number(bg.dataset.count) || 23;

for (let i = 0; i < count; i++) {
  const span = document.createElement('span');
  span.className = 'particle';
  bg.appendChild(span);
}

// Update quiz question display
function updateQuizQuestion() {
  if (!libraryData) return;
  
  const questionKey = `Q${currentQuestionIndex}`;
  const questionData = libraryData[currentLang].quiz[questionKey];
  const imageData = libraryData.illust.quiz[questionKey];
  
  if (questionData) {
    document.getElementById('quiz-question').textContent = questionData.Question;
    document.getElementById('btn_a').textContent = questionData.Options['1'];
    document.getElementById('btn_b').textContent = questionData.Options['2'];
    document.getElementById('btn_c').textContent = questionData.Options['3'];
    
    // Update question counter
    document.getElementById('question-counter').textContent = `${currentQuestionIndex}/12`;
    
    // Update image if available
    if (imageData) {
      document.getElementById('quiz-image').src = `assets/quizzes/${imageData}`;
    }
  }
}

//event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Load library data first
  loadLibraryData();
  
  // Language selector
  const langDropdown = document.getElementById('lang-dropdown');
  if (langDropdown) {
    langDropdown.addEventListener('change', function() {
      updateLanguage(this.value);
    });
  }
  
  // Tutorial and About modal functionality
  const tutorialLink = document.getElementById('nav-tutorial');
  const aboutLink = document.getElementById('nav-about');
  
  if (tutorialLink) {
    tutorialLink.addEventListener('click', function(e) {
      e.preventDefault();
      showModal('tutorial');
    });
  }
  
  if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
      e.preventDefault();
      showModal('about');
    });
  }
  
  // Start button
  const btnStart = document.querySelector('.btn_start');
  if (btnStart) {
    btnStart.addEventListener('click', function() {
      startQuizSequence();
    });
  }
  
  // Quiz option buttons
  document.getElementById('btn_a').addEventListener('click', () => handleQuizAnswer('1'));
  document.getElementById('btn_b').addEventListener('click', () => handleQuizAnswer('2'));
  document.getElementById('btn_c').addEventListener('click', () => handleQuizAnswer('3'));
  
  // Download result button
  document.getElementById('result-download').addEventListener('click', function() {
    downloadResultImage();
  });
  
  // Retake quiz button
  document.getElementById('retake-quiz').addEventListener('click', function() {
    // Reset quiz state
    currentQuestionIndex = 1;
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // Hide result and show landing
    document.querySelector('.result').style.display = 'none';
    const landing = document.querySelector('.landing');
    landing.style.display = 'flex';
    landing.classList.remove('fade-out');
    
    // Reset timer
    clearInterval(timerInterval);
    timerActive = false;
    timeRemaining = 300;
    updateTimerDisplay();
  });
});

// Handle quiz answer selection
function handleQuizAnswer(selectedOption) {
  if (!libraryData) return;
  
  // Save score based on selected option
  const questionKey = `Q${currentQuestionIndex}`;
  const scoreData = libraryData.scores[questionKey];
  
  if (scoreData && scoreData[selectedOption]) {
    const optionScores = scoreData[selectedOption];
    for (const [trait, points] of Object.entries(optionScores)) {
      scores[trait] += points;
    }
  }
  
  // Move to next question or show results
  currentQuestionIndex++;
  
  if (currentQuestionIndex <= 12) {
    updateQuizQuestion();
  } else {
    // Quiz completed, show results
    showResults();
  }
}

// Show quiz results
function showResults() {
  // Stop timer
  clearInterval(timerInterval);
  timerActive = false;
  
  // Determine personality type
  const personality = determinePersonality();
  
  // Hide quiz and show results
  document.querySelector('.quiz').style.display = 'none';
  document.querySelector('.result').style.display = 'flex';
  
  // Update result content
  document.getElementById('result-header').textContent = libraryData[currentLang].results.header;
  
  // Update result image
  const resultImage = libraryData.illust.results[personality];
  if (resultImage) {
    document.getElementById('result-image').src = `assets/results/${currentLang}/${resultImage}`;
  }
}

// Modal functionality
function showModal(type) {
  if (!libraryData) return;
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  
  // Create content
  const data = libraryData[currentLang];
  const title = type === 'tutorial' ? data.menu.tutorial : data.menu.about;
  const content = type === 'tutorial' ? (data.tutorial.text || 'Tutorial content coming soon...') : (data.about.text || 'About content coming soon...');
  
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <h2>${title}</h2>
      <p>${content}</p>
    </div>
  `;
  
  // Show modal with animation
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Close on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Quiz start sequence with transition
function startQuizSequence() {
  const landing = document.querySelector('.landing');
  const transition = document.querySelector('.transition');
  const quiz = document.querySelector('.quiz');
  
  // Step 1: Fade out landing page
  landing.classList.add('fade-out');
  
  setTimeout(() => {
    // Step 2: Hide landing, show transition
    landing.style.display = 'none';
    transition.style.display = 'flex';
    
    setTimeout(() => {
      // Step 3: Fade in transition
      transition.classList.add('show');
      
      setTimeout(() => {
        // Step 4: Fade out transition
        transition.classList.remove('show');
        
        setTimeout(() => {
          // Step 5: Hide transition, show quiz
          transition.style.display = 'none';
          quiz.style.display = 'flex';
          
          // Load first question and start timer
          currentQuestionIndex = 1;
          updateQuizQuestion();
          startTimer();
        }, 300); // Wait for fade out
      }, 1000); // Show transition for 0.3s to match gif duration
    }, 50); // Small delay before fade in
  }, 300); // Wait for landing fade out
}

// Download result image function
function downloadResultImage() {
  const resultImage = document.getElementById('result-image');
  
  if (resultImage && resultImage.src) {
    // Create download link directly from the image source
    const link = document.createElement('a');
    link.download = 'mycelitype-result.png';
    link.href = resultImage.src;
    link.click();
  }
}