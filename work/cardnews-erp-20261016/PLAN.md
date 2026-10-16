# 운영 ERP 쇼츠·카드뉴스
승인: 기존 Codex 채팅으로 중계된 사용자의 crm.mongpd.com 메뉴·결과 다운로드 구현/배포 요청.
운영: kanghyeonjun-crm / prj_wAfPnnaxUrLqEjWDJh1vDrS3hkJY.
기준 커밋 aa635d35b6e5e14fe766ef3a6dd2f4e6ec3c1c7b. 로컬은 Git 미포함 복사본; 원격 변경 파일 대조 후 적용.
SCV status: 설치 runtime 정상(bash 4+ 사용), 프로젝트 SCV index/promote 없음. archive 하지 않음.
1. 공통 콘텐츠 메뉴: 로컬 쇼츠 새 탭 링크 + 인증된 카드뉴스 페이지.
2. 지정 card-4907aaca 결과만 private manifest allowlist로 제공. 서버에서 회원 검사 후 이미지/다운로드. 임의 URL·경로 입력 없음.
3. 산출물 수신 후 sha256/크기 검증, 기존 결과의 요청/job/turn 연결 표시. 새 제작 실행 없음.
4. typecheck/build, 경로 이탈/해시 불일치/비로그인 거부, 운영 갤러리8장/ZIP 다운로드 대조.
제약: gh 미설치. Vercel/GitHub 기존 연결은 읽기 사용 가능 확인. 파일 수신 전 완료 주장 금지.
