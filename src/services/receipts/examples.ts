/**
 * examples.ts
 * Exemple reale de text OCR pentru bonuri RO de carburant.
 * Folosite la testarea parser-ului si ca fallback demo in DEV.
 */

export const RECEIPT_EXAMPLES: { label: string; text: string }[] = [
  {
    label: "OMV - motorina",
    text: `OMV PETROM MARKETING SRL
STATIA OMV FOCSANI SUD
CIF RO1590082
BON FISCAL
Data: 14.03.2025  Ora: 18:42
EURO DIESEL
Cantitate: 42,18 L
Pret unitar: 7,99 RON/L
TOTAL: 336,98 LEI
TVA 19%: 53,79
Bon fiscal nr: 0241
Va multumim!`,
  },
  {
    label: "Petrom - benzina",
    text: `PETROM
Statia 0567 BUCURESTI
05/02/2025 09:15
TOP EURO 95
Cantitate 30,00 l
Pret/L 7,49 lei/l
SUBTOTAL 224,70
TOTAL DE PLATA 224,70 RON
Nr bon: 1182`,
  },
  {
    label: "MOL - diesel",
    text: `MOL ROMANIA PETROLEUM PRODUCTS
MOL 312 CLUJ-NAPOCA
22.12.2024
EVO DIESEL
38,452 L x 7,89
TOTAL 303,39 RON
TVA inclus
BF nr 00891`,
  },
  {
    label: "Rompetrol - gpl",
    text: `ROMPETROL DOWNSTREAM
KMG STATION 145 IASI
Data 2025-01-30 14:03
AUTOGAZ GPL
Cantitate: 25,40 L
P.U. 3,29 RON/L
Total de plata: 83,57 lei`,
  },
  {
    label: "Bon mizerabil (campuri lipsa)",
    text: `*** BON ***
statie carburant
benzina
suma 150,00
multumim`,
  },
];
