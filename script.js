const QUIZIZZ_CODE = "123456";
const QUIZIZZ_URL = `https://quizizz.com/join?gc=${QUIZIZZ_CODE}`;
const OFFLINE_QUESTIONS = [
  {
    question: "Apa lambang sila pertama Pancasila?",
    answers: ["Bintang", "Rantai", "Pohon beringin", "Padi dan kapas"],
    correctIndex: 0,
    explanation: "Benar. Sila pertama dilambangkan dengan bintang emas."
  },
  {
    question: "Sikap menghormati teman yang berbeda agama mencerminkan sila ke berapa?",
    answers: ["Sila pertama", "Sila kedua", "Sila ketiga", "Sila kelima"],
    correctIndex: 0,
    explanation: "Tepat. Menghormati perbedaan agama sesuai dengan nilai Ketuhanan Yang Maha Esa."
  },
  {
    question: "Apa yang sebaiknya dilakukan saat kelompok memiliki pendapat berbeda?",
    answers: ["Memaksakan pendapat sendiri", "Bermusyawarah", "Meninggalkan teman", "Menyalahkan orang lain"],
    correctIndex: 1,
    explanation: "Betul. Musyawarah adalah contoh pengamalan sila keempat."
  },
  {
    question: "Siapa tokoh yang dikenal sebagai penggali Pancasila?",
    answers: ["Dr. Muhammad Hatta", "Muhammad Yamin", "Ir. Soekarno", "Prof. Dr. Supomo"],
    correctIndex: 2,
    explanation: "Hebat. Ir. Soekarno dikenal sebagai penggali Pancasila."
  },
  {
    question: "Contoh pengamalan sila kelima adalah...",
    answers: ["Membagi tugas kelompok secara adil", "Tidak mau berteman", "Mengejek budaya teman", "Tidak ikut berdiskusi"],
    correctIndex: 0,
    explanation: "Benar. Bersikap adil adalah nilai utama sila kelima."
  },
  {
    question: "Apa lambang sila kedua Pancasila?",
    answers: ["Kepala banteng", "Rantai emas", "Bintang emas", "Pohon beringin"],
    correctIndex: 1,
    explanation: "Tepat. Sila kedua dilambangkan dengan rantai emas."
  },
  {
    question: "Pohon beringin adalah lambang sila yang berbunyi...",
    answers: ["Persatuan Indonesia", "Ketuhanan Yang Maha Esa", "Keadilan Sosial bagi Seluruh Rakyat Indonesia", "Kemanusiaan yang Adil dan Beradab"],
    correctIndex: 0,
    explanation: "Benar. Pohon beringin melambangkan sila ketiga, Persatuan Indonesia."
  },
  {
    question: "Pada tanggal berapa PPKI menetapkan Pancasila sebagai dasar negara?",
    answers: ["1 Juni 1945", "22 Juni 1945", "17 Agustus 1945", "18 Agustus 1945"],
    correctIndex: 3,
    explanation: "Betul. PPKI menetapkan Pancasila pada tanggal 18 Agustus 1945."
  },
  {
    question: "Piagam Jakarta dihasilkan oleh panitia yang bernama...",
    answers: ["Panitia Sembilan", "BPUPKI", "PPKI", "Komite Sekolah"],
    correctIndex: 0,
    explanation: "Hebat. Piagam Jakarta disusun oleh Panitia Sembilan."
  },
  {
    question: "Sikap yang mencerminkan persatuan adalah...",
    answers: ["Bermain hanya dengan teman satu suku", "Bermain bersama tanpa memilih-milih teman", "Mengejek budaya teman", "Menolak kerja kelompok"],
    correctIndex: 1,
    explanation: "Benar. Bermain bersama tanpa memilih-milih teman menjaga persatuan."
  }
];

const screens = document.querySelectorAll(".screen");
const goButtons = document.querySelectorAll("[data-go]");
const subchapters = Array.from(document.querySelectorAll(".subchapter"));
const lessonScreen = document.querySelector("#lesson-screen");
const quizForm = document.querySelector("#quiz-form");
const thanksMessage = document.querySelector("#thanks-message");
const progressText = document.querySelector("#progress-text");
const prevChapterButton = document.querySelector("#prev-chapter");
const nextChapterButton = document.querySelector("#next-chapter");
const offlineQuestionTitle = document.querySelector("#offline-question-title");
const offlineQuestionText = document.querySelector("#offline-question-text");
const offlineQuizCounter = document.querySelector("#offline-quiz-counter");
const offlineAnswerList = document.querySelector("#offline-answer-list");
const offlineQuizFeedback = document.querySelector("#offline-quiz-feedback");
const offlineNextButton = document.querySelector("#offline-next-button");
const offlineQuizPanel = document.querySelector("#offline-quiz-panel");
const offlineResultPanel = document.querySelector("#offline-result-panel");
const offlineScore = document.querySelector("#offline-score");
const offlineResultMessage = document.querySelector("#offline-result-message");
const retryOfflineQuizButton = document.querySelector("#retry-offline-quiz");
const quizizzCodeInput = document.querySelector("#quizizz-code");
const CHAPTER_TRANSITION_MS = 320;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentSubchapter = 0;
let isSubchapterTransitioning = false;
let currentQuizQuestion = 0;
let selectedAnswerIndex = null;
let offlineScoreCount = 0;
let hasCheckedCurrentAnswer = false;

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  document.querySelector(`#${screenId}`)?.scrollTo({ top: 0, behavior: "smooth" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollLessonToTop() {
  lessonScreen.scrollTo({ top: 0, behavior: "smooth" });
}

function updateChapterNav() {
  const isFirstChapter = currentSubchapter === 0;
  const isLastChapter = currentSubchapter === subchapters.length - 1;

  progressText.textContent = `Subbab ${currentSubchapter + 1} dari ${subchapters.length}`;
  prevChapterButton.disabled = isFirstChapter || isSubchapterTransitioning;
  nextChapterButton.disabled = isSubchapterTransitioning;
  nextChapterButton.setAttribute("aria-label", isLastChapter ? "Ke Kuis" : "Berikutnya");
}

function pauseChapterVideos(chapter) {
  chapter.querySelectorAll("video").forEach((video) => {
    video.pause();
  });
}

function renderOfflineQuestion() {
  const question = OFFLINE_QUESTIONS[currentQuizQuestion];

  selectedAnswerIndex = null;
  hasCheckedCurrentAnswer = false;
  offlineQuestionTitle.textContent = `Pertanyaan ${currentQuizQuestion + 1}`;
  offlineQuestionText.textContent = question.question;
  offlineQuizCounter.textContent = `${currentQuizQuestion + 1} dari ${OFFLINE_QUESTIONS.length}`;
  offlineQuizFeedback.textContent = "";
  offlineNextButton.textContent = "Jawab";
  offlineNextButton.disabled = true;

  offlineAnswerList.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const text = document.createElement("span");

    button.className = "answer-button";
    button.type = "button";
    label.className = "answer-label";
    label.textContent = String.fromCharCode(65 + index);
    text.className = "answer-text";
    text.textContent = answer;
    button.append(label, text);
    button.addEventListener("click", () => selectOfflineAnswer(index));
    offlineAnswerList.append(button);
  });
}

function selectOfflineAnswer(answerIndex) {
  if (hasCheckedCurrentAnswer) {
    return;
  }

  selectedAnswerIndex = answerIndex;
  offlineNextButton.disabled = false;

  offlineAnswerList.querySelectorAll(".answer-button").forEach((button, index) => {
    button.classList.toggle("selected", index === selectedAnswerIndex);
  });
}

function checkOfflineAnswer() {
  const question = OFFLINE_QUESTIONS[currentQuizQuestion];
  const answerButtons = offlineAnswerList.querySelectorAll(".answer-button");
  const isCorrect = selectedAnswerIndex === question.correctIndex;

  hasCheckedCurrentAnswer = true;
  offlineNextButton.textContent = currentQuizQuestion === OFFLINE_QUESTIONS.length - 1 ? "Lihat Nilai" : "Lanjut";
  offlineQuizFeedback.textContent = isCorrect ? question.explanation : `Belum tepat. Jawaban yang benar: ${question.answers[question.correctIndex]}.`;

  if (isCorrect) {
    offlineScoreCount += 1;
  }

  answerButtons.forEach((button, index) => {
    button.disabled = true;
    button.classList.toggle("correct", index === question.correctIndex);
    button.classList.toggle("incorrect", index === selectedAnswerIndex && !isCorrect);
  });
}

function showOfflineResult() {
  const totalQuestions = OFFLINE_QUESTIONS.length;
  offlineScore.textContent = `${offlineScoreCount}/${totalQuestions}`;
  offlineResultMessage.textContent = offlineScoreCount === totalQuestions
    ? "Luar biasa, semua jawaban benar."
    : `Kamu menjawab benar ${offlineScoreCount} dari ${totalQuestions} pertanyaan.`;
  offlineQuizPanel.classList.remove("active");
  offlineResultPanel.classList.add("active");
}

function resetOfflineQuiz() {
  currentQuizQuestion = 0;
  offlineScoreCount = 0;
  offlineResultPanel.classList.remove("active");
  offlineQuizPanel.classList.add("active");
  renderOfflineQuestion();
}

function showSubchapter(step, options = {}) {
  const nextSubchapter = Math.max(0, Math.min(step, subchapters.length - 1));
  const shouldAnimate = options.animate !== false
    && !prefersReducedMotion
    && subchapters[currentSubchapter]?.classList.contains("active");

  if (nextSubchapter === currentSubchapter) {
    updateChapterNav();
    return;
  }

  if (isSubchapterTransitioning) {
    return;
  }

  const previousSubchapter = currentSubchapter;
  const direction = nextSubchapter > previousSubchapter ? "next" : "back";
  const previousChapter = subchapters[previousSubchapter];
  const nextChapter = subchapters[nextSubchapter];

  currentSubchapter = nextSubchapter;
  lessonScreen.dataset.chapterDirection = direction;

  if (!shouldAnimate) {
    subchapters.forEach((chapter, index) => {
      chapter.classList.toggle("active", index === currentSubchapter);
      chapter.classList.remove("is-entering", "is-exiting");
    });
    updateChapterNav();
    return;
  }

  isSubchapterTransitioning = true;
  updateChapterNav();
  pauseChapterVideos(previousChapter);

  previousChapter.classList.add("is-exiting");

  window.setTimeout(() => {
    previousChapter.classList.remove("active", "is-exiting");
    nextChapter.classList.add("active", "is-entering");

    window.setTimeout(() => {
      nextChapter.classList.remove("is-entering");
      isSubchapterTransitioning = false;
      updateChapterNav();
    }, CHAPTER_TRANSITION_MS);
  }, CHAPTER_TRANSITION_MS);
}

goButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.go === "lesson-screen") {
      showSubchapter(0, { animate: false });
    }

    if (button.dataset.go === "quiz-screen") {
      offlineQuizPanel.classList.add("active");
      offlineResultPanel.classList.remove("active");
    }

    if (button.dataset.go === "offline-quiz-screen") {
      resetOfflineQuiz();
    }

    showScreen(button.dataset.go);
  });
});

prevChapterButton.addEventListener("click", () => {
  showSubchapter(currentSubchapter - 1);
  scrollLessonToTop();
});

nextChapterButton.addEventListener("click", () => {
  if (currentSubchapter === subchapters.length - 1) {
    showScreen("quiz-screen");
    return;
  }

  showSubchapter(currentSubchapter + 1);
  scrollLessonToTop();
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const studentName = document.querySelector("#student-name").value.trim();
  if (!studentName) {
    return;
  }

  thanksMessage.textContent = `Terima kasih, ${studentName}. Semoga nilai Pancasila semakin terlihat dalam dirimu setiap hari.`;
  window.open(QUIZIZZ_URL, "_blank", "noopener,noreferrer");
  showScreen("thanks-screen");
});

offlineNextButton.addEventListener("click", () => {
  if (!hasCheckedCurrentAnswer) {
    checkOfflineAnswer();
    return;
  }

  if (currentQuizQuestion === OFFLINE_QUESTIONS.length - 1) {
    showOfflineResult();
    return;
  }

  currentQuizQuestion += 1;
  renderOfflineQuestion();
});

retryOfflineQuizButton.addEventListener("click", resetOfflineQuiz);

quizizzCodeInput.value = QUIZIZZ_CODE;
renderOfflineQuestion();
showSubchapter(0);
