// ─── Hi-Lo Academy I — Le Marchand : Google Play Billing ──────────
// Achats in-app réels des artefacts (non-consommables, 4,99 € pièce)
// via cordova-plugin-purchase v13 (Play Billing Library).
//
// Sur Android (APK Capacitor) : le clic "Acquérir" ouvre la feuille de
// paiement Google Play ; le déblocage n'arrive QUE si Google confirme
// la transaction (callback onPurchased). Au démarrage, les achats déjà
// possédés (réinstallation, autre appareil) sont resynchronisés
// (onEntitled). Pas de backend : validation locale par le Play Store.
//
// Sur navigateur / desktop (dev) : billingIsNative() === false, l'app
// garde le déblocage démo en localStorage.
//
// ⚠️ Les product IDs Play Console DOIVENT être les ids des skins
// (sp_steampunk, sp_cyber, …) — voir TODO.md pour la config console.

import { Capacitor } from '@capacitor/core';

const NATIVE = (() => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
})();

let _store = null;
let _platform = null;
const _prices = {}; // id → prix localisé Play Store (ex. "4,99 €", "$5.49")

export const billingIsNative = () => NATIVE;

// Prix localisé d'un artefact (null tant que le store n'a pas répondu →
// l'UI retombe sur t('shop.price499')).
export const getArtefactPrice = (id) => _prices[id] || null;

// Initialise le store Play Billing. À appeler une seule fois, après le
// chargement de la sauvegarde (les callbacks patchent eliteSave).
//  - onPurchased(id) : achat frais confirmé par Google → débloquer + équiper
//  - onEntitled(id)  : produit déjà possédé (restore / réinstall) → débloquer
//  - onPrices({id: prix}) : prix localisés reçus du Play Store
export function initBilling(productIds, { onPurchased, onEntitled, onPrices } = {}) {
  if (!NATIVE) return;

  const start = () => {
    const CdvPurchase = window.CdvPurchase;
    if (!CdvPurchase) return; // plugin absent (build sans sync)
    const { store, ProductType, Platform, LogLevel } = CdvPurchase;
    _store = store;
    _platform = Platform.GOOGLE_PLAY;
    store.verbosity = LogLevel.WARNING;

    store.register(productIds.map(id => ({
      id, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY,
    })));

    store.when()
      .productUpdated(p => {
        if (p.pricing?.price) {
          _prices[p.id] = p.pricing.price;
          onPrices?.({ ..._prices });
        }
      })
      // Transaction approuvée par Google → on débloque puis on acquitte
      // (finish = acknowledge côté Play ; sans lui, remboursement auto en 3 j).
      .approved(tx => {
        (tx.products || []).forEach(p => onPurchased?.(p.id));
        tx.finish();
      })
      // Reçus (re)chargés : resynchronise tout ce qui est déjà possédé.
      .receiptUpdated(() => {
        productIds.forEach(id => { if (store.owned(id)) onEntitled?.(id); });
      });

    store.error(err => console.warn('[billing]', err?.code, err?.message));
    store.initialize([Platform.GOOGLE_PLAY]);
  };

  if (window.CdvPurchase) start();
  else document.addEventListener('deviceready', start, { once: true });
}

// Lance l'achat : ouvre la feuille de paiement Google Play.
// Le déblocage arrive via onPurchased (pas ici). Résout quand la feuille
// se ferme ; erreur/annulation = silencieux (Google affiche déjà la sienne).
export async function orderArtefact(id) {
  const offer = _store?.get(id, _platform)?.getOffer();
  if (!offer) { console.warn('[billing] produit indisponible :', id); return; }
  const err = await offer.order();
  if (err && !err.isCancelled) console.warn('[billing] achat échoué :', err.code, err.message);
}

// « Restaurer mes achats » — force le rechargement des reçus Play
// (les déblocages repassent par onEntitled).
export async function restorePurchases() {
  try { await _store?.restorePurchases(); } catch (e) { console.warn('[billing] restore :', e); }
}
