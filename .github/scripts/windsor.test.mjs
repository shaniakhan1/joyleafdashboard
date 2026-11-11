import test from 'node:test';
import assert from 'node:assert/strict';
import { windsorSources, parseWindsorDaily, parseWindsorFollowers, requestWindsor, fetchWindsorSource } from './windsor.mjs';

const period = { start_date: '2026-11-01', end_date: '2026-11-02' };
const source = windsorSources.instagram;
const rows = [1, 2].map(day => ({ account_id: source.account, date: `2026-11-0${day}`, views: '7', total_interactions: 2, follower_count_1d: 0, reach: 5 }));

test('Windsor sums complete daily additive metrics including real zero, never daily unique reach', () => {
  assert.deepEqual(parseWindsorDaily(rows, source, period), { views: 14, interactions: 4, new_follows: 0 });
});
test('Windsor rejects missing dates, duplicate dates, other accounts and dates outside window', () => {
  for (const bad of [rows.slice(0, 1), [...rows, rows[0]], rows.map(row => ({ ...row, account_id: 'another-client' })), rows.map(row => ({ ...row, date: '2026-10-31' }))]) assert.throws(() => parseWindsorDaily(bad, source, period));
});
test('missing or invalid fields are withheld, not converted to zero', () => {
  for (const bad of [null, undefined, '', 'invalid', -1, 0.5]) {
    const result = parseWindsorDaily(rows.map(row => ({ ...row, views: bad })), source, period);
    assert.equal(result.views, undefined);
    assert.equal(result.interactions, 4);
  }
});
test('LinkedIn followers is one current snapshot, not a summed daily count', () => {
  const row = { account_id: windsorSources.linkedin.account, organization_follower_count: '705', date: null };
  assert.equal(parseWindsorFollowers([row], row.account_id), 705);
  assert.throws(() => parseWindsorFollowers([row, row], row.account_id));
  assert.throws(() => parseWindsorFollowers([row], 'wrong-account'));
});
test('request is account-scoped, fixed-host, nonredirecting and only returns rows', async () => {
  const actual = await requestWindsor(source, ['date','views'], period, 'test-only-placeholder', async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://connectors.windsor.ai');
    assert.equal(parsed.searchParams.get('select_accounts'), source.account);
    assert.equal(parsed.searchParams.get('date_from'), period.start_date);
    assert.equal(options.redirect, 'error');
    return { ok: true, json: async () => ({ data: rows }) };
  });
  assert.deepEqual(actual, rows);
});
test('raw errors, query URLs and provider bodies never appear in published failures', async () => {
  const key = 'test-only-placeholder';
  const failures = [async () => { throw new Error(`https://provider/?api_key=${key}`); }, async () => ({ ok:false, status:403, json:async()=>({error:key}) }), async () => ({ ok:true, json:async()=>({error:key}) })];
  for (const request of failures) {
    const result = await fetchWindsorSource('instagram', key, new Date('2026-11-09T00:00:00Z'), request);
    assert.equal(result.status, 'failed');
    assert.ok(!JSON.stringify(result).includes(key));
    assert.deepEqual(result.metrics, {});
  }
});
test('no credential means no network call', async () => {
  const result = await fetchWindsorSource('facebook', '', new Date(), async () => { throw new Error('must not call'); });
  assert.equal(result.status, 'unavailable');
});

test('impossible calendar dates cannot replace a missing expected day', () => {
  const crossMonth = { start_date: '2026-10-12', end_date: '2026-11-08' };
  const complete = Array.from({ length: 28 }, (_, index) => ({ ...rows[0], date: new Date(Date.UTC(2026, 9, 12 + index)).toISOString().slice(0, 10) }));
  assert.equal(parseWindsorDaily(complete, source, crossMonth).views, 196);
  for (const impossible of ['2026-10-32', '2026-10-99']) {
    assert.throws(() => parseWindsorDaily(complete.map((row, index) => index ? row : { ...row, date: impossible }), source, crossMonth), /invalid calendar dates/);
  }
  const february = { start_date: '2026-02-28', end_date: '2026-03-01' };
  assert.throws(() => parseWindsorDaily([{ ...rows[0], date: '2026-02-29' }, { ...rows[1], date: '2026-03-01' }], source, february), /invalid calendar dates/);
  assert.equal(parseWindsorDaily([{ ...rows[0], date: '2024-02-29' }, { ...rows[1], date: '2024-03-01' }], source, { start_date: '2024-02-29', end_date: '2024-03-01' }).views, 14);
});
test('invalid or reversed reporting window fails closed', () => {
  for (const invalid of [undefined, { start_date: '2026-02-30', end_date: '2026-03-02' }, { start_date: '2026-11-02', end_date: '2026-11-01' }]) {
    assert.throws(() => parseWindsorDaily(rows, source, invalid), /invalid calendar dates/);
  }
});
