# Harmonisera JavaScript och CSS-styling

Den här guiden beskriver hur du manipulerar stilar samtidigt som du behåller samspel mellan JavaScript och CSS. Här får du tips om struktur, klasser och variabler för att göra koden lätt att underhålla.

## 1. Separera ansvar

- **CSS** hanterar visuellt utseende som layout, typografi och färger.
- **JavaScript** sköter beteende som interaktion, datamanipulering och dynamiskt innehåll.
- Undvik att blanda inlinestilar med avancerad logik. Tillsätt eller ta bort klasser eller ändra CSS-variabler från JavaScript istället.

## 2. Använd konsekventa namn

- Följ en namngivningsstandard som BEM (Block__Element--Modifier) för klasser.
- Matcha JavaScript-modulernas namn med komponenterna de styr.
- Använd data-attribut (t.ex. `data-js="accordion"`) för att koppla beteende utan att röra CSS-klasserna.

## 3. Skapa ett centralt teman

- Definiera CSS-variabler för färger, avstånd och typsnitt i en rot- eller temafil.
- Uppdatera variabler med JavaScript för globala ändringar (t.ex. mörkt läge) i stället för att ändra enstaka stilar.

```css
:root {
  --primary-color: #0069aa;
  --gap-large: 2rem;
}
```

```javascript
function toggleDarkMode() {
  document.documentElement.style.setProperty('--primary-color', '#ffffff');
}
```

## 4. Hantera tillstånd med klasser

- Lägg till eller ta bort klasser för att trigga CSS-övergångar och animationer.
- Håll ett set med hjälpsklasser (t.ex. `.is-active`, `.is-hidden`) för vanliga tillstånd.
- Undvik att sätta stilar direkt via JavaScript om det inte behövs.

```javascript
button.addEventListener('click', () => {
  panel.classList.toggle('is-active');
});
```

## 5. Undvik stilkonflikter

- Använd avgränsade selektorer eller komponent-specifika omslag för att hindra att stilar läcker.
- Se till att dynamiskt genererad HTML har klasser som matchar befintliga regler.
- Dokumentera beroenden mellan JavaScript-moduler och CSS-filer i kommentarer eller dokumentation.

## 6. Optimera prestanda

- Samla DOM-läsningar och skrivningar för att undvika layoutproblem.
- Använd `requestAnimationFrame` för uppdateringar som sker ofta, exempelvis animationer.
- Minimera och paketera CSS och JavaScript för produktion för snabbare laddning.

## 7. Testa och felsök

- Använd webbläsarens utvecklingsverktyg för att inspektera tillämpade klasser och stilar.
- Enhetstesta JavaScript-moduler så att de lägger till rätt klasser.
- Testa manuellt att stilförändringar fungerar i olika webbläsare.

## 8. Exempel från projektet

### Anpassa FAQ-accordion

FAQ-delen styrs av `faq-toggle.js` i `src/bjarred-code/scripts/atomic-components/js-modules/components`. Stilarna finns i `style.css` under `#vaccine-bjarred-app .faq-item`.
Ändra gradienten eller huvudfärgen med CSS-variablerna högst upp i `style.css`:

```css
#vaccine-bjarred-app {
  --grad-price-table: linear-gradient(145deg, #ffb347 0%, #ffcc33 60%, #ffdd55 100%);
}
```

JavaScript har publika metoder för att styra panelerna:

```javascript
// Öppna första FAQ-posten
window.faqToggle.open('faq-0');

// Lyssna på växlingar
document.addEventListener('vaccine:faq:toggled', (e) => {
  console.log('FAQ växlades', e.detail);
});
```

### Styling av responsiva tabeller

Tabellerna använder `responsive-table.js` tillsammans med `vb-tables.css` och `table-responsive.css`.
Färger styrs av variabler som `--grad-price-table` och `--grad-location-table`.

```css
#vaccine-bjarred-app {
  --grad-location-table: linear-gradient(to left, #ffe1a8 40%, #ffedd5 100%);
}
```

Du kan även skicka in alternativ när komponenten initieras:

```javascript
window.tableComponent = new ResponsiveTable('.price-table', {
  showScrollIndicators: false,
  scrollSensitivity: 75
});
```

Genom att dela variabler och API:er hålls JavaScript och CSS i synk.

## Sammanfattning

Genom att hålla isär ansvar, använda konsekventa konventioner och hantera tillstånd med klasser kan du skapa dynamiska gränssnitt där JavaScript och CSS samverkar utan konflikt.
