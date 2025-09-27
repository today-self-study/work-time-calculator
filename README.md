# Work Time Calculator (주간 실근무시간 계산기)

유연근무제 환경에서 월요일부터 금요일까지 출·퇴근 시간과 식사 여부를 입력하면, 하루 실근무시간과 주간 목표 대비 잔여시간을 자동으로 계산합니다. 모든 데이터는 브라우저 로컬 저장소(localStorage)에만 저장됩니다.

## 주요 기능

- 주간 목표 시간 설정 (기본 40시간, 예: 32/37.5/42 등 입력 가능)
- 월~금 요일별 출근/퇴근 시간 입력
- 점심(-1시간), 저녁(-30분) 체크박스 적용
- 하루 실 근무시간 자동 계산 및 표시
- 주간 잔여시간을 요일별로 순차 차감하여 표시
- 이번 주 리셋(입력값 초기화, 주간 목표는 유지)
- 브라우저 로컬 저장(localStorage) 및 자동 복원

## 사용 방법

1. 상단의 "주간 목표 시간"에 주간 목표 시간을 입력합니다. (기본 40)
2. 각 요일 행에 출근/퇴근 시간을 입력합니다.
3. 해당 날에 점심/저녁을 실제로 먹었다면 체크합니다.
4. "실 근무" 열에 해당 날짜의 실근무시간이 자동 계산되어 표시됩니다.
5. "잔여(주간)" 열에는 주간 목표에서 해당 요일까지 누적 차감된 잔여 시간이 표시됩니다.
6. 새로운 주가 시작되면 "이번 주 리셋" 버튼을 눌러 입력값을 초기화하세요. (주간 목표는 유지)

## 데이터 보관 및 개인정보

- 모든 입력값은 사용자의 브라우저 로컬 저장소(localStorage)에만 저장됩니다.
- 서버로 전송되지 않으며, 다른 기기/브라우저와 공유되지 않습니다.
- 브라우저 캐시/저장소를 삭제하거나 기기를 변경하면 데이터가 사라질 수 있습니다.

## 프로젝트 구조

```
work-time-calculator/
  ├─ index.html     # 메인 페이지
  ├─ styles.css     # 스타일
  ├─ app.js         # 계산 및 저장 로직
  └─ favicon.svg    # 파비콘
```

## 로컬 개발

- 정적 사이트이므로 파일을 브라우저로 직접 열어도 동작합니다.
- 또는 간단한 정적 서버를 사용해도 됩니다.

예시(파워쉘):

```
python -m http.server 5500
```

이후 `http://localhost:5500` 접속.

## GitHub Pages 배포 방법

1) GitHub 저장소 생성 및 연결

- GitHub에서 새 저장소를 만듭니다. (예: `work-time-calculator`)
- 로컬에서 원격을 연결합니다. (파워쉘에서 명령은 한 줄씩 실행)

```
git remote add origin https://github.com/<YOUR_USERNAME>/work-time-calculator.git
git fetch origin
```

2) 최신 코드 기준으로 리베이스 후 푸시

```
git rebase origin/main
git add .
git commit -m "feat: add work time calculator static site"
git push -u origin main
```

3) 저장소 Settings > Pages 설정

- Build and deployment: Deploy from a branch
- Branch: `main` / 폴더: `/ (root)` 선택 후 저장
- 잠시 후 `https://<YOUR_USERNAME>.github.io/work-time-calculator/` 로 접속 가능

4) 커스텀 도메인(선택)

- Pages 설정에서 커스텀 도메인을 등록하고 DNS 설정을 진행합니다.

## 브라우저 지원

- 최신 크롬/엣지/사파리/파이어폭스에 최적화되어 있습니다.
- 시간 입력(`input[type=time]`) 지원이 제한된 구형 브라우저에서는 동작이 다를 수 있습니다.

## 라이선스

MIT
