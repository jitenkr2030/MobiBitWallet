# 🏦 MobBitWallet - Be Your Own Bank

**Secure. Private. Borderless.** A comprehensive cryptocurrency wallet with self-custody features built on modern web technologies.

## 🌟 Vision

MobBitWallet empowers users to take full control of their digital assets with a secure, private, and user-friendly cryptocurrency wallet that supports Bitcoin, Lightning Network, and future multi-chain capabilities.

## ✨ Key Features

### 🔐 Security & Self-Custody
- **Biometric Authentication** - Fingerprint and Face ID support
- **Military-Grade Encryption** - AES-256 encryption for all sensitive data
- **Multi-Wallet Management** - Separate wallets for Personal, Business, and Savings
- **BIP39 Mnemonic Support** - Standard 12/24-word recovery phrases
- **Encrypted Backups** - Secure cloud and local backup options

### ⚡ Lightning-Fast Payments
- **Lightning Network Integration** - Instant, low-cost Bitcoin transactions
- **QR Code Payments** - Easy send and receive functionality
- **Merchant Mode** - Professional payment acceptance interface
- **Real-time Market Data** - Live prices and portfolio tracking

### 📊 Smart Analytics
- **Transaction History** - Comprehensive filtering and search
- **Portfolio Dashboard** - Multi-currency balance overview
- **Spending Analytics** - Visual charts and insights
- **Price Alerts** - Custom notifications for market movements

### 🌐 Platform Ready
- **White-Label SDK** - For businesses and partners
- **API Integration** - Seamless third-party connections
- **Multi-Chain Support** - Bitcoin, Ethereum, Solana, and more (coming soon)

## 🚀 Technology Stack

### Frontend
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first styling
- **🧩 shadcn/ui** - Premium UI components
- **🌈 Framer Motion** - Smooth animations

### Backend & Security
- **🗄️ Prisma ORM** - Type-safe database operations
- **🔐 NextAuth.js** - Authentication framework
- **🔒 AES-256 Encryption** - Data protection
- **📱 Biometric APIs** - Device-level security

### Integrations
- **⚡ Lightning Network** - Fast Bitcoin transactions
- **📊 CoinGecko API** - Market data
- **🔄 WebSockets** - Real-time updates
- **☁️ Cloud Storage** - Encrypted backups

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/mobbitwallet/mobbitwallet.git
cd mobbitwallet

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# API Keys
COINGECKO_API_KEY="your-coingecko-api-key"
LIGHTNING_NODE_URL="your-lightning-node-url"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## 📱 Development Phases

### Phase 1: Foundation & Rebranding ✅
- [x] Project setup and branding
- [x] Core architecture review
- [x] Documentation setup

### Phase 2: Core Wallet Enhancement 🔄
- [x] Security enhancements
- [x] Multi-wallet management
- [x] BIP39 mnemonic support
- [x] Transaction history

### Phase 3: Payments & Integration 🔄
- [x] Lightning Network integration
- [x] QR code payments
- [x] Market data integration
- [x] Merchant mode

### Phase 4: Backup & Recovery 📋
- [ ] Encrypted backup system
- [ ] Recovery options
- [ ] Offline resilience

### Phase 5: Intelligence & Insights 📋
- [ ] Analytics dashboard
- [ ] Notifications & alerts
- [ ] Smart recommendations

### Phase 6: White-Label Platform 📋
- [ ] Admin dashboard
- [ ] API layer
- [ ] Partner SDK

### Phase 7: Testing & Launch 📋
- [ ] Full QA testing
- [ ] Security audit
- [ ] Production deployment

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── wallet/            # Wallet management
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── wallet/           # Wallet-specific components
│   └── charts/           # Analytics components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── db.ts             # Database client
│   ├── auth.ts           # Authentication
│   ├── encryption.ts     # Encryption utilities
│   └── api/              # API clients
└── types/                # TypeScript definitions
```

## 🔐 Security Features

### Data Protection
- All sensitive data encrypted with AES-256
- Secure key storage using platform-specific solutions
- End-to-end encryption for backups

### Authentication
- Biometric authentication (fingerprint, face ID)
- Multi-factor authentication support
- Session management with automatic timeout

### Network Security
- HTTPS-only communication
- API request signing
- Rate limiting and DDoS protection

## 🌍 Internationalization

MobBitWallet supports multiple languages with:
- Built-in i18n with Next Intl
- RTL language support
- Currency formatting
- Localized error messages

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Powered by [Z.ai](https://chat.z.ai) for AI-assisted development

## 📞 Support

- **Documentation**: [docs.mobbitwallet.com](https://docs.mobbitwallet.com)
- **Issues**: [GitHub Issues](https://github.com/mobbitwallet/mobbitwallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mobbitwallet/mobbitwallet/discussions)
- **Email**: support@mobbitwallet.com

---

**Be Your Own Bank** 🏦✨

Built with ❤️ by the MobBitWallet team. Empowering financial freedom through technology.