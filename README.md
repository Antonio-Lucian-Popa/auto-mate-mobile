# AutoMate — Car Reminder Mobile 🚗

Aplicație mobilă premium pentru gestionarea mașinilor personale: garaj, costuri,
alimentări, **scanare bonuri cu OCR offline**, documente, remindere (RCA, ITP,
rovinietă, service) și notificări locale.

Construită cu **React Native + Expo Router + TypeScript + NativeWind**, design
dark-first inspirat de Linear / Revolut / Stripe. Tot textul UI este în română.

---

## ✨ Funcționalități

- **Autentificare** — login, register, refresh automat de token, auto-login,
  stocare securizată (expo-secure-store).
- **Garaj** — listă mașini, adăugare/editare/ștergere, detaliu, status badges
  (totul în regulă / expiră curând / restant / service).
- **Dashboard** — mașină selectată, cost lunar, consum mediu, cost/km, remindere
  apropiate, acțiuni rapide.
- **Remindere** — pe tipuri (RCA, CASCO, ITP, rovinietă, service, ulei, anvelope,
  curea distribuție, baterie, custom), sortate după urgență, „Expiră în X zile" /
  „Restant", reînnoire.
- **Costuri** — timeline pe luni cu iconițe pe categorii și sumare lunare.
- **Alimentări** — total auto-calculat, consum mediu L/100km între plinuri,
  preț mediu/litru, cost lunar.
- **Scanare bonuri (OCR REAL, offline)** — vezi mai jos.
- **Documente** — galerie cu poze pentru RCA/ITP/facturi/bonuri, pe mașină.
- **Notificări** — permisiuni, token Expo Push stocat local, notificări locale
  pentru remindere.
- **Setări** — profil, temă, preferințe notificări, URL API pentru development.

---

## 🧾 Scanare bonuri — OCR pe dispozitiv

OCR-ul rulează **local**, fără API-uri plătite și fără cloud:

- **Android:** Google ML Kit
- **iOS:** Apple Vision

prin pachetul [`expo-text-extractor`](https://www.npmjs.com/package/expo-text-extractor).

Fluxul:
1. „Scanează bon" → cameră sau galerie.
2. Loading: *„Scanăm bonul… Citim textul offline, direct pe telefonul tău."*
3. `ocrService` extrage textul → `receiptParser` îl analizează (regex, fără AI).
4. **ReceiptReviewScreen**: card sumar, total evidențiat, câmpuri editabile,
   **badge-uri de încredere** (sigur / verifică / necesită verificare), text OCR brut.
5. Nimic nu se salvează automat — doar la „**Adaugă bonul**".

Parserul (`src/services/receipts/receiptParser.ts`) recunoaște stații românești
(OMV, Petrom, MOL, Rompetrol, Lukoil, Socar, Gazprom, Shell), data, totalul,
tipul de carburant, litrii, prețul/litru și numărul bonului, cu numere în format
românesc (`1.234,56`). Există 5 exemple de test în
`src/services/receipts/examples.ts`.

> ⚠️ **OCR-ul nativ NU funcționează în Expo Go.** Ai nevoie de un **dev build**
> (vezi mai jos). În `__DEV__`, dacă modulul nativ lipsește, aplicația folosește
> automat un bon demo, iar din Setări poți activa „Folosește bon demo".

### Test rapid al parserului (fără telefon)
```bash
npm run test:parser
```

---

## 🚀 Pornire rapidă

### Cerințe
- Node.js 18+
- npm / pnpm / yarn
- Un telefon fizic sau emulator (Android Studio / Xcode)
- Backend `car-reminder-api` pornit și accesibil

### 1. Instalare
```bash
npm install
```

### 2. Variabile de mediu
Copiază `.env.example` în `.env`:
```bash
cp .env.example .env
```
Setează URL-ul backendului (IP-ul mașinii tale în rețea, **nu** `localhost`,
ca telefonul să-l poată accesa):
```
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```
> Poți schimba acest URL și din aplicație → **Setări → URL API** (util în development).

### 3. Pornire (UI rapid, fără OCR nativ)
```bash
npx expo start
```
Funcționează în Expo Go pentru tot, **mai puțin OCR-ul nativ** (folosește bonul demo).

---

## 📱 Dev build (necesar pentru OCR real)

```bash
# 1. Generează proiectele native
npx expo prebuild

# 2. Build de development cu EAS
npm install -g eas-cli
eas login
eas build --profile development --platform android
# sau
eas build --profile development --platform ios
```

Rulare locală directă pe device (alternativă la EAS):
```bash
npx expo run:android
npx expo run:ios
```

Apoi pornește serverul de development pentru dev build:
```bash
npx expo start --dev-client
```

> `expo-dev-client` este inclus. După instalarea build-ului de development pe
> telefon, OCR-ul nativ (ML Kit / Apple Vision) devine activ.

---

## 🔌 Conectarea la backend

Backendul existent acoperă **Auth**, **Cars** și **Reminders**. Acestea sunt
deja integrate prin servicii tipate în `src/services/api/`.

**Costuri, alimentări, documente și Expo Push** rulează momentan pe servicii
**mock locale** (AsyncStorage). Pentru a le muta pe server, urmează ghidul din
[`BACKEND_EXTENSIONS_NEEDED.md`](./BACKEND_EXTENSIONS_NEEDED.md) — conține
modelele Prisma, endpointurile și exemplele de request/response necesare.

---

## 🗂️ Structura proiectului

```
src/
  app/                # rute Expo Router
    (auth)/           # login, register
    (tabs)/           # dashboard, garaj, remindere, setări
    car/ reminders/ costs/ fuel/ receipts/ documents/
    onboarding.tsx
  components/          # ui / cards / forms / feedback
  hooks/              # useCars, useReminders, useImagePicker, useActiveCar
  services/
    api/              # client tipat + auth/cars/reminders (REAL)
    ocr/              # OCR on-device + fallback mock
    receipts/         # parser bonuri + exemple + test
    costs/ fuel/ documents/ notifications/   # MOCK local
    storage/          # SecureStore + AsyncStorage
  stores/             # Zustand: auth, car, settings
  lib/                # format, date, status, cn
  types/              # tipuri partajate
  constants/          # tipuri reminder/cost/document, stații, temă
```

---

## 🧰 Stack tehnic

| Domeniu          | Tehnologie                                    |
|------------------|-----------------------------------------------|
| Framework        | React Native + Expo (SDK 51)                  |
| Navigare         | Expo Router                                   |
| Limbaj           | TypeScript                                    |
| Stilizare        | NativeWind (Tailwind)                         |
| Formulare        | React Hook Form + Zod                         |
| State server     | TanStack Query                                |
| State client     | Zustand                                       |
| Tokenuri         | expo-secure-store                             |
| Date mock        | AsyncStorage                                  |
| OCR              | expo-text-extractor (ML Kit / Apple Vision)   |
| Cameră / poze    | expo-camera, expo-image-picker                |
| Notificări       | expo-notifications                            |
| Iconițe          | lucide-react-native                           |
| Animații         | react-native-reanimated                       |

---

## 📦 Scripturi

```bash
npm run start          # expo start
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run test:parser    # testează parserul de bonuri pe exemple
```

---

## 📝 Note

- Nu sunt folosite API-uri plătite și niciun serviciu AI cloud.
- Designul este dark-first; tokenii de temă sunt în `tailwind.config.js` și
  `src/constants/theme.ts`.
- Toate fluxurile au stări de loading, empty și error.
