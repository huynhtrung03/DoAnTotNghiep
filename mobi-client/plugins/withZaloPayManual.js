const {
  withAppBuildGradle,
  withDangerousMod,
  withAndroidManifest,
  withMainApplication,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// --- NỘI DUNG FILE JAVA ---
const getZPModuleJava = (packageName, appId, scheme) => `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import vn.zalopay.sdk.ZaloPayError;
import vn.zalopay.sdk.ZaloPaySDK;
import vn.zalopay.sdk.listeners.PayOrderListener;

public class ZPModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onNewIntent(Intent intent) {
            try {
                if (intent != null) {
                    ZaloPaySDK.getInstance().onResult(intent);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    };

    public ZPModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(mActivityEventListener);
        
        // Khởi tạo SDK ngay lập tức để sẵn sàng xử lý deep link
        try {
            ZaloPaySDK.init(${appId}, vn.zalopay.sdk.Environment.SANDBOX);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return "PayZaloBridge";
    }

    private void sendEvent(String eventName, WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void payOrder(String zpTransToken) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) return;

        // SDK đã được khởi tạo trong constructor
        // Nếu cần thay đổi environment, thực hiện ở đây

        ZaloPaySDK.getInstance().payOrder(currentActivity, zpTransToken, "${scheme}://app", new PayOrderListener() {
            @Override
            public void onPaymentSucceeded(final String transactionId, final String transToken, final String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "1");
                params.putString("transactionId", transactionId);
                params.putString("transToken", transToken);
                params.putString("appTransID", appTransID);
                sendEvent("EventPayZalo", params);
            }

            @Override
            public void onPaymentCanceled(String transToken, String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "4");
                params.putString("transToken", transToken);
                params.putString("appTransID", appTransID);
                sendEvent("EventPayZalo", params);
            }

            @Override
            public void onPaymentError(ZaloPayError zaloPayError, String transToken, String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "-1");
                params.putString("error", zaloPayError.toString());
                params.putString("transToken", transToken);
                params.putString("appTransID", appTransID);
                sendEvent("EventPayZalo", params);
            }
        });
    }
}
`;

const getZPPackageJava = (packageName) => `package ${packageName};

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ZPPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ZPModule(reactContext));
        return modules;
    }
}
`;

const withZaloPayManual = (config, props) => {
  // Lấy config từ app.json hoặc props
  const appId = props?.appId || 2553; // Default sandbox
  const scheme = props?.scheme || 'mobi-client'; // Thay bằng scheme app của bạn
  
  // 1. COPY FILE .AAR
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidAppLibs = path.join(projectRoot, 'android', 'app', 'libs');
      const sourceAar = path.join(projectRoot, 'local-libs', 'zpdk-release-v3.1.aar');
      
      if (!fs.existsSync(androidAppLibs)) {
        fs.mkdirSync(androidAppLibs, { recursive: true });
      }
      
      if (fs.existsSync(sourceAar)) {
        fs.copyFileSync(sourceAar, path.join(androidAppLibs, 'zpdk-release-v3.1.aar'));
        console.log('✅ Đã copy zpdk-release-v3.1.aar');
      } else {
        console.warn('⚠️ Không tìm thấy file zpdk-release-v3.1.aar tại local-libs/');
      }
      return config;
    },
  ]);

  // 2. CONFIG BUILD.GRADLE
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Thêm flatDir repository nếu chưa có
    if (!buildGradle.includes('flatDir')) {
      buildGradle = buildGradle.replace(
        /repositories\s*\{/,
        `repositories {\n        flatDir {\n            dirs 'libs'\n        }`
      );
    }
    
    // Thêm dependency
    if (!buildGradle.includes('zpdk-release-v3.1')) {
      buildGradle = buildGradle.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation files('libs/zpdk-release-v3.1.aar')`
      );
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  // 3. SINH FILE JAVA
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const packageName = config.android?.package || 'com.namaesieunhangao.mobiclient';
      const packagePath = packageName.replace(/\./g, '/');
      const javaSrcPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', packagePath);

      if (!fs.existsSync(javaSrcPath)) {
        fs.mkdirSync(javaSrcPath, { recursive: true });
      }

      // Ghi file ZPModule.java
      fs.writeFileSync(
        path.join(javaSrcPath, 'ZPModule.java'), 
        getZPModuleJava(packageName, appId, scheme)
      );

      // Ghi file ZPPackage.java
      fs.writeFileSync(
        path.join(javaSrcPath, 'ZPPackage.java'), 
        getZPPackageJava(packageName)
      );
      
      console.log('✅ Đã tạo file ZaloPay Bridge Java!');
      return config;
    },
  ]);

  // 4. ĐĂNG KÝ PACKAGE VÀO MAIN APPLICATION
  // config = withMainApplication(config, (config) => {
  //   let mainAppContent = config.modResults.contents;
  //   const packageName = config.android?.package || 'com.namaesieunhangao.mobiclient';
    
  //   // Thêm import
  //   if (!mainAppContent.includes('ZPPackage')) {
  //     const importPattern = /import\s+expo\.modules\.ReactActivityDelegateWrapper/;
  //     if (importPattern.test(mainAppContent)) {
  //       mainAppContent = mainAppContent.replace(
  //         importPattern,
  //         `$&\nimport ${packageName}.ZPPackage`
  //       );
  //     } else {
  //       // Fallback: thêm sau package declaration
  //       mainAppContent = mainAppContent.replace(
  //         `package ${packageName}`,
  //         `package ${packageName}\n\nimport ${packageName}.ZPPackage`
  //       );
  //     }
  //   }

  //   // Đăng ký package trong getPackages()
  //   if (!mainAppContent.includes('ZPPackage()')) {
  //     // Với Kotlin (Expo SDK 50+)
  //     if (mainAppContent.includes('override fun getPackages()')) {
  //       mainAppContent = mainAppContent.replace(
  //         /return\s+PackageList\(this\)\.packages/,
  //         `val packages = PackageList(this).packages.toMutableList()\n        packages.add(ZPPackage())\n        return packages`
  //       );
  //     }
  //     // Với Java
  //     else if (mainAppContent.includes('getPackages()')) {
  //       mainAppContent = mainAppContent.replace(
  //         /return\s+new\s+PackageList\(this\)\.getPackages\(\);/,
  //         `List<ReactPackage> packages = new PackageList(this).getPackages();\n        packages.add(new ZPPackage());\n        return packages;`
  //       );
  //     }
  //   }
    
  //   config.modResults.contents = mainAppContent;
  //   return config;
  // });

  config = withMainApplication(config, (config) => {
  let content = config.modResults.contents;
  const packageName = config.android?.package || 'com.namaesieunhangao.mobiclient';

  // Thêm import
  if (!content.includes('import ' + packageName + '.ZPPackage')) {
    content = content.replace(
      /import expo\.modules\.ReactNativeHostWrapper/,
      `import expo.modules.ReactNativeHostWrapper\nimport ${packageName}.ZPPackage`
    );
  }

  // TÌM ĐOẠN getPackages() TRONG DefaultReactNativeHost VÀ THÊM ZPPackage()
  const getPackagesRegex = /override fun getPackages\(\): List<ReactPackage>[\s\S]*?PackageList\(this\)\.packages\.apply \{/;
  
  if (getPackagesRegex.test(content)) {
    content = content.replace(
      /PackageList\(this\)\.packages\.apply \{/,
      `PackageList(this).packages.apply {\n              add(ZPPackage()) // ZaloPay Bridge`
    );
    console.log('Đã thêm ZPPackage() vào MainApplication.kt');
  } else {
    console.warn('Không tìm thấy getPackages() để thêm ZPPackage – có thể SDK quá mới');
  }

  config.modResults.contents = content;
  return config;
});

  // 5. CẤU HÌNH MANIFEST (Deep Link)
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    
    if (mainActivity) {
      const intentFilter = {
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': scheme, 'android:host': 'app' } }],
      };
      
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }
      
      // Kiểm tra xem đã có intent-filter này chưa
      const hasScheme = mainActivity['intent-filter'].some(filter => 
        filter.data && filter.data.some(d => d.$['android:scheme'] === scheme)
      );
      
      if (!hasScheme) {
        mainActivity['intent-filter'].push(intentFilter);
        console.log(`✅ Đã thêm deep link: ${scheme}://app`);
      }
    }
    return config;
  });

  return config;
};

module.exports = withZaloPayManual;