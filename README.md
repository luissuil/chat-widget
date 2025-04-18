# Chat Widget Pro

**Chat Widget Pro** es un componente de chat flotante, ligero y 100% personalizable, construido con [Lit](https://lit.dev/) y TypeScript. Permite a los desarrolladores integrar fácilmente un asistente de chat en cualquier sitio web o aplicación, con configuración declarativa vía atributos HTML y variables CSS.

---

## 📦 Características

- Basado en **Web Components**: funciona en cualquier frontend sin dependencias de frameworks.
- **Icono personalizable**: Usa el slot `bubble-icon` para añadir tu propio SVG o HTML.
- **Campos de formulario** configurables (nombre, email, teléfono, asunto).
- **Comunicación con backend** mediante endpoints REST (`form-url`, `chat-url`)
- **Modo desarrollo** (`dev-mode`): simula respuestas sin servidor.
- **Posición dinámica**: soporta `bottom-right`, `bottom-left`, `top-right`, `top-left`.
- **Apertura automática** via `start-open`.
- **Formulario opcional** (`disable-form`): omite paso inicial.
- **Mensaje de bienvenida personalizado** con placeholders (`{name}`).
- **Variables CSS** para personalizar colores, bordes y estilos.
- **Accesibilidad**: roles ARIA, keyboard-friendly.

---

## 🚀 Instalación y Arranque

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/chat-widget-pro.git
   cd chat-widget-pro
   ```
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
4. Abre tu navegador en `http://localhost:5173` para ver la demo.

Para compilación de producción:
```bash
pnpm build
``` 
Los archivos generados se colocarán en `dist/`.

---

## 🔧 Uso

### 1. Integración básica

**Desarrollo (Vite):**
Incluye el script local para pruebas en desarrollo:
```html
<script type="module" src="/src/main.ts"></script>
```

**Producción o CDN:**
Tras construir la librería, sirve el bundle empaquetado:
```html
<script src="/dist/chat-widget.js"></script>
```
Añade el componente donde lo necesites:
```html
<chat-widget
  form-url="/api/start"
  chat-url="/api/chat"
></chat-widget>
```

### 2. Atributos y configuración

| Atributo           | Tipo     | Descripción                                                      | Por defecto     |
|--------------------|----------|------------------------------------------------------------------|-----------------|
| `form-url`         | string   | Endpoint para iniciar conversación (POST JSON)                   | _obligatorio_   |
| `chat-url`         | string   | Endpoint para enviar/recibir mensajes (POST JSON)               | _obligatorio_   |
| `api-base-url`     | string   | Prefijo para construir `form-url` y `chat-url`                  |                |
| `enable-phone`     | boolean  | Mostrar campo `teléfono` en el formulario                       | `false`         |
| `enable-subject`   | boolean  | Mostrar campo `asunto` en el formulario                         | `false`         |
| `dev-mode`         | boolean  | Simula respuestas sin backend                                    | `false`         |
| `position`         | string   | Posición del widget: `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right`  |
| `start-open`       | boolean  | Abre el chat automáticamente al cargar                           | `false`         |
| `disable-form`     | boolean  | Omitir formulario inicial y mostrar chat directo                 | `false`         |
| `welcome-message`  | string   | Mensaje de bienvenida (admite `{name}`)                         | por defecto     |

### 3. Personalizar el icono de la burbuja (Slot `bubble-icon`)

Puedes reemplazar el icono por defecto de la burbuja usando el slot `bubble-icon`. Simplemente inserta tu SVG o cualquier elemento HTML dentro del componente:

```html
<chat-widget form-url="/api/start" chat-url="/api/chat">
  <!-- Usando un SVG personalizado -->
  <svg slot="bubble-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="30px" height="30px">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8-8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
</chat-widget>

<chat-widget form-url="/api/start" chat-url="/api/chat">
  <!-- Usando un emoji o texto -->
  <span slot="bubble-icon" style="font-size: 24px;">❓</span>
</chat-widget>
```
Si no proporcionas contenido para el slot, se usará un icono de chat SVG por defecto.

### 4. Variables CSS

Puedes personalizar colores y aspectos visuales usando variables CSS en el host o tu hoja global:
```css
chat-widget {
  --primary: #005A9C;
  --accent: #FFA500;
  --surface: #F9F5EC;
  --surface-alt: #FFFAF0;
  --border: #E0D7C5;
}
```

### 5. Ejemplos rápidos

```html
<!-- Básico con icono por defecto -->
<chat-widget form-url="/api/start" chat-url="/api/chat"></chat-widget>

<!-- Con icono SVG personalizado y posición diferente -->
<chat-widget form-url="/api/start" chat-url="/api/chat" position="bottom-left">
  <svg slot="bubble-icon" viewBox="0 0 24 24" fill="white" width="28px" height="28px">...</svg>
</chat-widget>

<!-- Con teléfono, asunto y emoji como icono -->
<chat-widget enable-phone enable-subject form-url="/api/start" chat-url="/api/chat">
  <span slot="bubble-icon">🚀</span>
</chat-widget>

<!-- Modo dev sin backend -->
<chat-widget dev-mode welcome-message="¡Hola {name}, bienvenido al demo!" start-open></chat-widget>
```

---

## 🗂 Estructura de Archivos

```
├── index.html            # Página demo y ejemplos
├── docs.html             # Documentación en HTML
├── usage.html            # Ejemplos de uso
├── src/                  # Código fuente
│   ├── main.ts           # Lógica del componente
│   └── chat-widget.styles.ts  # Estilos encapsulados
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama con tu feature: `git checkout -b feature/nueva-caracteristica`
3. Realiza tus cambios y commitea: `git commit -m "Agrega nueva característica"`
4. Envía tu pull request

Por favor, mantén el formato de código y añade tests si corresponde.

---

## 📄 Licencia

MIT © 2025 Chat Widget Pro
