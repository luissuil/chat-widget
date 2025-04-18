import { css } from 'lit';

export const chatWidgetStyles = css`
  :host {
    display: block;
    position: fixed;
    z-index: 1000;

    /* Variables de paleta configurables */
    --primary: #556B2F;
    --primary-dark: #4C5A22;
    --accent: #D2691E;
    --accent-dark: #B55B17;
    --surface: #F9F5EC;
    --surface-alt: #FFFAF0;
    --border: #E0D7C5;
  }
  #chat-bubble {
    width: 55px;
    height: 55px;
    background-color: var(--accent);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 28px;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  #chat-bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
  #chat-container {
    width: min(400px, 90vw); /* Ancho aumentado */
    max-height: min(80vh, 600px);
    border: none;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    background: var(--surface);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    visibility: hidden;
    opacity: 0;
    transform-origin: bottom right;
    transition: visibility 0s linear 0.2s, opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  }
  :host([position="bottom-left"]) #chat-container { transform-origin: bottom left; }
  :host([position="top-right"]) #chat-container { transform-origin: top right; }
  :host([position="top-left"]) #chat-container { transform-origin: top left; }

  #chat-container.open {
    visibility: visible;
    opacity: 1;
    transform: translateY(0) scale(1);
    transition-delay: 0s;
  }
  #chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background-color: var(--primary);
    color: var(--surface);
    border-bottom: 1px solid #eee;
  }
  #chat-header span {
    font-weight: 600;
    font-size: 1.1em;
  }
  #close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--surface);
    padding: 0;
    line-height: 1;
    opacity: 0.8;
  }
  #close-button:hover {
    opacity: 1;
  }
  #messages {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    min-height: 100px;
    background-color: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  /* Custom scrollbar */
  #messages::-webkit-scrollbar {
    width: 6px;
  }
  #messages::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .message {
    padding: 10px 15px;
    border-radius: 18px;
    max-width: 80%;
    word-wrap: break-word;
    line-height: 1.4;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    animation: fadeIn 0.3s ease-out;
  }
  .user-message {
    background-color: var(--primary);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  .assistant-message {
    background-color: var(--surface-alt);
    color: #333;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  #input-container {
    display: flex;
    border-top: 1px solid #e0e0e0;
    padding: 10px;
    background-color: var(--surface);
  }
  #input-container input {
    flex: 1;
    border: 1px solid #dcdcdc;
    padding: 10px 12px;
    outline: none;
    border-radius: 20px;
    margin-right: 8px;
    font-size: 0.95em;
    background: var(--surface-alt);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  #input-container input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(85,107,47,0.2);
  }
  #input-container button {
    border: none;
    padding: 0 15px;
    cursor: pointer;
    background: var(--accent);
    color: white;
    border-radius: 20px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  #input-container button:hover {
    background-color: var(--accent-dark);
  }
  .message-timestamp {
    font-size: 0.75em;
    color: #888;
    margin-top: 4px;
    text-align: right;
  }
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 15px;
    max-width: 60%;
    background-color: #e0e0e0;
    border-radius: 18px;
    align-self: flex-start;
  }
  .typing-indicator span {
    display: block;
    width: 6px;
    height: 6px;
    background-color: #888;
    border-radius: 50%;
    opacity: 0.4;
    animation: blink 1.4s infinite both;
  }
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.4; }
    40% { opacity: 1; }
  }
  .helper-tooltip {
    position: absolute;
    background: var(--primary);
    color: var(--surface);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85em;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    white-space: nowrap;
    animation: fadeIn 0.3s ease-out;
    bottom: 65px;
    right: 0;
  }
  .helper-tooltip::before {
    content: '';
    position: absolute;
    border-width: 6px;
    border-style: solid;
    bottom: -6px;
    right: 14px;
    border-color: var(--primary) transparent transparent transparent;
  }
  :host([position="bottom-left"]) .helper-tooltip {
    bottom: 65px;
    left: 0;
    right: auto;
  }
  :host([position="bottom-left"]) .helper-tooltip::before {
    bottom: -6px;
    left: 14px;
    right: auto;
    border-color: var(--primary) transparent transparent transparent;
  }
  :host([position^="top-"]) .helper-tooltip {
    top: 65px;
    bottom: auto;
  }
  :host([position="top-right"]) .helper-tooltip {
    right: 0;
    left: auto;
  }
  :host([position="top-left"]) .helper-tooltip {
    left: 0;
    right: auto;
  }
  :host([position^="top-"]) .helper-tooltip::before {
    top: -6px;
    bottom: auto;
    border-color: transparent transparent var(--primary) transparent;
  }
  :host([position="top-right"]) .helper-tooltip::before {
    right: 14px;
    left: auto;
  }
  :host([position="top-left"]) .helper-tooltip::before {
    left: 14px;
    right: auto;
  }

  /* Estilos para el formulario inicial */
  .init-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 30px 20px 20px; /* Más padding arriba */
    box-sizing: border-box;
  }
  /* Contenedor para input + error */
  .init-form > div {
    display: flex;
    flex-direction: column;
    gap: 4px; /* Espacio entre input y mensaje de error */
  }
  .init-form input {
    width: 100%;
    border: 1px solid var(--border);
    padding: 8px 12px; /* Menos padding vertical */
    border-radius: 8px; /* Menos redondeado, más acorde al contenedor */
    background: var(--surface-alt);
    font-size: 0.95em;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box; /* Asegura que padding no aumente el tamaño */
  }
  .init-form input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(85,107,47,0.2);
  }
  .init-form button {
    width: 100%;
    padding: 10px 12px;
    background: var(--primary);
    color: var(--surface);
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 8px; /* Espacio extra antes del botón */
  }
  .init-form button:hover {
    background-color: var(--primary-dark);
  }

  /* Mensajes de error de validación */
  .error-message {
    color: var(--accent);
    font-size: 0.85em;
    padding-left: 12px;
  }
`;
