# Baseline 캡처 안내

## 캡처 대상

데스크탑 `1440x900` + 모바일 `393x852` 두 viewport 에서 ch01 4개 데모를 캡처한다.

```text
http://localhost:5176/library/1/ch01_q01
http://localhost:5176/library/1/ch01_q02
http://localhost:5176/library/1/ch01_q03
http://localhost:5176/library/1/ch01_q04
```

## 파일명

```text
ch01_q01_desktop.png
ch01_q01_mobile.png
ch01_q02_desktop.png
ch01_q02_mobile.png
ch01_q03_desktop.png
ch01_q03_mobile.png
ch01_q04_desktop.png
ch01_q04_mobile.png
```

## 절차

1. `/home/claude/architecture` 에서 `npm run dev` 실행
2. 브라우저에서 위 4개 URL 접속
3. Chrome DevTools 에서 viewport 를 `1440x900` 또는 `393x852` 로 맞춤
4. Command Palette 에서 `Capture full size screenshot` 실행
5. `qa/preview-baseline/{파일명}.png` 으로 저장
