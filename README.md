# Mijn Weekmenu

Een eenvoudige Nederlandstalige weekmenu-app voor iPhone en computer. De app draait via GitHub Pages.

## Gebruiken

1. Open de GitHub Pages-website van deze repository in Safari.
2. Kies het aantal personen, je budget en het aantal gerechten per soort.
3. Tik op Maak nieuw weekmenu of vervang één gerecht via Vervang.
4. Via Ingrediënten en Bron kun je de ingrediënten en de oorspronkelijke receptenwebsite bekijken.
5. Ga naar Lijst om boodschappen af te vinken, producten als In huis te markeren en extra producten toe te voegen.
6. Tik in Safari op Delen en Zet op beginscherm om de app te installeren.

## Functies

* 1–7 gerechten voor 1–8 personen.
* Vlees, vis, vegetarisch en kindvriendelijk, plus voorkeur voor rund, varken, kip of gevogelte.
* Individueel gerecht vervangen met automatische aanpassing van de boodschappen.
* Ingrediënten samengevoegd per product, eenheid en bewaarmethode, per winkelafdeling.
* Soepoptie, boodschappen toevoegen, lijst kopiëren en printen.
* Lokaal opslaan van instellingen en afgevinkte producten.
* Installeerbare PWA met offline cache voor eigen appbestanden.

## Grenzen

* Collect&Go: er is een directe website-link, maar geen automatische koppeling met het winkelmandje.
* Prijzen: indicatieve gerechtprijzen en geen actuele Colruyt- of Collect&Go-prijzen.
* Ingrediënten: de receptendatabank bevat basiswaarden voor vier personen; controleer het originele recept voor de uiteindelijke bereidingswijze en allergenen.
* Receptfoto's: alleen echte en betrouwbare afbeeldingen worden getoond. Recepten zonder zo'n foto tonen een plaatsaanduiding.
* Synchronisatie: menu en afvinkstatus worden op het gebruikte toestel bewaard, niet tussen apparaten gesynchroniseerd.
* Productnamen zijn bruikbare zoektermen voor Collect&Go, maar niet noodzakelijk exacte artikelnamen of verkoopverpakkingen.
* Bij onvoldoende recepten in een categorie kan het voorstel uitwijken naar een andere categorie.

## Bestanden

* index.html: startpagina, manifest en scripts
* recipes.js: recepten, ingrediënten, tags, prijzen en externe links
* v3.js: appwerking en lokale opslag
* v3.css: mobiel ontwerp
* sw.js: PWA-cache
* icon.svg en manifest.json: appinstallatie

replace-recipe.js is historisch en wordt niet langer geladen.
