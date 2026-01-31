# ✋ GestureMind: Neural Interface Controller

**GestureMind** is a high-performance, futuristic hand-gesture controller that bridges the gap between physical movement and digital action. Using **MediaPipe Hands** for real-time landmark tracking and **Gemini 3 Flash** for neural intent decoding, it allows users to control media and navigate web services through intuitive hand signs.

---

## 🚀 Core Features

### 🧠 Neural Intent Decoding
Unlike traditional gesture controllers that use hard-coded geometry, GestureMind streams hand landmark data to **Gemini 3 Flash**. The AI interprets the "intent" behind the posture, allowing for more robust detection across different hand shapes and orientations.

### 🔗 Direct Link Redirection
The system features "Neural Links" that automatically open industry-standard web services based on specific finger extensions:
- **Middle Finger:** Triggers a direct link to **YouTube Music**.
- **Open Palm:** Launches the main **YouTube** platform.
- **Small Finger (Pinky):** Redirects to **Gmail**.

### ⏸️ Universal Media Control (The O-Sign)
The **O-Sign (Pinch)** acts as a global interrupt signal. 
- **Action:** Touching the thumb and index finger.
- **Behavior:** Immediately halts any active media stream (YouTube or Music) within the virtual dashboard, displaying a "SIGNAL PAUSED" alert.

---

## 🛠️ Gesture Keymap

| Gesture | Action | System Response |
| :--- | :--- | :--- |
| **🖕 Middle Finger** | `PLAY_SONG` | Opens YouTube Music Link + UI Transition |
| **🖐️ Open Palm** | `OPEN_YOUTUBE` | Opens YouTube Link + UI Transition |
| **🤙 Pinky Finger** | `OPEN_GMAIL` | Opens Gmail Link + Virtual Inbox View |
| **👌 O-Sign (Pinch)** | `PAUSE_SONG` | **Universal Pause** for active media |
| **👍 Thumbs Up** | `VOLUME_UP` | Increments system volume by 10% |
| **👎 Thumbs Down** | `VOLUME_DOWN` | Decrements system volume by 10% |
| **✊ Fist** | `LOCK_SYSTEM` | Enters high-security lock state |

---

## 💻 Technical Stack

- **Frontend:** React 19, Tailwind CSS
- **Vision Engine:** MediaPipe Hands (Real-time 21-point landmark tracking)
- **AI Core:** Google Gemini 3 Flash (`@google/genai`)
- **Icons:** Lucide React
- **Design Language:** Cyberpunk Glassmorphism / Neural-Industrial

---

## ⚙️ How It Works

1. **Capture:** The browser accesses the webcam via `MediaPipe Camera Utils`.
2. **Tracking:** `MediaPipe Hands` identifies 21 coordinates (X, Y, Z) for the hand in every frame.
3. **Inference:** When a stable gesture is detected, the normalized coordinates are sent to the Gemini API.
4. **Action:** The AI returns a JSON-structured intent (e.g., `PLAY_SONG`). The app then executes the corresponding logic, such as `window.open()` for links or updating the React state for the virtual UI.

---

## ⚠️ Requirements

- **API Key:** A valid `process.env.API_KEY` must be configured for the Gemini AI.
- **Permissions:** Camera access is required for hand tracking.
- **Pop-ups:** Browser pop-ups must be allowed for the "Direct Link" redirection feature to function automatically.

---

