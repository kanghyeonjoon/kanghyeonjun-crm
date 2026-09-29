import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(
  await fs.readFile("supabase/migrations/202609290001_crm.sql", "utf8"),
);
await db.exec(await fs.readFile('supabase/migrations/20260929085812_restrict_internal_functions.sql','utf8'));
const owner = "11111111-1111-4111-8111-111111111111",
  outsider = "22222222-2222-4222-8222-222222222222",
  viewer = "33333333-3333-4333-8333-333333333333";
await db.exec(
  `insert into auth.users values('${owner}','owner@example.test',now()),('${outsider}','outsider@example.test',now()),('${viewer}','viewer@example.test',now());insert into crm_private.invites values('owner@example.test','owner');insert into public.crm_members values('${viewer}','viewer',true);`,
);
async function as(id, sql) {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`,
  );
  return db.query(sql);
}
assert.equal(
  (await as(outsider, "select crm_enroll() as allowed")).rows[0].allowed,
  false,
);
await assert.rejects(() =>
  as(outsider, "insert into hospitals(name) values('Forbidden')"),
);
assert.equal(
  (await as(owner, "select crm_enroll() as allowed")).rows[0].allowed,
  true,
);
const hospital = (
  await as(
    owner,
    "insert into hospitals(name) values('Synthetic test clinic') returning id",
  )
).rows[0].id;
assert.equal((await as(outsider, "select * from hospitals")).rows.length, 0);
await assert.rejects(() =>
  as(owner, `update crm_members set role='owner' where user_id='${outsider}'`),
);
await assert.rejects(() => as(owner, "delete from hospitals"));
await as(
  owner,
  `insert into proposals(hospital_id,title,url) values('${hospital}','Test proposal','https://example.test/proposal')`,
);
await as(
  owner,
  `insert into opportunities(hospital_id,next_action) values('${hospital}','Review')`,
);
await assert.rejects(() =>
  as(
    owner,
    `insert into proposals(hospital_id,title,url) values('${hospital}','Bad URL','javascript:alert(1)')`,
  ),
);
assert.equal(
  (
    await as(
      owner,
      `update hospitals set name='Edited' where id='${hospital}' and version=1 returning version`,
    )
  ).rows[0].version,
  2,
);
assert.equal(
  (
    await as(
      owner,
      `update hospitals set name='Stale' where id='${hospital}' and version=1 returning id`,
    )
  ).rows.length,
  0,
);
assert.equal((await as(viewer, "select * from hospitals")).rows.length, 1);
await assert.rejects(() =>
  as(viewer, "insert into hospitals(name) values('Forbidden')"),
);
assert.equal(
  (
    await as(
      viewer,
      `update hospitals set name='Forbidden' where id='${hospital}' returning id`,
    )
  ).rows.length,
  0,
);
assert.equal((await as(owner, "select * from crm_audit")).rows.length, 4);
await assert.rejects(() => as(owner, "delete from crm_audit"));
await db.exec(
  `reset role;update crm_members set active=false where user_id='${owner}'`,
);
assert.equal((await as(owner, "select * from hospitals")).rows.length, 0);
await db.exec("reset role;set role anon");
assert.equal(
  (await db.query("select crm_health() as version")).rows[0].version,
  "crm_v1",
);
await assert.rejects(() => db.query("select * from hospitals"));
await assert.rejects(() => db.query("select crm_enroll()"));
await db.close();
console.log(
  "PASS: enrollment, unauthorized access, CRUD, URL constraints, version conflicts, viewer permissions, audit integrity, revoked access, anonymous health",
);
