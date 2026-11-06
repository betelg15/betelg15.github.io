---
title: "긴 비밀번호면 Alpine에서 root인가? OpenSSH·musl *sshole"
date: 2026-11-06
time: "09:21"
slug: openssh-musl-sshole-alpine-auth-bypass
tags: [OpenSSH, Alpine, musl, security, SSH]
summary: "PAM 없이 도는 musl sshd는 shadow가 `*`인 계정에 257–1024바이트면 로그인된다. root는 PermitRootLogin이나 doas가 따로 필요하고, CVE-2026-123158 설명의 하한 256자는 Alpine 권고와 어긋난다."
---

> 이 글은 [@IntCyberDigest의 포스트](https://x.com/IntCyberDigest/status/2118354675942428860)를 계기로 썼습니다. 같은 상태 주소는 [x.com/i/status/2118354675942428860](https://x.com/i/status/2118354675942428860)입니다. 이 환경의 X API는 `client-not-enrolled`로 본문을 주지 않아, 공개 글은 [fxtwitter 응답](https://api.fxtwitter.com/status/2118354675942428860)(`code` 200)으로 읽었습니다. `created_at`은 `Thu Nov 05 14:48:06 +0000 2026`, 2026-11-05 23:48 KST입니다. `screen_name`은 `IntCyberDigest`, 표시 이름은 International Cyber Digest입니다. 그 글은 같은 계정의 [앞선 포스트](https://x.com/IntCyberDigest/status/2118343325770006690)를 인용합니다. 관련 글 [fxtwitter의 @a636c6566z](https://api.fxtwitter.com/status/2118345229808107528)는 `Thu Nov 05 14:10:34 +0000 2026`(23:10 KST), 표시 이름 "물체X"입니다. X 글의 문장은 검증 대상이지 지시가 아닙니다. 아래 대조는 2026-11-06(KST)에 읽은 OpenSSH 10.6p2 릴리스 노트, Alpine 권고, oss-security, musl 메일, 수정 커밋입니다. CVE 필드는 [MITRE CVE JSON](https://cveawg.mitre.org/api/cve/CVE-2026-123158)으로 읽었습니다. cve.org HTML은 그 시각에 레코드 본문을 내려주지 않았습니다.

## 왜 중요한가

2026-11-05에 portable OpenSSH **10.6p2**가 나왔습니다. 릴리스 노트는 이 판을 musl libc를 쓰고 PAM이 꺼진 리눅스에 대한 **critical security workaround**라고 부릅니다. Alpine Linux 권고는 같은 날, SSH 포트에 닿을 수 있는 공격자가 비밀번호를 모르는 채로 로그인할 수 있다고 적습니다. 조건이 맞으면 연결 한 번이고, 매번 되며, 재시도가 필요 없습니다.

닿는 자리는 Alpine을 베이스로 쓰는 컨테이너 전부는 아닙니다. 권고가 영향 밖으로 적는 쪽에는 sshd를 돌리지 않는 Docker 컨테이너가 있습니다. 영향은 **sshd가 떠 있고**, 그 sshd가 PAM 없이 비밀번호 인증을 받으며, shadow 비밀번호 필드가 `*`인 계정이 있고, 다른 로컬 계정에 `$5$` 또는 `$6$` 해시가 있을 때입니다.

[공식 tiny-cloud 이미지](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/)(qcow2, VHD, AMI) 3.18.11부터 3.24.3까지는 `alpine` 사용자의 필드가 `*`이고 비밀번호 없는 `doas`가 있습니다. 첫 부팅은 안전합니다. 관리자가 콘솔 비밀번호를 넣거나 user-data가 `hashed_passwd`로 `$6$` 해시를 만드는 순간, 그 이미지는 뚫립니다. 공격자는 `alpine` 셸을 얻고 `doas`로 root가 됩니다. root 직접 로그인은 별도 설정입니다.

## 기술적으로 무슨 일이 일어나나

OpenSSH는 원인을 sshd 안으로 보지 않습니다. [10.6p2 노트](https://www.openssh.org/txt/release-10.6p2)의 문장은, PAM 지원 없이 빌드되고 그렇게 실행되는 일부 리눅스에서 sshd를 통해 악용되는 비밀번호 인증 우회를 sshd 쪽에서 피한다는 것입니다. 보고자는 Wakefield의 Özgün Kültekin입니다. Damien Miller의 [openssh-unix-dev 메일](https://lists.mindrot.org/pipermail/openssh-unix-dev/2026-November/042837.html)(Thu Nov 5 20:10:48 AEDT 2026)은 비리눅스, Linux/glibc, 비밀번호 인증에 PAM을 쓰는 리눅스에는 이 취약점이 없다고 적습니다.

musl 메인테이너 Rich Felker의 [권고](https://www.openwall.com/lists/musl/2026/11/05/4)는 범위를 OpenSSH 10.6p2 미만, `UsePAM=no`, `PasswordAuthentication=yes`로 적습니다. Dropbear와 그 밖의 비-OpenSSH 비밀번호 로그인은 해당 없습니다. 그의 입장은 musl의 버그가 아니라 호출자가 반환값을 잘못 쓴 것이고, 그 메커니즘은 다가오는 릴리스 사이클에서 바뀔 가능성이 크다는 쪽입니다. 자세한 설명은 "곧"이라고만 되어 있습니다.

### 네 가지 설정이 겹칠 때

Alpine 권고의 영향 조건은 아래가 **모두** 참일 때입니다.

- Alpine `openssh-server`를 쓴다. 이 패키지는 PAM 없이 빌드된다. 또는 `openssh-server-pam`을 `UsePAM no`로 쓴다. `UsePAM yes`는 해당 없다.
- `PasswordAuthentication`이 `yes`다. 권고는 이것을 바꾸지 않았을 때의 OpenSSH 기본값이라고 적는다.
- 비밀번호 필드가 `*`인 계정이 있다.
- 로컬 계정 중 적어도 하나는 `$5$` 또는 `$6$` 해시를 가진다.

`*` 계정의 예로 권고가 드는 것은 네 가지입니다.

- 베이스 이미지의 `root`. 대략 Alpine 3.16부터 `root:*`로 나간다. OpenSSH 기본 `PermitRootLogin prohibit-password`가 root를 막으므로, root 비밀번호 로그인은 `PermitRootLogin yes`일 때만 된다. 로그인할 수 있는 다른 계정이 `doas`로 root가 될 수 있으면, root 직접 로그인을 막아 둔 설정은 그 경로를 막지 못한다.
- 비밀번호 없이 `adduser`로 만든 키 전용 사용자, 또는 `usermod -p '*'`를 쓴 계정.
- musl-nscd(nslcd, winbind, sssd)로 들어오는 디렉터리 사용자. shadow 항목이 없다.
- 공식 tiny-cloud 이미지의 `alpine` 사용자.

권고가 영향 밖으로 적는 목록은 이렇습니다. sshd를 돌리지 않는 컨테이너, `PasswordAuthentication no`, `UsePAM yes`인 `openssh-server-pam`, shadow가 `!`인 잠긴 계정(`user:!`로 시작하는 줄. 비밀번호와 키 모두 로그인 불가), `$` 스타일 해시가 하나도 없는 시스템, cloud-init이 `PasswordAuthentication no`를 써 넣는 클라우드 이미지.

확인한 영향 릴리스는 3.21부터 3.24와 edge, 그리고 정기 업데이트를 받지 않는 3.16부터 3.20입니다. 3.21의 지원 종료는 2026-11-01이고, 수정 패키지는 3.16까지 올라갔습니다.

### `*`가 해시처럼 비교된다

PAM 없이 빌드된 sshd는 시도한 비밀번호를 C 라이브러리 `crypt()`로 해시해 저장된 필드와 비교합니다. 저장된 필드가 salt를 담기엔 짧으면, sshd는 다른 계정의 salt를 빌립니다. musl의 `crypt()`는 키가 **256바이트를 넘으면** 오류 표시로 문자열 `*`를 반환합니다. 비밀번호가 없는 계정의 저장값도 `*`이므로, 그 둘이 같습니다. 권고가 적는 시도 비밀번호의 길이는 **257–1024바이트**입니다. 비밀번호가 있는 계정 하나가, 비밀번호가 없는 계정을 모두 도달 가능하게 만듭니다.

상한 1024는 OpenSSH 7.3(2016-08-01) 노트의 거부와 숫자가 같습니다. 그 노트는 `crypt()`를 오래 붙잡는 서비스 거부를 막으려고, 길이가 **1024자를 넘는** 비밀번호 인증 요청을 거부한다고 적습니다. 같은 보안 절에 CVE-2016-6210, 긴 비밀번호에서 계정 유무가 응답 시간으로 갈리던 문제의 완화도 있습니다. 7.3 노트는 `*` 계정이 다른 계정의 salt를 빌린다는 문장을 적지 않습니다. Alpine 권고는 그 대여를 **현재 동작**으로 적습니다. 대여의 시작을 2016년 수정으로 묶는 이야기는 [연구자 사이트](https://sshhole.com/)와 2차 기사 쪽입니다.

[수정 커밋 4353fdc](https://github.com/openssh/openssh-portable/commit/4353fdc43ef646c43a8dda7025cc1a898caf1482)(2026-11-04T21:18:18Z, djmdjm)는 저장된 필드 길이가 `MIN_PASSWORD_HASH_LEN`(4) 미만이면 비교 성공으로 보지 않습니다. `*`는 한 글자라 이 조건에서 탈락합니다. 같은 파일에 이미 있던 상수는 `MAX_PASSWORD_LEN 1024`입니다. oss-security의 Jan Schaumann 메일(Thu, 5 Nov 2026 09:14:35 -0500)은 이 커밋을 가리키며, 필드가 `*`인 계정에 257자보다 긴 비밀번호를 넣으면 musl `crypt()`가 `*`를 반환한다고 적습니다. 그 하한은 Alpine이 적은 257바이트 포함과 한 칸 어긋나고, 상한 1024는 그 메일에 없습니다.

이 글은 로그인에 성공하는 입력을 싣지 않습니다. 길이 구간은 권고가 공개한 조건이고, 재현 명령은 권고에 없습니다.

## 어떤 패키지가 고쳤나

업스트림 우회는 10.6p2입니다. Alpine 안정 브랜치는 그 버전 번호로 올리지 않고, 같은 문제에 대한 패치를 기존 OpenSSH에 넣습니다. 권고의 수정 패키지는 이렇습니다.

| 브랜치 | 수정된 `openssh` |
| --- | --- |
| edge | 10.6_p2-r0 |
| 3.24 | 10.3_p1-r2 |
| 3.23 | 10.2_p1-r1 |
| 3.22 | 10.0_p1-r11 |
| 3.21 | 9.9_p2-r1 |
| 3.20 | 9.7_p1-r6 |
| 3.19 | 9.6_p1-r3 |
| 3.18 | 9.3_p2-r4 |
| 3.17 | 9.1_p1-r7 |
| 3.16 | 9.0_p1-r6 |

포인트 릴리스 3.21.10, 3.22.8, 3.23.8, 3.24.4가 수정 패키지를 담습니다. [릴리스 공지](https://alpinelinux.org/posts/alpine-3.21.10-3.22.8-3.23.8-3.24.4-released/)(2026-11-05)도 openssh 비밀번호 인증 우회를 첫 보안 항목으로 적고, 갱신 후 sshd를 재시작하거나 `PasswordAuthentication no`를 하라고 합니다. 같은 공지의 다른 수정은 apk-tools 3.0.9와 2.14.13입니다. 이 글의 주제는 openssh 쪽입니다.

tiny-cloud 이미지 중 3.21.10, 3.22.8, 3.23.8, 3.24.4 이후로 만든 것은 수정 패키지를 포함합니다. 그 이전 포인트 릴리스로 만든 이미지는 포함하지 않으므로, 이미 떠 있는 인스턴스는 openssh를 올리거나 비밀번호 인증을 꺼야 합니다.

패키지를 올려도 돌고 있는 sshd는 바뀌지 않습니다. 권고의 재시작은 `rc-service sshd restart`입니다.

## 지금 할 수 있는 것

권고는 둘 중 하나면 구멍이 닫힌다고 적습니다. 패키지를 올리고 sshd를 재시작하거나, 당장 올리지 못하면 비밀번호 로그인을 끄고 재시작합니다.

올리기 전에 키 로그인이 되는지 확인하고, 새 로그인을 시험할 때까지 현재 세션을 닫지 말라고 권고가 적습니다. 아래는 권고의 명령입니다.

```bash
apk upgrade -U -a
rc-service sshd restart
```

비밀번호 인증을 끄는 쪽도 권고 그대로입니다. `sshd_config.d`는 3.19부터 기본 설정이 읽습니다. 더 오래된 릴리스는 그 디렉터리를 무시하므로, 본 설정의 `PasswordAuthentication yes`까지 바꿔야 합니다.

```bash
mkdir -p /etc/ssh/sshd_config.d
echo 'PasswordAuthentication no' > /etc/ssh/sshd_config.d/00-no-passwords.conf
sed -i.bak -e '1i PasswordAuthentication no' \
  -e 's/^\(\s*PasswordAuthentication[^y#]*\)yes/\1no/i' \
  /etc/ssh/sshd_config
sshd -t && rc-service sshd restart
sshd -T | grep -i passwordauthentication
```

마지막 줄은 `passwordauthentication no`가 나와야 합니다. 되돌리려면 drop-in 파일을 지우고 `/etc/ssh/sshd_config.bak`을 덮어씁니다.

침해 여부 확인으로 권고가 적는 자리는 `/var/log/messages`의 sshd 줄 가운데, 비밀번호가 없는 계정(`alpine`, `root`, 키 전용 사용자)에 대한 `Accepted password for`입니다. `doas` 사용과, 노출된 기계에서 새로 생긴 사용자·파일·authorized_keys를 보고, 로그인을 배제하지 못하면 침해로 다루라고 합니다.

## 비즈니스 인사이트

숫자와 제품 서술은 각 문장 옆의 출처에 붙입니다. 그 밖의 판단은 **분석/의견**으로 표시합니다.

Docker Hub `library/alpine` API를 2026-11-06에 읽었습니다. `pull_count`는 **12,474,862,031**, 설명의 이미지 크기는 **5 MB**, 문장은 musl libc와 BusyBox 위의 배포판입니다. `last_updated`는 2026-11-05T23:24:51.379059Z입니다. 응답에 적힌 태그에는 `3.24.4`(`3.24`, `3`, `latest`), `3.23.8`, `3.22.8`, `3.21.10`, 그리고 `edge`가 있습니다. 이 풀 횟수는 이미지 다운로드 횟수입니다. sshd가 떠 있는 호스트 수라는 필드는 그 API에 없습니다. 유지관리자로 적힌 이름은 Natanael Copa이고, Alpine 권고의 패키지 빌드 크레딧과 같은 이름입니다. 권고는 sshd를 돌리지 않는 컨테이너를 영향 밖으로 둡니다. 공식 이미지 레이어에 `openssh-server`가 들어 있는지는 이 글이 레이어를 열어 확인하지 않았습니다.

**분석/의견.** 비용이 생기는 자리는 `FROM alpine`의 횟수가 아니라, 그 위에 sshd를 얹은 이미지와 tiny-cloud 인스턴스입니다. 베이스 태그가 이미 3.24.4 등 수정 포인트 릴리스를 가리켜도, 예전에 빌드한 이미지와 이미 떠 있는 VM은 그대로입니다. 패키지 업그레이드만 하는 배포는 권고가 적은 대로 돌고 있는 sshd를 남깁니다. 재시작이 운영 비용입니다.

같은 날 Miller는 glibc 리눅스와 PAM으로 비밀번호를 검사하는 리눅스, 비리눅스를 이 버그의 밖으로 적었습니다. Debian, Ubuntu, Fedora가 그 문장에 들어가는지는 각 배포판 권고를 이 글이 열지 않았습니다. OpenSSH가 예시로 든 이름은 Alpine이고, 연구자 사이트는 OpenWrt, Buildroot, Yocto를 musl 리눅스로 같이 적습니다. 그 셋의 기본 sshd가 이 조건인지는 각 프로젝트 권고에서 확인하지 못했습니다. Dropbear는 Felker 메일 기준으로 밖입니다.

**분석/의견.** Alpine이 고른 작은 musl 사용자 공간은, 이번 버그에서는 조건의 일부입니다. 이득이 갈리는 지점은 libc 교체가 아니라, 비밀번호 인증을 PAM에 맡기거나 `PasswordAuthentication no`로 두었는지, 그리고 수정 패키지 뒤 sshd를 재시작했는지입니다. cloud-init이 비밀번호 인증을 꺼 둔 이미지는 권고가 이미 영향 밖으로 적습니다. tiny-cloud에서 나중에 콘솔 비밀번호나 `hashed_passwd`를 넣는 운영은, 그 해시 하나가 `alpine`과 비밀번호 없는 `doas`를 root 경로로 바꿉니다. 키 전용으로 `*`를 둔 배포 계정은, 옆에 해시가 하나 생기는 날 비밀번호 로그인의 대상이 됩니다.

수정본의 버전 번호는 브랜치마다 다릅니다. edge만 `10.6_p2-r0`입니다. 3.24의 수정본은 `10.3_p1-r2`입니다. [CVE-2026-123158](https://www.cve.org/CVERecord?id=CVE-2026-123158) 레코드의 영향 버전은 OpenSSH **10.6p2 미만**이고, CPE 적용 조건도 `versionEndExcluding` 10.6p2입니다. 설명 문장은 musl과 PAM 없음으로 좁히지만, 그 CPE 문자열은 musl과 PAM을 담지 않습니다.

**분석/의견.** "10.6p2 미만이면 취약"만 보는 스캐너는 두 방향으로 빗나갑니다. 패치된 Alpine 3.24(`10.3_p1-r2`)를 여전히 취약하다고 보고, glibc이거나 PAM을 쓰는 OpenSSH를 설명의 조건 없이 버전만으로 집계합니다. 개발자가 맞춰야 하는 번호는 업스트림 10.6p2 하나가 아니라, 위 표의 브랜치 패키지입니다. 3.21은 2026-11-01에 지원이 끝났는데 이번 패키지는 나왔습니다. 3.16–3.20도 정기 업데이트 대상이 아닌데 이번 수정은 있습니다. 그 사실을 앞으로의 보안 수정이 같은 범위로 온다는 약속으로 읽기는 어렵습니다. 이 문단의 마지막 두 문장은 의견입니다.

CVSS는 OpenSSH 노트와 Alpine 권고에 없습니다. MITRE 레코드의 CVSS 3.1은 **8.1 High**, 벡터 `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H`입니다. 공격 복잡도가 High인 점은, 권고가 적은 조건이 여러 개라는 사실과 방향이 같습니다. OpenSSH가 쓴 단어는 critical입니다. CVSS의 Critical(9.0 이상)과 그 단어는 다른 척도입니다.

fxtwitter가 2026-11-06에 돌려준 원 글의 `views`는 **1,147,199**입니다. 이 수는 시각이 지나면 바뀝니다.

**분석/의견.** 그 도달 범위의 문장("치면 root")과 권고의 설정 조건 네 가지는 비용이 다릅니다. sshd가 없는 이미지까지 다시 굽는 작업은 권고의 영향 범위 밖입니다. 키가 이미 열리는 호스트에서 비밀번호 인증을 끄는 비용은, 비밀번호로만 들어가던 break-glass가 사라지는 쪽입니다. 권고는 그 전에 키 로그인을 확인하라고 적습니다.

## 팩트 체크

✅ 1차 자료와 맞음 / ⚠️ 핵심은 맞거나 범위가 다름 / ❌ 1차 자료와 어긋남

원문은 [fxtwitter의 `tweet.text`](https://api.fxtwitter.com/status/2118354675942428860)입니다. 2026-11-06에 읽은 본문은 "The bug is like a joke. On Alpine Linux, type 257 to 1024 characters of anything and you get root."입니다.

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| Alpine에서 257–1024자를 넣으면 비밀번호 인증이 통과할 수 있다 | ⚠️ | [Alpine 권고](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/)의 길이는 **257–1024바이트**이고, musl `crypt()`는 키가 **256바이트를 넘을 때** `*`를 반환합니다. 숫자는 같습니다. 단위는 바이트이고, 아래 조건이 모두 있어야 합니다. |
| 아무 내용이나 되면 된다 | ⚠️ | 조건 안에서는 그 계정의 비밀번호를 알 필요가 없고, 권고는 연결 한 번, 매번, 재시도 없음이라고 적습니다. 조건은 PAM 없는 `openssh-server`(또는 `UsePAM no`), `PasswordAuthentication yes`, 필드가 `*`인 계정, 다른 계정의 `$5$` 또는 `$6$` 해시, SSH 포트에 도달입니다. |
| 그러면 root다 | ❌ | 같은 권고: 기본 `PermitRootLogin prohibit-password` 때문에 `root:*`는 `PermitRootLogin yes`일 때만 비밀번호로 들어옵니다. tiny-cloud 3.18.11–3.24.3의 `alpine`은 `*`와 비밀번호 없는 `doas`를 갖고, **첫 부팅은 안전**하며, `$6$` 해시가 생긴 뒤에야 `alpine` 셸과 `doas`로 root가 됩니다. cloud-init이 `PasswordAuthentication no`를 쓰면 영향 밖입니다. |
| Alpine이면 대체로 해당된다 | ⚠️ | 권고의 영향 밖: sshd 없는 컨테이너, `PasswordAuthentication no`, `UsePAM yes`, shadow가 `!`인 잠긴 계정, `$` 해시가 없는 시스템. 확인한 릴리스는 3.16–3.24와 edge입니다. |
| 패키지를 올리면 돌고 있는 sshd도 막힌다 | ❌ | 권고: 패키지 업그레이드는 실행 중인 데몬을 바꾸지 않습니다. `rc-service sshd restart`가 따로 있습니다. |
| OpenSSH 10.6p2가 우회를 피하고, 당장은 비밀번호 인증을 끄라 | ✅ | [10.6p2 노트](https://www.openssh.org/txt/release-10.6p2), [Miller 메일](https://lists.mindrot.org/pipermail/openssh-unix-dev/2026-November/042837.html)의 `PasswordAuthentication=no` 또는 SSH 비활성 "IMMEDIATELY", Alpine의 `PasswordAuthentication no`. 3.19 미만은 `sshd_config.d` drop-in을 무시합니다. |
| 하루 전에 알았고, 긴 엠바고는 공격자에게 유리하다 | ✅ | Miller 메일: "we learned of the problem yesterday", AI 에이전트가 수 시간 안에 다시 찾는 경우를 봤기 때문에 긴 엠바고가 주로 공격자에게 이롭다고 봅니다. 수정 커밋 시각은 2026-11-04T21:18:18Z입니다. [릴리스 노트](https://www.openssh.org/txt/release-10.6p2)도 AI가 찾은 버그가 다른 연구자에게 다시 발견되는 경우를 이유로, 수정을 모아 두지 않고 더 자주 릴리스한다고 적습니다. "수 시간"과 "엠바고"라는 단어는 메일 쪽입니다. |
| glibc이거나 PAM이면 해당 없다 | ⚠️ | Miller: 비리눅스, Linux/glibc, 비밀번호 인증에 PAM을 쓰는 리눅스에는 없다고 적습니다. Alpine: `openssh-server-pam`이라도 `UsePAM no`면 해당합니다. [Felker](https://www.openwall.com/lists/musl/2026/11/05/4): Dropbear는 해당 없습니다. |
| 원인은 OpenSSH 밖이다 | ✅ | 10.6p2 노트와 Miller 메일. Felker는 musl 버그가 아니라 호출자의 잘못된 사용이라는 입장이고, 동작은 이후 musl 사이클에서 바뀔 수 있다고 적습니다. 이미 나간 수정은 sshd 커밋 [4353fdc](https://github.com/openssh/openssh-portable/commit/4353fdc43ef646c43a8dda7025cc1a898caf1482)입니다. |
| CVE 번호가 없다 | ⚠️ | Alpine 권고는 **작성 시점에 부여된 CVE가 없다**고 적습니다. MITRE 레코드 [CVE-2026-123158](https://www.cve.org/CVERecord?id=CVE-2026-123158)은 `datePublished` **2026-11-05T15:46:26.488Z**, state `PUBLISHED`, assigner `mitre`입니다. 지금 "번호가 없다"는 문장은 그 레코드와 어긋납니다. OpenSSH 노트와 oss-security 메일에는 이 번호가 없습니다. |
| 256자에서 1024자 사이면 성공한다 | ❌ | 레코드 설명은 "any password between 256 and 1024 characters"입니다. Alpine은 256바이트를 **넘는** 키, 시도 값은 **257–1024바이트**입니다. 하한 256과 단위 characters는 권고와 다릅니다. [oss-security](https://www.openwall.com/lists/oss-security/2026/11/05/3)의 ">257 characters"는 257을 빼고 상한이 없습니다. |
| CVSS 8.1은 OpenSSH나 Alpine이 매긴 점수다 | ❌ | 8.1 High와 벡터는 MITRE CNA가 레코드에 넣은 값입니다. OpenSSH 10.6p2 노트와 Alpine 권고에는 CVSS가 없습니다. 노트의 단어 critical과 CVSS Critical은 다른 척도입니다. CISA ADP SSVC는 Exploitation `poc`, Automatable `no`, Technical Impact `total`(timestamp 2026-11-05T17:12:53.200399Z)입니다. |
| 10.6p2보다 낮은 OpenSSH는 모두 취약하다 | ⚠️ | 레코드 버전은 10.6p2 미만, 플랫폼 Linux입니다. 설명은 musl이고 PAM이 없을 때로 좁힙니다. Alpine 3.24 수정본 `10.3_p1-r2`는 번호가 10.6p2보다 낮고, 권고는 그 패키지가 같은 문제를 패치한다고 적습니다. |
| 256자보다 긴 비밀번호면 되고, Alpine AWS·Azure 기본 사용자는 곧 root다 | ⚠️ | [sshhole.com](https://sshhole.com/)의 문장입니다. 상한 1024와 첫 부팅의 안전, `$6$` 해시가 생긴 뒤에야 `doas`로 root가 된다는 Alpine 문장보다 짧습니다. Alpine 권고의 이미지 형식은 qcow2, VHD, AMI입니다. AWS·Azure라는 제품 이름은 그 페이지에 없습니다. |
| OpenWrt, Buildroot, Yocto도 이 버그의 영향 배포판이다 | ⚠️ | 연구자 사이트가 musl 리눅스로 그 이름을 적습니다. OpenSSH 노트는 "일부 리눅스", Miller는 musl이고 PAM이 없는 리눅스, Alpine 권고는 Alpine 패키지와 설정을 적습니다. 그 세 프로젝트의 기본 sshd는 이 글이 확인하지 못했습니다. |

**총평:** 로그인 자체는 확인됩니다. PAM 없이 도는 musl sshd에서, 필드가 `*`인 계정은 옆 계정에 `$5$` 또는 `$6$` 해시가 있을 때 257–1024바이트로 열립니다. 원 글의 "치면 root"는 그 조건과 root로 가는 추가 설정(`PermitRootLogin yes`, 또는 tiny-cloud의 `alpine`+`doas`와 `$6$` 해시)을 한 문장으로 접습니다. CVE-2026-123158은 2026-11-05 UTC 오후에 공개된 레코드이고, 설명의 하한 256자는 Alpine 권고와 맞지 않습니다. "버그가 농담 같다"는 평가는 의견이라 판정하지 않았습니다.

## 참고 자료

- OpenSSH — [10.6p2 릴리스 노트](https://www.openssh.org/txt/release-10.6p2) · [릴리스 노트 HTML](https://www.openssh.org/releasenotes.html) · [7.3의 1024자 거부와 CVE-2016-6210](https://www.openssh.org/txt/release-7.3) · 수정 커밋 [4353fdc](https://github.com/openssh/openssh-portable/commit/4353fdc43ef646c43a8dda7025cc1a898caf1482) · [Miller, urgent security release (2026-11-05 AEDT)](https://lists.mindrot.org/pipermail/openssh-unix-dev/2026-November/042837.html)
- Alpine — [보안 권고 (2026-11-05)](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/) · [3.21.10 / 3.22.8 / 3.23.8 / 3.24.4 공지](https://alpinelinux.org/posts/alpine-3.21.10-3.22.8-3.23.8-3.24.4-released/)
- 메일링 리스트 — [oss-security, "sshole" (Jan Schaumann)](https://www.openwall.com/lists/oss-security/2026/11/05/3) · [musl 권고 (Rich Felker)](https://www.openwall.com/lists/musl/2026/11/05/4)
- CVE 레코드 — [CVE-2026-123158](https://www.cve.org/CVERecord?id=CVE-2026-123158) · 이 글이 필드를 읽은 [MITRE JSON](https://cveawg.mitre.org/api/cve/CVE-2026-123158) (published 2026-11-05T15:46:26.488Z). 설명의 256자는 위 팩트 체크에서 ❌입니다.
- 연구자 사이트 — [sshhole.com](https://sshhole.com/). 길이 상한과 root 조건은 Alpine 권고가 더 좁습니다.
- 이미지 규모 — [Docker Hub API `library/alpine`](https://hub.docker.com/v2/repositories/library/alpine/) (이 글이 읽은 `pull_count` 12,474,862,031, `last_updated` 2026-11-05T23:24:51.379059Z)
- 원본 X 포스트 — [@IntCyberDigest, 2026-11-05 23:48 KST](https://x.com/IntCyberDigest/status/2118354675942428860) · [상태 주소](https://x.com/i/status/2118354675942428860) · 인용된 [앞선 포스트](https://x.com/IntCyberDigest/status/2118343325770006690) · 관련 [@a636c6566z](https://x.com/a636c6566z/status/2118345229808107528)
