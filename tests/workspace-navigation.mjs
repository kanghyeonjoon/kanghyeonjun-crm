import assert from 'node:assert/strict';
import {activeWorkspaceItem,workspaceGroups} from '../lib/workspace-navigation.ts';
for(const g of workspaceGroups)for(const item of g.items){if(item.external)continue;const u=new URL(item.href,'https://crm.mongpd.com');assert.equal(activeWorkspaceItem(u.pathname,u.searchParams.get('tab')),item.id);}
assert.equal(activeWorkspaceItem('/workspace','unknown'),'hospitals');
assert.equal(activeWorkspaceItem('/workspace/finance/clobe','unknown'),'overview');
assert.equal(activeWorkspaceItem('/workspace/integrations/solapi',null),'diagnoses');
assert.deepEqual(workspaceGroups.map(g=>g.label),['마케팅','CRM','재무 관리']);
console.log('workspace navigation: every destination, defaults and nested routes passed');
