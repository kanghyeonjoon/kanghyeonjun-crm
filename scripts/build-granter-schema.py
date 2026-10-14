# Build reviewed form fields from the public API contract, never from account data.
import re,json,sys,copy
from pathlib import Path
s=Path(sys.argv[1]).read_text()
labels={'supplier':'공급자','contractor':'공급받는 자','issuer':'발행자','buyer':'구매자','tradeItems':'품목','modificationOption':'수정·취소 사유','recurringScheduleOption':'반복 발행 일정'}
ops={'ticket-references':('증빙 연결','재무 데이터'),'cards':('수기 카드','수기 입력'),'bank-accounts':('수기 계좌','수기 입력'),'card-usages':('수기 카드거래','수기 입력'),'bank-transactions':('수기 계좌거래','수기 입력'),'manual-transactions':('수기관리 전표','수기 입력'),'tax-invoices':('수기 세금계산서','수기 입력'),'cash-receipts':('수기 현금영수증','수기 입력'),'tax-invoices/issue':('세금계산서 발행','증빙 발행'),'tax-invoices/modify-issue':('세금계산서 수정발행','증빙 발행'),'tax-invoices/cancel-issue':('세금계산서 취소발행','증빙 발행'),'cash-receipts/issue':('현금영수증 발행','증빙 발행'),'cash-receipts/cancel-issue':('현금영수증 취소발행','증빙 발행'),'workflows':('전자결재','운영 데이터'),'salary-histories-create':('급여','운영 데이터'),'contacts':('거래처','기준 정보'),'categories':('계정과목','기준 정보'),'tags':('1차 태그','기준 정보'),'tag-details':('2차 태그','기준 정보'),'ticket-tags':('다중 태그','기준 정보'),'people':('구성원 초대','기준 정보')}
result=[]
for c in s.split('\n## '):
 m=re.match(r'(POST|PUT|DELETE) /api/public-docs/([^\n]+)',c)
 if not m or m[2] not in ops:continue
 method,endpoint=m.groups();req=c.split('### Request Fields')[1].split('### Response Example')[0].split('### Request Example')[0]
 fields=[]
 parts=re.split(r'\n(?=- `[^`]+` \((?:required|optional),)',req)
 for p in parts:
  m=re.match(r'- `([^`]+)` \((required|optional), (.*?)\): (.*)',p)
  if not m:continue
  path,required,t,description=m.groups()
  if 'deprecated' in description or 'slackToken' in path:continue
  choices=re.findall(r'"([^"]+)"',t) or re.findall(r'^    - `([^`]+)`:',p,re.M)
  if '[]' in t or '[2]' in t or path.endswith('[]'):kind='array'
  elif 'boolean' in t:kind='boolean'
  elif 'YYYY-MM-DD' in t:kind='date' if 'ISO' not in t else 'datetime'
  elif 'ISO-8601' in t:kind='datetime'
  elif ('number' in t or 'integer' in t) and ('string' not in t or path in ['originalAmount','accountBalance']):kind='number'
  elif 'object' in t:kind='object'
  else:kind='string'
  fields.append(dict(path=path,required=required=='required',kind=kind,integer='integer' in t,label=description,options=choices))
 # Expand arrays declared inline in payroll contract.
 for f in fields[:]:
  if f['path'] in ['taxExemptions','incentives','allowances','deductions']:
   for k,kind,label in [('title','string','항목명'),('amount','number','금액')]:fields.append(dict(path=f['path']+'[].'+k,required=True,kind=kind,integer=False,label=label,options=[]))
 name,group=ops[endpoint];suffix=' 수정' if method=='PUT' else (' 해제' if endpoint=='ticket-references' else ' 삭제') if method=='DELETE' else '' if '발행' in name or '초대' in name else ' 등록'
 result.append(dict(id=method.lower()+'-'+endpoint.replace('/','-'),endpoint=endpoint,method=method,title=name+suffix,group=group,fields=fields))
issue=copy.deepcopy(next(o for o in result if o['endpoint']=='tax-invoices/issue'))
for o in result:
 if o['endpoint'] in ['tax-invoices/modify-issue','tax-invoices/cancel-issue']:
  fields={f['path']:f for f in issue['fields'] if not f['path'].startswith(('issueScheduleType','recurringScheduleOption'))}
  fields.update({f['path']:f for f in o['fields'] if f['path']!='tradeItems[]'});o['fields']=list(fields.values())
 if o['endpoint']=='tax-invoices':
  o['fields'] += [copy.deepcopy(f) for f in issue['fields'] if f['path'].startswith('tradeItems[].')]
 # Typed nested form tree.
 root={}
 for f in o.pop('fields'):
  paths=f['path'].split('.');cur=root
  for i,part in enumerate(paths):
   array=part.endswith('[]');key=part.removesuffix('[]')
   if key not in cur:cur[key]=dict(key=key,label=labels.get(key,key),kind='array' if array else 'object',required=False,children={})
   node=cur[key]
   if i==len(paths)-1:
    node.update({k:v for k,v in f.items() if k!='path'})
    if array:node['kind']='array'
   else:
    if array:node['kind']='array'
    cur=node['children']
 def finalize(nodes):
  arr=[]
  for node in nodes.values():
   node['children']=finalize(node['children'])
   if node['children'] and node['kind']!='array':node['kind']='object'
   if node['children'] and node['kind']=='object':node['required']=any(x['required'] for x in node['children'])
   node.setdefault('options',[]);node.setdefault('integer',False)
   arr.append(node)
  return arr
 o['fields']=finalize(root)
Path('lib/granter-forms.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Generated',len(result),'review forms')
