# Cyworld Reboot - Local Only

이 버전은 Supabase/DB 연결 코드를 전부 제거한 로컬 테스트용 버전입니다.

- 저장 방식: browser localStorage
- Supabase .env 필요 없음
- DB SQL 실행 필요 없음
- 실행: 프로젝트 루트에서 `npm run install:all` 후 `npm start`

## 실행

```cmd
npm run install:all
npm start
```

## localStorage 초기화

브라우저 개발자도구 Console에서:

```js
localStorage.clear(); location.reload();
```

## 주의

이 버전은 로컬 테스트용입니다. 실제 배포용 DB 연결은 나중에 별도 단계로 다시 진행해야 합니다.
