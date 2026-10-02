const cfg = window.ESUBE_CONFIG || {};
const API_URL = cfg.API_URL || "/api/chat";

let language = "english";
let mode = "assistant";
let history = [];

const $ = (id) => document.getElementById(id);
const chat = $("chat");
const message = $("message");

const text = {
  english: {
    subtitle: "Your bilingual personal assistant",
    assistant: "Assistant",
    nursing: "Nursing Care Plan",
    welcomeTitle: "Hello! I'm Esube AI.",
    welcomeText: "Ask me anything, or select Nursing Care Plan to create a structured plan.",
    placeholder: "Type your message...",
    notice: "Health answers are educational support and should be checked against clinical assessment and local protocols.",
    listening: "Listening…",
    error: "Sorry, I couldn't connect to Esube AI."
  },
  amharic: {
    subtitle: "የእርስዎ የግል ሁለት-ቋንቋ AI ረዳት",
    assistant: "የግል ረዳት",
    nursing: "የነርሲንግ እንክብካቤ እቅድ",
    welcomeTitle: "ሰላም! እኔ Esube AI ነኝ።",
    welcomeText: "ማንኛውንም ጥያቄ ይጠይቁኝ፣ ወይም የነርሲንግ እቅድ ለማዘጋጀት የነርሲንግ እቅድን ይምረጡ።",
    placeholder: "መልዕክትዎን ይጻፉ...",
    notice: "የጤና መረጃዎች ለትምህርታዊ ድጋፍ ብቻ ናቸው፤ ከሕክምና ግምገማና ከአካባቢ ፕሮቶኮሎች ጋር ያረጋግጡ።",
    listening: "እያዳመጥኩ ነው…",
    error: "ይቅርታ፣ Esube AI ጋር መገናኘት አልቻልኩም።"
  }
};

function renderLanguage() {
  const t = text[language];
  $("subtitle").textContent = t.subtitle;
  $("assistantLabel").textContent = t.assistant;
  $("nursingLabel").textContent = t.nursing;
  $("welcomeTitle").textContent = t.welcomeTitle;
  $("welcomeText").textContent = t.welcomeText;
  $("message").placeholder = t.placeholder;
  $("notice").textContent = t.notice;
  $("langBtn").textContent = language === "english" ? "አማ" : "EN";
}

function addBubble(content, who="ai") {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = content;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const value = message.value.trim();
  if (!value) return;
  addBubble(value, "user");
  message.value = "";
  const typing = document.createElement("div");
  typing.className = "bubble ai typing";
  typing.textContent = "…";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        message: value,
        language,
        mode,
        history
      })
    });
    const data = await res.json();
    typing.remove();
    if (!res.ok) throw new Error(data.error || "Request failed");
    addBubble(data.text, "ai");
    history.push({role:"user", content:value}, {role:"assistant", content:data.text});
    speak(data.text);
  } catch (e) {
    typing.remove();
    addBubble(text[language].error, "ai");
  }
}

function speak(value) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(value);
  utter.lang = language === "amharic" ? "am-ET" : "en-US";
  utter.rate = 0.9;
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v =>
    /female|zira|samantha|victoria|karen|susan|aria|jenny/i.test(v.name)
  );
  if (female) utter.voice = female;
  speechSynthesis.speak(utter);
}

$("sendBtn").onclick = send;
message.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

document.querySelectorAll(".mode").forEach(btn => {
  btn.onclick = () => {
    mode = btn.dataset.mode;
    document.querySelectorAll(".mode").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
  };
});

$("langBtn").onclick = () => {
  language = language === "english" ? "amharic" : "english";
  renderLanguage();
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  $("micBtn").onclick = () => {
    recognition.lang = language === "amharic" ? "am-ET" : "en-US";
    $("micBtn").textContent = "🔴";
    recognition.start();
  };
  recognition.onresult = e => {
    message.value = e.results[0][0].transcript;
    $("micBtn").textContent = "🎙️";
  };
  recognition.onerror = () => $("micBtn").textContent = "🎙️";
  recognition.onend = () => $("micBtn").textContent = "🎙️";
} else {
  $("micBtn").onclick = () => alert("Voice input is not supported by this browser.");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

renderLanguage();
