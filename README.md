# Blacksburg Transit Mobile App

A modern, accessible mobile app for Blacksburg Transit built with **Expo + React Native** that recreates and improves the current BT4U experience.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

## 🚍 Features

- **Real-Time Arrivals**: Live bus predictions with ≤15s latency
- **Smart Search**: Fuzzy search for stops and routes
- **Live Map**: Track buses in real-time with vehicle positions
- **Favorites**: Quick access to frequently used stops and routes
- **Service Alerts**: Stay informed about delays and detours
- **Accessible**: WCAG 2.1 AA compliant with screen reader support
- **Offline-First**: Cached data works without network
- **Privacy-Focused**: GPS never leaves your device

## 📱 Tech Stack

### Mobile App (`/app`)

- **Framework**: Expo SDK 54+ with React Native
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query (server state) + Zustand (UI state)
- **Storage**: MMKV (fast key-value storage)
- **Maps**: react-native-maps
- **Testing**: Jest + React Native Testing Library + Detox
- **CI/CD**: EAS Build + EAS Update

### Proxy (`/proxy`)

- **Runtime**: Vercel Edge Functions
- **Language**: TypeScript
- **API**: SOAP→JSON converter for BT4U webservice
- **Caching**: Vercel KV (10s–5min TTL based on endpoint)
- **Rate Limiting**: 100 req/min per IP
- **Monitoring**: Health checks + circuit breaker

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **iOS**: macOS with Xcode 15+ (or use Expo Go)
- **Android**: Android Studio (or use Expo Go)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blacksburg-transit/app.git
   cd blacksburg-transit
   ```

2. **Install proxy dependencies**
   ```bash
   cd proxy
   npm install
   ```

3. **Install app dependencies**
   ```bash
   cd ../app
   npm install
   ```

### Development

#### Mobile App

```bash
cd app
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your device

#### Proxy (Local Development)

```bash
cd proxy
npm run dev
```

The proxy will be available at `http://localhost:3000`

## 📂 Project Structure

```
blacksburg-transit/
├── app/                      # Mobile app (Expo + React Native)
│   ├── app/                  # File-based routes (Expo Router)
│   │   ├── (tabs)/           # Tab navigator screens
│   │   │   ├── near-me.tsx
│   │   │   ├── search.tsx
│   │   │   ├── map.tsx
│   │   │   ├── favorites.tsx
│   │   │   └── alerts.tsx
│   │   ├── stop/[id].tsx     # Stop detail screen
│   │   ├── route/[id].tsx    # Route detail screen
│   │   └── _layout.tsx       # Root layout with providers
│   ├── components/           # Reusable components
│   ├── lib/                  # API client, hooks, stores, utils
│   ├── constants/            # Colors, config, types
│   └── assets/               # Images, fonts, icons
├── proxy/                    # SOAP→JSON proxy (Vercel Edge)
│   ├── api/                  # Edge function endpoints
│   ├── lib/                  # SOAP client, parsers, cache
│   └── __tests__/            # Unit tests
├── tasks/                    # PRD and task lists
└── README.md
```

## 🧪 Testing

### Unit Tests (App)

```bash
cd app
npm test                 # Run all tests
npm run test:coverage    # With coverage report
```

### E2E Tests (App)

```bash
cd app
npm run test:e2e:ios     # iOS Simulator
npm run test:e2e:android # Android Emulator
```

### Proxy Tests

```bash
cd proxy
npm test
npm run test:coverage
```

## 📦 Deployment

### Proxy (Vercel)

```bash
cd proxy
vercel --prod
```

### Mobile App (EAS Build)

```bash
cd app
eas build --platform all --profile production
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure linting passes (`npm run lint`)
6. Commit (`git commit -m 'Add amazing feature'`)
7. Push (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/blacksburg-transit/app/issues/new) with:
- Device/OS version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📄 License

This project is open source under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Blacksburg Transit** for providing the BT4U API
- **Virginia Tech community** for feedback and testing
- **Expo team** for the amazing framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/blacksburg-transit/app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blacksburg-transit/app/discussions)
- **Email**: [Contact form placeholder]

---

**Made with ❤️ for the Virginia Tech and Blacksburg community**

