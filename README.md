# Japan Solo Dining 🇯🇵🍜

A modern, responsive web application designed to help solo travelers find solo-friendly restaurants in Japan (Osaka, Kyoto, etc.).

> **Concept**: "Eating alone doesn't mean being lonely. It means enjoying 100% of the flavor."

## ✨ Features

-   **Interactive Dashboard**: Real-time restaurant listing with dynamic filtering by City, Style, Cuisine, and Alcohol availability.
-   **Dark Mode**: Fully supported light and dark themes with a seamless toggle.
-   **Restaurant Details**: Comprehensive modal view with high-resolution image galleries (uncropped).
-   **Live Data**: Powered by **Firebase Firestore** for real-time updates.
-   **Add & Edit**: Secure interfaces to add new spots or update existing ones (protected by PIN).
-   **Image Management**: Multi-image upload with client-side compression and Firebase Storage integration.
-   **Responsive Design**: Built with **Tailwind CSS v4** for a premium experience on mobile and desktop.
-   **Visuals**: 
    -   **Swiper** image sliders for restaurant cards.
    -   **AOS** (Animate On Scroll) for smooth entry animations.
-   **SEO Optimized**: configured with Open Graph and Twitter Cards for social sharing.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Database**: Firebase Firestore
-   **Storage**: Firebase Storage
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animation**: AOS (Animate On Scroll)
-   **Carousel**: Swiper.js
-   **Charts**: Chart.js (react-chartjs-2)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ installed.
-   A Firebase project with Firestore and Storage enabled.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/japan-solo-dining.git
    cd japan-solo-dining
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Firebase credentials:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    
    # Security (For Edit/Add Pages)
    NEXT_PUBLIC_ADMIN_PIN=your_secret_pin
    
    # SEO
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

-   `app/`: App Router pages (`page.tsx`, `add/page.tsx`, `edit/[id]/page.tsx`, `layout.tsx`).
-   `components/`: Reusable UI components (`RestaurantCard`, `RestaurantModal`, `FilterSidebar`, `Navbar`, etc.).
-   `lib/`: Utility functions and Firebase initialization (`firebase.ts`).
-   `types/`: TypeScript definitions for the data model.
-   `public/`: Static assets (fonts, OG images).

## 🛡️ Security Note

The "Edit" and "Add" pages are currently protected by a simple client-side PIN for demonstration purposes. For a production environment, it is recommended to implement full Firebase Authentication.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is open-source and available under the MIT License.

---

Made with ❤️ for Solo Diners.
