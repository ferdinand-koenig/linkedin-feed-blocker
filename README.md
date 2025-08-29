# LinkedIn Feed Blocker

A simple Chrome extension that blocks the LinkedIn feed after 3 minutes to help you stay focused.

## Author
Ferdinand Koenig

## License
This project is licensed under the [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/).

---

## Installation

1. Clone or download this repository to your computer.
2. Open **Google Chrome** and navigate to:
    `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right).
4. Click **"Load unpacked"**.
5. Select the folder containing the extension files.

---

## Usage

1. Go to [LinkedIn Feed](https://www.linkedin.com/feed/).
2. Stay on the page for **3 minutes**.
3. After the time is up, the feed will be blocked and replaced with a motivational message.

---

## Notes

- The time limit is currently set to **3 minutes** in `background.js`.
- You can adjust it by editing the value:
  ```js
  3 * 60 * 1000 // 3 minutes in milliseconds
  ```
- After making changes, reload the extension in `chrome://extensions/`.

