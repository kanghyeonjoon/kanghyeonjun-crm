import assert from 'node:assert/strict';
import {transactionRow,filterTransactions,transactionTotals} from '../lib/granter-transactions.ts';
const rows=[transactionRow({id:1,amount:1000,transactionType:'IN',contact:'고객사',content:'입금',expenseCategory:{name:'매출'},ticketReferences:[{targetType:'WORKFLOW',targetId:3}],bankTransaction:{bankAccount:{id:5,organizationName:'국민은행',nickname:'운영',number:'••••1234'}}}),transactionRow({id:2,amount:300,transactionType:'OUT',contact:{companyName:'외주사'},assetId:6}),transactionRow({id:3,amount:500,transactionType:'OUT',isIncluded:false}),transactionRow({id:4,amount:-50,transactionType:'OUT',contact:'환불'}),transactionRow({id:5,amount:null,transactionType:'IN'})];
assert.equal(rows[0].contactName,'고객사');assert.match(rows[0].accountLabel,/국민은행.*운영.*1234/);assert.equal(rows[0].linkedCount,1);assert.equal(rows[1].linkedCount,null);assert.equal(rows[1].contactName,'외주사');
assert.deepEqual(transactionTotals(rows),{income:1000,expense:250,net:750,excluded:1,unknown:1});
assert.deepEqual(filterTransactions(rows,'국민은행','IN','5',false).map(r=>r.id),[1]);
assert.equal(filterTransactions(rows,'','ALL','ALL',true).length,4);
assert.equal(filterTransactions(rows,'고객사','OUT','ALL',false).length,0);
assert.equal(rows.length,5);console.log('Transaction tests passed: account/contact formats, V2 references, refunds, exclusion, missing amounts and combined filters');
