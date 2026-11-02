---
title: "리눅스 없이 네오지오: Raspberry Pi 베어메탈 에뮬레이터 neo-pi 팩트 체크"
date: 2026-11-02
slug: neo-pi-bare-metal-neogeo
tags: [RaspberryPi, 베어메탈, 에뮬레이션, NeoGeo, Geolith, 팩트체크]
summary: "OS 없이 Pi 3 B+/4에서 네오지오를 켠다는 neo-pi를 저장소·Geolith·Circle·Raspberry Pi 부팅 문서와 대조했습니다. 1ms USB 폴링과 2코어 분업은 소스에 있고, 풀스피드와 CRT급 반응은 버전에 따라 말이 갈립니다."
---

> 이 글은 X에서 북마크해 둔 [@yoshinokentarou의 포스트](https://x.com/yoshinokentarou/status/2116771938123280753)를 계기로, 프로젝트 페이지 [neo-pi](https://alessioscand.github.io/neo-pi/)와 소스 [alessioscand/neo-pi](https://github.com/alessioscand/neo-pi)를 읽고 정리한 것입니다. 아래 팩트 체크의 여섯 항목은 그 포스트의 주장으로 전달된 내용입니다. 포스트 원문은 이 글을 쓰는 시점에 다시 열지 못했으므로, 인용부호 안의 영어 문장은 저장소·릴리스 노트·공식 문서에서 가져온 것입니다.

검토한 기준점은 기본 브랜치 `main`의 [`96dc2db`](https://github.com/alessioscand/neo-pi/commit/96dc2db90577af2ce1e9c499f3899021b94755cb)(2026-11-01, `NEOPI_VERSION` `"0.6.4"`)와, 그 위에 합쳐지지 않은 프리릴리스 태그 [`v0.7.0-rc1`](https://github.com/alessioscand/neo-pi/releases/tag/v0.7.0-rc1)(`e485ca9`)입니다. 두 트리의 부모가 같고(`5276a86`), 그 다음 커밋이 갈립니다. 웹사이트 문장과 빔 레이싱 코드가 서로 다른 쪽에 있습니다.

## 왜 개발자에게 흥미로운가

네오지오 에뮬레이터 자체는 새롭지 않습니다. 흥미로운 쪽은 **리눅스를 부팅하지 않는 Raspberry Pi 프로그램이 화면, USB 패드, 오디오, 두 번째 CPU 코어를 어떻게 직접 붙이느냐**입니다.

- 부팅 이미지가 `kernel8.img`라는 이름의 **커널**이고, 그 안의 `main()`이 곧 앱입니다. 프로세스 스케줄러가 없습니다.
- 입력 지연을 줄이려고 한 일이 "게임 루프를 1ms로 돌리기"가 아니라, **USB 인터럽트 엔드포인트의 폴링 간격**을 바꾸는 패치입니다.
- 멀티코어는 스레드 풀이 아니라, **스캔라인을 큐에 넣고 다른 코어가 그리는** 생산자·소비자이고, 메모리 배리어를 빠뜨리면 코어가 잠든 채 안 깨어납니다. 저자가 Pi 3에서 실제로 봤다고 패치 주석에 적었습니다.
- 프로젝트 웹은 "HDMI 신호보다 조금 앞서 라인을 그린다"고 쓰는데, **그 코드는 `main`에 없습니다.** 태그에만 있습니다. 바이너리와 `git clone`의 기본 브랜치를 구분해야 하는 사례입니다.

## neo-pi가 무엇인가

[Alessio Scanderebech](https://alessioscand.github.io/neo-pi/)가 2026-10-29에 첫 공개한([v0.6.1](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.1)) Raspberry Pi용 네오지오 에뮬레이터입니다. 라이선스는 Circle을 링크하므로 **GPLv3**(또는 그 이후). Geolith 코어는 **BSD 3-Clause**를 유지합니다. README의 요구 사항은 Raspberry Pi 4(Pi 400도 될 것이라 적음) 또는 **Raspberry Pi 3 B+**, FAT32 마이크로SD, USB 패드, HDMI입니다.

BIOS(`neogeo.zip`)와 `.neo` 게임은 **포함되지 않고, 배포하지도 않는다**고 README와 SD 카드 안내가 반복합니다. Geolith 쪽 README도 "legally obtained dumps"로 검증하라고 합니다. 이 글은 ROM을 구하는 방법을 다루지 않습니다. NEO GEO는 SNK의 상표이고, 프로젝트는 SNK와 무관하다고 적혀 있습니다.

카드에 게임이 하나뿐이면 목록을 건너뛰고 그 게임으로 들어갑니다. 웹사이트는 이 동작을 MV-1 mode라고 부릅니다.

## 베어메탈이란: GPU 펌웨어가 커널 이미지를 올린다

Raspberry Pi는 ARM이 리눅스를 시작하기 **전에** VideoCore GPU 쪽 펌웨어가 SD 카드의 FAT 파티션을 읽습니다. 공식 문서 기준으로 정리하면 이렇습니다.

- Pi 3까지는 SoC의 부트 ROM이 `bootcode.bin`을 읽고, 이어서 `start*.elf`가 GPU에서 부팅을 이어받습니다. `start.elf`가 `config.txt`를 읽고 커널 이미지를 ARM에 넘깁니다. [부트 파티션 설명](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/configuration/reference.adoc)
- Pi 4와 Pi 5는 `bootcode.bin`을 쓰지 않습니다. Pi 4는 보드 EEPROM의 부트로더가 그 역할을 하고, Pi 4용 펌웨어는 `start4.elf`입니다. [같은 문서](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/configuration/reference.adoc), [config.txt의 `kernel`](https://www.raspberrypi.com/documentation/computers/config_txt.html#kernel)
- `kernel=`은 부트 파티션에서 로드할 파일 이름입니다. 64비트 이미지는 `kernel8.img` 계열입니다.

neo-pi의 `dist/sd/config.txt`는 그 규칙을 그대로 씁니다. `arm_64bit=1`, 로드 주소 `kernel_address=0x80000`, 모델별 커널 이름:

```text
[pi3]
kernel=kernel8.img

[pi3+]
kernel=kernel8.img

[pi4]
armstub=armstub8-rpi4.bin
kernel=kernel8-rpi4.img
```

`BUILD.md`는 이 SD 이미지에 Raspberry Pi 펌웨어(Circle이 쓰는 `raspberrypi/firmware` 커밋 `0641c5bf`: `bootcode.bin`, `start*.elf`, `fixup*.dat`, Pi 4용 dtb, `armstub8-rpi4.bin`)를 넣는다고 적습니다. Pi 3 경로용 `bootcode.bin`과 Pi 4 경로용 `start4.elf`·EEPROM 부트가 한 카드에 같이 있는 구성입니다.

ARM에 넘어온 뒤의 진입점은 Circle 스타일의 `main()`입니다. 리눅스도, init도 없습니다.

```cpp
int main (void)
{
	static CKernel Kernel;
	if (!Kernel.Initialize ())
	{
		halt ();
		return EXIT_HALT;
	}
	TShutdownMode ShutdownMode = Kernel.Run ();
	/* ... reboot() 또는 halt() ... */
}
```

`CKernel::Run()`은 기기 초기화 뒤에 `while (1)`로 게임 목록과 프레임 루프를 돕니다. README의 표현이 정확합니다. "no operating system on the Pi's CPU". GPU에는 Broadcom 펌웨어가 여전히 있고, USB·SD·HDMI·오디오 드라이버는 [Circle](https://github.com/rsta2/circle)(Rene Stange, GPLv3, C++ 베어메탈 환경)이 제공합니다. `BUILD.md`는 Circle 커밋 `7a81e1b`를 `AARCH=64`, `ARM_ALLOW_MULTI_CORE`로 빌드한다고 적습니다. Circle 트리 자체는 저장소에 들어 있지 않고, neo-pi가 Circle에 가하는 변경은 `patches/`에 있습니다.

즉 "OS가 없다"는 **ARM 위에서 범용 OS 스케줄러가 돌지 않는다**는 뜻이지, 펌웨어와 드라이버 계층까지 없다는 뜻은 아닙니다. 저자도 README에서 "bare metal doesn't mean starting from scratch"라고 씁니다.

## USB를 1ms마다 읽는다는 말의 실체

게임 루프는 패드를 **프레임마다 한 번**, 에뮬레이션 직전에 읽습니다.

```cpp
// read controls as late as possible, right before emulating the frame
boolean bChange = m_pInput->TakeChange (&nChangeTicks);
u32 Pad[2] = {m_pInput->Get (0), m_pInput->Get (1)};
/* ... */
geo_exec ();
```

`UpdateDevices()`는 주석대로 "매 프레임이 아니라 태스크 레벨에서 새 장치를 스캔"하는 함수이고, 게임 루프에서는 30프레임마다 호출됩니다. 1ms는 여기가 아닙니다.

1ms는 Circle의 USB 엔드포인트 간격입니다. `patches/circle-usb-poll.py`가 low/full-speed 장치의 **인터럽트 IN** 간격이 전역값보다 크면 그 값으로 깎습니다. 허브(`bDeviceClass == 9`)는 빼고요. 기본값은 1입니다.

```python
edit('lib/usb/usbendpoint.cpp', '''CUSBEndpoint::CUSBEndpoint (CUSBDevice *pDevice)\n''',
     '''unsigned g_nUSBInterruptPollMs = 1;

CUSBEndpoint::CUSBEndpoint (CUSBDevice *pDevice)\n''')
```

`kernel.cpp`의 `LoadConfig()`는 `neopi/neopi.cfg`에 `usbpoll=native`가 있으면 이 전역값을 0으로 만들어 "장치가 요청한 간격"으로 되돌리고, 로그에는 `"1 ms"` 또는 `"native"`를 남깁니다. SD 카드 `README.txt`는 native가 보통 **8–10ms**라고 적습니다. `BUILD.md`는 이 패치를 리눅스의 `usbhid.jspoll=1`에 비깁니다.

정리하면, 패드는 최대 약 1ms 묵은 HID 리포트를 갖고 있고, 그 리포트를 **게임에 넣는 주기**는 한 프레임(약 16.7ms)입니다. 1ms 폴링이 입력 지연을 줄이려는 설계인 것은 맞고, 에뮬레이션 루프가 1000Hz로 돈다는 뜻은 아닙니다. 저장소에는 이 패치 전후를 외부 지연 측정기로 잰 표는 없습니다. 0.6.4 릴리스 노트는 멀티코어를 넣기 전후로 "USB report에서 스캔아웃 시작까지"를 재 봤더니 **입력 지연은 그대로**였다고 적습니다. 그건 1ms 패치의 효과가 아니라 코어를 나눈 효과에 대한 말입니다.

## 화면과 소리: 프레임버퍼, HVS, 48kHz

게임 화면은 이중 버퍼입니다. `CBcmFrameBuffer`를 높이를 두 배로 잡고, `Flip()`이 `SetVirtualOffset`으로 보여줄 버퍼를 바꿉니다. 한 프레임의 끝은 이렇습니다.

```cpp
m_Video.Flip ();
if (m_bVSync)
{
	m_Video.WaitForVSync ();
}
else
{
	while ((int) (CTimer::GetClockTicks () - nNextDeadline) < 0)
	{
	}
	nNextDeadline += 16667;
}
```

펌웨어 vsync가 블로킹되지 않아 초당 프레임이 75를 넘으면(`nFPS100 > 7500`) 타이머 대기로 바꿉니다. 로그 문구는 `"firmware vsync does not block: switching to timer pacing"`입니다.

스케일은 정수배만 합니다. 보이는 영역은 Geolith 버퍼 안의 304×224(`GAME_W` × `GAME_H`)이고, CPU가 `m`배, Pi의 하드웨어 스케일러 HVS가 `k`배, 합이 `S = m * k`입니다. 스캔라인은 그 그리기 과정에서 어두운 줄을 넣는 것이고, 별도 프레임을 쌓지 않습니다. `video.h`는 "no extra buffering, no added lag"이라고 적습니다. SD 안내의 숫자와 맞습니다. 1080p에서 4배면 1216×896, 720p에서 3배면 912×672.

소리는 HDMI 48kHz입니다(`CHDMISoundBaseDevice`). Geolith의 YM2610 출력은 믹서가 `56319`Hz로 맞춥니다. 주석에 MVS 55555Hz, AES 55943.489Hz를 프레임 레이트에 맞춰 다시 잡은 값이라고 되어 있습니다. neo-pi 기본 리샘플러는 이 56319Hz를 48kHz로 선형 보간합니다. Speex 품질 7이 Pi 3에서 프레임 시간의 약 15%를 먹어서, 0.6.2부터 가벼운 쪽으로 바꿨다고 소스 주석과 릴리스 노트가 말합니다. `resampler=speex`로 되돌릴 수 있습니다.

오디오 쪽에는 입력 지연과 별개인 버퍼가 있습니다. 큐 용량 4800프레임(100ms), 목표 수위 1600프레임입니다.

```cpp
#define QUEUE_FRAMES	4800			// 100 ms queue capacity
#define TARGET_FRAMES	1600			// keep ~2 video frames queued (~33 ms)
```

큐가 목표에서 벗어나면 블록 길이를 최대 약 1% 늘리거나 줄입니다. 화면 반응을 말하는 1ms 폴링과, 소리를 끊지 않으려고 쌓아 둔 약 33ms는 다른 예산입니다.

## 멀티코어: 코어 0이 돌리고, 코어 1이 줄을 그린다

0.6.4부터 기본 빌드는 `NEOPI_MC`입니다. Circle의 `CMultiCoreSupport`를 상속한 워커는 **코어 1만** 쓰고, 주석이 코어 2와 3은 논다고 적습니다.

```cpp
void Run (unsigned nCore)
{
	if (nCore == 1)
	{
		geo_lspc_mc_worker (&m_nStop);	// cores 2 and 3 stay idle
	}
}
```

Geolith 원본은 수정하지 않고, 빌드 디렉터리에 복사한 `geo_lspc.c`에만 `patches/geolith-mc.py`를 적용합니다. 코어 0은 68000·Z80·사운드를 돌리며 "라인 N을 그려라"를 링 버퍼에 넣고 `DSB` 다음 `SEV`로 코어 1을 깨웁니다. 패치 주석은 배리어가 없으면 스토어가 보이기 전에 깨어나서, 예전 값을 보고 다시 잠든 뒤 **영원히 안 깨어나는** 경우를 Pi 3에서 봤다고 합니다. VRAM이나 팔레트를 바꾸기 전에는 코어 0이 코어 1을 기다리고, 그래서 한 코어와 그림이 같아야 한다고 합니다. 빈 파일 `neopi/MCTEST`가 그 비교를 합니다. `multicore=off`면 0.6.3까지의 한 코어 경로입니다.

0.6.4 릴리스 노트는 이 분업으로 **스캔라인 필터가 Pi 3에서도** 느려지지 않게 됐고, 입력 지연은 바뀌지 않는다고 적습니다. 웹의 "라인을 HDMI보다 조금 앞서 보낸다"와는 다른 문장입니다. `main`의 코어 1은 끝난 줄을 백 버퍼에 복사할 뿐이고, 프레임의 공개는 여전히 `Flip()`과 vsync입니다.

## Geolith: 무엇을 맡고, 어디는 빼 두었나

코어는 Rupert Carmichael의 [Geolith](https://gitlab.com/jgemu/geolith)입니다. neo-pi는 미러 설명을 `third_party/geolith`에 넣고, CD 쪽은 `src/geo_disc_stub.c`로 바꿔 링크하지 않습니다. 스텁 첫 주석이 "Neo Geo CD is out of scope"입니다. 그래서 neo-pi가 말하는 것은 카트리지 MVS/AES이지, Geolith 전체(CD/CDZ 포함)가 아닙니다.

Geolith README(미러의 같은 문장)는 이렇게 자신을 설명합니다.

- "highly accurate emulator for the Neo Geo AES, MVS, CD, and CDZ."
- CPU는 **명령어 단위**로 에뮬레이트하고, CPU끼리와 LSPC(영상)·YM2610(소리)을 촘촘히 동기화한다.
- 영상 이벤트는 공개된 문서에 기댄 **"best effort"** 이고, 완전히 사이클 정확한 영상은 **장기 목표**다. 지금은 상용 게임이 플레이 가능하고, 실기와의 차이는 아주 작으며, 알려진 큰 버그는 없다고 적습니다.
- `.NEO`는 암호화는 풀려 있지만 보호 장치(챌린지-리스폰스, 디스크램블)는 패치되어 있지 않아서, 에뮬레이터가 실기처럼 그 장치를 돌려야 한다고 합니다. 예외로 무라이선스 게임 Super Bubble Pop만 미리 패치되어 있습니다.
- 상용 AES/MVS 라이브러리와 상용 CD 라이브러리에 대해 호환 100%를 주장합니다. PAL, 일부 초기 프로토타입, 전용 JAMMA PCB는 제외라고 같은 절에 적혀 있습니다. CD 100%는 Geolith의 주장이고, neo-pi 빌드는 CD를 빼므로 neo-pi의 범위가 아닙니다.

neo-pi 옵션의 지역은 EUROPE / USA / JAPAN / ASIA 네 가지이고, 시스템은 MVS와 AES입니다. UniBIOS는 README의 Planned와 웹사이트의 "Coming next"에 있습니다. `main`의 시스템 메뉴가 고르는 값은 MVS와 AES뿐입니다.

한 프레임의 시간 단위는 Geolith `geo.c`에 있습니다. 라인당 1536 마스터 사이클, 프레임당 264라인입니다.

```c
#define MCYC_PER_LINE 1536
#define MCYC_PER_FRAME (MCYC_PER_LINE * 264) // 405504
```

벤치마크 로그는 "100% = 59.19 fps"를 실기 네오지오 속도로 둡니다. Geolith 문서의 MVS 약 59.19fps와 같은 자리수입니다.

## 빔 레이싱은 어디에 있나

`main`의 README는 설계 이야기 끝에 이렇게 쓰고, Planned 목록의 첫 항목도 Beam racing입니다.

> it can be sent to the screen just before the HDMI output reaches it: beam racing! … *(Beam racing is coming in an upcoming release.)*

그런데 같은 README의 테스트 옵션 표에는 `beamracing=off`, `framedelay=`, `framephase=classic`이 있습니다. `main`의 `LoadConfig()`는 `usbpoll=native`와 `multicore=off`는 읽고, **`beamracing` 문자열은 어디에도 없습니다.**

그 코드는 태그 `v0.7.0-rc1`에 있습니다. `src/race.h`의 설명은 이렇습니다. 프레임은 게임이 패드를 읽는 수직 귀선에서 시작하고, 코어 0은 각 줄의 데드라인보다 `lead`만큼 앞서 나가지 않으며, 코어 1이 그 줄을 지금 보이는 프레임버퍼에 넣고 늦었는지 봅니다. 늦은 줄이 잦으면 이중 버퍼로 돌아갑니다.

```cpp
/*
 * neo-pi - beam racing (Pi 4)
 *
 * One emulated frame per HDMI frame, raced against the HVS (see raster.h):
 *   - frame start (core 0, before the pads are read): wait until
 *       deadline(row 0) - lead - vblank budget
 *   - each visible row: wait until deadline(row) - lead
 *   - core 1 draws each row into the framebuffer being shown
 */
```

릴리스 노트(2026-11-01)는 범위를 더 넓게 말합니다. "Beam racing (Pi 4 and Pi 3)", 대부분의 게임이 자리를 잡으면 패드에서 그림 맨 위까지 약 2–3ms, 무거운 게임은 3–5ms, 실기 CRT는 약 2.5ms. 그리고 "Beam racing has been tested on a Pi 4 at 1080p; the Pi 3 and 720p need more testing." 헤더 주석은 Pi 4, 노트는 Pi 3도 켜지되 검증은 Pi 4 1080p라고 읽는 것이 맞습니다. 이 숫자들은 저자가 상태 줄의 `RACE`(자신이 더하는 지연, TV 지연은 제외)로 설명한 값이지, 이 글이 재현한 측정은 아닙니다.

웹사이트(`docs/index.html`, 커밋 `dcd9305`, `main`에 포함)는 조건을 붙이지 않습니다.

> Gamepads are polled every millisecond. Video lines are rendered just ahead of the HDMI signal, recreating the near-instant response of playing on real hardware with a CRT.

이 문장은 프리릴리스 태그의 기능을 가리키고, `main`을 클론해서 만드는 0.6.4 커널의 기능은 아닙니다. `v0.7.0-rc1`은 `5276a86`에서 갈라진 뒤 `main`으로 다시 합쳐지지 않았습니다. `main`의 그다음 커밋은 웹 문구를 고친 것입니다.

## 팩트 체크

북마크 포스트의 주장을 위 자료와 대조했습니다. ✅ 사실 / ⚠️ 부분적으로 사실·범위가 더 좁음·측정이 없음 / ❌ 사실 아님

| 주장 | 판정 | 근거 |
|---|---|---|
| Pi 3 B+/4에서 리눅스 없이 베어메탈로 동작한다 | ✅ | README 요구 사항은 Pi 4(400 포함 가능)와 Pi 3 B+. `config.txt`가 `[pi3]`·`[pi3+]`에 `kernel8.img`, `[pi4]`에 `kernel8-rpi4.img`를 지정하고 `main()`이 `CKernel::Run()`이다. ARM 쪽 리눅스 스케줄러는 없다. GPU 펌웨어(`start*.elf` 또는 Pi 4 EEPROM 부트)와 Circle 드라이버는 있다. [README](https://github.com/alessioscand/neo-pi/blob/main/README.md) · [config.txt](https://github.com/alessioscand/neo-pi/blob/main/dist/sd/config.txt) · [Raspberry Pi 부트 파일](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/configuration/reference.adoc) |
| 고정밀 Geolith 코어를 쓴다 | ✅ | `third_party/geolith`, BSD 3-Clause. Geolith README의 자기 설명은 "highly accurate". CPU는 명령어 단위이고, 영상 사이클 정확도는 장기 목표("best effort")라고 같은 문서가 적는다. neo-pi는 CD를 스텁으로 빼서 MVS/AES 카트리지만 해당한다. [Geolith README 미러](https://github.com/alessioscand/geolith-mirror/blob/master/README) · [geo_disc_stub.c](https://github.com/alessioscand/neo-pi/blob/main/src/geo_disc_stub.c) |
| 입력 지연을 줄이려고 USB 컨트롤러를 1ms마다 폴링한다 | ✅ | `g_nUSBInterruptPollMs = 1`이 low/full-speed 인터럽트 IN(허브 제외)의 간격을 1ms로 내린다. `usbpoll=native`면 장치가 요청한 간격(안내문: 보통 8–10ms). 게임 루프는 그 최신 상태를 프레임당 한 번 읽는다. 1ms 전후를 외부 기기로 잰 표는 저장소에 없다. [circle-usb-poll.py](https://github.com/alessioscand/neo-pi/blob/main/patches/circle-usb-poll.py) · [kernel.cpp의 LoadConfig](https://github.com/alessioscand/neo-pi/blob/main/src/kernel.cpp) |
| 멀티코어 처리를 지원한다 | ✅ | 0.6.4부터 코어 0이 CPU·소리, 코어 1이 LSPC 라인. 코어 2·3은 유휴. `multicore=off`로 끌 수 있다. 0.6.4 노트는 이 변경이 입력 지연을 바꾸지 않는다고 한다. [v0.6.4 릴리스](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.4) · [geolith-mc.py](https://github.com/alessioscand/neo-pi/blob/main/patches/geolith-mc.py) |
| Pi 3에서도 풀스피드다 | ⚠️ | [v0.6.4 노트](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.4)는 "Raspberry Pi 3 B+: even the heaviest games at full speed"라고 한다. 게임별 벤치 표는 저장소에 없고, 사용자가 카드에 `BENCH`를 두어야 `BENCH.TXT`가 생긴다. `BUILD.md`는 `-O3`가 Pi 3에서 60Hz를 놓치는 무거운 장면의 프레임을 **절반**으로 줄인다고 할 뿐 0으로 만든다고는 하지 않는다. README는 Pi 3 B+가 60°C 위에서 클럭을 내린다고 한다. 더 이전 노트는 더 좁다. v0.6.1은 Pi 4에서 시험했고 Metal Slug 3 등 무거운 게임이 아직 풀스피드가 아니라고 했고, v0.6.2는 Pi 3 B+에서 **대부분의** 게임이 60fps라고 했다. |
| 켜면 바로, 실기 느낌의 기판을 지향한다 | ⚠️ | 지향은 README와 웹 문구("Just power on and insert coin", "a few seconds")에 있다. 저장소에 부팅 초 단위 측정은 없고, GPU 펌웨어가 ARM 커널보다 먼저다. v0.7.0-rc1은 스케일러 측정 때문에 기동이 약 1초 더 걸린다고 한다. `main` 0.6.4의 화면 공개는 이중 버퍼와 vsync이고, CRT에 가깝다는 빔 레이싱은 아래 추가 항목이다. |

### 프로젝트 웹이 덧붙인 문장

| 주장 | 판정 | 근거 |
|---|---|---|
| 비디오 라인을 HDMI 신호보다 조금 앞서 그려, 실기+CRT에 가까운 반응을 만든다 | ⚠️ | 구현은 태그 [v0.7.0-rc1의 `src/race.h`](https://github.com/alessioscand/neo-pi/blob/v0.7.0-rc1/src/race.h)와 그 릴리스 노트에 있다. 헤더는 "beam racing (Pi 4)", 노트는 Pi 3도 포함하되 Pi 4 1080p에서 시험했고 Pi 3와 720p는 시험이 더 필요하다고 한다. `main`(0.6.4) 소스에는 `race.cpp`가 없고 README Planned에는 아직 Beam racing이 있다. 같은 README의 `beamracing=off`는 `main`의 `LoadConfig()`가 읽지 않는다. 웹(`dcd9305` 이후 `docs/index.html`)은 이 구분을 쓰지 않은 채 현재 기능처럼 적는다. [릴리스 노트](https://github.com/alessioscand/neo-pi/releases/tag/v0.7.0-rc1) · [웹](https://alessioscand.github.io/neo-pi/) |

**총평:** "리눅스 없이 돈다", "Geolith를 쓴다", "USB 인터럽트 간격을 1ms로 당긴다", "코어를 둘로 나눈다"는 소스와 맞습니다. ❌로 끊을 문장은 없었습니다. 범위를 넘는 쪽은 Pi 3 **전부·항상** 풀스피드라는 읽기, 그리고 웹이 프리릴리스의 빔 레이싱을 기본 브랜치의 현재 기능처럼 말하는 부분입니다.

## 개발자로서 가져갈 점

1. **베어메탈 Pi 앱의 부트 체인은 `config.txt`의 `kernel=`과 GPU 펌웨어다.** 모델마다 파일이 다릅니다. Pi 3는 `bootcode.bin`→`start.elf`, Pi 4는 EEPROM 부트→`start4.elf`. "OS가 없다"고 적어도 VideoCore 펌웨어와, 여기서는 Circle이 남아 있습니다.
2. **폴링 간격과 소비 간격을 분리해서 재자.** 1ms는 HID 리포트가 갱신되는 간격이고, 게임은 프레임마다 한 번 읽습니다. 오디오 큐 목표 약 33ms는 또 다른 지연입니다.
3. **멀티코어는 동기화가 기능이다.** `DSB; SEV`와 "그리기가 읽는 메모리를 바꾸기 전에 기다림"이 그림이 한 코어와 같다는 조건입니다. 네 코어를 다 쓰는 구조가 아닙니다.
4. **클론한 브랜치와 릴리스 태그를 나눠 읽자.** 이 저장소는 웹·README 옵션 표·`main` 소스·`v0.7.0-rc1`이 빔 레이싱에 대해 서로 다른 말을 합니다.
5. **코어의 정확도 목표는 코어 저자의 문장으로 인용하자.** Geolith는 명령어 단위 CPU와 촘촘한 동기화를 말하고, 영상 사이클 정확도는 아직 목표라고 말합니다. neo-pi는 그중 CD를 빼 두었습니다.
6. **BIOS와 게임 ROM은 사용자가 합법적으로 가진 것만.** 두 프로젝트 모두 포함하지 않는다고 적고, 상표 고지도 따로 있습니다.

## 참고 자료

- Alessio Scanderebech, neo-pi — [웹사이트](https://alessioscand.github.io/neo-pi/) · [저장소 `main`](https://github.com/alessioscand/neo-pi) · [README](https://github.com/alessioscand/neo-pi/blob/main/README.md) · [BUILD.md](https://github.com/alessioscand/neo-pi/blob/main/BUILD.md) · [v0.6.1](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.1) · [v0.6.2](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.2) · [v0.6.4](https://github.com/alessioscand/neo-pi/releases/tag/v0.6.4) · [v0.7.0-rc1](https://github.com/alessioscand/neo-pi/releases/tag/v0.7.0-rc1)
- Rupert Carmichael, Geolith — [GitLab](https://gitlab.com/jgemu/geolith) · [README 미러](https://github.com/alessioscand/geolith-mirror/blob/master/README) · [jgemu](https://jgemu.gitlab.io)
- Rene Stange, Circle — [rsta2/circle](https://github.com/rsta2/circle)
- Raspberry Pi Ltd, 부트 파일과 `kernel` — [config.txt](https://www.raspberrypi.com/documentation/computers/config_txt.html#kernel) · [configuration reference (boot folder)](https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/configuration/reference.adoc)
- 원본 X 포스트: [@yoshinokentarou](https://x.com/yoshinokentarou/status/2116771938123280753)
