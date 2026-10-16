# 운영 검증 기록
대상 https://crm.mongpd.com/workspace/cardnews
배포 dpl_6d4BdXxUgd8aceHourLmbNwuvi7t READY production, custom domains bound.
커밋 9a9ae6c66ef583ccbce7fec55b7247fe813bf8ac (기존 branch CAS 업데이트)
gh CLI 미설치. 기존 GitHub connector 인증으로 적용했으며 새 토큰/권한 생성 없음.
로컬 네 sidebar 원본 Git blob SHA와 운영 커밋의 네 파일 SHA 일치 확인.
SCV 런타임: ~/.local/bin/bash로 status 성공. 해당 웹앱 SCV 상태 없음, archive 하지 않음.

## 통과
- npm run typecheck
- npm run build
- node tests/cardnews.mjs: 파일 입력/크기/경로/종류, 중복 금지, owner/viewer/inactive/anon RLS, 정상 storage path 허용 및 traversal 거부.
- 기존 database, diagnosis-database, columns-database, column-content, solapi, finance 테스트 통과.
- 기존 인증된 운영 browser에서 병원788/제안서489/영업788 보존, 새 메뉴 확인.
- 운영 cardnews 페이지/새로고침/결과 가져오기 폼 표시. 파일 미수신 0/8을 정확하게 표시.
- 비인증 HTTP page/files/encoded traversal: 모두 login으로 이동, private content 없음.
- 운영 bucket public=false, 32MiB 제한, cardnews_assets RLS=true, 기존 회원 can_access 재사용.

## 분리한 기존 문제
npm test 전체는 tests/granter.mjs에서 GranterError disconnected로 중단. lib/granter.ts가 기존부터 즉시 disconnected를 throw하는 상태이며 이번 수정 없음.
Supabase security advisor: 카드뉴스 관련 경고 없음. 기존 private invitations/clobe/granter 정책 없음 INFO 및 유출 비밀번호 보호 비활성 WARN 존재. 설정 변경 안 함.
참고 https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## 아직 미완료
원본 PNG8/ZIP 미수신. 실제 gallery/download byte/hash, 최종 imported metadata 대조 대기.
기존 제작 job/turn 정보 표시만 연결. 신규 제작 실행/재생성/게시 없음.

## 가져오기 계약
로그인된 owner/operator만 운영 페이지에서 가져오기 가능. viewer는 읽기만 가능.
JSON: {"files":[{"name":"원본.png","kind":"image","position":1,"bytes":123,"sha256":"64자리소문자SHA256"}, ... {"name":"card-4907aaca.zip","kind":"zip","position":0,"bytes":27033566,"sha256":"cc6d9ab80be2169393dc7e47178c0a09169358886c71a68951f6208bd2957bb6"}]}
정확히 PNG 8장과 ZIP1개. PNG position1~8/ZIP0. 1080x1350 PNG 서버 검증.
브라우저에서 Supabase 비공개 bucket으로 직접 업로드(웹앱 body 제한 미경유).
등록 action은 저장 파일을 재다운로드하여 크기/해시/파일 signature 확인.
파일 제공은 requireMember와 RLS 후 60초 만료 signed URL, private/no-store 응답.
업로드 실패 시 완료 표시하지 않음. 동일 해시 재등록은 idempotent, 기존 대상 위치 다른 hash는 덮어쓰기 거부.
