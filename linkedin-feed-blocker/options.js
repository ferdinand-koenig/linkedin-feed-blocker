const minutesInput = document.getElementById("minutes");
const valueDisplay = document.getElementById("value-display");
const status = document.getElementById("status");

// Load saved value from storage
chrome.storage.sync.get({ blockMinutes: 1 }, data => {
  minutesInput.value = data.blockMinutes;
  valueDisplay.textContent = formatMinutes(data.blockMinutes);
  adjustStep(data.blockMinutes);
});

// Format display
function formatMinutes(value) {
  if (value === '0' || value === 0) return "Immediate";
  return `${parseFloat(value).toFixed(2)} min`;
}

// Adjust slider step based on value ranges
function adjustStep(value) {
  value = parseFloat(value);
  if (value < 2) {
    minutesInput.step = 0.25;
  } else if (value < 5) {
    minutesInput.step = 0.5;
  } else if (value < 10) {
    minutesInput.step = 1;
  } else {
    minutesInput.step = 5; // 10 → 20 minutes
  }
}

// Update display and step dynamically
minutesInput.addEventListener("input", () => {
  valueDisplay.textContent = formatMinutes(minutesInput.value);
  adjustStep(minutesInput.value);
});

// Save value
document.getElementById("save").addEventListener("click", () => {
  let value = parseFloat(minutesInput.value);
  if (isNaN(value) || value < 0) return;

  chrome.storage.sync.set({ blockMinutes: value }, () => {
    status.textContent = `Saved! Blocking after ${formatMinutes(value)}.`;
    setTimeout(() => { status.textContent = ''; }, 3000);
  });
});
