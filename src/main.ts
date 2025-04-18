import { LitElement, html, svg } from 'lit'; // Import svg
import { customElement, property, query, state } from 'lit/decorators.js';
import { z } from 'zod';
import { chatWidgetStyles } from './chat-widget.styles.ts';

// Define modelo de mensaje con remitente, texto y timestamp
interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Interfaces para respuestas de API
interface StartResponse {
  message?: string;
  thread_id?: string;
}

interface ChatResponse {
  message?: string;
  thread_id?: string; // El backend podría devolverlo para mantener la sesión
}

// Definición interna de los campos disponibles
const PREDEFINED_FIELDS = {
  name: {
    label: 'Nombre',
    type: 'text',
    validation: z.string().min(1, 'El nombre es obligatorio'),
  },
  email: {
    label: 'Correo Electrónico',
    type: 'email',
    validation: z.string().email('El correo no tiene un formato válido'),
  },
  phone: {
    label: 'Teléfono (Opcional)',
    type: 'tel',
    validation: z.string().regex(/^[+\d\s\-()]{6,}$/, 'Formato de teléfono inválido').optional().or(z.literal('')),
  },
  subject: {
    label: 'Asunto (Opcional)',
    type: 'text',
    validation: z.string().optional(),
  },
};
type FieldName = keyof typeof PREDEFINED_FIELDS;

@customElement('chat-widget')
export class ChatWidget extends LitElement {
  static styles = [chatWidgetStyles];

  // Mensajes en formato estructurado
  @property({ type: Array }) messages: Message[] = [];
  @property({ type: String }) chatTitle = 'Asistente';
  @property({ type: String }) position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right'; // Nueva propiedad para posición

  /* Configuración de URLs para backend */
  @property({ type: String, attribute: 'form-url' }) formUrl = '';
  @property({ type: String, attribute: 'chat-url' }) chatUrl = '';
  @property({ type: String, attribute: 'api-base-url' }) apiBaseUrl = '';

  // Propiedades para habilitar campos (con atributos HTML)
  @property({ type: Boolean, attribute: 'enable-name' }) enableName = true;
  @property({ type: Boolean, attribute: 'enable-email' }) enableEmail = true;
  @property({ type: Boolean, attribute: 'enable-phone' }) enablePhone = false;
  @property({ type: Boolean, attribute: 'enable-subject' }) enableSubject = false;

  // Modo de desarrollo para simular backend
  @property({ type: Boolean, attribute: 'dev-mode' }) devMode = false;

  // Nuevos estados para helper y formulario
  @state() private _isOpen = false;
  @state() private _isTyping = false;
  @state() private showHelper = true;
  @state() private formSubmitted = false;
  @state() private draft = '';
  @state() private threadId?: string;
  @state() private _formValues: Partial<Record<FieldName, string>> = {};
  @state() private _formErrors: Partial<Record<FieldName, string | undefined>> = {};

  private _helperTimeout?: number;

  @query('#messages') private _messagesContainer!: HTMLDivElement;

  connectedCallback() {
    super.connectedCallback();
    // Configuración de URLs desde apiBaseUrl si no se han pasado individualmente
    if (this.apiBaseUrl) {
      if (!this.formUrl) this.formUrl = `${this.apiBaseUrl}/start`;
      if (!this.chatUrl) this.chatUrl = `${this.apiBaseUrl}/chat`;
    }
    // Aplicar la posición inicial
    this._updateHostPosition();
    // Esc para cerrar
    window.addEventListener('keydown', this._onKeydownEscape);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeydownEscape);
    clearTimeout(this._helperTimeout);
  }

  // Actualizar la posición cuando cambie la propiedad
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('position')) {
      this._updateHostPosition();
    }
  }

  private _updateHostPosition() {
    // Eliminar clases de posición anteriores
    this.style.removeProperty('top');
    this.style.removeProperty('bottom');
    this.style.removeProperty('left');
    this.style.removeProperty('right');

    // Aplicar nuevos estilos basados en la posición
    switch (this.position) {
      case 'bottom-left':
        this.style.bottom = '20px';
        this.style.left = '20px';
        break;
      case 'top-right':
        this.style.top = '20px';
        this.style.right = '20px';
        break;
      case 'top-left':
        this.style.top = '20px';
        this.style.left = '20px';
        break;
      case 'bottom-right':
      default:
        this.style.bottom = '20px';
        this.style.right = '20px';
        break;
    }
  }

  private _onKeydownEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') this._toggleChat(); };

  private _toggleChat() {
    this._isOpen = !this._isOpen;
    // Resetea helper al abrir
    if (this._isOpen && !this.formSubmitted) {
      this.showHelper = true;
      clearTimeout(this._helperTimeout);
      this._helperTimeout = window.setTimeout(() => this.showHelper = false, 8000);
      // Focus first enabled input
      this.updateComplete.then(() => {
        const firstInput = this.shadowRoot?.querySelector('.init-form input') as HTMLInputElement | null;
        setTimeout(() => firstInput?.focus(), 50);
      });
    }
  }

  private _handleFormInput(fieldName: FieldName, value: string) {
    this._formValues = { ...this._formValues, [fieldName]: value };
    // Limpiar error al escribir
    if (this._formErrors[fieldName]) {
      this._formErrors = { ...this._formErrors, [fieldName]: undefined };
    }
  }

  private async _startConversation() {
    // 1. Construir esquema Zod dinámicamente
    let dynamicSchemaObject: Record<string, z.ZodTypeAny> = {};
    const enabledFieldNames: FieldName[] = [];

    if (this.enableName) {
      dynamicSchemaObject.name = PREDEFINED_FIELDS.name.validation;
      enabledFieldNames.push('name');
    }
    if (this.enableEmail) {
      dynamicSchemaObject.email = PREDEFINED_FIELDS.email.validation;
      enabledFieldNames.push('email');
    }
    if (this.enablePhone) {
      dynamicSchemaObject.phone = PREDEFINED_FIELDS.phone.validation;
      enabledFieldNames.push('phone');
    }
    if (this.enableSubject) {
      dynamicSchemaObject.subject = PREDEFINED_FIELDS.subject.validation;
      enabledFieldNames.push('subject');
    }
    const dynamicSchema = z.object(dynamicSchemaObject);

    // 2. Validar los valores actuales
    const result = dynamicSchema.safeParse(this._formValues);

    // 3. Manejar errores o éxito
    if (!result.success) {
      // Explicitly type zodErrors
      const zodErrors: Partial<Record<FieldName, string[] | undefined>> = result.error.formErrors.fieldErrors;
      const newErrors: Partial<Record<FieldName, string | undefined>> = {};
      // Mapear errores de Zod a nuestro estado _formErrors
      for (const field of enabledFieldNames) {
        newErrors[field] = zodErrors[field]?.[0];
      }
      this._formErrors = newErrors;
      return;
    }

    // Éxito: Limpiar errores y proceder
    this._formErrors = {};
    const validatedData = result.data as Partial<Record<FieldName, string | undefined>>;

    this.formSubmitted = true;

    // --- Modo Dev: Simular inicio --- 
    if (this.devMode) {
      const welcomeText = `Modo Dev: ¡Hola ${validatedData?.name || 'invitado'}! Formulario recibido.`;
      const welcome: Message = { sender: 'assistant', text: welcomeText, timestamp: new Date() };
      this.messages = [welcome];
      this.updateComplete.then(() => this._scrollToBottom());
      return; // Saltar llamada real al backend
    }
    // --- Fin Modo Dev ---

    // 4. Enviar datos validados al backend
    let welcomeText = `Hola ${validatedData?.name || 'invitado'}, ¿en qué puedo ayudarte?`; // Mensaje por defecto
    let errorOccurred = false;

    if (this.formUrl) {
      try {
        // Enviar solo los datos de los campos habilitados y validados
        const payload = enabledFieldNames.reduce((acc, key) => {
          if (key in validatedData && validatedData[key] !== undefined && validatedData[key] !== '') {
            acc[key] = validatedData[key]!;
          }
          return acc;
        }, {} as Record<string, string>);

        const resp = await fetch(this.formUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data: StartResponse = await resp.json();
        welcomeText = data.message || welcomeText;
        if (data.thread_id) this.threadId = data.thread_id;

      } catch (err) {
        console.error('Error al iniciar conversación:', err);
        welcomeText = 'Error al conectar con el asistente. Inténtalo más tarde.';
        errorOccurred = true;
      }
    } else {
      console.warn('ChatWidget: form-url no está configurado.');
      welcomeText = 'Configuración incompleta del widget.';
      errorOccurred = true;
    }

    const welcome: Message = { sender: 'assistant', text: welcomeText, timestamp: new Date() };
    this.messages = [welcome];
    this.updateComplete.then(() => this._scrollToBottom());
  }

  private async _sendMessage() {
    if (!this.draft.trim() || this._isTyping) return;
    const text = this.draft.trim();
    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    this.messages = [...this.messages, userMsg];
    this.draft = '';
    this._scrollToBottom();

    this._isTyping = true;
    await this.updateComplete;
    this._scrollToBottom();

    // --- Modo Dev: Simular respuesta --- 
    if (this.devMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay
      const responseText = `Modo Dev: Recibido "${text}"`;
      const assistantMsg: Message = { sender: 'assistant', text: responseText, timestamp: new Date() };
      this._isTyping = false;
      this.messages = [...this.messages, assistantMsg];
      await this.updateComplete;
      this._scrollToBottom();
      return; // Saltar llamada real al backend
    }
    // --- Fin Modo Dev ---

    // Llamada al backend para obtener respuesta
    let responseText = 'Lo siento, algo salió mal.';
    if (this.chatUrl) {
      try {
        const payload: { message: string; thread_id?: string } = { message: text };
        if (this.threadId) payload.thread_id = this.threadId;

        const resp = await fetch(this.chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data: ChatResponse = await resp.json();
        responseText = data.message || responseText;
        if (data.thread_id) this.threadId = data.thread_id;

      } catch (err) {
        console.error('Error al enviar mensaje:', err);
        responseText = 'Error en la comunicación con el servidor.';
      }
    } else {
      console.warn('ChatWidget: chat-url no está configurado.');
      responseText = 'Configuración incompleta del widget.';
    }

    const assistantMsg: Message = { sender: 'assistant', text: responseText, timestamp: new Date() };
    this._isTyping = false;
    this.messages = [...this.messages, assistantMsg];
    await this.updateComplete;
    this._scrollToBottom();
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target && target.closest('.init-form')) {
        this._startConversation();
      } else {
        this._sendMessage();
      }
    }
  }

  render() {
    // Default bubble icon (SVG example)
    const defaultIcon = svg`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28px" height="28px">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    `;

    return html`
      ${!this._isOpen
        ? html`
          <div
            id="chat-bubble"
            role="button"
            aria-label="Abrir chat"
            aria-expanded="false"
            aria-controls="chat-container"
            @click=${this._toggleChat}
            title="Abrir chat"
          >
            <slot name="bubble-icon">${defaultIcon}</slot> <!-- Usar slot -->
          </div>
          ${this.showHelper
            ? html`<div class="helper-tooltip" role="tooltip">Chatea con nuestro asistente</div>`
            : ''}`
        : html`
          <div
            id="chat-container"
            class="open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            ${!this.formSubmitted
            ? html`
                <div id="chat-header">
                  <span id="chat-title">Bienvenida</span>
                  <button
                    id="close-button"
                    type="button"
                    aria-label="Cerrar chat"
                    @click=${this._toggleChat}
                  >&times;</button>
                </div>
                <div class="init-form">
                  ${this.enableName ? html`
                    <div> <!-- Wrap input and error message -->
                      <input
                        id="form-name"
                        type="${PREDEFINED_FIELDS.name.type}"
                        aria-label="${PREDEFINED_FIELDS.name.label}"
                        placeholder="${PREDEFINED_FIELDS.name.label}"
                        .value=${this._formValues.name ?? ''}
                        @input=${(e: Event) => this._handleFormInput('name', (e.target as HTMLInputElement).value)}
                        @keydown=${this._handleKeydown}
                      />
                      ${this._formErrors.name ? html`<div class="error-message">${this._formErrors.name}</div>` : ''}
                    </div>
                  ` : ''}

                  ${this.enableEmail ? html`
                    <div> <!-- Wrap input and error message -->
                      <input
                        id="form-email"
                        type="${PREDEFINED_FIELDS.email.type}"
                        aria-label="${PREDEFINED_FIELDS.email.label}"
                        placeholder="${PREDEFINED_FIELDS.email.label}"
                        .value=${this._formValues.email ?? ''}
                        @input=${(e: Event) => this._handleFormInput('email', (e.target as HTMLInputElement).value)}
                        @keydown=${this._handleKeydown}
                      />
                      ${this._formErrors.email ? html`<div class="error-message">${this._formErrors.email}</div>` : ''}
                    </div>
                  ` : ''}

                  ${this.enablePhone ? html`
                    <div> <!-- Wrap input and error message -->
                      <input
                        id="form-phone"
                        type="${PREDEFINED_FIELDS.phone.type}"
                        aria-label="${PREDEFINED_FIELDS.phone.label}"
                        placeholder="${PREDEFINED_FIELDS.phone.label}"
                        .value=${this._formValues.phone ?? ''}
                        @input=${(e: Event) => this._handleFormInput('phone', (e.target as HTMLInputElement).value)}
                        @keydown=${this._handleKeydown}
                      />
                      ${this._formErrors.phone ? html`<div class="error-message">${this._formErrors.phone}</div>` : ''}
                    </div>
                  ` : ''}

                  ${this.enableSubject ? html`
                    <div> <!-- Wrap input and error message -->
                      <input
                        id="form-subject"
                        type="${PREDEFINED_FIELDS.subject.type}"
                        aria-label="${PREDEFINED_FIELDS.subject.label}"
                        placeholder="${PREDEFINED_FIELDS.subject.label}"
                        .value=${this._formValues.subject ?? ''}
                        @input=${(e: Event) => this._handleFormInput('subject', (e.target as HTMLInputElement).value)}
                        @keydown=${this._handleKeydown}
                      />
                      ${this._formErrors.subject ? html`<div class="error-message">${this._formErrors.subject}</div>` : ''}
                    </div>
                  ` : ''}

                  <button type="button" @click=${this._startConversation}>Empezar Chat</button>
                </div>
              `
            : html`
                <div id="chat-header">
                  <span id="chat-title">${this.chatTitle}</span>
                  <button
                    id="close-button"
                    type="button"
                    aria-label="Cerrar chat"
                    @click=${this._toggleChat}
                  >&times;</button>
                </div>
                <div id="messages">
                  ${this.messages.map(msg => html`
                    <div class="message ${msg.sender}-message">
                      ${msg.text}
                      <div class="message-timestamp">${msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  `)}
                  ${this._isTyping ? html`<div class="typing-indicator"><span></span><span></span><span></span></div>` : ''}
                </div>
                <div id="input-container">
                  <input
                    id="message-input"
                    type="text"
                    aria-label="Escribe tu consulta"
                    placeholder="Escribe tu consulta..."
                    .value=${this.draft}
                    @input=${(e: Event) => this.draft = (e.target as HTMLInputElement).value}
                    @keydown=${this._handleKeydown}
                    ?disabled=${this._isTyping && !this.devMode}
                  />
                  <button
                    type="button"
                    @click=${this._sendMessage}
                    ?disabled=${!this.draft.trim() || (this._isTyping && !this.devMode)}
                    aria-disabled=${!this.draft.trim() || (this._isTyping && !this.devMode)}
                    aria-label="Enviar mensaje"
                  >Enviar</button>
                </div>
              `}
          </div>`}
    `;
  }

  private _scrollToBottom() {
    this.updateComplete.then(() => {
      if (this._messagesContainer) this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight;
    });
  }
}