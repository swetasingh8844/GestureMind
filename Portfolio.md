# Resume Reference: GestureMind

### **Spatial AI & Neural Intent Engine (GestureMind)**
**Tech Stack:** React 19, TypeScript, MediaPipe Hands, Gemini 3 Flash API, Tailwind CSS, Lucide Architecture.

*   **Engineered a High-Performance HCI Interface:** Developed a real-time Spatial Computing platform that bridges physical hand movements with digital system actions, utilizing **React 19** and **MediaPipe** for 21-point landmark tracking.
*   **Architected Neural Intent Decoding:** Replaced rigid, heuristic-based geometry logic with a **Gemini 3 Flash**-powered inference engine. The system streams normalized landmark data to the LLM to perform semantic intent decoding, resulting in significantly higher gesture robustness.
*   **Optimized Asynchronous Data Pipeline:** Built a low-latency pipeline capable of frame-by-frame coordinate extraction, normalization, and debounced AI inference, ensuring fluid UI responses while managing API quota efficiency.
*   **Context-Aware Automation:** Designed a "Neural Link" system that automates complex cross-site navigation (YouTube, Gmail, YT Music) and hardware state management (Volume/Media control) based on high-level gesture interpretation.
*   **Futuristic UX/UI Design:** Created a "Neural-Industrial" dashboard using **Tailwind CSS** and custom **Glassmorphism**, featuring real-time diagnostic logs and virtualized application views.

---

### **How to explain this in an interview:**
"Most gesture controllers fail because they use hard-coded 'if/else' statements for finger positions. I built GestureMind to treat hand landmarks as **contextual data**. By streaming these coordinates to a Gemini 3 model, the system understands the *intent* of the user, making it more flexible and capable of handling complex actions like multi-app navigation and universal media interrupts through a simple O-Sign pinch."