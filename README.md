# JSON Viewer Extension 🚀

Una extensión de navegador ligera y funcional diseñada para desarrolladores que buscan una visualización estructurada y limpia de respuestas JSON. Esta herramienta transforma el texto plano en una interfaz interactiva con resaltado de sintaxis y herramientas de búsqueda.

---

## ✨ Características Principales

* **Renderizado Interactivo:** Formatea automáticamente el contenido JSON detectado en el navegador, organizando objetos y arreglos de forma jerárquica.
* **Buscador Integrado:** Incluye una barra de búsqueda con contador de coincidencias y navegación entre resultados (Anterior/Siguiente).
* **Gestión de Temas:** Soporte nativo para modo **Dark** y **Light**, con persistencia en el almacenamiento local (`localStorage`).
* **Controles de Nodo:** Capacidad para colapsar y expandir nodos individuales o realizar un colapso global de toda la estructura.
* **Copiado Rápido:** Botón dedicado para copiar el JSON formateado al portapapeles con un solo clic.
* **Arquitectura Moderna:** Desarrollada bajo el estándar **Manifest V3** de Chrome para mayor seguridad y rendimiento.

---

## 🛠️ Tecnologías y Estructura

El proyecto está construido con tecnologías web estándar para garantizar ligereza:

* **JavaScript (Vanilla):** Lógica de extracción, parseo y renderizado dinámico del DOM.
* **CSS3 Custom Properties:** Uso de variables para la implementación de temas dinámicos.
* **Chrome Extension API:** Uso de `i18n` para internacionalización y `runtime` para gestión de recursos.

### Archivos clave:
* `content.js`: Motor principal que detecta el JSON y gestiona la UI.
* `manifest.json`: Configuración de permisos y reglas de inyección.
* `styles.css`: Definición estética de los componentes y temas.

---

## 🚀 Instalación Local

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/alf1995/json-simple.git
    ```
2.  **Carga la extensión en el navegador:**
    * Ve a `chrome://extensions/` (o la sección de extensiones de tu navegador basado en Chromium).
    * Activa el **Modo de desarrollador**.
    * Haz clic en **Cargar desempaquetada** (Load unpacked).
    * Selecciona la carpeta raíz del proyecto.
3.  **Prueba la extensión:**
    * Abre cualquier URL que retorne un JSON (ej. una API REST) y verás la interfaz activa.

---

## ⚙️ Configuración del Desarrollador

La extensión está configurada para excluir dominios de alta carga o herramientas específicas de búsqueda para evitar conflictos de renderizado:

```json
"exclude_matches": [
  "*://[chatgpt.com/](https://chatgpt.com/)*",
  "*://*[.google.com/](https://.google.com/)*",
  "*://*[.facebook.com/](https://.facebook.com/)*"
]
