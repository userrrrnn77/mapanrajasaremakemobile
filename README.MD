# 🧹 Mapan Rajasa — Mobile App

> Aplikasi manajemen kebersihan, kehadiran, dan aktivitas karyawan berbasis mobile.
> Dibangun dengan **Expo SDK 52**, **NativeWind v4**, dan **Zustand**.

---

## 📱 Tech Stack

| Layer | Library | Versi |
|---|---|---|
| Framework | React Native + Expo | SDK 52 |
| Styling | NativeWind (Tailwind CSS) | v4 |
| State Management | Zustand | v5 |
| Navigation | React Navigation Native Stack | v7 |
| HTTP Client | Axios | v1 |
| Auth Storage | Expo SecureStore | v15 |
| Image Picker | Expo ImagePicker | v17 |
| Image Upload | Cloudinary (direct upload) | - |
| Animations | React Native Reanimated | v3 |
| Push Notif | Expo Notifications + Firebase | - |
| Location | Expo Location | v19 |
| Icons | Expo Vector Icons | - |
| Server State | TanStack React Query | v5 |

---

## 🗂️ Struktur Folder

```
mapan-rajasa-remake-react_native/
├── app/
│   ├── api/
│   │   ├── _axios.ts           # Axios instance + auth interceptor
│   │   ├── auth.ts             # login, register, updateMe, logout
│   │   ├── user.ts             # getMyProfile, getDashboardStats, timeline
│   │   ├── activity.ts         # CRUD aktivitas
│   │   ├── attendance.ts       # Absensi masuk/keluar
│   │   ├── chat.ts             # Chat AI
│   │   ├── cloudinary.ts       # Direct upload ke Cloudinary
│   │   ├── notification.ts     # Push notification
│   │   ├── report.ts           # Laporan
│   │   └── workLocation.ts     # Data lokasi kerja
│   │
│   ├── components/
│   │   ├── ActionSheet.tsx     # Bottom sheet aksi
│   │   ├── Avatar.tsx          # Avatar dengan fallback inisial
│   │   ├── Badge.tsx           # Status badge
│   │   ├── Button.tsx          # Tombol dengan loading state
│   │   ├── Card.tsx            # Card container
│   │   ├── ChatBubble.tsx      # Bubble chat AI
│   │   ├── ChatInput.tsx       # Input chat
│   │   ├── Container.tsx       # SafeArea wrapper
│   │   ├── Divider.tsx         # Garis pemisah
│   │   ├── Dropdown.tsx        # Select dropdown
│   │   ├── EmptyState.tsx      # Ilustrasi data kosong
│   │   ├── Header.tsx          # Header dengan back & custom element
│   │   ├── Input.tsx           # Text input
│   │   ├── Modal.tsx           # Modal dialog
│   │   ├── RefreshControl.tsx  # Pull to refresh
│   │   ├── Skeleton.tsx        # Loading skeleton
│   │   ├── StatusStep.tsx      # Step indicator status
│   │   ├── Toast.tsx           # Notifikasi toast
│   │   ├── TypingIndicator.tsx # Indikator AI sedang mengetik
│   │   ├── Typography.tsx      # Text dengan variant
│   │   └── index.ts            # Barrel export
│   │
│   ├── context/
│   │   ├── useAuthStore.ts         # Auth state + SecureStore hydration
│   │   ├── useNotificationStore.ts # Notifikasi state
│   │   └── useThemeStore.ts        # Dark/light theme
│   │
│   ├── hooks/
│   │   ├── useKamera.ts        # Galeri & kamera picker
│   │   ├── useLokasi.ts        # GPS & geofencing
│   │   └── useUpload.ts        # Upload foto ke Cloudinary
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Stack navigator + role-based auth guard
│   │
│   ├── screens/
│   │   ├── admin/              # Screen khusus admin
│   │   ├── bersama/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── cleaning_service/
│   │       └── DashboardCleaning.tsx
│   │
│   └── utils/
│       ├── checkUpdate.ts      # Cek versi app terbaru
│       ├── formatTanggal.ts    # Helper format tanggal
│       ├── geoLogic.ts         # Kalkulasi jarak & geofence
│       ├── validasiLogin.ts    # Validasi form login
│       └── __tests__/
│           ├── geoLogic.test.ts
│           └── validasiLogin.test.ts
│
├── assets/                     # Icon & splash screen
├── App.tsx                     # Root component + hydration
├── global.css                  # NativeWind global styles
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── index.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- Node.js >= 20
- **Expo Go SDK 52** di HP Android

> ⚠️ Project ini menggunakan **Expo SDK 52** dan **Reanimated v3**.
> Expo Go versi terbaru (SDK 54+) tidak kompatibel.
> Download Expo Go SDK 52:
> ```
> https://github.com/expo/expo-go-releases/releases/download/Expo-Go-2.32.20/Expo-Go-2.32.20.apk
> ```

### Install Dependencies

```bash
bun install
```

### Jalankan Dev Server

```bash
bunx expo start -c
```

Scan QR code dengan Expo Go di HP.

---

## ⚙️ Konfigurasi

### `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      "react-native-reanimated/plugin", // HARUS paling bawah
    ],
  };
};
```

### `metro.config.js`

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### `package.json` — Resolutions Penting

```json
"resolutions": {
  "react-native-reanimated": "~3.16.7"
}
```

---

## 🔐 Auth Flow

```
App mount
  └── hydrate() → baca SecureStore
        ├── ada token & userData
        │     └── isAuthenticated: true → Dashboard (sesuai role)
        └── kosong
              └── Login Screen

Login berhasil
  └── setAuth(user, token)
        ├── simpan ke SecureStore
        └── update Zustand store → navigator redirect otomatis

Logout
  └── clearAuth()
        ├── hapus SecureStore
        └── reset store → kembali ke Login
```

---

## 👥 Role & Screen

| Role | Dashboard |
|---|---|
| `cleaning_service` | DashboardCleaning |
| `security` | DashboardSecurity *(coming soon)* |
| `admin` | DashboardAdmin *(coming soon)* |

---

## 🖼️ Upload Foto Flow

```
Pilih foto (useKamera)
  └── dapat URI lokal
        └── upload ke Cloudinary langsung dari HP (useUpload)
              └── dapat { url, publicId }
                    └── kirim JSON ke BE (PATCH /auth/me)
                          └── BE simpan URL ke MongoDB
```

> BE tidak menangani file upload sama sekali, hanya menerima JSON.

---

## 🧪 Testing

```bash
# Jalankan semua test
bun test

# Test spesifik
bun test geoLogic
bun test validasiLogin
```

---

## 🌙 Dark Mode

Theme dihandle oleh NativeWind `useColorScheme`:

```tsx
import { useColorScheme } from "nativewind";

const { colorScheme, setColorScheme } = useColorScheme();
const isDark = colorScheme === "dark";

// Toggle
setColorScheme(isDark ? "light" : "dark");
```


---

## 🐛 Known Issues

| Issue | Status | Workaround |
|---|---|---|
| Expo Go SDK 54 tidak support Reanimated v3 | ⚠️ | Pakai Expo Go SDK 52 |
| NativeWind warning "state update on unmounted" | ⚠️ | Non-blocking, ignore |

---

## 📝 License

Private — Mapan Rajasa © 2026 Bre.Corp 👑