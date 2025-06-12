const slider = document.getElementById("slider");
const characterLength = document.getElementById("character-length");
const copiedText = document.getElementById("copied-text");
const copyIcon = document.getElementById("copy-icon");
const strengthStatus = document.getElementById("strength-status");
const strengthBars = document.getElementById("strength-bars-container");
const generateButton = document.getElementById("generate-button");
const passwordDisplay = document.getElementById("password-display");
const passwordOptions = document.getElementById("password-options");

const INITAL_PASSWORD_TEXT = "P4$5W0rD!";
const STRENGTH_STATUS = ["WEAK", "WEAK", "MEDIUM", "STRONG"];
const STRENGTH_STATUS_COLORS = {
  WEAK: "red-500",
  MEDIUM: "yellow-300",
  STRONG: "green-200",
};

const updateSliderAppearance = (sliderElement) => {
  const min = parseFloat(sliderElement.min);
  const max = parseFloat(sliderElement.max);
  const value = parseFloat(sliderElement.value);
  const percentage = ((value - min) / (max - min)) * 100;

  sliderElement.style.setProperty("--value-percent-js", `${percentage}%`);
  characterLength.textContent = Math.round(value);
};

const areAnyOptionsSelected = (optionsData) => {
  return Object.values(optionsData).some((value) => value);
};

const getRandomCharacter = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generatePassword = (length, options) => {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*_+-=|;:,./?";

  let characterPool = "";
  const guaranteedChars = [];

  if (options.uppercase) {
    characterPool += uppercaseChars;
    guaranteedChars.push(getRandomCharacter(uppercaseChars));
  }
  if (options.lowercase) {
    characterPool += lowercaseChars;
    guaranteedChars.push(getRandomCharacter(lowercaseChars));
  }
  if (options.numbers) {
    characterPool += numberChars;
    guaranteedChars.push(getRandomCharacter(numberChars));
  }
  if (options.symbols) {
    characterPool += symbolChars;
    guaranteedChars.push(getRandomCharacter(symbolChars));
  }

  if (characterPool.length === 0) {
    return "";
  }

  let passwordArray = [];

  passwordArray.push(...guaranteedChars);

  const remaingLength = length - guaranteedChars.length;
  for (let i = 0; i < remaingLength; i++) {
    if (characterPool.length > 0) {
      passwordArray.push(getRandomCharacter(characterPool));
    }
  }

  passwordArray = shuffleArray(passwordArray);

  if (passwordArray.length > length) {
    passwordArray = passwordArray.slice(0, length);
  }
  return passwordArray.join("");
};

const calculatePasswordStrength = (length, options) => {
  let strength = 0;
  const amountOfEnabledOptions = Object.values(options).filter(
    (value) => value
  ).length;

  if (amountOfEnabledOptions >= 3) {
    strength += 2;
  } else {
    strength += 1;
  }
  if (length <= 3) {
    strength = strength - 1 === 0 ? 1 : strength - 1;
  } else if (length <= 5) {
    strength += 0;
  } else if (length <= 10) {
    strength += 1;
  } else {
    strength += 2;
  }

  return strength;
};

const renderStrengthStatus = (stength) => {
  strengthStatus.classList.remove("hidden");
  strengthStatus.textContent = STRENGTH_STATUS[stength - 1];
  const color = STRENGTH_STATUS_COLORS[STRENGTH_STATUS[stength - 1]];

  strengthBars.querySelectorAll("div").forEach((bar, index) => {
    const isActive = index < stength;
    bar.dataset.active = isActive;
    if (isActive) {
      bar.style.setProperty("--active-fill", `var(--color-${color})`);
    } else {
      bar.style.setProperty("--active-fill", "transparent");
    }
  });
};

const init = () => {
  updateSliderAppearance(slider);
  copiedText.classList.add("hidden");
  strengthStatus.classList.add("hidden");
  generateButton.disabled = true;
  passwordDisplay.textContent = INITAL_PASSWORD_TEXT;
  passwordOptions.dataset.options = JSON.stringify({
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
  });
  strengthBars.querySelectorAll("div").forEach((bar) => {
    bar.dataset.active = false;
  });
};

document.addEventListener("DOMContentLoaded", () => {
  init();

  slider.addEventListener("input", (e) => {
    updateSliderAppearance(e.target);
  });

  passwordOptions.querySelectorAll("li").forEach((option) => {
    const checkboxInput = option.querySelector("input");
    option.addEventListener("click", () => {
      const optionData = JSON.parse(passwordOptions.dataset.options);
      optionData[checkboxInput.id] = checkboxInput.checked;
      generateButton.disabled = !areAnyOptionsSelected(optionData);
      passwordOptions.dataset.options = JSON.stringify(optionData);
    });
  });

  generateButton.addEventListener("click", () => {
    const length = parseInt(characterLength.textContent, 10);
    const options = JSON.parse(passwordOptions.dataset.options);

    const newPassword = generatePassword(length, options);
    passwordDisplay.textContent = newPassword;
    passwordDisplay.dataset.generated = true;

    const strength = calculatePasswordStrength(length, options);
    renderStrengthStatus(strength);
  });

  copyIcon.addEventListener("click", () => {
    const textToCopy = passwordDisplay.textContent;

    if (textToCopy && textToCopy !== INITAL_PASSWORD_TEXT) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          copiedText.classList.remove("hidden");
          setTimeout(() => {
            copiedText.classList.add("hidden");
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  });
});
