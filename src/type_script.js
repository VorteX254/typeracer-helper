(() => {
  // Get the full text from the race display
  const textElement = document.querySelector('.inputPanel span');
  if (!textElement) {
    console.warn('Text to type not found.');
    return;
  }

  const content = textElement.parentElement.textContent.split('');
  let charNum = 0;

  // Function to type one character
  const typeNextCharacter = () => {
    if (charNum >= content.length) return true;

    const input = document.querySelector('.txtInput');
    if (!input) return true;

    const char = content[charNum++];
    input.value += char;

    // Simulate key events (optional but more realistic)
    const eventOptions = { bubbles: true, cancelable: true };
    const keydown = new KeyboardEvent('keydown', { key: char, ...eventOptions });
    const keypress = new KeyboardEvent('keypress', { key: char, ...eventOptions });
    const inputEvent = new Event('input', eventOptions);
    const keyup = new KeyboardEvent('keyup', { key: char, ...eventOptions });

    input.dispatchEvent(keydown);
    input.dispatchEvent(keypress);
    input.dispatchEvent(inputEvent);
    input.dispatchEvent(keyup);

    return false;
  };

  // Loop with variable interval for human-like typing speed
  const loop = () => {
    const done = typeNextCharacter();
    if (done) return;
    setTimeout(loop, 35.5 + 2 * (Math.random() - 0.5));
  };

  loop();
})();
