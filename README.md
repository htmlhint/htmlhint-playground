# HTMLHint Playground

A modern, interactive playground for testing HTMLHint rules and configurations. Built with Astro and the latest HTMLHint library.

## Features

- **Real-time HTML validation** using the latest HTMLHint library
- **Interactive code editor** powered by Ace Editor
- **Comprehensive rule configuration** with all HTMLHint rules
- **Theme customization** with multiple editor themes
- **Configuration export** - download your rule settings as `.htmlhintrc`
- **Keyboard shortcuts** for navigating between hints
- **Responsive design** that works on desktop and mobile
- **Modern tech stack** built with Astro, TypeScript, and ES modules

## What's New in v2.0

- **Rebuilt with Astro** for better performance and developer experience
- **Latest HTMLHint library** (v1.1.4) with all current rules
- **Removed CSSLint and JSHint** dependencies for cleaner, focused HTML validation
- **Modern JavaScript** using ES modules and modern browser APIs
- **TypeScript support** for better development experience
- **Improved responsive design** with Bootstrap 5
- **Better accessibility** and modern web standards

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/htmlhint/htmlhint-playground.git
   cd htmlhint-playground
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run htmlhint` - Run HTMLHint on the project

### Project Structure

```txt
src/
├── components/          # Astro components
│   ├── Editor.astro    # Code editor component
│   └── RulePanel.astro # Rules configuration panel
├── layouts/            # Layout components
│   └── Layout.astro    # Main layout
├── pages/              # Astro pages
│   └── index.astro     # Main page
└── scripts/            # JavaScript modules
    └── app.js          # Main application logic
public/                 # Static assets
├── css/
│   └── index.css       # Styles
└── img/                # Images
```

### HTMLHint Rules

The playground supports all HTMLHint rules organized into categories:

- **Standard**: Basic HTML validation rules
- **Performance**: Rules for optimizing performance
- **Accessibility**: Rules for better accessibility
- **Specification**: Rules for HTML5 compliance

### Editor Features

- **Syntax highlighting** for HTML
- **Multiple themes** (light and dark)
- **Real-time validation** with 500ms debounce
- **Error annotations** in the editor
- **Keyboard navigation** between hints (Ctrl+Left/Right)

### Configuration

- **Persistent settings** saved in localStorage
- **Rule customization** with checkboxes and dropdowns
- **Configuration export** as `.htmlhintrc` file
- **Theme persistence** across sessions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [HTMLHint](https://htmlhint.com/) - The static code analysis tool
- [Astro](https://astro.build/) - The web framework for content-driven websites
- [Ace Editor](https://ace.c9.io/) - The code editor component
- [Bootstrap](https://getbootstrap.com/) - The CSS framework
