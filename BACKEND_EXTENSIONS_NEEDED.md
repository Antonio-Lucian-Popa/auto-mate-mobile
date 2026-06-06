# BACKEND_EXTENSIONS_NEEDED

Aplicația mobilă **AutoMate** folosește backendul existent
[`car-reminder-api`](https://github.com/Antonio-Lucian-Popa/car-reminder-api)
pentru **Auth**, **Cars** și **Reminders**.

Funcționalitățile de mai jos rulează momentan pe **servicii MOCK locale**
(AsyncStorage) în aplicație și trebuie portate pe backend. Fiecare serviciu mock
din `src/services/*` este marcat cu un comentariu `// MOCK` și are aceeași semnătură
ca viitoarele apeluri reale, deci înlocuirea înseamnă doar schimbarea implementării
din `costsService` / `fuelService` / `documentsService` cu `apiRequest(...)`.

Module de adăugat:
1. Costs (`/api/costs`)
2. Fuel logs (`/api/fuel`)
3. Documents (`/api/documents`) + upload fișiere
4. Expo Push tokens (`/api/notifications/expo-token`)

---

## 1. Prisma — modele noi

```prisma
enum CostCategory {
  FUEL
  REPAIR
  SERVICE
  INSURANCE
  ROAD_TAX
  ROVINIETA
  ITP
  PARKING
  WASHING
  PARTS
  OTHER
}

enum FuelKind {
  benzina
  motorina
  gpl
  electric
  hybrid
}

enum DocumentType {
  RCA
  CASCO
  ITP
  ROVINIETA
  INVOICE
  FUEL_RECEIPT
  SERVICE_RECEIPT
  OTHER
}

model Cost {
  id              String       @id @default(cuid())
  car             Car          @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId           String
  category        CostCategory
  amount          Decimal      @db.Decimal(10, 2)
  currency        String       @default("RON")
  date            DateTime
  mileage         Int?
  vendor          String?
  notes           String?
  receiptImageUrl String?
  createdAt       DateTime     @default(now())

  @@index([carId, date])
}

model FuelLog {
  id              String   @id @default(cuid())
  car             Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId           String
  date            DateTime
  station         String?
  fuelType        FuelKind
  liters          Decimal  @db.Decimal(8, 2)
  pricePerLiter   Decimal  @db.Decimal(8, 3)
  total           Decimal  @db.Decimal(10, 2)
  mileage         Int?
  fullTank        Boolean  @default(true)
  receiptImageUrl String?
  createdAt       DateTime @default(now())

  @@index([carId, date])
}

model Document {
  id               String       @id @default(cuid())
  car              Car          @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId            String
  type             DocumentType
  title            String
  imageUrl         String
  linkedCostId     String?
  linkedReminderId String?
  createdAt        DateTime     @default(now())

  @@index([carId])
}

model ExpoPushToken {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  token     String   @unique
  platform  String?  // "ios" | "android"
  createdAt DateTime @default(now())
}
```

> Notă: aplicația trimite valori numerice simple (RON). Dacă folosești `Decimal`,
> serializează ca `number` în răspunsuri pentru a se potrivi cu tipurile din
> `src/types/index.ts`.

---

## 2. Endpoints noi

Toate cer header `Authorization: Bearer <accessToken>` și sunt scoped pe user
(prin relația `Car -> User`). Filtrarea după mașină se face prin `?carId=`.

### Costs
| Metodă | Rută                     | Descriere                       |
|--------|--------------------------|---------------------------------|
| GET    | `/api/costs?carId=`      | Listă costuri (opțional / mașină) |
| POST   | `/api/costs`             | Creează cost                    |
| GET    | `/api/costs/:id`         | Detaliu cost                    |
| PATCH  | `/api/costs/:id`         | Actualizează cost               |
| DELETE | `/api/costs/:id`         | Șterge cost                     |
| GET    | `/api/costs/summary?carId=&month=YYYY-MM` | Total lunar (opțional) |

### Fuel logs
| Metodă | Rută                     | Descriere                       |
|--------|--------------------------|---------------------------------|
| GET    | `/api/fuel?carId=`       | Listă alimentări                |
| POST   | `/api/fuel`              | Creează alimentare              |
| GET    | `/api/fuel/:id`          | Detaliu                         |
| PATCH  | `/api/fuel/:id`          | Actualizează                    |
| DELETE | `/api/fuel/:id`          | Șterge                          |
| GET    | `/api/fuel/analytics?carId=` | Consum mediu, preț mediu, cost lunar |

### Documents
| Metodă | Rută                     | Descriere                       |
|--------|--------------------------|---------------------------------|
| GET    | `/api/documents?carId=`  | Listă documente                 |
| POST   | `/api/documents`         | Creează (multipart, fișier imagine) |
| DELETE | `/api/documents/:id`     | Șterge                          |

### Notificări (Expo Push)
| Metodă | Rută                              | Descriere                          |
|--------|-----------------------------------|------------------------------------|
| POST   | `/api/notifications/expo-token`   | Salvează tokenul Expo al device-ului |
| DELETE | `/api/notifications/expo-token`   | Șterge tokenul la logout           |

> Backendul folosește deja Web Push (VAPID). Pentru mobil nativ e nevoie de
> Expo Push (https://exp.host/--/api/v2/push/send) sau FCM/APNs direct.

---

## 3. Exemple request / response

### POST `/api/fuel`
**Request**
```json
{
  "carId": "clt0abcd1234",
  "date": "2026-06-01",
  "station": "OMV",
  "fuelType": "motorina",
  "liters": 42.5,
  "pricePerLiter": 7.45,
  "total": 316.62,
  "mileage": 184320,
  "fullTank": true
}
```
**Response `201`**
```json
{
  "id": "clf0fuel5678",
  "carId": "clt0abcd1234",
  "date": "2026-06-01",
  "station": "OMV",
  "fuelType": "motorina",
  "liters": 42.5,
  "pricePerLiter": 7.45,
  "total": 316.62,
  "mileage": 184320,
  "fullTank": true,
  "receiptImageUrl": null,
  "createdAt": "2026-06-01T08:12:00.000Z"
}
```

### POST `/api/costs`
**Request**
```json
{
  "carId": "clt0abcd1234",
  "category": "SERVICE",
  "amount": 450,
  "currency": "RON",
  "date": "2026-05-20",
  "mileage": 183900,
  "vendor": "Service Auto Vrancea",
  "notes": "Schimb ulei + filtre"
}
```
**Response `201`** — același obiect + `id`, `createdAt`.

### GET `/api/fuel/analytics?carId=clt0abcd1234`
```json
{
  "averageConsumption": 6.4,
  "averagePricePerLiter": 7.41,
  "monthlyCost": 612.30,
  "kmBetweenFillups": 540
}
```

### POST `/api/documents` (multipart/form-data)
Câmpuri: `carId`, `type`, `title`, `file` (imagine).
**Response `201`**
```json
{
  "id": "cld0doc999",
  "carId": "clt0abcd1234",
  "type": "RCA",
  "title": "RCA Allianz 2026",
  "imageUrl": "https://cdn.example.com/docs/clt0/rca.jpg",
  "createdAt": "2026-06-01T09:00:00.000Z"
}
```

### POST `/api/notifications/expo-token`
```json
{ "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]", "platform": "android" }
```
**Response `204`**

---

## 4. Pași de integrare în aplicație

1. Setează `EXPO_PUBLIC_API_URL` în `.env`.
2. În `src/services/costs/costsService.ts`, `fuel/fuelService.ts`,
   `documents/documentsService.ts` înlocuiește accesul la `jsonStorage` cu
   `apiRequest(...)` din `src/services/api/client.ts` (gestionează deja
   refresh-ul de token la 401).
3. În `src/services/notifications/notificationService.ts`, după
   `registerForPush()`, trimite tokenul cu `POST /api/notifications/expo-token`
   (vezi `// TODO` din fișier).
4. Tipurile din `src/types/index.ts` reflectă deja contractul de mai sus.
