
"use strict";

// ======================================
// ภารกิจฮีโร่น้อย พิทักษ์โลก
// ผู้จัดทำ: ครูจองซ่า
// ======================================

const $ = (id) => document.getElementById(id);

const screens = document.querySelectorAll(".screen");
let totalScore = 0;
let gameScore = 0;
let lives = 3;
let currentTrash = [];
let selectedTrashId = null;
let trashSequence = 0;
let quizIndex = 0;
let quizScore = 0;
let answered = false;
let audioContext = null;
let musicTimer = null;
let musicEnabled = true;
let musicStep = 0;
let toastTimer = null;

const binNames = {
  general: "ขยะทั่วไป",
  recycle: "ขยะรีไซเคิล",
  organic: "ขยะเปียก",
  hazard: "ขยะอันตราย"
};

// ตัวอย่างขยะสำหรับเกม
const trashLibrary = [
  { emoji: "🧴", name: "ขวดพลาสติกสะอาด", type: "recycle" },
  { emoji: "📰", name: "หนังสือพิมพ์", type: "recycle" },
  { emoji: "🥫", name: "กระป๋องสะอาด", type: "recycle" },
  { emoji: "📦", name: "กล่องกระดาษ", type: "recycle" },
  { emoji: "🍌", name: "เปลือกกล้วย", type: "organic" },
  { emoji: "🍎", name: "เศษแอปเปิล", type: "organic" },
  { emoji: "🥬", name: "เศษผัก", type: "organic" },
  { emoji: "🍚", name: "เศษข้าว", type: "organic" },
  { emoji: "🍬", name: "ซองขนมเปื้อน", type: "general" },
  { emoji: "🧻", name: "ทิชชูใช้แล้ว", type: "general" },
  { emoji: "🥡", name: "กล่องเปื้อนอาหาร", type: "general" },
  { emoji: "🧹", name: "เศษฝุ่นกวาด", type: "general" },
  { emoji: "🔋", name: "ถ่านไฟฉายใช้แล้ว", type: "hazard" },
  { emoji: "💡", name: "หลอดไฟเสีย", type: "hazard" },
  { emoji: "🪫", name: "แบตเตอรี่เก่า", type: "hazard" },
  { emoji: "🧪", name: "ภาชนะสารเคมี", type: "hazard" }
];

// แบบทดสอบ 10 ข้อ
const questions = [
  {
    icon: "🧴",
    q: "ขวดพลาสติกที่สะอาดควรทิ้งถังใด?",
    options: ["ถังสีน้ำเงิน", "ถังสีเหลือง", "ถังสีเขียว", "ถังสีแดง"],
    answer: 1,
    explain: "ขวดพลาสติกสะอาดเป็นขยะรีไซเคิล ควรแยกไว้เพื่อนำกลับมาใช้ประโยชน์"
  },
  {
    icon: "🍌",
    q: "เปลือกกล้วยจัดเป็นขยะประเภทใด?",
    options: ["ขยะอันตราย", "ขยะรีไซเคิล", "ขยะเปียก", "ขยะทั่วไป"],
    answer: 2,
    explain: "เปลือกกล้วยเป็นเศษอินทรีย์ สามารถนำไปทำปุ๋ยหมักได้"
  },
  {
    icon: "🔋",
    q: "ถ่านไฟฉายที่ใช้หมดแล้วควรทำอย่างไร?",
    options: ["ทิ้งรวมกับเศษอาหาร", "แยกส่งจุดรับขยะอันตราย", "ทิ้งลงพื้น", "เผาเองที่บ้าน"],
    answer: 1,
    explain: "ถ่านไฟฉายอาจมีสารที่เป็นอันตราย ต้องแยกและส่งจุดรับที่เหมาะสม"
  },
  {
    icon: "📰",
    q: "กระดาษหนังสือพิมพ์ที่สะอาดและแห้งควรทิ้งถังใด?",
    options: ["ถังสีเหลือง", "ถังสีแดง", "ถังสีเขียว", "ถังสีน้ำเงิน"],
    answer: 0,
    explain: "กระดาษสะอาดและแห้งสามารถรวบรวมเพื่อนำไปรีไซเคิลได้"
  },
  {
    icon: "🌎",
    q: "การแยกขยะให้ถูกประเภทมีประโยชน์อย่างไร?",
    options: ["ทำให้ขยะเพิ่มขึ้น", "ทำให้ทุกอย่างเป็นขยะอันตราย", "ช่วยนำวัสดุกลับมาใช้และจัดการได้เหมาะสม", "ทำให้ไม่ต้องเก็บขยะ"],
    answer: 2,
    explain: "การแยกขยะช่วยให้รีไซเคิลง่ายขึ้นและจัดการขยะแต่ละประเภทได้เหมาะสม"
  },
  {
    icon: "🥬",
    q: "เศษผักจากการทำอาหารเหมาะกับการจัดการแบบใด?",
    options: ["เผารวมกับพลาสติก", "นำไปทำปุ๋ยหมักเมื่อเหมาะสม", "ทิ้งลงแหล่งน้ำ", "ผสมกับถ่านไฟฉาย"],
    answer: 1,
    explain: "เศษผักเป็นขยะอินทรีย์ที่สามารถนำไปทำปุ๋ยหมักได้"
  },
  {
    icon: "🥫",
    q: "ก่อนนำกระป๋องเครื่องดื่มไปรีไซเคิล ควรทำอย่างไร?",
    options: ["เติมเศษอาหาร", "ฝังดิน", "เผาก่อน", "เทของเหลวออกและทำความสะอาด"],
    answer: 3,
    explain: "ควรเทของเหลวออกและทำความสะอาดตามความเหมาะสมก่อนนำไปรีไซเคิล"
  },
  {
    icon: "💡",
    q: "หลอดไฟที่แตกหรือเสียควรจัดการอย่างไร?",
    options: ["แยกและส่งจุดรับที่เหมาะสม", "โยนใส่ถังเศษอาหาร", "ทุบให้แตกเพิ่ม", "เผาในสนาม"],
    answer: 0,
    explain: "หลอดไฟบางชนิดอาจมีสารอันตราย ควรจัดเก็บอย่างระมัดระวังและส่งจุดรับเฉพาะ"
  },
  {
    icon: "🧻",
    q: "กระดาษทิชชูที่ใช้แล้วและเปื้อนควรทิ้งอย่างไร?",
    options: ["นำไปปนกับกระดาษสะอาด", "ใส่ถังขยะเปียกทุกกรณี", "ทิ้งขยะทั่วไปตามแนวทางท้องถิ่น", "ใส่ถังขยะอันตรายทุกกรณี"],
    answer: 2,
    explain: "ทิชชูใช้แล้วมักไม่เหมาะกับการรีไซเคิล ให้ทิ้งขยะทั่วไปตามแนวทางในพื้นที่"
  },
  {
    icon: "🦸",
    q: "ถ้าเห็นเพื่อนทิ้งขยะผิดถัง เราควรทำอย่างไร?",
    options: ["แกล้งเพื่อน", "เตือนอย่างสุภาพและช่วยกันแยกให้ถูก", "ทิ้งขยะเพิ่ม", "เดินหนีทุกครั้ง"],
    answer: 1,
    explain: "การช่วยกันอย่างสุภาพทำให้ทุกคนเรียนรู้และช่วยรักษาสิ่งแวดล้อมได้"
  }
];

// --------------------------------------
// เสียงดนตรีและเอฟเฟกต์ สร้างในเบราว์เซอร์
// --------------------------------------

function getAudioContext() {
  if (!audioContext) {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return null;
    audioContext = new AudioClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function tone(frequency, duration = 0.12, type = "sine", volume = 0.045) {
  if (!musicEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function soundEffect(kind) {
  if (!musicEnabled) return;

  if (kind === "click") {
    tone(550, 0.07, "sine", 0.025);
  } else if (kind === "correct") {
    tone(660, 0.12, "sine", 0.045);
    setTimeout(() => tone(880, 0.18, "sine", 0.04), 100);
  } else if (kind === "wrong") {
    tone(240, 0.2, "triangle", 0.035);
  } else if (kind === "win") {
    [523, 659, 784, 1046].forEach((note, i) => {
      setTimeout(() => tone(note, 0.25, "sine", 0.04), i * 130);
    });
  }
}

// ทำนองสั้น ๆ วนซ้ำได้ ไม่ใช้ไฟล์เพลงภายนอก
const melody = [
  523, 659, 784, 659,
  587, 698, 880, 698,
  523, 659, 784, 1046,
  880, 784, 659, 587
];

function startMusic() {
  stopMusic();
  if (!musicEnabled) return;

  musicTimer = setInterval(() => {
    if (!musicEnabled || document.hidden) return;

    const note = melody[musicStep % melody.length];
    musicStep++;
    tone(note, 0.22, "sine", 0.012);
  }, 300);
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

function toggleSound() {
  musicEnabled = !musicEnabled;
  $("soundButton").textContent = musicEnabled ? "🔊" : "🔇";
  $("soundButton").setAttribute(
    "aria-label",
    musicEnabled ? "ปิดเสียง" : "เปิดเสียง"
  );

  if (musicEnabled) {
    getAudioContext();
    startMusic();
    soundEffect("click");
    showToast("🎵 เปิดเสียงแล้ว");
  } else {
    stopMusic();
    showToast("🔇 ปิดเสียงแล้ว");
  }
}

// --------------------------------------
// ระบบหน้าจอ
// --------------------------------------

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove("active"));
  const target = $(id);
  if (target) target.classList.add("active");

  if (id === "gameScreen") {
    if (currentTrash.length === 0 && gameScore === 0) {
      startGame();
    }
  }

  if (id === "quizScreen") {
    if (!$("quizResult").classList.contains("hidden")) {
      return;
    }
    if (!answered && quizIndex === 0) renderQuestion();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function updateTotalScore() {
  $("totalScore").textContent = totalScore;
}

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    soundEffect("click");
    showScreen(button.dataset.go);
  });
});

$("soundButton").addEventListener("click", toggleSound);

// เปิดเสียงหลังผู้เล่นกดปุ่มเริ่ม
$("startButton").addEventListener("click", () => {
  getAudioContext();
  if (musicEnabled) startMusic();

  const name = $("playerName").value.trim();
  if (name) showToast(`ยินดีต้อนรับ ฮีโร่ ${name}! 🌟`);

  soundEffect("win");
  showScreen("gameScreen");
  startGame();
});

// --------------------------------------
// เกมแยกขยะ
// --------------------------------------

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startGame() {
  currentTrash = shuffle(trashLibrary).slice(0, 12).map(item => ({
    ...item,
    id: ++trashSequence
  }));

  gameScore = 0;
  lives = 3;
  selectedTrashId = null;

  $("gameScore").textContent = gameScore;
  $("livesText").textContent = "❤️❤️❤️";
  $("gameMessage").textContent = "🌟 เลือกขยะแล้วนำไปลงถังให้ถูกต้องนะ!";
  $("trashArea").innerHTML = "";

  document.querySelectorAll(".game-bin").forEach(bin => {
    bin.classList.remove("bin-target");
  });

  renderTrash();
  updateGameProgress();
}

function renderTrash() {
  const area = $("trashArea");
  area.innerHTML = "";

  currentTrash.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trash-item";
    button.draggable = true;
    button.dataset.id = item.id;
    button.setAttribute("aria-label", item.name);
    button.innerHTML = `
      <span class="trash-emoji">${item.emoji}</span>
      <span class="trash-name">${item.name}</span>
    `;

    button.addEventListener("click", () => {
      soundEffect("click");
      selectTrash(item.id);
    });

    button.addEventListener("dragstart", event => {
      selectedTrashId = item.id;
      button.classList.add("dragging");

      if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", String(item.id));
        event.dataTransfer.effectAllowed = "move";
      }
    });

    button.addEventListener("dragend", () => {
      button.classList.remove("dragging");
    });

    area.appendChild(button);
  });
}

function selectTrash(id) {
  const item = currentTrash.find(trash => trash.id === id);
  if (!item) return;

  selectedTrashId = id;

  document.querySelectorAll(".trash-item").forEach(button => {
    button.classList.toggle(
      "selected",
      Number(button.dataset.id) === id
    );
  });

  $("gameMessage").textContent =
    `${item.emoji} ${item.name} — แตะถังที่คิดว่าถูกต้องได้เลย!`;
}

function updateGameProgress() {
  const completed = 12 - currentTrash.length;
  $("progressText").textContent = `${completed}/12`;
  $("progressBar").style.width = `${(completed / 12) * 100}%`;
  $("gameScore").textContent = gameScore;
  $("livesText").textContent =
    lives > 0 ? "❤️".repeat(lives) + "🤍".repeat(3 - lives) : "💔💔💔";
}

function handleBinDrop(binType) {
  if (selectedTrashId === null) {
    showToast("👆 เลือกขยะก่อนนะ!");
    return;
  }

  const item = currentTrash.find(
    trash => trash.id === selectedTrashId
  );
  if (!item) {
    selectedTrashId = null;
    return;
  }

  if (item.type === binType) {
    // ตอบถูก
    gameScore += 10;
    totalScore += 10;
    currentTrash = currentTrash.filter(
      trash => trash.id !== selectedTrashId
    );

    soundEffect("correct");
    $("gameMessage").textContent =
      `เก่งมาก! ${item.emoji} ไปอยู่ถัง${binNames[binType]}แล้ว 🎉`;

    selectedTrashId = null;
    updateTotalScore();
    updateGameProgress();
    renderTrash();

    if (currentTrash.length === 0) {
      $("gameMessage").textContent =
        "🎉 เยี่ยมไปเลย! หนูแยกขยะครบแล้ว!";
      soundEffect("win");
      showToast("🏆 ผ่านภารกิจแยกขยะ! ได้รับ 120 คะแนน");

      setTimeout(() => {
        showToast("พร้อมแล้วไปทำแบบทดสอบ 10 ข้อกัน!");
      }, 1800);
    }
  } else {
    // ตอบผิด
    lives--;
    soundEffect("wrong");

    $("gameMessage").textContent =
      `ยังไม่ถูกนะ 😊 ${item.name} ควรลง${binNames[item.type]}`;

    selectedTrashId = null;
    document.querySelectorAll(".trash-item").forEach(button => {
      button.classList.remove("selected");
    });

    updateGameProgress();

    if (lives <= 0) {
      $("gameMessage").textContent =
        "หมดพลังแล้ว พักนิดหนึ่งแล้วเริ่มด่านใหม่ได้นะ 💚";
      showToast("ลองอีกครั้งได้เสมอ!");
    }
  }
}

document.querySelectorAll(".game-bin").forEach(bin => {
  bin.addEventListener("click", () => {
    soundEffect("click");
    handleBinDrop(bin.dataset.bin);
  });

  bin.addEventListener("dragover", event => {
    event.preventDefault();
    bin.classList.add("bin-target");
  });

  bin.addEventListener("dragleave", () => {
    bin.classList.remove("bin-target");
  });

  bin.addEventListener("drop", event => {
    event.preventDefault();
    bin.classList.remove("bin-target");

    const id = event.dataTransfer?.getData("text/plain");
    if (id) selectedTrashId = Number(id);

    handleBinDrop(bin.dataset.bin);
  });
});

$("restartGame").addEventListener("click", () => {
  soundEffect("click");
  startGame();
  showToast("เริ่มด่านใหม่แล้ว! สู้ ๆ นะ 🌱");
});

// --------------------------------------
// แบบทดสอบ 10 ข้อ
// --------------------------------------

function renderQuestion() {
  if (quizIndex >= questions.length) {
    showQuizResult();
    return;
  }

  answered = false;
  const question = questions[quizIndex];

  $("quizPanel").classList.remove("hidden");
  $("quizResult").classList.add("hidden");
  $("quizProgress").textContent =
    `ข้อ ${quizIndex + 1} จาก ${questions.length}`;
  $("quizScore").textContent = quizScore;
  $("quizProgressBar").style.width =
    `${(quizIndex / questions.length) * 100}%`;
  $("quizIllustration").textContent = question.icon;
  $("questionText").textContent = question.q;
  $("quizFeedback").textContent = "";
  $("nextQuestion").disabled = true;
  $("nextQuestion").textContent =
    quizIndex === questions.length - 1 ? "ดูผลคะแนน 🏆" : "ข้อต่อไป ➜";

  const options = $("quizOptions");
  options.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = `${["ก", "ข", "ค", "ง"][index]}. ${option}`;
    button.addEventListener("click", () => chooseAnswer(index));
    options.appendChild(button);
  });
}

function chooseAnswer(index) {
  if (answered) return;
  answered = true;

  const question = questions[quizIndex];
  const buttons = [...$("quizOptions").children];

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;

    if (buttonIndex === question.answer) {
      button.classList.add("correct");
    } else if (buttonIndex === index) {
      button.classList.add("wrong");
    }
  });

  if (index === question.answer) {
    quizScore++;
    totalScore += 10;
    soundEffect("correct");
    $("quizFeedback").textContent =
      `🎉 ถูกต้อง! ${question.explain}`;
  } else {
    soundEffect("wrong");
    $("quizFeedback").textContent =
      `💚 ไม่เป็นไรนะ คำตอบคือ "${question.options[question.answer]}" — ${question.explain}`;
  }

  $("quizScore").textContent = quizScore;
  updateTotalScore();
  $("quizProgressBar").style.width =
    `${((quizIndex + 1) / questions.length) * 100}%`;
  $("nextQuestion").disabled = false;
}

$("nextQuestion").addEventListener("click", () => {
  if (!answered) return;

  soundEffect("click");
  quizIndex++;

  if (quizIndex >= questions.length) {
    showQuizResult();
  } else {
    renderQuestion();
  }
});

function showQuizResult() {
  $("quizPanel").classList.add("hidden");
  $("quizResult").classList.remove("hidden");

  const points = quizScore * 10;
  const name = $("playerName").value.trim() || "ฮีโร่น้อย";

  $("finalQuizScore").textContent = `${quizScore}/10`;
  $("resultText").textContent =
    `${name} ตอบถูก ${quizScore} ข้อ ได้ ${points} คะแนนจากแบบทดสอบ`;

  let title, emoji, rank;

  if (quizScore >= 9) {
    title = "สุดยอดฮีโร่รักษ์โลก!";
    emoji = "🏆";
    rank = "🌟 ระดับเพชร";
  } else if (quizScore >= 7) {
    title = "เก่งมาก ฮีโร่น้อย!";
    emoji = "🥇";
    rank = "⭐ ระดับทอง";
  } else if (quizScore >= 5) {
    title = "ทำได้ดีมาก!";
    emoji = "🥈";
    rank = "🌱 ระดับเงิน";
  } else {
    title = "ฮีโร่น้อยสู้ต่อไป!";
    emoji = "🌈";
    rank = "💚 ระดับฝึกฝน";
  }

  $("resultTitle").textContent = title;
  $("resultEmoji").textContent = emoji;
  $("resultRank").textContent = rank;

  soundEffect("win");
}

$("retryQuiz").addEventListener("click", () => {
  soundEffect("click");
  quizIndex = 0;
  quizScore = 0;
  answered = false;
  renderQuestion();
});

updateTotalScore();
renderQuestion();
