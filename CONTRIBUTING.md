# Contributing to Agent Workbench

Thank you for your interest in contributing to Agent Workbench! We welcome contributions from the community.

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-workbench.git
   cd agent-workbench
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Enhancements

We welcome feature requests! Please create an issue with:

- A clear description of the feature
- The problem it solves
- Any implementation ideas you have

### Pull Requests

1. **Create a branch** for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our code style guidelines

3. **Test your changes** thoroughly

4. **Commit your changes** with clear, descriptive commit messages:

   ```bash
   git commit -m "Add feature: description of feature"
   # or
   git commit -m "Fix: description of bug fix"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with:
   - A clear title and description
   - Reference to any related issues
   - Screenshots/GIFs if applicable

## Code Style Guidelines

### General Principles

- Write clear, readable code
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Vue Components

- Use Vue 3 Composition API with `<script setup>`
- Keep components focused on a single responsibility
- Use props for parent-child communication
- Use emit for child-parent communication

### JavaScript/Vue Style

- Use 2 spaces for indentation
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for component names
- Prefer `const` over `let`, avoid `var`
- Use template literals for string interpolation

### File Organization

- Components go in `src/components/`
- Composables go in `src/composables/`
- Stores go in `src/stores/`
- Views go in `src/views/`

## Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update README`
- `style: Format code`
- `refactor: Refactor function`
- `test: Add tests`
- `chore: Update dependencies`

## Testing

Currently, the project doesn't have automated tests. When adding new features:

- Manually test your changes thoroughly
- Test on different operating systems if possible (macOS, Windows, Linux)
- Verify existing functionality still works

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Reach out via GitHub Discussions (if enabled)

## Code of Conduct

Please note that this project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## License

By contributing to Agent Workbench, you agree that your contributions will be licensed under the ISC License.
