if (!document.head.querySelector(".TwitchRTL")) {
  const style = document.createElement("style");
  style.className = "TwitchRTL";
  style.textContent = `
    @import url("https://fonts.googleapis.com/css2?family=Vazirmatn&display=swap");
    @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;600;700;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Changa:wght@200;300;400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Harmattan:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
    .chat-room__content {
      font-family: 'Vazirmatn';
    }
    .chat-line__message-container,
    .user-notice-line {
      border-bottom: 0.5px solid #808080;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    .rtlsupport {
      text-align: right;
      direction: rtl;
    }
    .gBAboc {
      font-weight: normal !important;
      font-family: 'Vazirmatn';
    }
    .jCLQvB{
      width: 100%
    }
    .fPmwxk {
      font-family: 'Vazirmatn';
      text-align: right;
      direction: rtl;
    }
    .chat-line__message--emote-button{
      margin-top: 1px !important; 
      margin-bottom: 1px !important;
    }
    .chat-scrollable-area__message-container > div:last-child .chat-line__message-container {
      border-bottom: none;
    }
    .font-select {
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      font-family: 'Segoe UI', sans-serif;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 8px;
      border: none;
      backdrop-filter: blur(4px);
    }
    .font-select:focus {
      outline: none;
    }
    .font-select-option {
      background-color: #333;
      color: white;
    }
   
    `;
  document.head.append(style);
}

const select = document.createElement("select");
select.className = "font-select";
select.style.fontFamily = "Vazirmatn";
select.innerHTML = `
    <option value="" disabled selected hidden>Choose Chat Font</option>
    <option class="font-select-option" value="Vazirmatn">Vazirmatn</option>
    <option class="font-select-option" value="Twitch">Twitch Default</option>
    <option class="font-select-option" value="Cairo">Cairo</option>
    <option class="font-select-option" value="Amiri">Amiri</option>
    <option class="font-select-option" value="Almarai">Almarai</option>
    <option class="font-select-option" value="Changa">Changa</option>
    <option class="font-select-option" value="Harmattan">Harmattan</option>
    <option class="font-select-option" value="Noto Naskh Arabic">Noto Naskh Arabic</option>
    <option class="font-select-option" value="Noto Kufi Arabic">Noto Kufi Arabic</option>
`;

const arabic = /[\u0600-\u06FF]/;
var currentFont = "Vazirmatn";
var globalFontSelectValue = "Vazirmatn";
globalFontSelectValue = localStorage.getItem('selectedFont') || globalFontSelectValue;

function handleMessages() {
  const chat = document.querySelector("div[aria-label='Chat messages']");
  if (!chat) return;

  if (globalFontSelectValue != currentFont && document.querySelector('.font-select')) {
    currentFont = globalFontSelectValue;
    localStorage.setItem('selectedFont', currentFont);
    if (currentFont == "Twitch")
      document.querySelector('.font-select').style.removeProperty("font-family");
    else
      document.querySelector('.font-select').style.fontFamily = currentFont;

    const sheet = document.querySelector('.TwitchRTL')?.sheet;
    if (sheet) {
      const targets = ['.chat-room__content', '.gBAboc', '.fPmwxk'];
      for (var rule of sheet.cssRules) {
        if (targets.includes(rule.selectorText)) {
          rule.style.removeProperty("font-family");
          if (currentFont != "Twitch")
            rule.style.fontFamily = currentFont;
        }
      }
    }
  }

  const container = chat.querySelector(".simplebar-content");
  if (container) container.style.overflowX = "hidden";

  document.querySelectorAll('[data-a-target="chat-welcome-message"]').forEach(div => div.innerHTML = "");
  document.querySelectorAll('[data-a-target="chat-welcome-message"]').forEach(div => div.innerText = "");

  const messages = chat.querySelectorAll("div[data-a-target='chat-line-message']");
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    const m = msg.querySelector("[class*='chat-line__no-background']");
    if (!m) continue;

    const emojiSpan = m.querySelector("span[aria-hidden='true']");
    if (emojiSpan) {
      const scrollAtEnd = !chat.querySelector("div[class*='chat-paused-footer']");
      emojiSpan.replaceWith(document.createElement("br"));

      if (scrollAtEnd) {
        const scroll = chat.querySelector("div[data-a-target='chat-scroller'] .simplebar-scroll-content");
        if (scroll) scroll.scrollTo(0, scroll.scrollHeight);
      }

      const body = m.querySelector("span[data-a-target='chat-line-message-body']");
      if (body && arabic.test(body.textContent)) {
        const wrapper = document.createElement("div");
        wrapper.className = "rtlsupport";
        body.parentNode.replaceChild(wrapper, body);
        wrapper.append(body);
      }
    }
  }
}

function waitFor(selector, timeout = 10000) {
  return new Promise((res, rej) => {
    const t = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) return clearInterval(t), res(el);
    }, 100);
    setTimeout(() => clearInterval(t) || rej(), timeout);
  });
}

const observerCallback = (mutationsList, observer) => {
  if (document.querySelector("div[aria-label='Chat messages']")) {
    handleMessages();
  }
};

const observer = new MutationObserver(observerCallback);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

function handler() {

  if (document.querySelectorAll('[data-a-target="chat-welcome-message"]').length > 1) {
    try {
      // const user_chat = document.querySelector("span[data-a-target='chat-input-text']").querySelector('span').innerText;
      document.querySelector("button[data-a-target='chat-settings']").click();
      waitFor("button[data-a-target='hide-chat-button']").then(el =>
        el.click()
      );
      waitFor("button[data-a-target='show-chat-button']").then(el =>
        el.click()
      );
      // document.querySelector("span[data-a-target='chat-input-text']").querySelector('span').innerText = user_chat;
    } catch (_) { }
  }


  /**********************
   * HANDLE ERROR CODES *
  **********************/

  const errorBox = document.querySelector(
    "div[aria-labelledby='content-overlay-gate-text']"
  );
  if (errorBox && /#\d000/.test(errorBox.innerText))
    errorBox.querySelector("button")?.click();

  if (document.querySelector(".consent-banner__content--gdpr-v2")) {
    document.querySelector(".consent-banner__content--gdpr-v2").querySelectorAll("button")[2].click();
  }

  /****************************
   * ADD FONT SELECT DROPDOWN *
  ****************************/

  const inputButtonContainer = document.querySelector(".chat-input__buttons-container");
  if (inputButtonContainer && !document.querySelector(".font-select")) {
    inputButtonContainer.children[1].children[0].append(select);
    document.querySelector(".font-select").value = globalFontSelectValue;
    fontSelectListener();
  }
}

setInterval(handler, 1000);

function fontSelectListener() {
  select.addEventListener("change", () => {
    if (select.value != "temp") {
      const originalValue = select.value;
      globalFontSelectValue = originalValue;
      const tempOption = new Option("Please wait...", "temp", true, true);
      select.add(tempOption);
      select.disabled = true;
      setTimeout(() => {
        select.value = originalValue;
        select.remove(tempOption.index);
        select.disabled = false;
      }, 3000);
    }
  });
}

/*********************
 * ِDISABLE K BUTTON *
 *********************/

document.addEventListener('keydown', function (e) {
  const tag = document.activeElement.tagName.toLowerCase();
  const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable;

  if (!isTyping && e.key.toLowerCase() === 'k') {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);