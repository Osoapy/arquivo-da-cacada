import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getDatabase, ref, onValue, set, get, remove, update } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js';
import { english, englishMoves } from './i18n.js?v=4';
import { basicHelp, startingHelp, playbookHelp } from './move-help.js';
import { huntDetails } from './hunt-details.js?v=4';
import { firebaseConfig } from './firebase-config.js';

const auth = getAuth(initializeApp(firebaseConfig));
const db = getDatabase();
const $ = (id) => document.getElementById(id);
$('library-view').insertAdjacentHTML('beforebegin', '<nav class="app-tabs" aria-label="Navegação"><button id="tab-characters" type="button"></button><button id="tab-campaigns" type="button"></button></nav>');
$('library-view').insertAdjacentHTML('afterend', '<section id="campaign-view" class="hidden"><div class="section-heading"><h1 id="campaign-heading"></h1></div><div class="campaign-forms"><form id="create-campaign-form" class="panel"><h2 id="create-campaign-heading"></h2><input id="campaign-name" maxlength="80" required><button class="button primary" type="submit" id="create-campaign-button"></button></form><form id="join-campaign-form" class="panel"><h2 id="join-campaign-heading"></h2><input id="campaign-code" required><button class="button outline" type="submit" id="join-campaign-button"></button></form></div><div id="campaign-list" class="campaign-list"></div><div id="campaign-detail"></div></section>');
$('back-to-library').insertAdjacentHTML('afterend', '<button id="share-character" class="text-button" type="button"></button>');
const stats = ['Braveza', 'Esperteza', 'Estranheza', 'Firmeza', 'Sutileza'];
const moves = ['Partir pra porrada / Proteger alguém', 'Investigar um mistério / Perceber uma enrascada', 'Usar magia', 'Agir sob pressão / Dar uma mão', 'Manipular alguém'];
const specialFields = { Arcano:'Magia combativa', Delinquente:'Antecedentes, perseguição e submundo', Divino:'Missão', Escolhido:'Sina e arma especial', Especialista:'Refúgio', Iniciado:'Seita', Injustiçado:'Quem você perdeu', Lunático:'Teorias e conexões', Monstruoso:'Raça e maldição', Mundano:'Vida normal', Profissional:'Agência', Sinistro:'Lado sombrio', Viajante:'Meio de transporte' };
const archetypeArt = { Arcano:'arcano', Delinquente:'delinquente', Divino:'divino', Escolhido:'escolhido', Especialista:'especialista', Iniciado:'iniciado', Injustiçado:'injusticado', Lunático:'lunatico', Monstruoso:'monstruoso', Mundano:'mundano', Profissional:'profissional', Sinistro:'sinistro', Viajante:'viajante' };
const artFor = (name) => `./images/${archetypeArt[name] || 'caca'}.webp`;
let playbooks = {};
let user = null;
let characters = {};
let images = {};
let activeId = null;
let saveTimer = null;
let unsubCharacters = null;
let unsubImages = null;
let unsubCampaigns = null;
let campaignIds = {};
let lastCampaignLinks = '';
let activeCampaignId = null;
let activeOwnerUid = null;
let activeCanEdit = true;
const sheetParam = new URLSearchParams(location.search).get('sheet');
const sharedTarget = sheetParam?.match(/^([A-Za-z0-9_-]{1,128})\.([0-9a-f-]{36})$/i);
let creatingAccount = false;
let lastRoll = null;
let locale = localStorage.getItem('language') === 'en' ? 'en' : 'pt';
const t = (text) => locale === 'en' ? english[text] || text : text;
const dynamicUi = '#auth-hero-title,#auth-hero-copy,#auth-title,#auth-subtitle,#email-label,#password-label,#password-toggle,#email-submit,#switch-auth,#lang-toggle,#character-grid,#rating-preset,#ratings,#basic-moves,#starting-moves,#move-options,#roll-stat,#roll-result,#archetype-badge,#special-label,#save-status,#toast,#campaign-view,.app-tabs,#share-character';
const staticText = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
for (let node; (node = walker.nextNode());) {
  const key = node.textContent.trim();
  if (!english[key] || node.parentElement.closest(dynamicUi)) continue;
  staticText.push([node, key, node.textContent.match(/^\s*/)[0], node.textContent.match(/\s*$/)[0]]);
}
const staticAttrs = [...document.querySelectorAll('[placeholder],[aria-label],[title],[alt]')].flatMap((element) =>
  ['placeholder','aria-label','title','alt'].filter((attr) => english[element.getAttribute(attr)] && !element.matches('#password,#password-toggle')).map((attr) => [element, attr, element.getAttribute(attr)]));
function renderLanguage() {
  document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
  document.title = t('Arquivo da Caçada');
  for (const [node,key,before,after] of staticText) node.textContent = before + t(key) + after;
  for (const [element,attr,key] of staticAttrs) element.setAttribute(attr,t(key));
  $('lang-toggle').textContent = locale === 'en' ? 'Português' : 'English';
  $('lang-toggle').setAttribute('aria-label', locale === 'en' ? 'Mudar para português' : 'Switch to English');
  $('tab-characters').textContent = t('Caçadores');
  $('tab-campaigns').textContent = t('Campanhas');
  $('campaign-heading').textContent = t('Campanhas');
  $('create-campaign-heading').textContent = t('Criar campanha');
  $('join-campaign-heading').textContent = t('Entrar em campanha');
  $('create-campaign-button').textContent = t('Criar campanha');
  $('join-campaign-button').textContent = t('Entrar');
  $('campaign-name').placeholder = t('Nome da campanha');
  $('campaign-code').placeholder = t('Código ou link da campanha');
  $('share-character').textContent = t('Compartilhar ficha');
  renderAuth();
  if (user) renderLibrary();
  if (activeId) openCharacter(activeId, true);
  if (user && !$('campaign-view').classList.contains('hidden')) renderCampaigns();
}
$('lang-toggle').addEventListener('click', () => { locale = locale === 'pt' ? 'en' : 'pt'; localStorage.setItem('language',locale); renderLanguage(); });

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = (message) => { $('toast').textContent = message; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 3300); };
const errText = (error) => /permission[ _-]?denied/i.test(`${error?.code} ${error?.message}`) ? t('Você não tem permissão para acessar isto. Se a ficha foi compartilhada, confira se as regras do banco estão publicadas.') : t(({'auth/invalid-credential':'E-mail ou senha incorretos.','auth/email-already-in-use':'Este e-mail já está cadastrado.','auth/weak-password':'Use uma senha com pelo menos 6 caracteres.','auth/popup-closed-by-user':'A janela de login foi fechada.','auth/unauthorized-domain':'Adicione este domínio aos domínios autorizados no Firebase Authentication.','permission_denied':'Configure as regras do Realtime Database conforme o README.'}[error?.code] || error?.message || 'Não foi possível concluir a operação.'));
const confirmDialog = ({ title, message, confirm, danger = false }) => new Promise((resolve) => {
  const dialog = document.createElement('dialog'); dialog.className = 'share-dialog confirm-dialog' + (danger ? ' danger' : '');
  dialog.innerHTML = `<h2>${escapeHtml(title)}</h2><p class="dialog-message">${escapeHtml(message)}</p><div class="dialog-actions"><button type="button" class="button outline" data-answer="no">${t('Cancelar')}</button><button type="button" class="button primary" data-answer="yes">${escapeHtml(confirm)}</button></div>`;
  let answer = false;
  dialog.addEventListener('click', (event) => { const button = event.target.closest('[data-answer]'); if (button) { answer = button.dataset.answer === 'yes'; dialog.close(); } else if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { dialog.remove(); resolve(answer); });
  document.body.append(dialog); dialog.showModal(); dialog.querySelector('[data-answer="no"]').focus();
});
const setTab = (name) => { $('tab-characters').classList.toggle('active', name === 'characters'); $('tab-campaigns').classList.toggle('active', name === 'campaigns'); };
const charPath = (id, uid = user?.uid) => `users/${uid}/characters/${id}`;
const imagePath = (id, uid = user?.uid) => `users/${uid}/images/${id}`;
const sheetUrl = (uid, id) => `${location.origin}${location.pathname}?sheet=${encodeURIComponent(uid + '.' + id)}`;
const campaignUrl = (id) => `${location.origin}${location.pathname}?campaign=${encodeURIComponent(id)}`;

renderLanguage();
try { playbooks = await fetch('./playbooks.json').then((r) => { if (!r.ok) throw Error(t('Cartilhas indisponíveis')); return r.json(); }); }
catch (error) { toast(error.message); }

function renderAuth() {
  $('auth-view').classList.toggle('signup', creatingAccount);
  $('auth-hero-title').innerHTML = creatingAccount ? t('Crie sua conta.') : `${t('Todo monstro')}<br>${t('deixa')} <em>${t('rastros.')}</em>`;
  $('auth-hero-copy').textContent = t(creatingAccount ? 'Escolha uma cartilha e monte sua ficha.' : 'Fichas de caçadores para Monstro da Semana.');
  $('auth-title').textContent = t(creatingAccount ? 'Criar conta' : 'Entrar');
  $('auth-subtitle').textContent = t(creatingAccount ? 'Crie uma conta para guardar suas fichas.' : 'Entre com e-mail ou Google.');
  $('email-label').textContent = t(creatingAccount ? 'Seu e-mail' : 'E-mail da conta');
  $('password-label').textContent = t(creatingAccount ? 'Crie uma senha' : 'Senha da conta');
  $('password').placeholder = t(creatingAccount ? 'Pelo menos 6 caracteres' : 'Digite sua senha');
  $('email-submit').textContent = t(creatingAccount ? 'Criar conta' : 'Entrar com e-mail');
  $('switch-auth').textContent = t(creatingAccount ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta');
  $('password').autocomplete = creatingAccount ? 'new-password' : 'current-password';
  $('password').type = 'password';
  $('password-toggle').textContent = t('Mostrar');
  $('password-toggle').setAttribute('aria-label', t('Mostrar senha'));
  $('password-toggle').setAttribute('aria-pressed', 'false');
  $('auth-error').textContent = '';
}
$('switch-auth').addEventListener('click', () => {
  creatingAccount = !creatingAccount;
  renderAuth();
});
$('password-toggle').addEventListener('click', () => {
  const visible = $('password').type === 'password';
  $('password').type = visible ? 'text' : 'password';
  $('password-toggle').textContent = t(visible ? 'Ocultar' : 'Mostrar');
  $('password-toggle').setAttribute('aria-label', t(visible ? 'Ocultar senha' : 'Mostrar senha'));
  $('password-toggle').setAttribute('aria-pressed', String(visible));
});
$('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault(); $('auth-error').textContent = '';
  const email = $('email').value.trim(); const password = $('password').value;
  try { await (creatingAccount ? createUserWithEmailAndPassword(auth,email,password) : signInWithEmailAndPassword(auth,email,password)); }
  catch (error) { $('auth-error').textContent = errText(error); }
});
$('google-login').addEventListener('click', async () => {
  $('auth-error').textContent = '';
  try { await signInWithPopup(auth,new GoogleAuthProvider()); }
  catch (error) { $('auth-error').textContent = errText(error); }
});
$('signout').addEventListener('click', () => signOut(auth).catch((error) => toast(errText(error))));

onAuthStateChanged(auth, (nextUser) => {
  clearTimeout(saveTimer);
  unsubCharacters?.(); unsubImages?.(); unsubCampaigns?.();
  user = nextUser; activeId = null; activeOwnerUid = user?.uid || null; characters = {}; images = {}; campaignIds = {};
  $('auth-view').classList.toggle('hidden',!!user || !!sharedTarget);
  $('app-view').classList.toggle('hidden',!user && !sharedTarget);
  $('signout').classList.toggle('hidden',!user);
  $('user-label').textContent = user?.displayName || user?.email || '';
  if (sharedTarget) { openShared(sharedTarget[1], sharedTarget[2]); return; }
  if (!user) return;
  if (new URLSearchParams(location.search).has('campaign')) showCampaigns(); else showLibrary();
  unsubCharacters = onValue(ref(db,`users/${user.uid}/characters`), (snapshot) => { characters = snapshot.val() || {}; renderLibrary(); const links = JSON.stringify(Object.entries(characters).map(([id,c]) => [id,c.campaignId || '',c.name || ''])); if (links !== lastCampaignLinks) { lastCampaignLinks = links; renderCampaigns(); } }, (error) => toast(errText(error)));
  unsubImages = onValue(ref(db,`users/${user.uid}/images`), (snapshot) => { images = snapshot.val() || {}; renderLibrary(); if (activeId) renderPortrait(); }, (error) => toast(errText(error)));
  unsubCampaigns = onValue(ref(db,`users/${user.uid}/campaigns`), (snapshot) => { campaignIds = snapshot.val() || {}; renderCampaigns(); }, (error) => toast(errText(error)));
});

function renderLibrary() {
  const entries = Object.entries(characters).sort((a,b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));
  $('character-grid').innerHTML = entries.length ? entries.map(([id,c]) => `<article class="character-card"><button class="card-open" data-open="${escapeHtml(id)}"><div class="card-image"><img src="${images[id] ? escapeHtml(images[id]) : artFor(c.archetype)}" alt=""></div><div class="card-body"><small>${escapeHtml(t(c.archetype))}</small><strong>${escapeHtml(c.name || t('Caçador sem nome'))}</strong><div class="card-footer"><span>${t('Dano')} ${Number(c.harm)||0}/7</span><span>${t('Sorte')} ${Number(c.luck)||0}/7</span></div></div></button><div class="card-actions"><button type="button" data-share="${escapeHtml(id)}">${t('Compartilhar')}</button><button type="button" data-delete="${escapeHtml(id)}">${t('Excluir')}</button></div></article>`).join('') : `<div class="empty-state"><h2>${t('Nenhuma ficha cadastrada.')}</h2></div>`;
}
function showLibrary() { setTab('characters'); activeId = null; activeOwnerUid = user?.uid || null; activeCanEdit = true; $('library-view').classList.remove('hidden'); $('campaign-view').classList.add('hidden'); $('sheet-view').classList.add('hidden'); document.querySelector('.app-tabs').classList.remove('hidden'); renderLibrary(); }
$('back-to-library').addEventListener('click', () => { clearTimeout(saveTimer); if (activeId && activeCanEdit) saveCharacter(); if (sharedTarget) location.href = location.pathname; else showLibrary(); });
$('character-grid').addEventListener('click', (event) => { const open = event.target.closest('[data-open]'); const share = event.target.closest('[data-share]'); const del = event.target.closest('[data-delete]'); if (open) openCharacter(open.dataset.open); else if (share) shareCharacter(share.dataset.share); else if (del) deleteCharacter(del.dataset.delete); });

async function openShared(uid, id) {
  try {
    const snapshot = await get(ref(db,charPath(id,uid)));
    if (!snapshot.exists()) throw Error(t('Ficha não encontrada.'));
    const c = snapshot.val();
    activeOwnerUid = uid; activeCanEdit = user?.uid === uid || c.shareMode === 'edit';
    if (c.campaignId && user && !activeCanEdit) {
      const owner = await get(ref(db,`campaigns/${c.campaignId}/ownerUid`));
      activeCanEdit = owner.val() === user.uid;
    }
    characters[id] = c;
    const portrait = await get(ref(db,imagePath(id,uid))).catch(() => null);
    if (portrait?.exists()) images[id] = portrait.val();
    openCharacter(id);
  } catch (error) {
    document.querySelector('.app-tabs').classList.add('hidden');
    $('library-view').classList.remove('hidden'); $('sheet-view').classList.add('hidden');
    $('character-grid').innerHTML = `<div class="empty-state"><h2>${escapeHtml(errText(error))}</h2><a href="${location.pathname}">${t('Voltar ao arquivo')}</a></div>`;
  }
}

$('tab-characters').addEventListener('click', showLibrary);
$('tab-campaigns').addEventListener('click', showCampaigns);
function showCampaigns() {
  setTab('campaigns');
  if (!user) return;
  activeId = null; $('library-view').classList.add('hidden'); $('sheet-view').classList.add('hidden'); $('campaign-view').classList.remove('hidden');
  document.querySelector('.app-tabs').classList.remove('hidden');
  activeCampaignId ||= new URLSearchParams(location.search).get('campaign');
  if (activeCampaignId) $('campaign-code').value = activeCampaignId;
  renderCampaigns();
}
let campaignListeners = [];
let battleCtx = null;
let battleLog = [];
let campaignRenderToken = 0;
const stopCampaignListeners = () => { for (const off of campaignListeners) off(); campaignListeners = []; };
async function renderCampaigns() {
  if (!user || $('campaign-view').classList.contains('hidden')) { stopCampaignListeners(); battleCtx = null; return; }
  const token = ++campaignRenderToken;
  const ids = Object.keys(campaignIds);
  const items = await Promise.all(ids.map(async (id) => { try { return [id,(await get(ref(db,`campaigns/${id}`))).val()]; } catch { return [id,null]; } }));
  if (token !== campaignRenderToken) return;
  $('campaign-list').innerHTML = items.filter(([,c]) => c).map(([id,c]) => `<button type="button" data-campaign="${escapeHtml(id)}" class="${id === activeCampaignId ? 'selected' : ''}">${c.image ? `<img src="${escapeHtml(c.image)}" alt="">` : '<span class="campaign-thumb">✳</span>'}<span>${escapeHtml(c.name)}</span></button>`).join('') || `<p>${t('Nenhuma campanha ainda.')}</p>`;
  stopCampaignListeners();
  if (!activeCampaignId || !campaignIds[activeCampaignId]) { $('campaign-detail').innerHTML = ''; battleCtx = null; return; }
  const campaign = items.find(([id]) => id === activeCampaignId)?.[1];
  if (!campaign) { $('campaign-detail').innerHTML = `<p>${t('Campanha indisponível.')}</p>`; battleCtx = null; return; }
  const campaignId = activeCampaignId; const owner = campaign.ownerUid === user.uid;
  const linked = (await Promise.all(Object.entries(campaign.sheets || {}).map(async ([id,uid]) => {
    try { const c = (await get(ref(db,charPath(id,uid)))).val(); if (!c) return null; const img = await get(ref(db,imagePath(id,uid))).then((s) => s.val()).catch(() => null); return { id, uid, c, img }; } catch { return null; }
  }))).filter(Boolean);
  if (token !== campaignRenderToken) return;
  const available = Object.entries(characters).filter(([,c]) => !c.campaignId);
  const cover = campaign.image ? `<img src="${escapeHtml(campaign.image)}" alt="">` : '<span class="cover-placeholder">✳</span>';
  $('campaign-detail').innerHTML = `<div class="panel campaign-detail"><div class="campaign-hero"><div class="campaign-cover">${cover}${owner ? `<label class="cover-upload" for="campaign-image-input">${t(campaign.image ? 'Trocar foto' : 'Adicionar foto')}</label><input id="campaign-image-input" type="file" accept="image/*" hidden>` : ''}</div><div class="campaign-info"><span class="campaign-role">${owner ? t('Você criou esta campanha') : t('Você participa desta campanha')}</span><h2>${escapeHtml(campaign.name)}</h2><p>${t('Código da campanha')}: <code>${escapeHtml(campaignId)}</code></p><button type="button" class="text-button" id="copy-campaign">${t('Copiar convite')}</button></div></div>
    <h3>${t('Personagens vinculados')}</h3><div class="campaign-roster">${linked.map(({id,uid,c,img}) => `<div class="roster-card"><a class="roster-open" href="${sheetUrl(uid,id)}" title="${escapeHtml(t('Abrir ficha'))}"><img src="${img ? escapeHtml(img) : artFor(c.archetype)}" alt=""><span><strong>${escapeHtml(c.name || t('Caçador sem nome'))}</strong><small>${escapeHtml(t(c.archetype))}</small></span></a>${uid === user.uid ? `<button type="button" class="roster-unlink" data-unlink="${escapeHtml(id)}">${t('Desvincular')}</button>` : ''}</div>`).join('') || `<p>${t('Nenhum personagem vinculado.')}</p>`}</div>
    <form id="link-sheet-form"><label for="link-sheet">${t('Vincular meu personagem')}</label><select id="link-sheet" ${available.length ? '' : 'disabled'}>${available.map(([id,c]) => `<option value="${escapeHtml(id)}">${escapeHtml(c.name || t('Caçador sem nome'))}</option>`).join('')}</select><button type="submit" class="button primary" ${available.length ? '' : 'disabled'}>${t('Vincular')}</button></form></div>
    <section id="battle-panel" class="panel battle-panel"></section>`;
  battleCtx = { campaignId, owner, battle: campaign.battle || {}, hunters: Object.fromEntries(linked.map((h) => [h.id, h])) };
  renderBattle();
  campaignListeners.push(onValue(ref(db,`campaigns/${campaignId}/battle`), (snap) => { if (battleCtx?.campaignId !== campaignId) return; battleCtx.battle = snap.val() || {}; renderBattle(); }, () => {}));
  for (const h of linked) campaignListeners.push(onValue(ref(db,charPath(h.id,h.uid)), (snap) => { const hunter = battleCtx?.campaignId === campaignId && battleCtx.hunters[h.id]; if (!hunter || !snap.exists()) return; hunter.c = snap.val(); renderBattle(); }, () => {}));
}
const battleStats = () => stats.map((s,i) => `<option value="${i}">${t(s)}</option>`).join('');
const harmBoxes = (kind, id, value, max, editable, act = 'harm') => `<div class="battle-track">${Array.from({length:max},(_,i) => `<button type="button" class="${i < value ? 'filled' : ''}" data-act="${act}" data-kind="${kind}" data-id="${escapeHtml(id)}" data-value="${i+1}" ${editable ? '' : 'disabled'} aria-label="${i+1}/${max}">${i < value ? '×' : ''}</button>`).join('')}</div>`;
function renderBattle() {
  const panel = $('battle-panel'); if (!panel || !battleCtx) return;
  const { owner, battle, hunters } = battleCtx; const monsters = battle.monsters || {}; const armor = battle.armor || {};
  const active = document.activeElement; const focus = active && panel.contains(active) && active.id ? { id: active.id, value: active.value } : null;
  const hunterCards = Object.values(hunters).map(({id,c,img}) => {
    const harm = Number(c.harm) || 0; const luck = Number(c.luck) || 0; const state = harm >= 7 ? t('Morrendo') : harm >= 4 || c.unstable ? t('Instável') : harm ? t('Ferido') : t('Ileso');
    const sid = escapeHtml(id);
    return `<article class="combatant hunter ${harm >= 7 ? 'down' : ''}"><header><img src="${img ? escapeHtml(img) : artFor(c.archetype)}" alt=""><div><strong>${escapeHtml(c.name || t('Caçador sem nome'))}</strong><small>${escapeHtml(t(c.archetype))} · <span class="combat-state">${state}</span></small></div></header>
      <div class="combat-row"><span>${t('Dano')} ${harm}/7</span>${harmBoxes('hunter',id,harm,7,owner)}</div>
      <div class="combat-row"><span>${t('Sorte')} ${luck}/7</span>${harmBoxes('hunter',id,luck,7,owner,'luck')}</div>
      ${owner ? `<div class="combat-actions"><label>${t('Armadura')} <input type="number" min="0" max="5" id="armor-${sid}" data-armor="${sid}" value="${Number(armor[id]) || 0}"></label><label>${t('Dano')} <input type="number" min="0" max="9" id="hit-${sid}" value="1"></label><button type="button" class="button primary small" data-act="hit" data-kind="hunter" data-id="${sid}">${t('Aplicar')}</button><button type="button" class="button outline small" data-act="heal" data-kind="hunter" data-id="${sid}">${t('Curar 1')}</button><button type="button" class="button outline small" data-act="luck-save" data-id="${sid}" ${luck >= 7 ? 'disabled' : ''}>${t('Usar Sorte')}</button></div>
      <div class="combat-actions"><select id="roll-${sid}" aria-label="${t('Classificação')}">${battleStats()}</select><button type="button" class="button outline small" data-act="roll" data-id="${sid}">${t('Rolar 2d6')}</button></div>` : ''}</article>`;
  }).join('');
  const monsterCards = Object.entries(monsters).sort((a,b) => (a[1].created || 0) - (b[1].created || 0)).map(([id,m]) => {
    const max = Math.min(20, Math.max(1, Number(m.harmMax) || 7)); const harm = Math.min(max, Number(m.harm) || 0); const sid = escapeHtml(id);
    return `<article class="combatant monster ${harm >= max ? 'down' : ''}"><header><span class="monster-mark">${m.minion ? '◆' : '✷'}</span><div><strong>${escapeHtml(m.name)}</strong><small>${t(m.minion ? 'Capanga' : 'Monstro')} · ${t('Armadura')} ${Number(m.armor) || 0}${m.attack ? ` · ${escapeHtml(m.attack)}` : ''}</small></div>${owner ? `<button type="button" class="text-button remove-monster" data-act="remove" data-id="${sid}" aria-label="${t('Remover')}">✕</button>` : ''}</header>
      <div class="combat-row"><span>${harm >= max ? t('Derrotado') : `${t('Dano')} ${harm}/${max}`}</span>${harmBoxes('monster',id,harm,max,owner)}</div>
      ${owner ? `<div class="combat-actions"><label>${t('Dano')} <input type="number" min="0" max="9" id="hit-${sid}" value="2"></label><button type="button" class="button primary small" data-act="hit" data-kind="monster" data-id="${sid}">${t('Aplicar')}</button><button type="button" class="button outline small" data-act="heal" data-kind="monster" data-id="${sid}">${t('Curar 1')}</button></div>` : ''}</article>`;
  }).join('');
  const log = battleLog.filter((l) => l.campaignId === battleCtx.campaignId).slice(-8).reverse();
  panel.innerHTML = `<div class="battle-head"><div><span class="eyebrow">${t('Mestre')}</span><h2>${t('Simulador de batalha')}</h2><p>${owner ? t('Clique nas caixas para marcar dano e sorte. O dano aplicado já desconta a armadura.') : t('Acompanhe a batalha. Só quem criou a campanha pode editar.')}</p></div><div class="round-box"><span>${t('Rodada')}</span><strong>${Number(battle.round) || 1}</strong>${owner ? `<div><button type="button" class="button outline small" data-act="round" data-value="-1" aria-label="${t('Rodada anterior')}">−</button><button type="button" class="button outline small" data-act="round" data-value="1" aria-label="${t('Próxima rodada')}">+</button></div>` : ''}</div></div>
    <div class="battle-columns"><div><h3>${t('Caçadores')}</h3><div class="combatants">${hunterCards || `<p class="battle-empty">${t('Vincule personagens para que eles entrem na batalha.')}</p>`}</div></div>
    <div><h3>${t('Ameaças')}</h3><div class="combatants">${monsterCards || `<p class="battle-empty">${t('Nenhum monstro em cena.')}</p>`}</div>
    ${owner ? `<form id="monster-form" class="monster-form"><input id="monster-name" maxlength="60" required placeholder="${t('Nome (ex.: Lobisomem)')}"><label>${t('Capacidade de dano')} <input id="monster-harm" type="number" min="1" max="20" value="8"></label><label>${t('Armadura')} <input id="monster-armor" type="number" min="0" max="5" value="0"></label><input id="monster-attack" maxlength="60" placeholder="${t('Ataque (ex.: Garras 3-dano)')}"><label class="check-row"><input id="monster-minion" type="checkbox"> ${t('Capanga')}</label><button type="submit" class="button primary small">${t('Adicionar ameaça')}</button></form>` : ''}</div></div>
    <div class="battle-foot"><ol class="battle-log">${log.map((l) => `<li>${escapeHtml(l.text)}</li>`).join('') || `<li class="muted">${t('As rolagens e o dano aplicado aparecem aqui.')}</li>`}</ol>${owner ? `<button type="button" class="text-button danger" data-act="end">${t('Encerrar batalha')}</button>` : ''}</div>`;
  if (focus && $(focus.id)) { $(focus.id).value = focus.value; $(focus.id).focus(); }
}
const logBattle = (text) => { battleLog.push({ campaignId: battleCtx.campaignId, text }); battleLog = battleLog.slice(-40); };
async function setHunter(id, changes) {
  const h = battleCtx.hunters[id]; if (!h) return;
  const paths = {}; for (const [k,v] of Object.entries(changes)) paths[`${charPath(id,h.uid)}/${k}`] = v;
  paths[`${charPath(id,h.uid)}/updatedAt`] = Date.now();
  Object.assign(h.c, changes); renderBattle();
  try { await update(ref(db), paths); if (characters[id]) Object.assign(characters[id], changes); } catch (error) { toast(errText(error)); }
}
async function setBattle(path, value) {
  try { await update(ref(db), { [`campaigns/${battleCtx.campaignId}/battle/${path}`]: value }); } catch (error) { toast(errText(error)); }
}
const hitText = (name, raw, armor, delta) => `${name}: ${raw} ${t('de dano')}${armor ? ` − ${armor} ${t('de armadura')}` : ''} = ${delta}`;
$('campaign-detail').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-act]'); if (!button || !battleCtx?.owner || button.disabled) return;
  const { act, kind, id } = button.dataset; const value = Number(button.dataset.value);
  const monster = battleCtx.battle.monsters?.[id]; const hunter = battleCtx.hunters[id];
  const name = monster && (kind === 'monster' || act === 'remove') ? monster.name : hunter?.c.name || t('Caçador sem nome');
  if (act === 'harm' && kind === 'hunter' && hunter) { const harm = (Number(hunter.c.harm) || 0) === value ? value - 1 : value; await setHunter(id, harm >= 4 ? { harm, unstable: true } : { harm }); }
  else if (act === 'luck' && hunter) { const luck = (Number(hunter.c.luck) || 0) === value ? value - 1 : value; await setHunter(id, { luck }); }
  else if (act === 'harm' && kind === 'monster' && monster) { const harm = (Number(monster.harm) || 0) === value ? value - 1 : value; await setBattle(`monsters/${id}/harm`, harm); }
  else if (act === 'hit' || act === 'heal') {
    const raw = Math.max(0, Number($(`hit-${id}`)?.value) || 0);
    const armor = act === 'heal' ? 0 : kind === 'monster' ? Number(monster?.armor) || 0 : Number(battleCtx.battle.armor?.[id]) || 0;
    const delta = act === 'heal' ? -1 : Math.max(0, raw - armor);
    if (kind === 'monster' && monster) {
      const max = Number(monster.harmMax) || 7; const harm = Math.min(max, Math.max(0, (Number(monster.harm) || 0) + delta));
      logBattle(act === 'heal' ? `${name}: ${t('curou 1 de dano')}` : `${hitText(name, raw, armor, delta)}${harm >= max ? ` · ${t('Derrotado')}` : ''}`);
      await setBattle(`monsters/${id}/harm`, harm);
    } else if (hunter) {
      const harm = Math.min(7, Math.max(0, (Number(hunter.c.harm) || 0) + delta));
      logBattle(act === 'heal' ? `${name}: ${t('curou 1 de dano')}` : `${hitText(name, raw, armor, delta)}${harm >= 7 ? ` · ${t('Morrendo')}` : ''}`);
      await setHunter(id, harm >= 4 ? { harm, unstable: true } : { harm });
    }
    renderBattle();
  }
  else if (act === 'luck-save' && hunter) { const luck = Math.min(7, (Number(hunter.c.luck) || 0) + 1); logBattle(`${name}: ${t('marcou Sorte para evitar o dano')} (${luck}/7)`); await setHunter(id, { luck }); }
  else if (act === 'roll' && hunter) {
    const stat = Number($(`roll-${id}`)?.value) || 0; const bonus = Number(hunter.c.ratings?.[stat]) || 0;
    const dice = [1,2].map(() => crypto.getRandomValues(new Uint32Array(1))[0] % 6 + 1); const total = dice[0] + dice[1] + bonus;
    logBattle(`${name} · ${t(stats[stat])}: ${dice[0]} + ${dice[1]} ${bonus >= 0 ? '+' : '−'} ${Math.abs(bonus)} = ${total} (${t(total >= 10 ? 'Sucesso total' : total >= 7 ? 'Sucesso com complicação' : 'Marque experiência')})`); renderBattle();
  }
  else if (act === 'round') await setBattle('round', Math.max(1, (Number(battleCtx.battle.round) || 1) + value));
  else if (act === 'remove' && monster) { if (await confirmDialog({ title: t('Remover ameaça?'), message: monster.name, confirm: t('Remover'), danger: true })) await setBattle(`monsters/${id}`, null); }
  else if (act === 'end') {
    if (!await confirmDialog({ title: t('Encerrar batalha?'), message: t('As ameaças e a rodada serão apagadas. O dano e a sorte dos caçadores continuam nas fichas.'), confirm: t('Encerrar'), danger: true })) return;
    battleLog = battleLog.filter((l) => l.campaignId !== battleCtx.campaignId);
    try { await set(ref(db,`campaigns/${battleCtx.campaignId}/battle`), null); } catch (error) { toast(errText(error)); }
  }
});
$('campaign-detail').addEventListener('change', async (event) => {
  const armor = event.target.closest('[data-armor]');
  if (armor && battleCtx?.owner) { await setBattle(`armor/${armor.dataset.armor}`, Math.max(0, Math.min(5, Number(armor.value) || 0))); return; }
  if (event.target.id === 'campaign-image-input') {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file || !battleCtx?.owner) return;
    if (!file.type.startsWith('image/')) { toast(t('Selecione uma imagem.')); return; }
    try { const data = await compressImage(file); await update(ref(db,`campaigns/${battleCtx.campaignId}`), { image: data }); toast(t('Foto da campanha atualizada.')); renderCampaigns(); }
    catch (error) { toast(errText(error)); }
  }
});
$('campaign-detail').addEventListener('submit', async (event) => {
  if (event.target.id !== 'monster-form') return; event.preventDefault(); if (!battleCtx?.owner) return;
  const name = $('monster-name').value.trim(); if (!name) return;
  const monster = { name, harmMax: Math.max(1, Math.min(20, Number($('monster-harm').value) || 8)), harm: 0, armor: Math.max(0, Math.min(5, Number($('monster-armor').value) || 0)), attack: $('monster-attack').value.trim(), minion: $('monster-minion').checked, created: Date.now() };
  logBattle(`${t('Entrou em cena')}: ${name}`);
  await setBattle(`monsters/${crypto.randomUUID()}`, monster);
});
$('campaign-list').addEventListener('click', (event) => { const button = event.target.closest('[data-campaign]'); if (button) { activeCampaignId = button.dataset.campaign; renderCampaigns(); } });
$('create-campaign-form').addEventListener('submit', async (event) => {
  event.preventDefault(); if (!user) return;
  const name = $('campaign-name').value.trim(); if (!name) return;
  const id = crypto.randomUUID();
  try { await set(ref(db,`campaigns/${id}`),{name,ownerUid:user.uid,members:{[user.uid]:true}}); await set(ref(db,`users/${user.uid}/campaigns/${id}`),true); campaignIds[id] = true; activeCampaignId = id; $('campaign-name').value = ''; renderCampaigns(); toast(t('Campanha criada.')); }
  catch (error) { toast(errText(error)); }
});
$('join-campaign-form').addEventListener('submit', async (event) => {
  event.preventDefault(); if (!user) return;
  const raw = $('campaign-code').value.trim(); let id = raw;
  try { id = new URL(raw).searchParams.get('campaign') || raw; } catch {}
  if (!/^[0-9a-f-]{36}$/i.test(id)) { toast(t('Código de campanha inválido.')); return; }
  try { await set(ref(db,`campaigns/${id}/members/${user.uid}`),true); await set(ref(db,`users/${user.uid}/campaigns/${id}`),true); campaignIds[id] = true; activeCampaignId = id; renderCampaigns(); toast(t('Você entrou na campanha.')); }
  catch (error) { toast(errText(error)); }
});
$('campaign-detail').addEventListener('click', async (event) => {
  if (event.target.id === 'copy-campaign') { try { await navigator.clipboard.writeText(campaignUrl(activeCampaignId)); toast(t('Link copiado.')); } catch { toast(t('Não foi possível copiar o link.')); } return; }
  const unlink = event.target.closest('[data-unlink]'); if (!unlink || !user) return;
  const id = unlink.dataset.unlink; if (characters[id]?.campaignId !== activeCampaignId) return;
  try { await update(ref(db),{[`${charPath(id)}/campaignId`]:null,[`campaigns/${activeCampaignId}/sheets/${id}`]:null}); delete characters[id].campaignId; renderCampaigns(); toast(t('Personagem desvinculado.')); }
  catch (error) { toast(errText(error)); }
});
$('campaign-detail').addEventListener('submit', async (event) => {
  if (event.target.id !== 'link-sheet-form') return;
  event.preventDefault(); const id = $('link-sheet').value;
  if (!user || !activeCampaignId || !characters[id] || characters[id].campaignId) return;
  try { await update(ref(db),{[`${charPath(id)}/campaignId`]:activeCampaignId,[`campaigns/${activeCampaignId}/sheets/${id}`]:user.uid}); characters[id].campaignId = activeCampaignId; renderCampaigns(); toast(t('Personagem vinculado.')); }
  catch (error) { toast(errText(error)); }
});

$('new-character').addEventListener('click', () => {
  const dialog = document.createElement('dialog'); dialog.className = 'archetype-dialog';
  dialog.innerHTML = `<div class="dialog-top"><h2>${t('Escolha uma cartilha')}</h2><button class="text-button" data-close>${t('Fechar')}</button></div><div class="archetype-grid">${Object.keys(playbooks).map((name) => `<button data-archetype="${escapeHtml(name)}"><img src="${artFor(name)}" alt=""><strong>${escapeHtml(t(name))}</strong><small>${escapeHtml(t(specialFields[name]))}</small></button>`).join('')}</div>`;
  document.body.append(dialog); dialog.showModal();
  dialog.addEventListener('click', async (event) => {
    if (event.target.matches('[data-close]')) { dialog.close(); dialog.remove(); return; }
    const choice = event.target.closest('[data-archetype]'); if (!choice) return;
    const archetype = choice.dataset.archetype; const id = crypto.randomUUID();
    const character = { name:'', archetype, appearance:'', ratings:playbooks[archetype].ratings[0], preset:0, luck:0, harm:0, xp:0, unstable:false, selectedMoves:[], moves:'', gear:'', special:'', history:'', notes:'', updatedAt:Date.now() };
    try { await set(ref(db,charPath(id)),character); characters[id] = character; dialog.close(); dialog.remove(); openCharacter(id); toast(t('Caçador criado.')); }
    catch (error) { toast(errText(error)); }
  });
});

function openCharacter(id, preserveRoll = false) {
  const c = characters[id]; if (!c) return;
  const selectedStat = preserveRoll ? $('roll-stat').value : '0';
  if (!preserveRoll) lastRoll = null;
  activeId = id; $('library-view').classList.add('hidden'); $('campaign-view').classList.add('hidden'); $('sheet-view').classList.remove('hidden'); document.querySelector('.app-tabs').classList.add('hidden');
  $('save-status').textContent = activeCanEdit ? t('Salvo na nuvem') : t('Somente leitura'); $('sheet-number').textContent = `ID #${id.slice(0,8).toUpperCase()}`;
  $('character-name').value = c.name || ''; $('appearance').value = c.appearance || '';
  $('archetype-badge').textContent = t(c.archetype); $('special-label').firstChild.textContent = `${t('Outras anotações do arquétipo')} `;
  for (const key of ['moves','gear','special','history','notes']) $(key).value = c[key] || '';
  $('unstable').checked = !!c.unstable;
  const choices = playbooks[c.archetype]?.ratings || [];
  $('rating-preset').innerHTML = choices.map((row,index) => `<option value="${index}">${t('Opção')} ${index+1} · ${row.map((v,i) => `${t(stats[i])} ${v>=0?'+':''}${v}`).join(' / ')}</option>`).join('') + `<option value="custom">${t('Personalizada')}</option>`;
  const presetMatch = choices.findIndex((row) => row.every((v,i) => v === Number(c.ratings?.[i])));
  $('rating-preset').value = presetMatch >= 0 ? String(presetMatch) : 'custom';
  renderRatings(); renderBasicMoves(); renderTracks(); renderPortrait(); renderStartingMoves(); renderMoveOptions(); renderHuntDetails();
  $('roll-stat').innerHTML = stats.map((s,i) => `<option value="${i}">${t(s)}</option>`).join('');
  $('roll-stat').value = selectedStat;
  renderRoll();
  for (const input of $('sheet-view').querySelectorAll('input,textarea,select')) if (input.id !== 'roll-stat') input.disabled = !activeCanEdit;
  for (const button of $('sheet-view').querySelectorAll('.track-boxes button')) button.disabled = !activeCanEdit;
  $('portrait-wrap').querySelector('.portrait-upload').classList.toggle('hidden', !activeCanEdit);
  $('delete-character').classList.toggle('hidden', !user || activeOwnerUid !== user.uid);
  $('share-character').classList.toggle('hidden', !user || activeOwnerUid !== user.uid);
  if (!preserveRoll) window.scrollTo({top:0,behavior:'smooth'});
}
function renderRoll() { $('roll-result').innerHTML = lastRoll ? `<span>${lastRoll.total}</span><small>${lastRoll.dice[0]} + ${lastRoll.dice[1]} ${lastRoll.stat>=0?'+':'−'} ${Math.abs(lastRoll.stat)} · ${t(lastRoll.outcome)}</small>` : '<span>—</span>'; }
function renderPortrait() { const src = images[activeId] || artFor(characters[activeId]?.archetype); $('portrait').classList.remove('hidden'); $('portrait-placeholder').classList.add('hidden'); $('portrait').src = src; }
function renderRatings() {
  const c = characters[activeId];
  $('ratings').innerHTML = stats.map((name,i) => `<div class="rating"><label for="stat-${i}">${t(name)}</label><input id="stat-${i}" type="number" min="-3" max="4" step="1" value="${Number(c.ratings?.[i])||0}" aria-label="${t(name)}"><small>${t(moves[i])}</small></div>`).join('');
}
function renderBasicMoves() {
  $('basic-moves').innerHTML = basicHelp.map((description,i) => `<details><summary>${t(moves[i])}</summary><p>${escapeHtml(description[locale === 'en' ? 1 : 0])}</p></details>`).join('');
}
function renderTracks() {
  const c = characters[activeId];
  for (const [key,count] of [['luck',7],['harm',7],['xp',5]]) $(key+'-track').innerHTML = Array.from({length:count},(_,i) => `<button type="button" data-track="${key}" data-value="${i+1}" class="${i < (Number(c[key])||0) ? 'filled' : ''}" aria-label="${t({luck:'Sorte',harm:'Dano',xp:'Experiência'}[key])} ${i+1} ${locale === 'en' ? 'of' : 'de'} ${count}" aria-pressed="${i < (Number(c[key])||0)}">${i < (Number(c[key])||0) ? '×' : ''}</button>`).join('');
}
function renderStartingMoves() {
  const entries = startingHelp[characters[activeId].archetype] || [];
  $('starting-moves').innerHTML = entries.length ? `<h3>${t('Movimentos iniciais')}</h3>${entries.map(([ptName,pt,enName,en]) => `<div class="move-item move-fixed"><strong>${escapeHtml(locale === 'en' ? enName : ptName)}<span class="move-tag">${t('Incluído')}</span></strong><p>${escapeHtml(locale === 'en' ? en : pt)}</p></div>`).join('')}` : '';
}
function renderMoveOptions() {
  const c = characters[activeId];
  $('move-options').innerHTML = (playbooks[c.archetype]?.moves || []).map((name,index) => `<label class="move-item move-choice"><input type="checkbox" data-move="${index}" ${c.selectedMoves?.includes(name) ? 'checked' : ''}><span class="move-text"><strong>${escapeHtml(locale === 'en' ? englishMoves[c.archetype]?.[index] || name : name)}</strong><p>${escapeHtml(playbookHelp[c.archetype][index][locale === 'en' ? 1 : 0])}</p></span></label>`).join('');
}
function renderHuntDetails() {
  const c = characters[activeId]; const defs = huntDetails[c?.archetype] || []; const d = c?.details || {};
  const L = (x) => x?.[locale === 'en' ? 'en' : 'pt'] || '';
  $('hunt-details').innerHTML = defs.map((f) => {
    if (f.type === 'text') return `<div class="hunt-field ${String(d[f.key] || '').trim() ? 'done' : 'pending'}"><label class="hunt-label" for="hd-${f.key}">${escapeHtml(L(f.label))}</label><textarea id="hd-${f.key}" data-detail-text="${f.key}" rows="3" placeholder="${escapeHtml(L(f.placeholder))}">${escapeHtml(d[f.key] || '')}</textarea></div>`;
    const sel = Array.isArray(d[f.key]) ? d[f.key] : []; const names = d[`${f.key}_names`] || {};
    const goal = f.min === f.max ? `${f.max}` : f.max >= f.options.length ? `${f.min}+` : `${f.min}–${f.max}`;
    const missing = Math.max(0, f.min - sel.length);
    const status = missing ? `<span class="hunt-status">${locale === 'en' ? `${missing} left` : `falta${missing > 1 ? 'm' : ''} ${missing}`}</span>` : '<span class="hunt-status ok">✓</span>';
    const chips = f.options.map((opt,i) => { const on = sel.includes(opt.pt); const full = !on && f.max > 1 && sel.length >= f.max; return `<label class="hunt-chip"><input type="checkbox" data-detail="${f.key}" data-index="${i}" ${on ? 'checked' : ''} ${full ? 'disabled' : ''}><span>${escapeHtml(L(opt))}</span></label>`; }).join('');
    const named = f.named ? f.options.map((opt,i) => sel.includes(opt.pt) ? `<label class="hunt-name"><span>${escapeHtml(L(opt))}</span><input data-detail-name="${f.key}" data-index="${i}" maxlength="120" placeholder="${escapeHtml(L(f.namePlaceholder))}" value="${escapeHtml(names['o'+i] || '')}"></label>` : '').join('') : '';
    return `<fieldset class="hunt-field ${missing ? 'pending' : 'done'}"><legend><span class="hunt-label">${escapeHtml(L(f.label))}</span><span class="hunt-goal">${t('Escolha')} ${goal}</span>${status}</legend>${f.hint ? `<p class="hunt-hint">${escapeHtml(L(f.hint))}</p>` : ''}<div class="hunt-options">${chips}</div>${named ? `<div class="hunt-names">${named}</div>` : ''}</fieldset>`;
  }).join('');
  if (!activeCanEdit) for (const input of $('hunt-details').querySelectorAll('input,textarea')) input.disabled = true;
}
$('hunt-details').addEventListener('change', (event) => {
  const input = event.target.closest('[data-detail]'); if (!input || !activeCanEdit) return;
  const c = characters[activeId]; const f = (huntDetails[c.archetype] || []).find((x) => x.key === input.dataset.detail); if (!f) return;
  c.details ||= {}; const option = f.options[Number(input.dataset.index)].pt;
  let sel = Array.isArray(c.details[f.key]) ? c.details[f.key].filter((x) => x !== option) : [];
  if (input.checked) sel = f.max === 1 ? [option] : [...sel, option].slice(0, f.max);
  c.details[f.key] = sel; renderHuntDetails(); scheduleSave();
});
$('hunt-details').addEventListener('input', (event) => {
  if (!activeCanEdit) return; const c = characters[activeId]; c.details ||= {};
  const text = event.target.closest('[data-detail-text]'); const name = event.target.closest('[data-detail-name]');
  if (text) { c.details[text.dataset.detailText] = text.value; text.closest('.hunt-field').classList.toggle('pending', !text.value.trim()); text.closest('.hunt-field').classList.toggle('done', !!text.value.trim()); scheduleSave(); }
  else if (name) { const key = `${name.dataset.detailName}_names`; c.details[key] = { ...(c.details[key] || {}), ['o' + name.dataset.index]: name.value }; scheduleSave(); }
});
function scheduleSave() { if (!activeId) return; $('save-status').textContent = t('Alterações pendentes…'); clearTimeout(saveTimer); saveTimer = setTimeout(saveCharacter,700); }
async function saveCharacter() { if (!activeId || !activeCanEdit) return; const id = activeId; const uid = activeOwnerUid; const c = characters[id]; if (!c) return; c.updatedAt = Date.now(); $('save-status').textContent = t('Salvando…'); try { await set(ref(db,charPath(id,uid)),c); if (activeId === id) $('save-status').textContent = t('Salvo na nuvem'); } catch (error) { $('save-status').textContent = t('Erro ao salvar'); toast(errText(error)); } }
for (const key of ['name','appearance','moves','gear','special','history','notes']) {
  const id = key === 'name' ? 'character-name' : key;
  $(id).addEventListener('input', () => { if (!activeId) return; characters[activeId][key] = $(id).value; scheduleSave(); });
}
$('unstable').addEventListener('change', () => { characters[activeId].unstable = $('unstable').checked; scheduleSave(); });
$('rating-preset').addEventListener('change', () => { const c = characters[activeId]; c.preset = $('rating-preset').value; if (c.preset !== 'custom') c.ratings = [...playbooks[c.archetype].ratings[Number(c.preset)]]; renderRatings(); scheduleSave(); });
$('ratings').addEventListener('change', (event) => { const input = event.target.closest('input[id^="stat-"]'); if (!input) return; const value = Number(input.value); if (!Number.isInteger(value) || value < -3 || value > 4) { input.value = characters[activeId].ratings[Number(input.id.slice(5))]; toast(t('Use um valor inteiro entre −3 e +4.')); return; } const c = characters[activeId]; c.ratings[Number(input.id.slice(5))] = value; const match = (playbooks[c.archetype]?.ratings || []).findIndex((row) => row.every((v,i) => v === Number(c.ratings[i]))); c.preset = match >= 0 ? match : 'custom'; $('rating-preset').value = String(c.preset); scheduleSave(); });
$('move-options').addEventListener('change', (event) => { const input = event.target.closest('[data-move]'); if (!input) return; const c = characters[activeId]; const name = playbooks[c.archetype].moves[Number(input.dataset.move)]; const selected = new Set(c.selectedMoves || []); if (input.checked) selected.add(name); else selected.delete(name); c.selectedMoves = [...selected]; scheduleSave(); });
for (const key of ['luck','harm','xp']) $(key+'-track').addEventListener('click', (event) => { const button = event.target.closest('[data-value]'); if (!button) return; const c = characters[activeId]; const value = Number(button.dataset.value); c[key] = c[key] === value ? value-1 : value; if (key === 'harm' && c.harm >= 4) { c.unstable = true; $('unstable').checked = true; } renderTracks(); scheduleSave(); });
$('roll-button').addEventListener('click', () => { const c = characters[activeId]; if (!c) return; const dice = [1,2].map(() => crypto.getRandomValues(new Uint32Array(1))[0] % 6 + 1); const stat = Number(c.ratings[Number($('roll-stat').value)]) || 0; const total = dice[0]+dice[1]+stat; const outcome = total >= 10 ? 'Sucesso total' : total >= 7 ? 'Sucesso com complicação' : 'Marque experiência'; lastRoll = {dice,stat,total,outcome}; renderRoll(); });
$('delete-character').addEventListener('click', () => deleteCharacter(activeId));
async function deleteCharacter(id) {
  if (!user || !characters[id]) return;
  if (!await confirmDialog({ title: t('Excluir ficha'), message: `${characters[id].name || t('Caçador sem nome')}: ${t('a ficha e o retrato serão apagados permanentemente. Não é possível desfazer.')}`, confirm: t('Excluir'), danger: true })) return;
  const changes = { [charPath(id)]: null, [imagePath(id)]: null };
  if (characters[id].campaignId) changes[`campaigns/${characters[id].campaignId}/sheets/${id}`] = null;
  try { await update(ref(db), changes); delete characters[id]; delete images[id]; showLibrary(); toast(t('Ficha excluída.')); }
  catch (error) { toast(errText(error)); }
}
function shareCharacter(id) {
  if (!user || !characters[id]) return;
  const dialog = document.createElement('dialog'); dialog.className = 'share-dialog';
  dialog.innerHTML = `<h2>${t('Compartilhar ficha')}</h2><p>${escapeHtml(characters[id].name || t('Caçador sem nome'))}</p><label for="share-mode">${t('Acesso pelo link')}</label><select id="share-mode"><option value="private">${t('Privada')}</option><option value="read">${t('Somente leitura')}</option><option value="edit">${t('Pode editar')}</option></select><label for="share-link">${t('Link da ficha')}</label><input id="share-link" readonly><div class="dialog-actions"><button type="button" class="button outline" id="copy-share">${t('Copiar link')}</button><button type="button" class="button primary" id="close-share">${t('Fechar')}</button></div>`;
  document.body.append(dialog); dialog.showModal();
  const mode = dialog.querySelector('#share-mode'); const link = dialog.querySelector('#share-link'); const copy = dialog.querySelector('#copy-share');
  const refresh = () => { link.value = mode.value === 'private' ? '' : sheetUrl(user.uid,id); copy.disabled = mode.value === 'private'; };
  mode.value = characters[id].shareMode || 'private'; refresh();
  mode.addEventListener('change', async () => {
    const previous = characters[id].shareMode || 'private';
    if (mode.value !== 'private' && mode.value !== previous) {
      const ok = await confirmDialog(mode.value === 'edit'
        ? { title: t('Permitir edição pelo link?'), message: t('Qualquer pessoa com o link poderá ver e alterar esta ficha, sem entrar em uma conta.'), confirm: t('Permitir edição'), danger: true }
        : { title: t('Tornar a ficha pública?'), message: t('Qualquer pessoa com o link poderá ver esta ficha, sem entrar em uma conta.'), confirm: t('Tornar pública') });
      if (!ok) { mode.value = previous; refresh(); return; }
    }
    const next = {...characters[id]}; if (mode.value === 'private') delete next.shareMode; else next.shareMode = mode.value;
    try { await set(ref(db,charPath(id)),next); characters[id] = next; refresh(); toast(t('Acesso atualizado.')); }
    catch (error) { mode.value = characters[id].shareMode || 'private'; refresh(); toast(errText(error)); }
  });
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(link.value); toast(t('Link copiado.')); } catch { link.select(); toast(t('Copie o link selecionado.')); } });
  dialog.querySelector('#close-share').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
}
$('share-character').addEventListener('click', () => shareCharacter(activeId));
$('portrait-input').addEventListener('change', async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file || !activeId || !activeCanEdit) return; if (!file.type.startsWith('image/')) { toast(t('Selecione uma imagem.')); return; } const id = activeId; const uid = activeOwnerUid; try { $('save-status').textContent = t('Comprimindo imagem…'); const data = await compressImage(file); await set(ref(db,imagePath(id,uid)),data); images[id] = data; renderPortrait(); $('save-status').textContent = t('Retrato salvo na nuvem'); toast(t('Retrato atualizado.')); } catch (error) { $('save-status').textContent = t('Erro ao salvar imagem'); toast(errText(error)); } });

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  try {
    for (const maxSide of [384,320,256,192]) {
      const scale = Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      for (const quality of [.78,.62,.45]) {
        const data = canvas.toDataURL('image/webp',quality);
        if (!data.startsWith('data:image/webp;')) throw Error(t('Este navegador não suporta a compressão WebP.'));
        if (data.length <= 80_000) return data;
      }
    }
    throw Error(t('A imagem ficou grande demais. Escolha outra imagem.'));
  } finally { bitmap.close(); }
}
