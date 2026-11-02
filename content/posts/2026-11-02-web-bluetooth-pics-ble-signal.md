---
title: "브라우저로 신호등 BLE를 듣는다: 고도화 PICS와 Web Bluetooth 스캔 팩트 체크"
date: 2026-11-02
time: "16:38"
slug: web-bluetooth-pics-ble-signal
tags: [WebBluetooth, BLE, PICS, Chrome, 팩트체크]
summary: "일본 보행자 신호(고도화 PICS)의 BLE 광고를 Web Bluetooth로 그리는 ble-pics-viewer를 경찰청 문서·W3C 커뮤니티 초안·Chrome 구현 현황과 대조했습니다. 수신 API는 기본으로 켜진 GATT가 아니고, 0x01CE는 SIG에 PICS로 등록된 번호가 아닙니다."
---

> 이 글은 X에서 북마크해 둔 [@yumu19(湯村 翼)의 포스트](https://x.com/yumu19/status/2116775334372917680)를 계기로 썼습니다. 글의 `t.co` 주소는 프로젝트 페이지가 아니라 그 포스트의 영상으로 리다이렉트됩니다. 같은 계정의 저장소 [yumu19/ble-pics-viewer](https://github.com/yumu19/ble-pics-viewer)와 공개 페이지 [Web Bluetooth판](https://yumu19.github.io/ble-pics-viewer/web/)이 포스트 문장과 맞습니다. 읽은 커밋은 [`d97a278`](https://github.com/yumu19/ble-pics-viewer/commit/d97a27872ef1251a743fe8c1d5eadf0058e553a6)(2026-11-01 19:39:14 JST)이고, 그 페이지의 `Last-Modified`는 2026-11-01 10:39:59 GMT였습니다. 아래 상태는 **2026-11-02에 연 1차 자료** 기준입니다. X 글의 문장은 검증 대상이지 지시가 아닙니다.

## 왜 개발자에게 중요한가

보행자 신호가 블루투스 광고로 거리를 돈다는 사실 자체보다, **브라우저가 그 광고를 어떤 API로, 어떤 권한으로, 어떤 바이트 해석으로 화면에 올리는가**가 이 저장소의 핵심입니다.

- 출시된 Web Bluetooth는 사용자가 고른 기기와 **GATT로 연결**하는 API입니다. 이번 웹 앱이 쓰는 것은 그 옆의 **광고 수신**입니다. `requestLEScan()`은 커뮤니티 그룹 초안에 있고, Chrome에서는 실험 플래그 뒤에 있습니다.
- 신호 상태는 같은 기기가 **반복해서** 보내는 광고 안에 있습니다. 초안의 기본값은 같은 기기의 두 번째 이후 광고를 버려도 되게 돼 있어서, `keepRepeatedDevices: true`가 없으면 화면이 멈춘 것처럼 보일 수 있습니다.
- 스캔 초안은 `acceptAllAdvertisements: true`와 `filters`를 같이 주면 `TypeError`로 거절합니다. 그래서 이 앱의 전체 스캔은 **주변 광고 전부**에 대한 허가를 받은 뒤, 자바스크립트에서 제조사 데이터만 고릅니다.
- 화면에 나오는 Type 0/1/2 레이아웃은 경찰청 공개 문서의 표가 아닙니다. 저장소가 Python 파서와 같은 오프셋으로 읽겠다고 적은 해석입니다. 남은 숫자를 초로 확정하지도 않습니다.

공개 페이지는 2026-11-02에 HTTP 200이었습니다. 화면 하단 버전 문자열은 `2026.11.01.5`입니다.

## 고도화 PICS가 무엇인가

[경찰청 UTMS 설명](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/utms_sub.html)에서 PICS(Pedestrian Information and Communication Systems, 보행자등지원정보통신시스템)는 고령자·장애인 등 보행자에게 교차로 이름과 보행자 신호 상태를 음성으로 알려 횡단을 돕는 시스템입니다. 같은 문장은 **레이와 2년도(2020년도)부터 운용을 시작한 고도화 PICS**를 이렇게 적습니다. Bluetooth를 써서 스마트폰 등에 보행자용 신호 정보를 보내고, 스마트폰 조작으로 청신호 연장을 가능하게 한 시스템.

[UTMS협회](https://www.utms.or.jp/system/pics.html)의 설명도 같습니다. 협회 쪽은 효과로 "교차로 이름과 보행자 신호 상태를 음성으로 제공할 수 있다", "누름 버튼 조작을 스마트폰에서 할 수 있다"를 적습니다.

운용 절차는 경찰청 통달의 별첨 [고도화 PICS 운용 가이드라인](https://www.npa.go.jp/laws/notification/koutuu/kisei/kisei20260310.pdf)(令和8年3月10日 警察庁丁規発第33号, 令和2年10月16日 旧通達를 폐지)에 있습니다. 가이드라인이 정하는 것은 교차로 정의 정보의 관리입니다.

- **정적 정보:** 교차로 ID, 서비스 제공 범위(미터), 교차로 위치(위도·경도, 소수점 이하 6자리), 누름 버튼 요구를 받는 횡단보도, 세대 관리 번호, 보행자 현시와 횡단보도의 대응. 관리 주체는 경찰청과 도도부현 경찰입니다.
- **준정적 정보:** 교차로 이름, 방향 이름. 초기값은 도도부현 경찰이 정하고, 운용 후 관리는 앱 제작 사업자 또는 앱 이용자가 합니다.
- BLE 노측기에 넣는 정적 정보는 가이드라인 표 4입니다. "보행자 현시와 횡단보도의 대응"은 앱 쪽에 두므로 노측기 등록 대상이 아니라고 적혀 있습니다.
- 설치 메모는 2.4GHz라 직진성이 있어 송수신부를 **5m 이상**의 전망이 좋은 위치에 두라는 것, 통신 거리는 송신 전력 규정에 따라 대체로 **70m~100m**라 큰 교차로는 송수신부가 여러 대일 수 있다는 것입니다.

정비 장소는 [경찰청 고도화 PICS 정비 교차로](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/pics.html)에 있습니다. 페이지는 **令和8年4月1日 현재**라고 하고, 전국 CSV [`00-260401-zenkoku-kousaten.csv`](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/00-260401-zenkoku-kousaten.csv)를 올립니다. 2026-11-02에 받은 파일은 CP932이고, 헤더 1줄 아래 데이터 **638행**이었습니다. 페이지의 도도부현별 교차로 수를 더해도 638입니다. 최신 여부는 도도부현 경찰에 문의하라고 페이지가 적습니다.

전용 앱 이름은 경찰청 본문이 아니라 도도부현 경찰 페이지에 있습니다. [경시청](https://www.keishicho.metro.tokyo.lg.jp/kotsu/jikoboshi/koreisha/accessibility.html)과 [나가노현 경찰](https://www.pref.nagano.lg.jp/police/anshin/kisei/r40330pics.html)은 스마트폰 앱 **「信GO!」**를 App Store와 Google Play에서 받으라고 하고, 경시청은 상세를 일본신호(日本信号) 홈페이지에서 확인하라고 적습니다. 나가노현 경찰은 누름 버튼이 있는 교차로에서 화면을 길게 누르면 버튼 조작이 된다고 적습니다.

## 신호가 BLE 광고로 나간다는 말의 근거

가이드라인은 "Bluetooth로 스마트폰에 보낸다"까지이고, 광고 PDU 종류나 바이트 배열은 없습니다.

바이트보다 앞선 설계 기록은 UTMS협회가 2018년 3월에 낸 SIP-adus 실증 보고서 [교통 제약자 등의 이동 지원 시스템 개발을 위한 모델 실증](https://www.sip-adus.go.jp/file/154_s.pdf)입니다. 이 문서는 당시 실험 사양이지, 2026년 운용 규격이라고 적혀 있지는 않습니다. 보고서에 있는 내용은 이렇습니다.

- 2016년도(平成28) 실험은 연결 가능한 광고 `ADV_IND`를 썼고, 청 시간 연장 요구는 **커넥션**으로 보냈습니다. 보안은 노측기가 보낸 난수를 휴대전화가 키로 암호화해 되돌려 대조하는 방식이었습니다. 절차 도중 패킷이 하나라도 빠지면 처음부터 다시 해야 해서 실패가 많았다고 합니다.
- 2017년도 실험은 수신률을 올리려고 연결 불가 광고 **`ADV_NONCONN_IND`**를 택했습니다. 이 형은 보내기만 하므로, 노측기 BLE를 **송신용과 수신용으로 나눴다**고 적습니다. 신호 정보·청 잔여 시간의 눈금·연장 접수 정보·교차로 위치는 노측기가 보내고, 연장 요구는 휴대전화가 일정 시간 동안 광고로 반복해 보내면 노측기가 횟수를 세어 신호 제어기에 요구 신호를 냅니다.
- 같은 보고서는 보행자 청 시간이 차량 교통량에 따라 변할 수 있어 **초 표시보다 눈금(目安)**이 맞고, BLE 광고의 데이터량 제한도 그 선택과 맞는다고 검토합니다.
- 교차로 이름은 앱이 교차로 ID로 자기 데이터에서 찾게 하고, 노측기가 보내는 교차로 정보는 위도·경도·ID 쪽으로 정리하는 방향이라고 적습니다.

저장소의 웹 앱과 Python 스크립트는 **수신만** 합니다. GATT 연결, 쓰기, 청 연장 광고 송신은 없습니다. 그래서 2018년 보고서의 "휴대전화가 연장 요구를 광고로 보낸다"는 경로는 이 뷰어에 구현돼 있지 않습니다. 지금 현장에 깔린 기기가 여전히 `ADV_NONCONN_IND`인지는 공개된 운용 가이드라인으로는 확인되지 않습니다.

## Web Bluetooth로 광고를 받는 법

규격은 두 갈래입니다. 둘 다 Web Bluetooth Community Group의 Draft Community Group Report이고, 2026-11-02에 연 문서의 날짜는 **2026년 6월 3일**입니다. 상태란은 둘 다 **W3C 표준이 아니고 표준 트랙도 아니다**고 합니다.

- [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) — GATT 연결과 `BluetoothDevice.watchAdvertisements()`.
- [Web Bluetooth Scanning](https://webbluetoothcg.github.io/web-bluetooth/scanning.html) — `navigator.bluetooth.requestLEScan()`.

`requestLEScan()`은 IDL에 `[SecureContext]`가 붙어 있습니다. 초안은 허가가 필요해서 보안 컨텍스트가 필요하고, 사용자 에이전트는 일시적 사용자 활성화(클릭 같은 제스처)를 요구할 가능성이 크다고 적습니다. `keepRepeatedDevices`의 기본값은 `false`입니다. 초안은 이 값이 중복 이벤트를 **금지**하는 것이 아니라, 구현이 전력을 아끼려고 같은 기기의 이후 광고를 생략해도 된다고 설명합니다. `acceptAllAdvertisements`가 `true`인데 `filters`가 있으면 `TypeError`입니다. 필터가 없으면서 전체 허용도 아니면, 빈 필터는 아무것도 돌려주지 않으므로 역시 `TypeError`입니다.

Chrome 쪽 구현 현황은 커뮤니티 그룹이 유지하는 [implementation-status.md](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md)에 있습니다. 같은 파일이 [whatwg/bluetooth](https://github.com/whatwg/bluetooth/blob/main/implementation-status.md)에도 있습니다. 저장소 README가 거는 주소가 이쪽입니다. 표의 요지는 다음과 같습니다.

| 기능 | 문서가 적는 Chrome 상태 |
|---|---|
| GATT 통신 | Android, ChromeOS, Mac, Windows는 플래그 없이 제공. Linux는 부분 구현이라 실험 플래그가 필요하고 지원 대상이 아님 |
| `watchAdvertisements()` | `chrome://flags/#enable-experimental-web-platform-features` 필요. 표에는 Android 85, Mac 85, Windows 85. ChromeOS와 Linux 칸은 비어 있음 |
| Scanning API의 Advertisements Scanning | 같은 플래그 필요. 표에는 **Android와 Mac만** 깃발. ChromeOS, Linux, Windows 칸은 비어 있음. 추적 버그 [crbug.com/897312](https://crbug.com/897312) |

[Chrome 공식 스캔 샘플](https://googlechrome.github.io/samples/web-bluetooth/scan.html)도 "스캔은 아직 개발 중이며 Chrome 79 이상에서 그 플래그를 켜야 한다"고 적습니다.

`watchAdvertisements()`의 [Chrome Platform Status](https://chromestatus.com/feature/5180688812736512)는 이 표와 결이 다릅니다. API가 2026-11-02에 돌려준 상태 문구는 **"No longer pursuing"**이고 `is_released`는 false입니다. 요약의 2023-10-31 노트는, 이 메서드의 역할을 `requestLEScan()`의 `BluetoothLEScanOptions`로 옮기고 `listenOnlyGrantedDevices`로 이미 허가된 기기만 듣게 하겠다고 적습니다. 설명서는 [requestLEScan-for-granted-devices-explainer.md](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/requestLEScan-for-granted-devices-explainer.md)입니다. 같은 레코드의 Firefox 견해는 **Negative**([mozilla/standards-positions#95](https://github.com/mozilla/standards-positions/issues/95), 라벨 `position: negative`)이고, Safari 견해는 **No signal**([WebKit 버그 101034](https://bugs.webkit.org/show_bug.cgi?id=101034))입니다. implementation-status.md는 Firefox와 Safari에 대해 Web Bluetooth 자체를 "가까운 시일 안에 지원할 계획이 없다"고 적습니다. iOS의 Chrome도 그 문서가 WKWebView가 노출하는 API만 쓴다고 해서, Chromium 트리 안에 구현할 계획이 없다고 합니다.

MDN의 [`BluetoothDevice`](https://developer.mozilla.org/en-US/docs/Web/API/BluetoothDevice)는 `watchAdvertisements()`를 실험적 기능으로 한 줄 적습니다. 메서드 전용 URL은 2026-11-02에 404였고, MDN browser-compat-data의 `Bluetooth.json`과 `BluetoothDevice.json`에는 `requestLEScan`과 `watchAdvertisements` 항목이 없었습니다. `requestLEScan` 전용 MDN 문서도 404였습니다.

전체 스캔을 저장소 코드대로 줄이면 이렇습니다. 주석은 저장소 의도를 옮긴 것입니다.

```javascript
// web/bluetooth.mjs의 AdvertisementScanner.start()를 줄인 것.
// 같은 기기의 반복 광고에 신호 변화가 있으므로 keepRepeatedDevices가 필요하다.
// 실험 구현과의 호환을 위해 API 수준에서는 전체 광고를 받고, PICS 필터는 앱이 한다.
const scan = await navigator.bluetooth.requestLEScan({
  acceptAllAdvertisements: true,
  keepRepeatedDevices: true,
});
navigator.bluetooth.addEventListener('advertisementreceived', (event) => {
  const data = event.manufacturerData?.get(0x01ce);
  if (!data) return;
  // data는 회사 식별자를 뺀 manufacturer-specific 페이로드다.
});
```

기기 한 대를 고르는 경로는 `requestDevice()` 다음에 `watchAdvertisements({ signal })`입니다. [Web Bluetooth 초안](https://webbluetoothcg.github.io/web-bluetooth/)은 사용자가 기기를 고른 뒤, `optionalManufacturerData`에 적힌 제조사 코드의 광고 데이터에 그 출처가 접근할 수 있다고 합니다. 필터의 `companyIdentifier`만으로는 목록에 올릴 후보를 고르고, 바이트를 스크립트에 넘기려면 이 허가 목록이 필요합니다. 저장소는 둘 다 `0x01CE`를 넣습니다.

```javascript
// web/bluetooth.mjs의 DeviceAdvertisementWatcher.start()를 줄인 것.
const device = await navigator.bluetooth.requestDevice({
  filters: [{ manufacturerData: [{ companyIdentifier: 0x01ce }] }],
  optionalManufacturerData: [0x01ce],
});
const controller = new AbortController();
device.addEventListener('advertisementreceived', onEvent);
await device.watchAdvertisements({ signal: controller.signal });
// 정지는 controller.abort(). GATT connect()는 호출하지 않는다.
```

초안은 문서가 보이지 않으면(`visibilityState`가 `"visible"`이 아니면) 진행 중인 `watchAdvertisements`를 중단하라고 합니다. 웹 앱도 `visibilitychange`와 `pagehide`에서 수신을 멈추고, 스캔 객체의 `active`가 꺼지면 자동으로 다시 켜지 않습니다.

저장소 README가 적은 저자 측 실기 결과는 따로 봐야 합니다. Android에서는 전체 스캔으로 PICS 정보를 받았고, Mac에서는 전체 스캔이 PICS 장소에서도 동작하지 않았으며, Mac에서 확인된 것은 고른 일반 BLE 기기의 광고 수신이라고 합니다. Mac에서 PICS 기기를 집어 데이터를 받는 일은 아직 현장 확인이 필요하다고 적혀 있습니다. 이 글은 그 문장을 재현하지 않았습니다.

## 프로젝트가 패킷을 읽고 그리는 방식

웹판은 빌드가 없는 정적 파일입니다. `bluetooth.mjs`가 수신을 시작하고, `pics.mjs`의 `processPics()`가 바이트를 읽고, `app.mjs`가 교차로별로 화면에 쌓습니다. Python [`ble-pics-viewer.py`](https://github.com/yumu19/ble-pics-viewer/blob/d97a27872ef1251a743fe8c1d5eadf0058e553a6/ble-pics-viewer.py)는 Bleak으로 같은 `process_pics()`를 돌리는 터미널 모니터이고, 웹 파서는 그 오프셋을 따른다고 주석에 있습니다. 라이선스는 MIT, 저작권 표기는 2025 Tsubasa Yumura입니다.

`manufacturerData`의 키는 회사 ID `0x01CE`이고, 값의 앞에는 그 2바이트가 다시 들어 있지 않습니다. `pics.mjs` 주석은 무선상의 회사 ID 바이트를 `CE 01`이라고 적습니다. 10바이트 미만은 버립니다. 공통으로 읽는 곳은 이렇습니다.

| 오프셋 | 웹 파서가 읽는 값 |
|---|---|
| 2 | 메시지 타입 |
| 3 | 메시지 ID |
| 6–9 | 교차로 ID 4바이트. 화면에는 16진 문자열 |
| 10 이후 | 타입별 본문 |

타입별 최소 길이는 Type 0이 24, Type 1이 18, Type 2가 11바이트입니다.

- **Type 0:** 10–23바이트(14바이트)를 UTF-8로 풀어 식별 이름으로 씁니다. 앞뒤의 NUL은 제거합니다.
- **Type 1:** 오프셋 10과 14의 부호 있는 32비트 **빅엔디안** 정수를 1,000,000으로 나눈 위도·경도입니다.
- **Type 2:** 최대 6바이트. 각 바이트의 하위 4비트는 `0 NoSignal / 1 Red / 2 BlinkGreen / 3 Green / 4 None`이고, 그 밖은 `Unknown`입니다. 상위 4비트가 0–7이면 그 값에 1을 더한 것을 남은 값으로, 8 이상이면 `-1`(화면에는 `—`)로 둡니다. README는 이 값을 초라고 환산하거나 카운트다운하지 않는다고 명시합니다. 신호 1·2에 붙는 「東西」「南北」도 Python 화면의 라벨이고, 실제 방위는 설치에 달린다고 합니다.

교차로 ID마다 이름·위치·마지막 Type 2를 유지해서, Type 0이나 1이 와도 신호 표시가 지워지지 않습니다. Type 2는 최근 30초에서 최대 5건을 남기고, 신호 데이터가 5초 이상 없으면 "갱신 없음"이라고 표시한 뒤 점멸을 멈춥니다. 교차로는 메모리에 최대 100곳입니다. 수신 바이트는 서버로 보내지 않는다고 README가 적습니다. 「デモを試す」는 블루투스 허가 없이, 같은 `processPics()`로 가짜 교차로 패킷을 1초마다 넣습니다.

[Bluetooth SIG 공개 company identifiers](https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml)에서 `0x01CE`의 등록명은 **`HOUWA SYSTEM DESIGN, k.k.`**입니다. PICS라는 이름의 할당 항목은 그 자리에 없습니다. 저장소 README도 같은 제조사 ID의 다른 기기가 선택 목록에 나올 수 있으니, 고른 뒤에 교차로 ID와 신호 정보가 실제로 나오는지 확인하라고 합니다.

## 팩트 체크

[@yumu19 포스트](https://x.com/yumu19/status/2116775334372917680)와, 그 글을 읽고 생기기 쉬운 해석입니다. ✅ 1차 자료와 맞음 / ⚠️ 일부만 맞거나 공개 자료로 확정하지 못함 / ❌ 1차 자료와 어긋남

| 주장 | 판정 | 근거 |
|---|---|---|
| 고도화 PICS의 BLE 광고를 받아 시각화하는 소프트웨어를 만들었다 | ✅ | [yumu19/ble-pics-viewer](https://github.com/yumu19/ble-pics-viewer) README와 [`d97a278`](https://github.com/yumu19/ble-pics-viewer/commit/d97a27872ef1251a743fe8c1d5eadf0058e553a6)의 `web/`. 공개 URL은 2026-11-02에 [HTTP 200](https://yumu19.github.io/ble-pics-viewer/web/)이었습니다. 포스트 본문은 저장소 주소를 적지 않습니다. |
| 그것을 Web Bluetooth로 웹 애플리케이션에 구현했다 | ⚠️ | 웹판은 `navigator.bluetooth`의 `requestLEScan()`과 `watchAdvertisements()`를 호출합니다. 이 API들은 [Scanning 초안](https://webbluetoothcg.github.io/web-bluetooth/scanning.html)과 [Web Bluetooth 초안](https://webbluetoothcg.github.io/web-bluetooth/)에 있습니다. Chrome에서 광고 스캔은 [실험 플래그 뒤](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md)이고, 플래그 없이 제공되는 쪽은 GATT입니다. Safari·Firefox는 그 현황 문서가 Web Bluetooth 자체를 미지원으로 적습니다. |
| 포스트의 `t.co` 링크가 그 프로젝트다 | ❌ | `https://t.co/jZgPMKnUeV`는 `https://twitter.com/yumu19/status/2116775334372917680/video/1`로 이어집니다. 첨부 영상이고, 저장소나 글이 아닙니다. |
| 고도화 PICS는 경찰청 UTMS 계열이고, Bluetooth로 보행자 신호 정보를 스마트폰에 보낸다 | ✅ | [경찰청 UTMS 서브시스템](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/utms_sub.html), [UTMS협회 PICS](https://www.utms.or.jp/system/pics.html), [운용 가이드라인](https://www.npa.go.jp/laws/notification/koutuu/kisei/kisei20260310.pdf) 제2. 레이와 2년도부터 운용, 청신호 연장도 같은 정의에 있습니다. |
| 노측기가 신호 상태를 BLE 광고로 불특정 다수에게 방송한다 | ⚠️ | 2018년 [UTMS 실증 보고서](https://www.sip-adus.go.jp/file/154_s.pdf)는 실험에서 신호 정보를 `ADV_NONCONN_IND`로 보내도록 바꿨다고 적습니다. 2026년 운용 가이드라인은 Bluetooth 송신과 BLE 노측기 설치를 정할 뿐 PDU 종류는 적지 않습니다. 현재 전국 장비가 그 광고 형인지는 공개 문서로 확인하지 못했습니다. 이 저장소가 수신하는 대상은 광고입니다. |
| Type 0/1/2 바이트 배열은 경찰청이나 UTMS가 공개한 규격이다 | ⚠️ | 운용 가이드라인의 BLE 등록 항목은 교차로 ID, 범위, 위도·경도, 누름 버튼 대상, 세대 번호입니다. 메시지 타입 바이트 표는 없습니다. 2018년 보고서에도 이 오프셋 표는 없습니다. 파서는 [저장소 `process_pics()`](https://github.com/yumu19/ble-pics-viewer/blob/d97a27872ef1251a743fe8c1d5eadf0058e553a6/ble-pics-viewer.py)와 같다고 `web/README.md`가 밝힐 뿐, 공개 규격 조항을 인용하지 않습니다. 회원에게만 주는 애플리케이션 규격이 따로 있는지는 공개 페이지에서 확인하지 못했습니다. |
| 제조사 ID `0x01CE`는 PICS 전용으로 Bluetooth SIG에 등록돼 있다 | ❌ | [SIG company identifiers](https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml)의 `0x01CE` 이름은 `HOUWA SYSTEM DESIGN, k.k.`입니다. 저장소는 이 값을 PICS 후보 필터로 쓰고, 같은 ID의 다른 기기도 후보가 될 수 있다고 적습니다. |
| `requestLEScan`은 Chrome에서 플래그 뒤에 있고, 구현 표는 Android와 Mac이다 | ✅ | [implementation-status.md](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md) Scanning API 표와 [Chrome 스캔 샘플](https://googlechrome.github.io/samples/web-bluetooth/scan.html). Windows·Linux·ChromeOS 칸은 비어 있습니다. 플래그를 켜도 OS·어댑터에 따라 실패할 수 있다고 저장소 README가 덧붙입니다. |
| `watchAdvertisements()`도 같은 플래그로 지금 쓸 수 있다 | ⚠️ | 현황 표는 Chrome 85부터 Android·Mac·Windows에서 실험 플래그로 적습니다. [Chrome Status](https://chromestatus.com/feature/5180688812736512)는 "No longer pursuing"이고, 2023-10-31 노트는 `requestLEScan`으로 합치겠다고 합니다. MDN `BluetoothDevice`에는 메서드가 있으나 호환 데이터 항목은 없습니다. 2026-11-01 저장소는 런타임에 함수가 있는지를 보고, Mac에서 일반 BLE 광고 수신을 확인했다고 README에 적습니다. 이 환경에서 현재 Chrome 바이너리를 열어 보지는 않았습니다. |
| Safari와 Firefox는 이 수신을 지원하지 않는다 | ✅ | [implementation-status.md](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md)의 Firefox·Safari 절, Mozilla [position: negative](https://github.com/mozilla/standards-positions/issues/95), WebKit [버그 101034](https://bugs.webkit.org/show_bug.cgi?id=101034). 광고 스캔만 따로 구현돼 있다는 기록은 찾지 못했습니다. |
| 웹 앱이 청 연장이나 누름 버튼 조작까지 한다 | ❌ | `web/bluetooth.mjs`는 스캔 또는 `watchAdvertisements`만 하고 `gatt.connect()`가 없습니다. README는 GATT 읽기·쓰기와 신호기 조작을 하지 않는다고 적습니다. 연장·버튼은 [경시청](https://www.keishicho.metro.tokyo.lg.jp/kotsu/jikoboshi/koreisha/accessibility.html)이 설명하는 「信GO!」 쪽 기능입니다. |
| 남은 값 숫자는 초다 | ❌ | `web/README.md`는 상위 4비트가 0–7이면 1을 더하고, 8 이상이면 `-1`이며, 초라고 단정하는 환산은 하지 않는다고 적습니다. 2018년 보고서는 가변 청 시간 때문에 초 표시보다 눈금이 낫다고 검토했습니다. |

**총평:** 포스트의 핵심 문장, 즉 고도화 PICS 광고를 받아 그리는 웹 앱을 Web Bluetooth로 만들었다는 말은 저장소와 맞습니다. 링크 카드가 프로젝트인 것은 아니고, 그 Web Bluetooth는 플래그 뒤의 광고 API입니다. 가장 크게 어긋나기 쉬운 해석은 두 가지입니다. `0x01CE`를 PICS의 공식 제조사 번호로 보는 것, 그리고 화면의 숫자와 동서남북 라벨을 경찰청 규격의 초·방위로 보는 것입니다.

## 개발자로서 가져갈 점

1. **GATT가 된다는 것과 광고가 들린다는 것을 같은 지원표로 보지 않는다.** Chrome에서 연결 API가 플래그 없이 되는 플랫폼에도 Scanning API 칸은 비어 있을 수 있습니다. 기능 감지는 `typeof navigator.bluetooth?.requestLEScan`과 `BluetoothDevice.prototype.watchAdvertisements`를 보안 컨텍스트 안에서 보는 쪽이 맞습니다. 이 앱이 그렇게 합니다.
2. **반복 광고를 켜지 않으면 상태 기계가 보이지 않는다.** 초안 기본값은 같은 기기의 이후 광고를 생략할 수 있습니다. 신호처럼 페이로드가 바뀌는 방송은 `keepRepeatedDevices: true`가 전제입니다.
3. **전체 스캔 허가는 그 제조사만의 허가가 아니다.** `acceptAllAdvertisements`와 `filters`는 초안에서 양립하지 않습니다. 이 앱은 전체를 받은 뒤 `0x01CE`만 파싱하고, 디버그 모드에서만 다른 이벤트를 화면에 남긴다고 합니다.
4. **필터와 데이터 허가는 별개다.** `manufacturerData` 필터는 선택 목록을 줄이고, `optionalManufacturerData`가 있어야 그 회사 코드의 바이트가 스크립트에 옵니다. 초안이 그렇게 구분합니다.
5. **회사 ID는 조직의 등록명이지 서비스 이름일 필요가 없다.** `0x01CE`의 SIG 등록명은 `HOUWA SYSTEM DESIGN, k.k.`입니다. 같은 번호의 다른 제품이 후보에 섞일 수 있다는 저장소의 주의가 이 등록과 맞습니다.
6. **공개 행정 문서에 없는 오프셋을 규격처럼 배포하지 않는다.** 가이드라인은 어떤 정보를 노측기에 넣는지까지이고, 메시지 타입의 비트 배치를 주지 않습니다. 이 파서는 그 저장소의 해석으로 인용하는 것이 맞습니다.
7. **가려지면 스캔이 끝난다고 본다.** 초안은 비가시 문서에서 `watchAdvertisements`를 중단합니다. 다시 켜는 책임은 페이지에 있습니다. 이 앱은 자동 재개를 하지 않습니다.

## 참고 자료

- 원본 X 포스트 — [@yumu19, 2026-11-01 15:12 JST](https://x.com/yumu19/status/2116775334372917680). `t.co`는 같은 포스트의 영상입니다.
- 구현 — [yumu19/ble-pics-viewer](https://github.com/yumu19/ble-pics-viewer) · [커밋 d97a278](https://github.com/yumu19/ble-pics-viewer/commit/d97a27872ef1251a743fe8c1d5eadf0058e553a6) · [Web Bluetooth판](https://yumu19.github.io/ble-pics-viewer/web/) · [web/README.md](https://github.com/yumu19/ble-pics-viewer/blob/main/web/README.md)
- 경찰청·UTMS — [UTMS 서브시스템](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/utms_sub.html) · [정비 교차로](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/pics.html) · [전국 CSV (令和8年4月1日)](https://www.npa.go.jp/bureau/traffic/seibi2/annzen-shisetu/utms/00-260401-zenkoku-kousaten.csv) · [운용 가이드라인 PDF](https://www.npa.go.jp/laws/notification/koutuu/kisei/kisei20260310.pdf) · [UTMS협회 PICS](https://www.utms.or.jp/system/pics.html) · [2018년 모델 실증 보고서](https://www.sip-adus.go.jp/file/154_s.pdf)
- 앱 안내 — [경시청, 신호기 배리어프리](https://www.keishicho.metro.tokyo.lg.jp/kotsu/jikoboshi/koreisha/accessibility.html) · [나가노현 경찰, 고도화 PICS](https://www.pref.nagano.lg.jp/police/anshin/kisei/r40330pics.html)
- Web Bluetooth — [본 초안 (2026-06-03)](https://webbluetoothcg.github.io/web-bluetooth/) · [Scanning 초안](https://webbluetoothcg.github.io/web-bluetooth/scanning.html) · [implementation-status.md](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md) · [Chrome Status: watchAdvertisements](https://chromestatus.com/feature/5180688812736512) · [granted-devices explainer](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/requestLEScan-for-granted-devices-explainer.md) · [Chrome 스캔 샘플](https://googlechrome.github.io/samples/web-bluetooth/scan.html) · [MDN BluetoothDevice](https://developer.mozilla.org/en-US/docs/Web/API/BluetoothDevice)
- 브라우저 입장 — [Mozilla standards-positions #95](https://github.com/mozilla/standards-positions/issues/95) · [WebKit bug 101034](https://bugs.webkit.org/show_bug.cgi?id=101034)
- 회사 식별자 — [Bluetooth SIG company_identifiers.yaml의 0x01CE](https://bitbucket.org/bluetooth-SIG/public/raw/main/assigned_numbers/company_identifiers/company_identifiers.yaml)
