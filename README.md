# QR Inventory System

A modern web application for managing inventory using QR codes. Built with React, TypeScript, and Firebase.

## Features

- Generate QR codes for inventory items
- Scan QR codes to manage inventory
- Real-time inventory tracking
- Responsive design for mobile and desktop
- Firebase integration for data persistence

## Tech Stack

- React 19
- TypeScript
- Material-UI
- Firebase
- Vite
- Vitest for testing

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/StuartGrossman/work-order.git
cd work-order
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your Firebase configuration
   - Never commit the `.env` file to git

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Firestore Database
   - Add your Firebase configuration to the `.env` file

5. Start the development server:
```bash
npm run dev
```

6. Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # Firebase and other services
├── types/         # TypeScript type definitions
└── styles/        # Global styles and CSS
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Variables

The following environment variables are required:

### Firebase Configuration
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Amazon Product Advertising API (Optional)
- `VITE_AMAZON_ACCESS_KEY_ID`
- `VITE_AMAZON_SECRET_KEY`
- `VITE_AMAZON_PARTNER_TAG`
- `VITE_AMAZON_PARTNER_TYPE`
- `VITE_AMAZON_HOST`
- `VITE_AMAZON_REGION`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
