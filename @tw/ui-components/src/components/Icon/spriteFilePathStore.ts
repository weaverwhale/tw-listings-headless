import { $store } from '@tw/snipestate';

export const $spritePath = $store('');

// initialize the sprite file asynchronously, so it doesn't affect initial page load
(async function () {
  const sprite = await import('../../assets/icons/svg/sprite.symbol.svg');
  $spritePath.set(sprite.default);
})();
