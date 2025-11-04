# Contributing to Blacksburg Transit App

Thank you for your interest in contributing to Blacksburg Transit! We welcome contributions from the community.

## 🤝 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 🐛 Reporting Bugs

Before creating a bug report:
- Check the existing issues to avoid duplicates
- Collect information about the bug (device, OS, steps to reproduce)

When filing a bug report, include:
- **Summary**: Clear and descriptive title
- **Steps to Reproduce**: Detailed steps (1, 2, 3...)
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**:
  - Device: (e.g., iPhone 14, Pixel 7)
  - OS: (e.g., iOS 17.2, Android 14)
  - App Version: (e.g., 1.0.0)

## 💡 Suggesting Features

Feature requests are welcome! Please:
- Check existing feature requests first
- Clearly describe the problem and proposed solution
- Explain why this would be useful to most users
- Consider submitting a PR if you can implement it

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- Git
- iOS: macOS with Xcode 15+ (or use Expo Go)
- Android: Android Studio (or use Expo Go)

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/blacksburg-transit.git
cd blacksburg-transit

# Install proxy dependencies
cd proxy
npm install

# Install app dependencies
cd ../app
npm install

# Start the app
npx expo start
```

## 📝 Pull Request Process

1. **Fork the repo** and create your branch from `main`
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write clear, commented code
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run unit tests
   npm test
   
   # Run linter
   npm run lint
   
   # Type check
   npm run type-check
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: brief description"
   ```
   
   Follow conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Formatting (no code change)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

6. **Open a Pull Request**
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

## 📐 Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- No `any` types (use `unknown` if needed)
- Use functional components (no classes)

### React Native

- Use functional components with hooks
- Memoize expensive computations (`useMemo`, `useCallback`)
- Follow React Native best practices
- Use Expo SDK modules when available

### Naming Conventions

- **Files**: PascalCase for components (`StopCard.tsx`), camelCase for utilities (`time.ts`)
- **Components**: PascalCase (`StopCard`, `PredictionRow`)
- **Functions**: camelCase (`formatETA`, `calculateDistance`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`Stop`, `Prediction`)

### Code Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { formatETA } from '@/lib/utils/time';

// 2. Types/Interfaces
interface StopCardProps {
  stopId: string;
  onPress: () => void;
}

// 3. Component
export function StopCard({ stopId, onPress }: StopCardProps) {
  // Hooks
  const { data, isLoading } = useQuery(...);
  const [state, setState] = useState(false);
  
  // Derived values
  const formattedETA = formatETA(data?.eta);
  
  // Event handlers
  const handlePress = () => {
    // ...
    onPress();
  };
  
  // Render
  return (
    <View>
      <Text>{formattedETA}</Text>
    </View>
  );
}
```

## ✅ Testing Guidelines

- Write tests for all new features
- Aim for ≥70% code coverage
- Test edge cases and error states
- Use descriptive test names

```typescript
describe('formatETA', () => {
  it('shows "Approaching" for <60s', () => {
    expect(formatETA(45)).toBe('Approaching');
  });
  
  it('shows minutes for ≥60s', () => {
    expect(formatETA(300)).toBe('5 min');
  });
  
  it('clamps negative values to 0', () => {
    expect(formatETA(-10)).toBe('Approaching');
  });
});
```

## ♿ Accessibility

All UI contributions must:
- Include `accessibilityLabel` for icons/images
- Use `accessibilityRole` appropriately
- Support Dynamic Type (scalable fonts)
- Maintain 4.5:1 color contrast (text)
- Have tap targets ≥44×44pt

## 📱 Performance

- Keep bundle size minimal (lazy load when possible)
- Optimize lists with `FlatList` + `keyExtractor`
- Memoize components and expensive calculations
- Profile with React DevTools Profiler
- Test on mid-range devices (not just flagships)

## 🏷️ Good First Issues

New to the project? Look for issues labeled `good first issue`. These are beginner-friendly and well-documented.

## 💬 Questions?

- Open a [Discussion](https://github.com/blacksburg-transit/app/discussions) for general questions
- Join our community chat (link TBD)
- Email the maintainers (link TBD)

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Special thanks in the app's About screen

Thank you for contributing! 🚍✨

