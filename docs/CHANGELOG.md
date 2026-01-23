# Japan Railroad Route Maker Changelog

[**운행 계통 / 특급열차 / 쾌속열차 목록**](SERIES.md)

## v1.1.0 (2026-01-24)

* FindRoute.js의 intersections 저장을 위한 변수형을 list로 수정 (Y자형 분기가 포함되어도 정상동작)
* JR 동일본의 특급열차 데이터 최신화 및 특급열차 데이터 추가

## v1.0.3 (2026-01-22)

* 동일본여객철도 도카이도선(東海道線)에서 도쿄 ~ 시나가와 간 요코스카선 계통 등으로 쓰이는 역 분리
  *東京: EB03_14208001 / EB03_a14208001
  *新橋: EB03_14208003 / EB03_a14208003
* JR 홋카이도의 특급 & 쾌속열차 데이터 최신화  
* JR 큐슈의 いさぶろう・しんぺい 선택시 大畑, 真幸이 포함되는 경우 경로가 작성되지 않는 오류를 수정
* Y자형 분기가 포함된 특급열차의 노선분리 (오도리코, 코노토리)

## v1.0.2 (2026-01-21)

* 선로상에 위치하지 않은 일부 역들을 포함한 경로가 작성되지 않는 오류를 수정
* 쇼난신주쿠라인 西大井역 hash값 수정

## v1.0.1 (2026-01-20)

* N05-16 (2016년) 데이터를 N05-24 (2024년) 데이터로 최신화
* Python 버전을 2.x에서 3으로 업데이트
* node-sass 라이브러리를 sass 라이브러리로 교체

## 이전까지의 Changelog
[Japan Railroad Plotter Changelog](https://github.com/Snack-X/japan-railroad-plotter/blob/master/docs/CHANGELOG.md) 참고
