import { cardList, CardType, rarityColor, EffectType, AbilityType, Effect } from '../data/cards';
import { sortCards } from './sort';

export const supportsWebp = (): Promise<boolean> => new Promise((resolve) => {
  const img = new Image();
  img.onload = img.onerror = () => {
    resolve(img.width == 1 && img.height == 1);
  };
  img.src = 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
});

export const getCardEffectHTML = (effects: Effect[]): string => {
  if (!effects) {
    return '';
  }
  let html = `<tr>
    <th colspan="4">Effects:</th>
  </tr>`;
  effects?.forEach(effect => {
    if (effect.trigger) {
      html += `<tr><th colspan="4" class="no-border">[${effect.trigger.toUpperCase()}]</th></tr>`;
    }
    if (effect.requirements) {
      html += `<tr><td colspan="4" class="no-border text-warning">${effect.requirements?.replace(/\n/g, '<br/>').replace(/\b(Green|Blue|Yellow|Purple)\b/g, symbol => `<img class="symbol-icon" src="generator/images/symbol/${symbol.toLowerCase()}.png"/>`).replace(new RegExp(`\\b(${Object.values(AbilityType).join('|')})\\b`, 'g'), ability => `<img class="effect-icon" src="generator/images/effects/${ability}.png"/> ${ability}`)}</td></tr>`;
    }
    html += `<tr><td colspan="4">${effect.description.replace(/\n/g, '<br/>').replace(/\b(Green|Blue|Yellow|Purple)\b/g, symbol => `<img class="symbol-icon" src="generator/images/symbol/${symbol.toLowerCase()}.png"/>`).replace(new RegExp(`\\b(${Object.values(AbilityType).join('|')})\\b`, 'g'), ability => `<img class="effect-icon" src="generator/images/effects/${ability}.png"/> ${ability}`)}</td></tr>`;
  });
  return html;
};

export const loadCards = async (container: HTMLElement): Promise<void> => {
  const webpSupport = await supportsWebp();
  cardList.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'col-md-6 col-12 py-2 card-item';

    // Apply data attributes
    el.dataset.id = card.id.toString();
    el.dataset.set = card.set;
    el.dataset.name = card.name;
    el.dataset.sub_name = card.sub_name;
    el.dataset.groups = card.groups.join(',');
    el.dataset.rarity = card.rarity.toString();
    el.dataset.energy_cost = card.energy_cost.toString();
    el.dataset.type = card.type;
    el.dataset.icon = card.icon;
    el.dataset.attack = card.attack?.toString() || '';
    el.dataset.hit_points = card.hit_points?.toString() || '';
    el.dataset.abilities = card.abilities?.join(',');
    el.dataset.effectTypes = card.effects?.map(e => e.type)?.flat().join(',');
    el.dataset.requirements = card.effects?.map(e => e.requirements).join(',');
    el.dataset.trigger = card.effects?.map(e => e.trigger).join(',');

    // Add elements
    el.innerHTML = `<div class="card mb-3">
      <div class="row m-0">
        <div class="card-image col-4 p-0 bg-secondary">
          <img class="clickable" data-bs-toggle="modal" data-bs-target="#cardInfoModal" src="images/cards/${card.id}_thumb.${webpSupport ? 'webp' : 'png'}" alt="${card.name} card image" loading="lazy" width="100%" onError="this.src = 'images/cards/none_thumb.${webpSupport ? 'webp' : 'png'}'" onclick="App.updateCardInfoModal(${card.id});">
          <img class="clickable add-to-deck" src="images/deck_icon.png" onclick="App.deckManager.addCard(${card.id})"/>
        </div>
        <div class="card-info col-8 p-0">
          <table class="table table-sm" width="100%">
            <thead>
              <tr>
                <th colspan="4"><h5>${card.name}<h5><h6 class="text-muted">${card.sub_name}</h6></th>
              </tr>
            </thead>
            <tbody>
              ${card.type !== CardType.Event ? `
              <tr>
                <th width="25%" class="text-end">Groups:</th>
                <td width="75%" class="text-start" colspan="3">${card.groups.map(g => `<span class="badge bg-primary">${g}</span>`).join(' ')}</td>
              </tr>` : ''}
              <tr>
                <th width="25%" class="text-end">Rarity:</th>
                <td width="25%" class="text-start rarity-${card.rarity}">${''.padStart(card.rarity, '✯')}</td>
                <th width="25%" class="text-end">Cost:</th>
                <td width="25%" class="text-start">${card.energy_cost}</td>
              </tr>
              ${card.type !== CardType.Event ? `
              <tr>
                <th width="25%" class="text-end">Attack:</th>
                <td width="25%" class="text-start">${card.attack || '-'}</td>
                <th width="25%" class="text-end">HP:</th>
                <td width="25%" class="text-start">${card.hit_points || '-'}</td>
              </tr>` : ''}
              ${card.abilities && card.abilities.length ? `
              <tr>
                <th width="25%" class="text-end">Ability:</th>
                <td width="75%" class="text-start" colspan="3">${card.abilities.map(a => `<img class="effect-icon" src="generator/images/effects/${a}.png"/> ${a}`).join(' ')}</td>
              </tr>` : ''}
              ${getCardEffectHTML(card.effects)}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
    container.appendChild(el);
  });
  sortCards();
};

export const loadEffectTypes = (): void => {
  const parent = document.getElementById('EffectType');
  Object.entries(EffectType).forEach(([value, description]) => {
    const html = `<input type="checkbox" class="btn-check filter-effect-type" id="effectType${value}" value="${description}" autocomplete="off" onfocus="this.blur()" onchange="App.filterCards()">
    <label class="btn btn-outline-primary" for="effectType${value}">${description}</label>`;
    parent.innerHTML += html;
  });
};

export const loadGroups = (): void => {
  const parent = document.getElementById('Groups');
  const groups = [...new Set(cardList.map(c => c.groups).flat())].sort();
  Object.entries(groups).forEach(([value, description]) => {
    const html = `<input type="checkbox" class="btn-check filter-groups" id="group${value}" value="${description}" autocomplete="off" onfocus="this.blur()" onchange="App.filterCards()">
    <label class="btn btn-outline-primary" for="group${value}">${description}</label>`;
    parent.innerHTML += html;
  });
};
