import assert from 'node:assert/strict';
import {cashBasis,availableCash,collectionState,cashOutlook} from '../lib/granter-cash-plan.ts';
const bank={assetType:'BANK_ACCOUNT',currencyCode:'KRW',isLoan:false,currentBalance:1000};
assert.deepEqual(cashBasis({assets:[bank,{...bank,isLoan:true,currentBalance:9000},{...bank,currencyCode:'USD'},{...bank,assetType:'SECURITIES_ACCOUNT'}]}),{cash:1000,count:1,excluded:3});
assert.equal(cashBasis({assets:[]}).cash,null);assert.equal(cashBasis({assets:[{...bank,currentBalance:null}]}).cash,null);
assert.equal(availableCash(1000,'','',''),null);assert.equal(availableCash(null,'0','0','0'),null);assert.equal(availableCash(1000,'-1','0','0'),null);assert.equal(availableCash(1000,'1.1','0','0'),null);
assert.deepEqual(availableCash(1000,'200','100','50'),{available:650,shortfall:0,expenses:200,reserve:100,restricted:50});
assert.equal(availableCash(1000,'1200','0','0').shortfall,200);assert.equal(availableCash(1000,'1200','0','0').available,0);assert.equal(availableCash(-100,'0','0','0').shortfall,100);
assert.equal(collectionState({isActive:true,scrapHistory:null}).tone,'neutral');assert.equal(collectionState({isActive:false}).tone,'warn');assert.equal(collectionState({scrapHistory:{lastCompletedAt:'2026-10-14',lastFailedAt:'2026-10-15'}}).tone,'warn');assert.equal(collectionState({scrapHistory:{lastCompletedAt:'2026-10-15',lastFailedAt:'2026-10-14'}}).tone,'good');
console.log('Cash plan tests passed: currency/loan/securities exclusions, missing balance, input validation, shortfall and collection failures');

assert.equal(availableCash(1000,'200','100','50','300').available,350);
assert.equal(availableCash(1000,'800','0','0','400').shortfall,200);
assert.equal(availableCash(1000,'200','0','0',''),null);
assert.equal(availableCash(1000,'200','0','0','-1'),null);
assert.equal(availableCash(1000,'200','0','0','100000000000001'),null);

assert.deepEqual(cashOutlook(15575312,'2439490','','',''),{base:15575312,afterCard:13135822,afterLiving:null,spendable:null});
assert.deepEqual(cashOutlook(15575312,'2439490','1000000','2000000','1500000'),{base:15575312,afterCard:13135822,afterLiving:12135822,spendable:8635822});
assert.equal(cashOutlook(1000,'0','0','0','0').spendable,1000);
assert.equal(cashOutlook(null,'0','0','0','0').spendable,null);
assert.equal(cashOutlook(1000,'1200','0','0','0').spendable,-200);
