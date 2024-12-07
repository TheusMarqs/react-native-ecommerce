# 🛍️ E-Commerce App (React Native)

## 📖 Description

This is the front-end for an e-commerce platform built with React Native. The app supports both mobile and web platforms, allowing users to browse products, manage their cart, view order history, and chat with customer support in real-time. It integrates with a Django REST API backend for data fetching, user authentication, and chat functionality.

## 🚀 Features
- 🛒 **Product Management**: Browse, filter, and view products in detail.
- 🛍️ **Shopping Cart**: Add/remove products, view the cart, and proceed to checkout.
- 📦 **Order History**: View past orders and their status.
- 💬 **Real-Time Chat**: Communicate with customer support using WebSockets and Redis for message persistence.
- 🔐 **User Authentication**: Login and registration using JWT tokens with refresh tokens for secure access.
- 📷 **QR & Barcode Scanning**: Scan product QR codes or barcodes to retrieve product information.
  
## 🛠️ Tech Stack
- **React Native**: Cross-platform framework for mobile and web apps.  
- **Expo**: Framework for building React Native apps with a set of tools and services.  
- **Expo Navigation**: For navigation between screens in the Expo environment.  
- **TypeScript**: For type safety and improved developer experience.  
- **Axios**: For making HTTP requests to the backend API.  
- **JWT**: For user authentication and authorization.  
- **WebSockets**: For real-time communication (chat).  
- **React Native Barcode Scanner**: To scan QR codes and barcodes for products.
- **Secure Storage (React Native Secure Storage)**: For securely storing sensitive information (e.g., tokens) on mobile devices or **Cookies**: For storing session information in the browser.

## 🏃‍♂️ How to Run the Project

### Prerequisites
- Install Node.js and npm/yarn.
- Install React Native CLI: npm install -g react-native-cli

### Installation
- Clone the repository: git clone https://github.com/TheusMarqs/React-native-ecommerce.git
- Navigate to the project directory: cd react-native-ecommerce
- Install dependencies: npm install
  
### Running the App
npx expo start

