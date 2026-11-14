# Android 앱 (APK)

웹 게임을 Capacitor로 감싼 Android 앱입니다. 빌드는 GitHub Actions(`.github/workflows/android-apk.yml`)가 합니다. 이 PC에는 Android SDK와 Java가 없어도 됩니다.

## 설치 (휴대폰)

1. GitHub 저장소의 **Releases**에서 `blue-card-vX.Y.Z.apk`를 휴대폰으로 받습니다.
2. 파일을 열면 "출처를 알 수 없는 앱 설치"를 허용하라고 합니다. 받은 앱(브라우저 또는 파일 앱)에 허용합니다.
3. 설치하고 엽니다. 진행 상황은 앱 안에 저장됩니다.

- **업데이트**: 새 APK를 받아 그대로 설치하면 덮어씌워지고 저장이 남습니다. 단, **같은 출시 서명 키로 만든 APK끼리만** 됩니다 (아래).
- debug APK(`-DEBUG.apk`)는 빌드마다 다른 임시 키로 서명되어 업데이트 설치가 안 됩니다. 지우고 다시 설치해야 하고, 그러면 저장이 지워집니다. 시험용으로만 씁니다.

## 서명 키 등록 (한 번만, 저장소 주인)

출시 APK를 만들려면 서명 키가 필요합니다. 키를 잃어버리면 그 뒤로는 업데이트 설치가 안 되니 안전한 곳에 따로 보관합니다. **키 파일과 비밀번호는 저장소에 커밋하지 않습니다.**

1. Java가 있는 PC에서 키를 만듭니다 (별칭은 `bluecard`).
   ```bash
   keytool -genkeypair -storetype PKCS12 -keystore bluecard-release.p12 -alias bluecard \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. 파일을 base64로 바꿉니다.
   ```bash
   base64 -w0 bluecard-release.p12 > bluecard-release.b64   # macOS: base64 -i bluecard-release.p12
   ```
3. GitHub 저장소 → Settings → Secrets and variables → Actions에 두 값을 넣습니다.
   - `BLUECARD_KEYSTORE_BASE64`: 2번 파일의 내용
   - `BLUECARD_KEYSTORE_PASSWORD`: 1번에서 정한 비밀번호
4. `.b64` 파일은 지웁니다. `.p12` 파일은 저장소 밖 안전한 곳에 보관합니다.

## 출시 (Release 만들기)

1. `package.json`의 `version`을 올립니다 (예: `0.2.0`).
2. `main`에 합친 뒤 같은 버전의 태그를 붙여 푸시합니다.
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
3. Actions의 "Android APK"가 끝나면 Releases에 `blue-card-v0.2.0.apk`가 붙습니다 (서명 키가 등록돼 있을 때만).

## 로컬에서 (선택)

Android Studio와 SDK가 있으면 로컬에서도 만들 수 있습니다.

```bash
npm run cap:sync          # 웹 빌드 + android/ 로 복사
cd android && ./gradlew assembleDebug
```

## 참고

- 앱 id: `io.github.aud9855.bluecard`, 세로 화면 고정.
- 휴대폰 뒤로 버튼: 열린 창(설정·하는 법·정보)만 닫고, 게임에서 나가지 않습니다.
- 앱 안에서는 서비스 워커를 쓰지 않습니다 (파일이 앱 안에 있음).
- 아이콘과 시작 화면 그림은 직접 그린 것입니다 (`public/icon.svg`, `pwa/icon-foreground.svg`).
