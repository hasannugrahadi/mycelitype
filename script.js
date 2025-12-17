let page = 0;
let currentLang = 'id';
let libraryData = null;
let currentQuestionIndex = 1;
let scores = { 
  E: 0, I: 0, 
  S: 0, N: 0, 
  T: 0, F: 0, 
  J: 0, P: 0 
};

//background particles
function spawnSpore() {
  const bg = document.querySelector('.background');
  const count = Number(bg.dataset.count) || 23;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'particle';
    bg.appendChild(span);
  }
}

//json loading
async function loadLibraryData() {
  try {
    const response = await fetch('library.json');
    libraryData = await response.json();
    updateLanguage(currentLang);
  } catch (error) {
    console.error('Error loading library data:', error);
  }
}

//update language
function updateLanguage(lang) {
  currentLang = lang;
  const data = libraryData[lang];
  const tutorialLink = document.querySelector('#nav-tutorial');
  const aboutLink = document.querySelector('#nav-about');

  tutorialLink.innerHTML = data.menu.tutorial;
  aboutLink.innerHTML = data.menu.about;
  
  document.getElementById('landing-title').textContent = data.menu.description1;
  document.getElementById('landing-description').textContent = data.menu.description2;
  document.getElementById('landing-start-btn').textContent = data.menu.start;
  
  document.getElementById('result-header').textContent = data.results.header;
  document.getElementById('result-feedback').textContent = data.results.feedback;
  document.getElementById('result-share').textContent = data.results.share;
  
  if (document.querySelector('.quiz').style.display === 'block') {
    updateQuizQuestion();
  }
}

//update quiz
function updateQuizQuestion() {
  const questionKey = `Q${currentQuestionIndex}`;
  const questionData = libraryData[currentLang].quiz[questionKey];
  const imageData = libraryData.illust.quiz[questionKey];
  
  document.getElementById('quiz-question').textContent = questionData.Question;
  document.getElementById('btn_a').textContent = questionData.Options['1'];
  document.getElementById('btn_b').textContent = questionData.Options['2'];
  document.getElementById('btn_c').textContent = questionData.Options['3'];
  document.getElementById('question-counter').textContent = `${currentQuestionIndex}/12`;
  document.getElementById('quiz-image').src = `assets/quizzes/${imageData}`;
}

//answer handler
function handleQuizAnswer(selectedOption) {
  const questionKey = `Q${currentQuestionIndex}`;
  const scoreData = libraryData.scores[questionKey];
  if (scoreData && scoreData[selectedOption]) {
    const optionScores = scoreData[selectedOption];
    for (const [trait, points] of Object.entries(optionScores)) {
      scores[trait] += points;
    }
  }
  currentQuestionIndex++;
  if (currentQuestionIndex <= 12) {
    updateQuizQuestion();
  } else {
    showResults();
  }
}

//determine personality type based on scores
function determinePersonality() {
  let personality = '';
  
  // Determine each dimension
  personality += scores.E > scores.I ? 'E' : 'I';
  personality += scores.S > scores.N ? 'S' : 'N';
  personality += scores.T > scores.F ? 'T' : 'F';
  personality += scores.J > scores.P ? 'J' : 'P';
  
  return personality;
}

//show quiz results
function showResults() {
  const personality = determinePersonality();
  document.querySelector('.quiz').style.display = 'none';
  document.querySelector('.result').style.display = 'block';
  document.getElementById('result-header').textContent = libraryData[currentLang].results.header;
  const resultImage = libraryData.illust.results[personality];
  document.getElementById('result-image').src = `assets/results/${currentLang}/${resultImage}`;
  document.getElementById('result-download').textContent = libraryData[currentLang].results.download;
  document.getElementById('retake-quiz').textContent = libraryData[currentLang].results.retake;
}

//modal show
function showModal(type) {
  let modal = document.getElementById('modal-overlay');
  const data = libraryData[currentLang];
  const title = type === 'tutorial' ? data.menu.tutorial : data.menu.about;
  const content = type === 'tutorial' ? data.tutorial.text : data.about.text;
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <h2>${title}</h2>
      <p>${content}</p>
    </div>
  `;
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

//modal close
function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

//transition from landing to quiz
function startQuizSequence() {
  const landing = document.querySelector('.landing');
  const transition = document.querySelector('.transition');
  const quiz = document.querySelector('.quiz');
  landing.classList.add('fade-out');
  setTimeout(() => {
    landing.style.display = 'none';
    transition.style.display = 'block';
    setTimeout(() => {
      transition.classList.add('show');
      setTimeout(() => {
        transition.classList.remove('show');
        setTimeout(() => {
          transition.style.display = 'none';
          quiz.style.display = 'block';
          currentQuestionIndex = 1;
          updateQuizQuestion();
        }, 300);
      }, 1000);
    }, 50);
  }, 300);
}

//download result image
function downloadResultImage() {
  const resultImage = document.getElementById('result-image');
  if (resultImage && resultImage.src) {
    const link = document.createElement('a');
    link.download = 'mycelitype-result.png';
    link.href = resultImage.src;
    link.click();
  }
}

//main event listener
document.addEventListener('DOMContentLoaded', function() {

  spawnSpore();
  loadLibraryData();
  
  const langDropdown = document.getElementById('lang-dropdown');
  langDropdown.addEventListener('change', function() {
    updateLanguage(this.value);
  });
  
  const tutorialLink = document.getElementById('nav-tutorial');
  const aboutLink = document.getElementById('nav-about');
  
  tutorialLink.addEventListener('click', function(e) {
    e.preventDefault();
    showModal('tutorial');
  });
  
  if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
      e.preventDefault();
      showModal('about');
    });
  }
  
  const btnStart = document.querySelector('.btn_start');
  btnStart.addEventListener('click', function() {
    startQuizSequence();
  });
  
  document.getElementById('btn_a').addEventListener('click', () => handleQuizAnswer('1'));
  document.getElementById('btn_b').addEventListener('click', () => handleQuizAnswer('2'));
  document.getElementById('btn_c').addEventListener('click', () => handleQuizAnswer('3'));
  document.getElementById('result-download').addEventListener('click', function() {
    downloadResultImage();
  });
  
  document.getElementById('retake-quiz').addEventListener('click', function() {
    currentQuestionIndex = 1;
    scores = { 
      E: 0, I: 0, 
      S: 0, N: 0, 
      T: 0, F: 0, 
      J: 0, P: 0 
    };
    document.querySelector('.result').style.display = 'none';
    const landing = document.querySelector('.landing');
    landing.style.display = 'block';
    landing.classList.remove('fade-out');
    
  });
});