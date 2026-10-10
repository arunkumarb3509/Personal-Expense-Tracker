# Firebase Setup Guide for PET Finance

Follow these steps to connect your own Firebase project to the PET Finance Expense Tracker application.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or **Create a project**).
3. Name your project (e.g. `pet-expense-tracker`).
4. (Optional) Enable Google Analytics and click **Create Project**.

---

## 2. Enable Firebase Authentication

1. In the left navigation, click **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Select **Email/Password**.
   - Enable **Email/Password**.
   - Ensure **Email link (passwordless sign-in)** remains disabled (or optional).
   - Click **Save**.
4. In the **Templates** tab:
   - Customize the **Email address verification** template if desired.

---

## 3. Enable Cloud Firestore Database

1. In the left navigation, click **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `asia-south1` for Mumbai/India or closest to your target region).
4. Start in **Production mode** (Security rules will secure the data).
5. Click **Enable**.

---

## 4. Deploy Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab in the Firebase Console.
2. Paste the contents of [`firestore.rules`](file:///c:/Users/PN/Desktop/My%20Computer1/Personal%20Workout/PET/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
      match /wallets/{walletId} { allow read, write: if isOwner(userId); }
      match /transactions/{transactionId} { allow read, write: if isOwner(userId); }
      match /people/{personId} { allow read, write: if isOwner(userId); }
      match /budgets/{budgetId} { allow read, write: if isOwner(userId); }
      match /recurring/{recurringId} { allow read, write: if isOwner(userId); }
      match /notifications/{notificationId} { allow read, write: if isOwner(userId); }
      match /settings/{settingsId} { allow read, write: if isOwner(userId); }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**.

---

## 5. Register an App & Get Credentials

1. In the Firebase Console, click the **Project Settings** (gear icon) in the top left.
2. Under **Your apps**, click the **Web** icon (`</>`) or **Android** icon.
3. Name your app (e.g. `PET Mobile`).
4. Copy the `firebaseConfig` keys into your `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## 6. Running the App

```bash
# Start Expo development server
npm run android
# Or for web preview
npm run web
```
