/**
 * Haptic buzz: `navigator.vibrate` on Android; on iOS 18+ Safari, which has no Vibration API,
 * one tick per "on" segment of the pattern via the switch-checkbox hack. No-op elsewhere.
 */
export function vibrate(pattern: VibratePattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
    return;
  }

  // ponytail: iOS hack — toggling a native `<input switch>` plays a system haptic tick. Undocumented
  // WebKit behavior (iOS 18+) that Apple may remove; may not fire outside a user gesture. Delete if it breaks.
  const segments = typeof pattern === "number" ? [pattern] : Array.from(pattern);
  let offset = 0;
  segments.forEach((duration, index) => {
    if (index % 2 === 0) {
      setTimeout(iosHapticTick, offset);
    }
    offset += duration;
  });
}

function iosHapticTick() {
  const label = document.createElement("label");
  label.ariaHidden = "true";
  label.style.display = "none";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);
  document.head.appendChild(label);
  label.click();
  label.remove();
}
