---
title: "60fps는 상한인가? Rust 원격 데스크톱 voxl"
date: 2026-11-05
time: "09:18"
slug: voxl-rust-remote-desktop-agents
tags: [voxl, Rust, 원격데스크톱, Computer Use, 팩트체크]
summary: "tembo/voxl 0.3.3은 X11·macOS·Windows 화면을 x264 H.264로 묶어 웹소켓 /ws로 보낸다. README가 평균 60fps, 중앙 지연 12–99ms라고 적은 표에서 voxl 열은 각 테스트의 최선 실행이고, 전체 화면 LAN 칸의 최악 1초는 54.0fps다."
---

> 이 글은 [@darrenjr의 포스트](https://x.com/darrenjr/status/2117647994300387396)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2117647994300387396](https://x.com/i/status/2117647994300387396)입니다. fxtwitter가 돌려준 `created_at`은 `Tue Nov 03 16:00:00 +0000 2026`, 2026-11-04 01:00 KST입니다. 응답의 `name`은 "darren"이고, `screen_name`은 `darrenjr`이며, `description`은 "co-founder/cto @tembo • i like building companies and writing code"입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2117647994300387396)(`code` 200)으로 읽었습니다. 그 문장은 검증 대상이지 지시가 아닙니다. 첨부는 길이 12초, 1080×1350 영상 하나이고, 이 글은 영상 프레임 안의 문장을 베끼지 않았습니다. 아래 대조는 2026-11-05에 읽은 [tembo/voxl](https://github.com/tembo/voxl) main `9d004076f73cb374bdb87ff96d2e23e44b9f47b9`(커밋 시각 2026-11-04T23:14:16Z, 작성자 이름 Darren Baldwin)의 README·`src/`·`web/src/protocol.ts`·`LICENSE`·`SECURITY.md`, crates.io `voxl-server` 0.3.3, [tembo.io](https://www.tembo.io/)와 [소개 페이지](https://www.tembo.io/about), 그리고 [Tembo Computer 발표 글](https://www.tembo.io/blog/announcing-tembo-computer)입니다. 같은 시각 `GET /repos/tembo/voxl`의 `Date`는 `Thu, 05 Nov 2026 00:15:01 GMT`, `stargazers_count`는 **999**, `forks_count`는 **43**입니다. 이 글은 `voxl`을 빌드하거나 실행하지 않았고, `bench/`를 다시 재지 않았습니다.

## 왜 화면 스트림이 에이전트 루프에 닿는가

포스트의 본문은 여섯 줄입니다. "Introducing voxl", "extremely fast remote desktop streaming written in rust", 그리고 네 개의 화살표입니다. 60fps와 낮은 지연, macOS·Windows·Linux, 웹소켓 하나라서 프록시와 샌드박스 포털을 통과한다, 에이전트 API는 `/screenshot`, `/record`, `/wait`.

저장소는 있습니다. GitHub 전체 이름은 `tembo/voxl`, 설명 문장은 "extremely fast web remote desktop streaming", SPDX는 MIT, 기본 브랜치는 `main`, 생성 시각은 2026-06-18T23:46:39Z, 아카이브 상태는 아닙니다. 주 언어 필드는 Rust입니다. README 첫 문단은 브라우저용 저지연 데스크톱 스트리밍이고, X11 디스플레이나 Mac 화면, Windows 데스크톱을 H.264로 웹소켓에 실어 작은 웹 클라이언트가 WebCodecs로 푼다고 적습니다. 입력, 클립보드, 오디오, 마이크, 파일·폴더 전송, 동적 해상도가 같은 문단에 있습니다.

개발자에게 닿는 지점은 "빠른 원격 데스크톱"이라는 형용사보다, 컴퓨터 유즈 에이전트가 픽셀을 보고 다음 동작을 고를 때 그 화면을 어디서 받느냐입니다. [E2B Desktop](https://github.com/e2b-dev/desktop) README의 제목은 "Open Source Virtual Computer for Computer Use"입니다. [Tembo](https://www.tembo.io/) 첫 화면은 에이전트가 브라우저와 그래픽 앱을 쓰고, 스크린샷을 찍고, 보이는 결과를 확인한다고 적습니다. voxl README의 FAQ는 이 프로그램을 헤드리스 VM과 샌드박스, 보통 GPU 없는 Xvfb 위에서 돌아가는 소프트웨어 팩토리와 컴퓨터 유즈 에이전트용으로 두고, 브라우저 탭 하나와 에이전트용 API를 그 이유로 적습니다.

crates.io에 올라간 패키지 이름은 `voxl`이 아닙니다. `Cargo.toml`은 "`voxl` on crates.io belongs to an unrelated crate; the binary is still `voxl`"이라고 적고, 패키지 이름은 `voxl-server`, 버전은 `0.3.3`입니다. 2026-11-05에 crates.io API가 돌려준 그 무관한 크레이트 `voxl`의 설명은 "A command-line tool for working with voxels"이고, 저장소 필드는 `https://github.com/tyleo/tyt`, `max_version`은 `0.1.0`입니다. README의 설치 줄은 `cargo install voxl-server`입니다.

## 캡처는 바뀐 사각형을 이미 알고 있다

Linux 경로는 [`src/capture.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/capture.rs) 첫 줄이 적습니다. X11 화면을 MIT-SHM `GetImage`로 고정된 BGRX 프레임에 받고, 그 루프를 XDamage가 돌립니다. README는 Xvfb를 `-shmem`으로 띄우면 제로카피 캡처가 된다고 적습니다. `Cargo.toml`의 Linux 의존성 `x11rb`는 `shm`, `damage`, `xfixes`, `xtest`, `randr`를 켭니다.

macOS는 [`src/mac/capture.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/mac/capture.rs)입니다. ScreenCaptureKit 프레임이 NV12로 오고, 같이 오는 더티 사각형이 XDamage와 같은 장부를 갱신합니다. 주석은 화면이 가만히 있으면 변환도 인코딩도 하지 않고, 안 변한 매크로블록은 x264가 건너뛴다고 적습니다. README의 macOS 절은 캡처를 ScreenCaptureKit, 입력을 CGEvent, 클립보드를 NSPasteboard, 소리를 시스템 오디오라고 적습니다. macOS는 화면 기록과 손쉬운 사용 권한을 묻고, 기본 수신 주소는 `127.0.0.1`입니다.

Windows는 [`src/win/capture.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/win/capture.rs)입니다. DXGI Desktop Duplication이 새 데스크톱 이미지와 더티·이동 사각형을 주고, 캡처 스레드는 그 영역만 BGRA 프레임에 복사합니다. 주석은 복제가 커서를 빼므로 클라이언트가 커서를 그린다고 적습니다. README는 Windows 10 이상, `SendInput`, 클립보드 텍스트와 이미지, WASAPI 시스템 오디오를 적고, 서비스가 아니라 사용자 세션에서 띄우라고 적습니다. 잠금 화면과 UAC는 SYSTEM이 아니면 Windows가 이 캡처에서 숨긴다고 같은 절이 적습니다.

세 경로가 공유하는 장부는 [`src/wait.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/wait.rs)에 있습니다. 16×16 블록마다 마지막 변경의 순번과 시각을 두고, 기다리는 쪽은 스크린샷을 다시 찍거나 폴링하지 않습니다. FAQ의 Wayland 답은 아직 없고, Linux에서 voxl이 스트리밍하는 것은 X11 디스플레이이며 Xvfb가 포함된다고 적습니다. 같은 답은 E2B와 Daytona의 가상 데스크톱도 Xvfb 위에서 돈다고 적습니다.

## 인코딩은 CPU의 x264이고, 영상은 웹소켓 하나에 실린다

인코더는 [`src/encoder.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/encoder.rs)의 libx264 래퍼입니다. 파일 주석은 저지연 데스크톱 스트리밍용이라고 적습니다. 프리셋 적용 직후의 파라미터는 이렇습니다.

```rust
let preset = CString::new(cfg.preset.as_str()).unwrap();
let tune = c"zerolatency";
if ffi::x264_param_default_preset(&mut param, preset.as_ptr(), tune.as_ptr()) < 0 {
    return Err(format!("bad x264 preset {}", cfg.preset));
}
param.i_width = cfg.width as i32;
param.i_height = cfg.height as i32;
param.i_csp = ffi::X264_CSP_I420 as i32;
param.i_fps_num = cfg.fps;
param.i_fps_den = 1;
param.i_timebase_num = 1;
param.i_timebase_den = 1000;
// VFR input costs a frame of encoder delay (duration estimation).
param.b_vfr_input = 0;
param.i_threads = cfg.threads as i32;
param.b_sliced_threads = (cfg.threads > 1) as i32;
param.i_slice_count = cfg.threads as i32;
param.i_keyint_max = ffi::X264_KEYINT_MAX_INFINITE as i32;
param.i_keyint_min = 1;
param.i_scenecut_threshold = 0;
param.b_intra_refresh = 0;
param.i_bframe = 0;
```

바로 아래는 Annex-B, 반복 헤더, CRF 레이트 컨트롤, `i_lookahead = 0`, `i_sync_lookahead = 0`, `b_mb_tree = 0`입니다. 움직임 탐색은 ultrafast의 다이아몬드 대신 UMH, 범위 64이고, 주석은 창을 끌거나 빠르게 스크롤할 때 그 차이를 적습니다. `b_mb_info`는 X damage가 준 "안 변함" 힌트로 분석을 건너뛰게 합니다. VBV 상한이 있으면 버퍼는 대략 프레임 1.25개분입니다. README 플래그의 기본 `--preset`은 `ultrafast`, `--crf`는 24, `--framerate`는 60, `--max-kbps`는 30000, `--min-kbps`는 2000입니다. `src/lib.rs`의 스레드 기본값은 `(ncpu / 4).clamp(1, 4)`이고, 주석은 2560×1600에서 스레드를 더 늘리면 CPU만 는다고 적습니다.

브라우저로 나가는 소켓은 하나입니다. [`web/src/protocol.ts`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/web/src/protocol.ts) 첫 주석이 그렇게 적고, [`src/server.rs`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/server.rs)는 `GET /ws`로 그 업그레이드를 받습니다. 바이너리 메시지는 타입 바이트로 시작합니다.

```typescript
export const Bin = {
	Video: 0x01,
	Audio: 0x02,
	Cursor: 0x03,
	ClipImage: 0x04,
	ClipImageUp: 0x11,
	MicOpus: 0x12,
	MicPcm: 0x13,
} as const;
```

서버의 텍스트는 JSON이고, 클라이언트의 텍스트는 `m,x,y` 같은 짧은 콤마 명령입니다. 비디오 헤더 16바이트에는 키프레임 비트, 프레임 번호, 캡처부터 송신까지의 파이프라인 시간(0.1ms 단위), 스트라이프 번호가 있습니다. `web/src/worker.ts`는 그 H.264를 `VideoDecoder`로 풀고, `configure`에 `optimizeForLatency: true`를 넣습니다. 오디오 타입 바이트는 Opus입니다. README 기본값은 데스크톱 오디오 켬, 장치 `output.monitor`, 비트레이트 128000입니다.

FAQ가 웹소켓을 WebRTC 대신 고른 이유로 적는 문장은 이렇습니다. 웹소켓 하나는 웹 페이지가 가는 곳으로 가고, 리버스 프록시와 터널, 샌드박스 프리뷰 URL을 통과하며, TURN 서버나 열 UDP 포트가 필요 없습니다. 브라우저는 프레임이 도착하는 즉시 WebCodecs로 풀고, WebRTC의 지터 버퍼를 거치지 않으며, 레이트 컨트롤은 voxl이 합니다. 같은 답이 적은 대가는 TCP입니다. 패킷이 빠지는 링크에서는 뒤 프레임이 막히고, WebRTC는 앞으로 건너뛸 수 있습니다.

그 문장에는 같은 README의 조건이 붙습니다. 호스트 이름이 IP와 `localhost`가 아니면 `--allowed-hosts`가 필요하고, 다른 사이트의 페이지가 붙으려면 `--allowed-origins`가 필요합니다. 거부되면 403이 어떤 플래그를 넣어야 하는지 알려 준다고 적혀 있습니다. WebCodecs는 HTTPS 페이지와 localhost에서만 허용되므로, 다른 기계에서 보려면 TLS 프록시 뒤에 두거나 SSH로 포트를 넘겨 `localhost`로 열라고 FAQ가 적습니다. Linux 기본 수신 주소는 `0.0.0.0`이고, macOS와 Windows는 `127.0.0.1`입니다. `SECURITY.md`는 로그인 없이 열리는 것이 페이지 스크립트·에셋과 `/healthz`뿐이라고 적고, 비밀번호를 주지 않으면 시작 때 128비트 난수를 만든다고 적습니다. 평문 HTTP이므로 localhost 밖에서는 TLS 프록시나 SSH 터널 뒤에 두라고 같은 문서가 적습니다.

## `/screenshot`, `/record`, `/wait`는 그 소켓의 메시지가 아니다

에이전트용으로 README가 적는 호출은 같은 포트의 HTTP입니다. `server.rs`의 라우트는 `GET /screenshot`, `GET /record`, `POST /record/start`, `POST /record/stop`, `GET /wait`입니다. 비밀번호는 `Authorization: Bearer`, 또는 `curl -u :<password>`입니다. README의 예는 아래와 같고, 이 글은 그 명령을 실행하지 않았습니다.

```bash
curl -u ":$VOXL_PASSWORD" -o shot.png localhost:6901/screenshot
curl -u ":$VOXL_PASSWORD" -o clip.mp4 "localhost:6901/record?seconds=10"
id=$(curl -u ":$VOXL_PASSWORD" -s -X POST localhost:6901/record/start | jq .id)
curl -u ":$VOXL_PASSWORD" -o clip.mp4 -X POST "localhost:6901/record/stop?id=$id"
curl -u ":$VOXL_PASSWORD" localhost:6901/wait
curl -u ":$VOXL_PASSWORD" "localhost:6901/wait?idle=1000&timeout=30000"
curl -u ":$VOXL_PASSWORD" "localhost:6901/wait?change&region=0,0,800,600"
```

`record.rs`의 주석은 녹화를 이미 인코딩된 H.264를 MP4로 다시 담는 일이라고 적습니다. 레코더는 프레임을 바로 확인하는 뷰어로 하나 더 붙으므로 CPU가 거의 늘지 않고, 커서는 빠지며, 화면이 바뀔 때만 프레임을 담습니다. 기본 포트는 6901, `--max-record-seconds` 기본은 300입니다.

스크린샷 핸들러는 캡처에 스냅샷을 하나 요청하고, 5초 안에 프레임이 없으면 503과 `"no frame from capture"`를 돌려줍니다. 성공하면 `image/png`이고, 헤더 이름은 `x-voxl-seq`입니다. README가 적는 `X-Voxl-Seq`와 같은 헤더입니다. PNG 인코더는 RGB 8비트, `Compression::Fast`입니다.

`/wait`의 기본은 300ms 동안 변화가 없을 때 반환하는 것입니다. 고요한 시간은 요청 시각보다 앞으로 세지 않아서, 방금 한 동작이 화면에 나올 시간이 있습니다. `change`는 첫 변화에서 반환합니다. `region=x,y,w,h`는 그 사각형만, 16픽셀 블록 단위로 보고, `timeout` 기본은 10초입니다. 소스의 `MAX_WAIT`는 600초이고, 밀리초로 받은 `idle`과 `timeout`은 그 값으로 잘립니다. 응답 JSON의 키는 `changed`, `timed_out`, `seq`, `waited_ms`입니다. README가 예시로 적은 본문은 `{"changed":true,"timed_out":false,"seq":812,"waited_ms":340}`입니다. 변화가 요청보다 먼저 도착할 수 있으므로, 어떤 동작이 일으킨 변화를 기다릴 때는 이전 `/wait`의 `seq`나 스크린샷의 시퀀스 헤더를 `since`로 넘깁니다. 깜빡이는 캐럿은 대략 초당 두 번 다시 그려지므로, README는 `idle`을 500ms 미만으로 두거나 캐럿을 `region` 밖에 두라고 적습니다.

## README가 재는 자리와, RDP 문서가 따로 있는 자리

README 벤치마크 절의 요약 문장은 "아래의 모든 테스트에서 voxl은 평균 60 FPS, 중앙 지연 12–99ms이고, noVNC는 평균 8 FPS 미만"입니다. 기계는 GPU 없는 16 vCPU AMD EPYC 9334 VM, 데스크톱은 2560×1600 Xvfb, 디코더는 콘텐츠에 그린 픽셀 마커를 읽는 네이티브 클라이언트입니다. 칸은 FPS(최악 1초), 그다음 그림이 그려진 뒤부터 프레임이 디코드될 때까지의 p50/p99입니다. voxl 열은 각 테스트의 최선 실행이라고 그 절이 적습니다. 재현은 [`bench/README.md`](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/bench/README.md)로 보내고, 이 글은 그 스크립트를 돌리지 않았습니다. 표의 숫자는 그 README에 적힌 그대로입니다.

| 테스트 | voxl | noVNC | KasmVNC | Neko 기본 |
|---|---|---|---|---|
| Chromium 스크롤, LAN | 60.1 (59.7), 55/60 ms | 6.7 (6.3), 198/301 ms | 51.7 (39.5), 99/135 ms | 25.0 (23.7), 156/217 ms |
| 스크롤, 10 Mbps / 40 ms | 60.0 (59.4), 82/94 ms | 2.6 (2.4), 426/678 ms | 8.3 (7.4), 229/249 ms | 24.6 (14.9), 221/737 ms |
| 스크롤, 5 Mbps / 60 ms | 60.1 (59.7), 99/109 ms | 1.6 (1.4), 637/937 ms | 4.9 (3.6), 306/415 ms | 21.7 (3.8), 1.2/3.6 s |
| 1080p 애니메이션, LAN | 60.1 (59.9), 12/16 ms | 7.7 (7.2), 149/210 ms | 56.7 (51.6), 51/82 ms | 24.8 (23.6), 122/202 ms |
| 애니메이션, 10 Mbps / 40 ms | 60.1 (59.5), 46/71 ms | 5.8 (5.2), 160/226 ms | 52.9 (49.2), 76/115 ms | 25.1 (9.1), 295/962 ms |
| 애니메이션, 5 Mbps / 60 ms | 60.0 (58.8), 66/92 ms | 5.1 (4.7), 174/240 ms | 34.1 (26.4), 104/156 ms | 15.2 (8.6), 5.0/9.4 s |
| 전체 화면 애니메이션, LAN | 59.8 (54.0), 18/25 ms | 5.9 (5.2), 184/279 ms | 34.2 (32.5), 83/102 ms | 22.7 (18.0), 2.9/3.3 s |

noVNC 열의 설명은 x11vnc와 noVNC를 E2B Desktop과 Daytona가 실어 보내는 플래그(`-forever -wait 50 -shared`, Tight)로 돌렸다는 것입니다. README는 x11vnc가 화면을 폴링해서 6–8 FPS에 막힌다고 적습니다. [noVNC](https://github.com/novnc/noVNC) 저장소 설명은 "VNC client web application"이고, README는 이것을 HTML VNC 클라이언트 라이브러리이자 그 위의 앱이라고 적습니다. 같은 표의 KasmVNC 1.4.0은 LAN 스크롤에서 51.7 FPS입니다. `bench/README.md`는 Kasm 클라이언트가 웹 클라이언트와 같이 웹소켓 위의 RFB를 말한다고 적습니다. 그래서 이 표가 말하는 격차는 "VNC라는 글자가 60fps를 못 한다"가 아니라, 그 절이 적은 x11vnc 폴링 설정과 H.264 스트림의 차이입니다.

WebRTC 열로 README가 이름을 거는 것은 Neko입니다. 링크 설명은 웹소켓 서버에는 TCP 프록시를, Neko의 WebRTC 미디어(UDP)에는 `tc netem`을 썼다고 적습니다. Neko 3.2 기본은 VP8, 25 FPS입니다. 맞춘 Neko는 60 FPS 캡처에 x264 `ultrafast`/`zerolatency`, 최대 30 Mbps이고, 기본으로 꺼진 추정기 때문에 느린 링크에서 프레임이 쌓입니다. "stalls"는 20초 동안 프레임이 없었다는 뜻이라고 그 절이 적습니다. Daytona 열은 voxl을 Daytona에 넣은 측정이 아닙니다. 기본 샌드박스(CPU 1개, x11vnc와 noVNC, 2560×1600)를 Daytona의 서명된 프리뷰 프록시로 본 열이고, 약 12ms 떨어진 그 경로의 지연이 포함된다고 적습니다.

RDP와 맞댄 열은 이 README에 없습니다. Microsoft의 [MS-RDPBCGR](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/5073f4ed-1e93-45e1-b039-6e30c385867c)는 원격 컴퓨터의 그래픽을 사용자에게 보내고, 사용자의 입력을 원격 컴퓨터에 넣어 그 자리에서 주입하는 프로토콜이라고 적습니다. 공개된 개정은 2026-03-09의 62.0입니다. [MS-RDSOD](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdsod/365317bb-e811-44f1-9ff3-d8036b34ae25)는 RDP를 멀티채널 프로토콜로 적고, 전송은 TCP 또는 UDP이며, 가상 채널이 화면, 입력, 장치, 라이선스를 나눈다고 적습니다. 게이트웨이로 방화벽 뒤의 세션 호스트에 RDP를 터널링하는 프로토콜은 같은 개요의 MS-TSGU입니다. voxl이 "웹소켓 하나면 프록시를 탄다"고 적은 비교 대상은 이 문서가 아니라, TURN과 UDP가 필요한 WebRTC입니다. RDP보다 빠르다는 문장은 이 글이 읽은 voxl 문서에 없습니다.

FAQ가 Moonlight·Sunshine에 대해 적는 자리는 자기 GPU 기계에서 게임을 하는 쪽이고, 그 용도에는 그쪽이 더 맞다고 합니다. RustDesk에 대해서는 TeamViewer·AnyDesk에 해당하는 자리로, 양쪽에 앱을 두고 ID 서버로 서로를 찾는다고 적습니다. 같은 답은 RustDesk가 Wayland 데스크톱을 실험적으로, Android 폰을 공유하며 voxl은 그 둘을 하지 않는다고 적습니다. RustDesk 웹 클라이언트도 ID와 릴레이를 통하며 셀프호스트 쪽은 RustDesk Server Pro가 따른다는 문장은 그 FAQ의 문장입니다. 이 글은 RustDesk 가격표를 다시 열지 않았습니다.

GPU 인코딩은 FAQ가 "아직 없다"고 적습니다. H.264는 CPU의 x264이고, 바쁜 2560×1600 데스크톱에서 X 서버를 포함해 1.3–1.7코어라고 같은 답이 적습니다. CPU 표의 voxl 칸은 idle 0.00, 1080p 애니메이션 1.39, 스크롤 1.33, 전체 화면 1.68입니다. macOS 하드웨어 인코딩은 진행 중이라고 FAQ가 적습니다.

브라우저 표는 WebCodecs가 되는 쪽입니다. Chromium 94+는 데스크톱과 Android에서 예, Firefox 130+ 데스크톱은 예, Safari 16.4+와 iPhone·iPad의 브라우저는 예(소리는 Safari 26), Firefox for Android는 아니오. 전화와 태블릿은 터치와 화면 키보드를 받는다고 적습니다.

## 비즈니스 인사이트

숫자와 문서 사실은 위에 붙입니다. 원격 데스크톱 시장의 점유율은 이 글이 측정하지 않았습니다.

회사 쪽 1차 출처는 제품 페이지입니다. [tembo.io/about](https://www.tembo.io/about)는 Ry Walker를 CEO 겸 공동창업자, Darren Baldwin Jr.를 CTO 겸 공동창업자로 적고, "We've raised $20M to build the agent platform engineering teams can trust, including a $14M Series A led by GreatPoint Ventures"라고 적습니다. 이 글은 그 문장을 투자 공시나 보도자료와 다시 대조하지 않았습니다. 포스트 계정의 자기소개는 co-founder/cto @tembo이고, 이 커밋의 작성자 필드는 Darren Baldwin입니다. 계정과 그 이름의 사람이 같다는 확인은 그 공개 문자열까지입니다.

[2026-09-15 Tembo Computer 글](https://www.tembo.io/blog/announcing-tembo-computer)은 작성자 줄을 Darren Baldwin으로 두고, 직접 만든 Linux VM에 60fps 데스크톱이 있으며 Computer 탭이 에이전트 채팅 옆에 그 화면을 연다고 적습니다. 같은 글의 가격표는 시간당 환산으로 Nano 2 vCPU·2 GiB가 $0.1066, Ultra 32 vCPU·128 GiB가 $2.9536이고, vCPU-시간 $0.0403에 GiB-시간 $0.0130을 더한다고 적습니다. "E2B와 Daytona 같은 제공자보다 20% 싸다"는 그 글의 문장이고, 이 글은 두 회사의 가격을 다시 받아 비율을 계산하지 않았습니다. 그 글은 voxl이라는 이름을 쓰지 않습니다. 이름을 잇는 줄은 `Cargo.toml` 주석입니다. 서버를 라이브러리로 넣는 예로 Tembo CLI의 `tembo voxl`을 적습니다. 9월 글의 스트리머 바이너리가 이 커밋이라는 문장은 그 주석에 없습니다.

채택 비용으로 문서가 적는 것은 구독료가 아닙니다. 빌드에는 Rust, pkg-config, clang, x264, libyuv, libopus, libpulse, esbuild가 필요하고, README는 `nix-shell`이 그걸 맞춘다고 적습니다. macOS는 Homebrew의 x264·opus·pkgconf·esbuild, Windows는 vcpkg의 `x64-windows-static-md`와 LLVM, esbuild입니다. crates.io `voxl-server`의 `downloads`는 2026-11-05 조회에서 **241**이고, 그중 0.3.3이 22입니다. 버전 0.3.3의 `created_at`은 2026-11-04T15:43:25.388162Z, 라이선스 필드는 MIT입니다. 별 999는 같은 날 09:15 KST의 저장소 API 값입니다.

라이선스는 소스와 배포 바이너리가 갈립니다. `LICENSE`는 MIT이고 저작권 줄은 "Copyright (c) 2026 Tembo"입니다. README의 마지막 FAQ는 코드가 MIT이고, 링크하는 x264가 GPL-2.0이므로 voxl 바이너리와 그것을 묶는 배포물은 GPL로 배포된다고 적습니다. 이 글이 연 `https://raw.githubusercontent.com/mirror/x264/master/COPYING`의 첫 제목은 "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"입니다. 소스만 주고 받는 것과, x264를 링크한 바이너리를 제품에 넣는 것은 README가 다른 문장으로 둡니다. 이 글은 그 결합이 특정 배포 형태에서 GPL 의무를 만드는지를 판정하지 않습니다.

CPU 표의 1.39–1.68코어는 그 VM, 그 해상도, 한 클라이언트에서의 프로젝트 측정입니다. 화면이 조용할 때의 voxl idle은 0.00입니다. GPU 인코딩이 아직 없다는 FAQ와 같이 읽으면, 바쁜 데스크톱의 비용은 인코더 코어이지 별도 GPU 칸이 아닙니다.

**분석/의견.** 이득이 가는 자리는 README가 적은 그 자리입니다. 화면이 있는 샌드박스를 이미 돌리고, 사람이 볼 탭은 URL 하나면 되며, 에이전트는 잠자기 대신 `/wait`의 시퀀스로 다음 스크린샷을 맞추고 싶은 쪽입니다. noVNC를 Tight와 폴링으로 실어 보내던 구성에게 이 표는, 프로토콜 이름보다 캡처가 손상을 알고 H.264로 나가는지가 프레임 수를 가른다는 문장입니다. KasmVNC LAN 51.7 FPS는 그 대체가 표 안의 유일한 답이 아니라는 칸입니다.

손해는 세 문서가 이미 적습니다. Wayland 세션은 아직 입력이 아닙니다. localhost 밖에서는 TLS와 `--allowed-hosts`가 없으면 WebCodecs와 호스트 검사가 페이지를 세웁니다. 바이너리를 제품에 넣어 배포하는 쪽은 MIT 소스와 별도로 x264의 GPL을 README가 배포 조건으로 올립니다. crates.io 다운로드 241은 발표 다음 날의 설치 횟수이지, Tembo 세션이 이 라이브러리를 몇 번 불렀는지는 아닙니다. 그 호출 수는 이 글의 1차 출처에 없습니다.

## 팩트 체크

✅ 사실 / ⚠️ 부분적으로 사실·범위가 다름·이 글이 다시 재지 못함 / ❌ 사실 아님

### @darrenjr 포스트

| 주장 | 판정 | 근거 |
|---|---|---|
| voxl은 Rust로 쓴 원격 데스크톱 스트리밍이다 | ✅ | [tembo/voxl](https://github.com/tembo/voxl) 주 언어 Rust, README 첫 문단, `Cargo.toml` 설명. 패키지 이름은 `voxl-server` 0.3.3. 웹 클라이언트는 TypeScript이고, 크레이트 이름 `voxl`은 보셀 CLI라서 README가 설치 이름에서 빼 둔다. |
| extremely fast | ⚠️ | 저장소 설명과 포스트의 형용사다. 숫자로 받은 비교는 README 벤치마크 절의 자체 표이고, voxl 열은 각 테스트의 최선 실행이다. 이 글은 `bench/`를 다시 돌리지 않았다. |
| 60 fps + low latency | ⚠️ | README 요약은 모든 테스트 평균 60 FPS, 중앙 지연 12–99 ms다. `--framerate` 기본값은 60이라는 상한이다. 표의 전체 화면 LAN 칸은 **59.8 (54.0), 18/25 ms**라서 최악 1초는 54.0 FPS다. 1080p LAN의 p50은 12 ms, 5 Mbps 스크롤의 p50은 99 ms, p99는 109 ms다. "낮다"의 기준선은 그 표 안에만 있다. |
| macOS, Windows, Linux | ✅ | README의 세 절과 `Cargo.toml`의 x11rb, ScreenCaptureKit, DXGI 의존성. Linux는 X11·Xvfb이고 FAQ는 Wayland를 아직 아니라고 적는다. Windows는 10 이상, 사용자 세션이다. macOS와 Windows의 기본 수신 주소는 `127.0.0.1`이다. |
| 웹소켓 하나라서 프록시와 샌드박스 포털을 통과한다 | ⚠️ | 스트림 소켓이 하나인 것은 `protocol.ts`와 `GET /ws`가 맞다. FAQ는 리버스 프록시, 터널, 샌드박스 프리뷰 URL, TURN·UDP 없음을 이유로 적는다. 같은 README는 호스트 이름에 `--allowed-hosts`, localhost 밖에 WebCodecs용 HTTPS를 요구한다. 맞지 않으면 403이다. 표의 Daytona 열은 Daytona의 noVNC를 그 프리뷰 프록시로 본 열이지, voxl을 샌드박스 포털에 넣어 잰 열이 아니다. |
| 에이전트 API `/screenshot`, `/record`, `/wait` | ✅ | `server.rs`의 `GET /screenshot`, `GET /record`, `POST /record/start`, `POST /record/stop`, `GET /wait`. README의 curl과 같다. 이 경로는 웹소켓 프레임이 아니라 같은 포트의 HTTP이고, 기본으로 비밀번호가 필요하다. `/healthz`와 페이지 스크립트만 비밀번호 없이 열린다. |

**총평:** voxl은 Rust 서버가 X11·ScreenCaptureKit·DXGI로 화면을 받아 x264 H.264를 웹소켓 하나에 싣고, 스크린샷·녹화·대기는 HTTP로 여는 프로그램이 맞다. 느슨한 곳은 60fps다. 그 숫자는 기본 프레임 상한이고, README가 공개한 표에서 voxl 열은 최선 실행이며, 전체 화면 테스트의 최악 1초는 54.0 FPS다. 프록시 문장도 플래그 없이 어떤 포털이든 열린다는 측정은 이 문서에 없다.

## 참고 자료

- 계기 포스트 — [@darrenjr, 2026-11-03 16:00 UTC](https://x.com/darrenjr/status/2117647994300387396) · [i/status](https://x.com/i/status/2117647994300387396) · 이 환경에서 읽은 사본 [fxtwitter](https://api.fxtwitter.com/status/2117647994300387396)
- voxl main `9d004076f73cb374bdb87ff96d2e23e44b9f47b9`, 2026-11-04T23:14:16Z — [README](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/README.md) · [bench/README.md](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/bench/README.md) · [SECURITY.md](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/SECURITY.md) · [LICENSE](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/LICENSE) · [Cargo.toml](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/Cargo.toml) · [capture.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/capture.rs) · [mac/capture.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/mac/capture.rs) · [win/capture.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/win/capture.rs) · [encoder.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/encoder.rs) · [server.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/server.rs) · [record.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/record.rs) · [wait.rs](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/src/wait.rs) · [protocol.ts](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/web/src/protocol.ts) · [worker.ts](https://github.com/tembo/voxl/blob/9d004076f73cb374bdb87ff96d2e23e44b9f47b9/web/src/worker.ts)
- 별·포크·라이선스 — 2026-11-05 00:15:01 GMT `GET /repos/tembo/voxl`. `stargazers_count` 999, `forks_count` 43, `license.spdx_id` MIT, `open_issues_count` 10
- crates.io `voxl-server` 0.3.3 — [crates.io/crates/voxl-server](https://crates.io/crates/voxl-server), `created_at` `2026-11-04T15:43:25.388162Z`, 버전 라이선스 MIT, 크레이트 `downloads` 241. 이름 `voxl`은 [별개의 보셀 CLI](https://crates.io/crates/voxl) (`tyleo/tyt`, 0.1.0)
- x264 `COPYING` — [mirror/x264 COPYING](https://raw.githubusercontent.com/mirror/x264/master/COPYING), 첫 제목은 GNU GPL Version 2, June 1991. 바이너리가 GPL로 배포된다는 문장은 voxl README FAQ
- noVNC — [novnc/noVNC](https://github.com/novnc/noVNC), 저장소 설명 "VNC client web application"
- RDP — [MS-RDPBCGR](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/5073f4ed-1e93-45e1-b039-6e30c385867c) 개정 62.0 (2026-03-09) · [MS-RDSOD 기능 구조](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdsod/365317bb-e811-44f1-9ff3-d8036b34ae25) · 게이트웨이 [MS-TSGU](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdsod/adcb72b1-ede2-4c73-a9f2-dd13adb0c6b8)는 같은 개요의 프로토콜 표에 있다
- Tembo — [tembo.io](https://www.tembo.io/) · [about](https://www.tembo.io/about) · [Announcing Tembo Computer, 2026-09-15](https://www.tembo.io/blog/announcing-tembo-computer)
- E2B Desktop — [e2b-dev/desktop](https://github.com/e2b-dev/desktop), README 제목 "Open Source Virtual Computer for Computer Use"
