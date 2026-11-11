// Sow Tracker online service: notifications, and sharing records between phones.
//
// What it stores for each phone: the phone's push address, its time zone, and a
// list of DATES on which something is due. It never receives sow names, boars or
// records. The phone itself fills in the details when the notification arrives.
//
// Once an hour it checks each phone: if today (in that phone's time zone) is on
// its list and it is 6 AM or later, it sends one silent "wake up" push. The app
// on the phone then shows the notification with the sow details.

import { DurableObject } from 'cloudflare:workers';

const ALLOWED_ORIGINS = ['https://carsonowens24.github.io'];
const CONTACT = 'https://carsonowens24.github.io/sow-tracker/';
const MAX_PHONES = 50;
const MAX_DATES = 800;

/* ---------- small helpers ---------- */
const enc = new TextEncoder();
function b64url(bytes) {
  let s = '';
  new Uint8Array(bytes).forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(text) {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
async function hash(text) {
  return b64url(await crypto.subtle.digest('SHA-256', enc.encode(text))).slice(0, 32);
}
function validEndpoint(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /(^|\.)push\.apple\.com$|(^|\.)googleapis\.com$|(^|\.)mozilla\.com$|(^|\.)windows\.com$/.test(u.hostname);
  } catch (e) { return false; }
}
function localNow(tz) {
  // Today's date and hour in the phone's own time zone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}
function validZone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
}

/* ---------- storage and sending (one shared object) ---------- */
export class Store extends DurableObject {
  // The service's identity for push providers. Made once, then reused.
  async keys() {
    let k = await this.ctx.storage.get('vapid');
    if (!k) {
      const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      k = {
        privateKey: b64url(await crypto.subtle.exportKey('pkcs8', pair.privateKey)),
        publicKey: b64url(await crypto.subtle.exportKey('raw', pair.publicKey))
      };
      await this.ctx.storage.put('vapid', k);
    }
    return k;
  }
  async publicKey() { return (await this.keys()).publicKey; }

  async saveSub(endpoint, dates, tz, hour) {
    const id = 'sub:' + await hash(endpoint);
    const existing = await this.ctx.storage.get(id);
    if (!existing) {
      const all = await this.ctx.storage.list({ prefix: 'sub:' });
      if (all.size >= MAX_PHONES) return false;
    }
    await this.ctx.storage.put(id, { endpoint, dates, tz, hour, lastSent: existing ? existing.lastSent : '', lastStatus: existing ? existing.lastStatus || 0 : 0 });
    return true;
  }
  async removeSub(endpoint) {
    await this.ctx.storage.delete('sub:' + await hash(endpoint));
  }

  // Send one empty push. Returns the provider's HTTP status.
  async push(endpoint) {
    const k = await this.keys();
    const key = await crypto.subtle.importKey('pkcs8', fromB64url(k.privateKey), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const head = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
    const body = b64url(enc.encode(JSON.stringify({
      aud: new URL(endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600,
      sub: CONTACT
    })));
    const sig = b64url(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + body)));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `vapid t=${head}.${body}.${sig}, k=${k.publicKey}`,
        TTL: '43200',
        Urgency: 'high'
      }
    });
    return res.status;
  }

  async test(endpoint) {
    const sub = await this.ctx.storage.get('sub:' + await hash(endpoint));
    if (!sub) return 404;
    try { return await this.push(sub.endpoint); } catch (e) { console.log('push failed:', e && e.message); return 0; }
  }

  // What the service has on file for one phone, so the app can show whether reminders are set up right.
  async info(endpoint) {
    const sub = await this.ctx.storage.get('sub:' + await hash(endpoint));
    const lastCheck = (await this.ctx.storage.get('lastCheck')) || 0;
    if (!sub) return { found: false, lastCheck };
    const now = localNow(sub.tz);
    const upcoming = sub.dates.filter((d) => d >= now.date);
    return {
      found: true, lastCheck, tz: sub.tz, hour: sub.hour, today: now.date, hourNow: now.hour,
      count: upcoming.length, next: upcoming[0] || '', dueToday: upcoming[0] === now.date,
      sentToday: sub.lastSent === now.date, lastStatus: sub.lastStatus || 0
    };
  }

  // Runs every hour.
  async sendDue() {
    await this.ctx.storage.put('lastCheck', Date.now());
    const all = await this.ctx.storage.list({ prefix: 'sub:' });
    let sent = 0;
    for (const [id, sub] of all) {
      const now = localNow(sub.tz);
      if (now.hour < sub.hour || sub.lastSent === now.date || !sub.dates.includes(now.date)) continue;
      let status = 0;
      try { status = await this.push(sub.endpoint); } catch (e) { console.log('push failed:', e && e.message); status = 0; }
      if (status === 404 || status === 410) { await this.ctx.storage.delete(id); continue; }   // phone unsubscribed
      sub.lastStatus = status;
      if (status >= 200 && status < 300) {
        sub.lastSent = now.date;
        sub.dates = sub.dates.filter((d) => d >= now.date);
        await this.ctx.storage.put(id, sub);
        sent++;
      } else await this.ctx.storage.put(id, sub);
    }
    return sent;
  }
}

/* ---------- sharing between phones (one object per farm) ---------- */
// Phones that know the same share code keep one combined set of records here.
// For each record the newest change wins, and a deleted record is remembered as
// deleted so it does not come back from another phone.
const MAX_RECORDS = 20000;
function cleanRecord(r) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
  if (typeof r.id !== 'string' || !/^[a-z0-9]{4,40}$/i.test(r.id)) return null;
  if (typeof r.updated !== 'number' || !isFinite(r.updated)) return null;
  if (JSON.stringify(r).length > 1500) return null;
  return r;
}
export class Farm extends DurableObject {
  async create() {
    if (!(await this.ctx.storage.get('meta'))) await this.ctx.storage.put('meta', { created: Date.now(), ver: 1 });
    return true;
  }
  // records: everything the phone has (or null if it has nothing new). ver: the version the phone last saw.
  async sync(records, ver) {
    const meta = await this.ctx.storage.get('meta');
    if (!meta) return null;                                   // no farm with this code
    if (!records && ver === meta.ver) return { same: true, ver: meta.ver };
    const all = await this.ctx.storage.list({ prefix: 'r:' });
    const changed = {};
    let count = all.size;
    for (const raw of records || []) {
      const r = cleanRecord(raw);
      if (!r) continue;
      const have = all.get('r:' + r.id);
      if (have && have.updated >= r.updated) continue;
      if (!have && count >= MAX_RECORDS) continue;
      if (!have) count++;
      changed['r:' + r.id] = r;
      all.set('r:' + r.id, r);
    }
    const keys = Object.keys(changed);
    for (let i = 0; i < keys.length; i += 100) {
      const batch = {};
      keys.slice(i, i + 100).forEach((k) => { batch[k] = changed[k]; });
      await this.ctx.storage.put(batch);
    }
    if (keys.length) { meta.ver++; await this.ctx.storage.put('meta', meta); }
    return { ver: meta.ver, records: [...all.values()] };
  }
}
function shareCode(v) {
  const code = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z0-9]{12}$/.test(code) ? code : null;
}

/* ---------- web addresses the app talks to ---------- */
function cors(request) {
  const origin = request.headers.get('Origin') || '';
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}
function reply(request, data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors(request) } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const store = env.STORE.get(env.STORE.idFromName('main'));
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });

    if (request.method === 'GET' && url.pathname === '/') return reply(request, { ok: true, service: 'sow-tracker-notify' });
    if (request.method === 'GET' && url.pathname === '/key') return reply(request, { key: await store.publicKey() });

    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return reply(request, { error: 'bad request' }, 400); }
      if (url.pathname === '/share/create' || url.pathname === '/share/sync') {
        const code = shareCode(body && body.code);
        if (!code) return reply(request, { error: 'bad code' }, 400);
        const farm = env.FARM.get(env.FARM.idFromName('farm:' + code));
        if (url.pathname === '/share/create') { await farm.create(); return reply(request, { ok: true }); }
        const records = Array.isArray(body.records) ? body.records.slice(0, MAX_RECORDS) : null;
        const out = await farm.sync(records, Number(body.ver) || 0);
        return out ? reply(request, { ok: true, ...out }) : reply(request, { error: 'no farm' }, 404);
      }
      const endpoint = body && body.endpoint;
      if (typeof endpoint !== 'string' || endpoint.length > 2000 || !validEndpoint(endpoint)) return reply(request, { error: 'bad endpoint' }, 400);

      if (url.pathname === '/sync') {
        const dates = Array.isArray(body.dates)
          ? [...new Set(body.dates.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort().slice(0, MAX_DATES)
          : [];
        const tz = typeof body.tz === 'string' && validZone(body.tz) ? body.tz : 'America/Chicago';
        const hour = Number.isInteger(body.hour) && body.hour >= 0 && body.hour <= 23 ? body.hour : 6;
        const ok = await store.saveSub(endpoint, dates, tz, hour);
        return ok ? reply(request, { ok: true, dates: dates.length }) : reply(request, { error: 'full' }, 429);
      }
      if (url.pathname === '/test') {
        const status = await store.test(endpoint);
        return reply(request, { ok: status >= 200 && status < 300, status });
      }
      if (url.pathname === '/status') return reply(request, { ok: true, ...(await store.info(endpoint)) });
      if (url.pathname === '/off') {
        await store.removeSub(endpoint);
        return reply(request, { ok: true });
      }
    }
    return reply(request, { error: 'not found' }, 404);
  },

  async scheduled(controller, env, ctx) {
    const store = env.STORE.get(env.STORE.idFromName('main'));
    ctx.waitUntil(store.sendDue());
  }
};
