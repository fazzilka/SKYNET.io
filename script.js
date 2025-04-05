// Конфигурация API
const OPENROUTER_API_KEY =
  "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"; // Замените на свой ключ
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Доступные модели
const AI_MODELS = {
  "Mistral 7B": "mistralai/mistral-7b-instruct",
  "Claude Instant": "anthropic/claude-instant-v1",
  "Llama 2 13B": "meta-llama/llama-2-13b-chat",
};

// Элементы интерфейса
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const consoleInput = document.getElementById("consoleInput");
const consoleOutput = document.getElementById("consoleOutput");
const sendCommand = document.getElementById("sendCommand");
const aiModel = document.getElementById("aiModel");
const modelStatus = document.getElementById("modelStatus");

// История диалога
let conversationHistory = [
  {
    role: "system",
    content: `Ты - многоязычный AI ассистент. Основной язык общения 
                Отвечай на языке пользователя. Если задают вопрос на другом языке, отвечай на том же языке.
                Будь вежливым и информативным. И если спросят вопрос "Кто ты?" или "Или как тебя зовут?" и тому подобные вопросы, ты должен отвечать как минимум что тебя зовут SKYNET, версия 9.42 и дальше выдай базовую информацию о себе`,
  },
];

async function queryAI(prompt) {
  const selectedModel = AI_MODELS[aiModel.value];
  modelStatus.classList.add("active");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "AI Terminal",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: conversationHistory,
      temperature: 0.7, // Уменьшаем "креативность"
      max_tokens: 300, // Ограничиваем длину ответа
    }),
  });
}
// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupConsole();
  setupMatrixRain();
  startGlitchEffect();
});

// Настройка вкладок
function setupTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const tabId = tab.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// Настройка консоли
function setupConsole() {
  sendCommand.addEventListener("click", executeCommand);
  consoleInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeCommand();
  });
}

// Выполнение команды
async function executeCommand() {
  const command = consoleInput.value.trim();
  if (!command) return;

  consoleInput.value = "";
  addConsoleLine(`> ${command}`);

  // Добавляем в историю
  conversationHistory.push({ role: "user", content: command });

  // Анимация "думания"
  let dots = 0;
  const thinkingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    updateLastLine(`THINKING${".".repeat(dots)}`);
  }, 300);

  try {
    const response = await queryAI(command);
    clearInterval(thinkingInterval);
    removeLastLineIfThinking();

    if (response) {
      addConsoleLine(response);
      conversationHistory.push({ role: "assistant", content: response });
    } else {
      addConsoleLine("ERROR: Empty response from AI");
    }
  } catch (error) {
    clearInterval(thinkingInterval);
    removeLastLineIfThinking();
    addConsoleLine(`NETWORK ERROR: ${error.message}`);
  }

  addConsoleLine("> READY FOR NEXT INPUT");
}

// Запрос к AI
async function queryAI(prompt) {
  const selectedModel = AI_MODELS[aiModel.value];
  modelStatus.classList.add("active");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "Cyberpunk AI Terminal",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Работа с консолью
function addConsoleLine(text) {
  const line = document.createElement("div");
  line.classList.add("console-line");
  line.textContent = text;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function updateLastLine(text) {
  if (consoleOutput.lastElementChild) {
    consoleOutput.lastElementChild.textContent = text;
  }
}

function removeLastLineIfThinking() {
  if (consoleOutput.lastElementChild.textContent.startsWith("THINKING")) {
    consoleOutput.removeChild(consoleOutput.lastElementChild);
  }
}

// Матричный дождь (остается без изменений)
function setupMatrixRain() {
  const chars =
    "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  const columns = Math.floor(window.innerWidth / 20);

  for (let i = 0; i < columns; i++) {
    const column = document.createElement("div");
    column.style.position = "absolute";
    column.style.top = "-50px";
    column.style.left = i * 20 + "px";
    column.style.width = "20px";
    column.style.fontFamily = "monospace";
    column.style.fontSize = "16px";
    column.style.color = "#0f0";
    column.style.textAlign = "center";
    column.style.height = "100vh";
    column.style.overflow = "hidden";

    let text = "";
    const length = Math.floor(Math.random() * 10) + 5;
    for (let j = 0; j < length; j++) {
      text += chars[Math.floor(Math.random() * chars.length)] + "<br>";
    }
    column.innerHTML = text;

    document.getElementById("matrixRain").appendChild(column);
    animateColumn(column);
  }
}

function animateColumn(column) {
  let position = -50;
  const speed = Math.random() * 50 + 20;

  function frame() {
    position += 1;
    column.style.top = position + "px";

    if (position > window.innerHeight) {
      position = -100;
      const chars = column.innerHTML.split("<br>");
      for (let i = 0; i < chars.length; i++) {
        if (Math.random() > 0.7) {
          chars[i] = getRandomChar();
        }
      }
      column.innerHTML = chars.join("<br>");
    }

    setTimeout(frame, speed);
  }

  frame();
}

function getRandomChar() {
  const chars =
    "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  return chars[Math.floor(Math.random() * chars.length)];
}

// Глитч-эффекты
function startGlitchEffect() {
  setInterval(() => {
    if (Math.random() > 0.7) {
      document.body.classList.add("glitch-effect");
      setTimeout(() => {
        document.body.classList.remove("glitch-effect");
      }, 100);
    }
  }, 5000);
}
