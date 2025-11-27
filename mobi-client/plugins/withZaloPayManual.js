const {
  withAppBuildGradle,
  withDangerousMod,
  withAndroidManifest,
  withMainApplication,
  AndroidConfig,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// --- NỘI DUNG FILE JAVA ---
// Chúng ta nhúng code Java trực tiếp vào đây để plugin tự sinh file khi build
const getZPModuleJava = (packageName) => `package ${packageName};

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
            ZaloPaySDK.getInstance().onResult(intent);
        }
    };

    public ZPModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(mActivityEventListener);
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

        // Khởi tạo SDK với AppID (Demo Sandbox: 2553)
        // Trong thực tế nên init ở onCreate, nhưng init ở đây cho tiện với Expo Plugin
        ZaloPaySDK.init(2553, vn.zalopay.sdk.Environment.SANDBOX);

        ZaloPaySDK.getInstance().payOrder(currentActivity, zpTransToken, "demozpdk://app", new PayOrderListener() {
            @Override
            public void onPaymentSucceeded(final String transactionId, final String transToken, final String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "1");
                params.putString("transactionId", transactionId);
                params.putString("appTransID", appTransID);
                sendEvent("EventPayZalo", params);
            }

            @Override
            public void onPaymentCanceled(String transToken, String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "4");
                params.putString("appTransID", appTransID);
                sendEvent("EventPayZalo", params);
            }

            @Override
            public void onPaymentError(ZaloPayError zaloPayError, String transToken, String appTransID) {
                WritableMap params = Arguments.createMap();
                params.putString("returnCode", "0");
                params.putString("error", zaloPayError.toString());
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

const withZaloPayManual = (config) => {
  // 1. COPY FILE .AAR
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidAppLibs = path.join(projectRoot, 'android', 'app', 'libs');
      const sourceAar = path.join(projectRoot, 'local-libs', 'zpdk-release-v3.1.aar');
      
      if (!fs.existsSync(androidAppLibs)) fs.mkdirSync(androidAppLibs, { recursive: true });
      if (fs.existsSync(sourceAar)) {
        fs.copyFileSync(sourceAar, path.join(androidAppLibs, 'zpdk-release-v3.1.aar'));
      }
      return config;
    },
  ]);

  // 2. CONFIG BUILD.GRADLE (Thêm dependencies)
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    if (!buildGradle.includes("zpdk-release-v3.1.aar")) {
      config.modResults.contents = buildGradle.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation files('libs/zpdk-release-v3.1.aar')`
      );
    }
    return config;
  });

  // 3. SINH FILE JAVA (ZPModule.java và ZPPackage.java)
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const packageName = config.android.package || 'com.namaesieunhangao.mobiclient';
      const packagePath = packageName.replace(/\./g, '/');
      const javaSrcPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', packagePath);

      // Ghi file ZPModule.java
      fs.writeFileSync(
        path.join(javaSrcPath, 'ZPModule.java'), 
        getZPModuleJava(packageName)
      );

      // Ghi file ZPPackage.java
      fs.writeFileSync(
        path.join(javaSrcPath, 'ZPPackage.java'), 
        getZPPackageJava(packageName)
      );
      
      console.log('✅ Đã tạo file ZaloPay Bridge Java thành công!');
      return config;
    },
  ]);

  // 4. ĐĂNG KÝ PACKAGE VÀO MAIN APPLICATION
  config = withMainApplication(config, (config) => {
    const mainAppContent = config.modResults.contents;
    const packageName = config.android.package || 'com.namaesieunhangao.mobiclient';
    
    // Thêm import
    if (!mainAppContent.includes('import ' + packageName + '.ZPPackage;')) {
        const importAnchor = 'import android.app.Application'; // Điểm neo an toàn
        config.modResults.contents = mainAppContent.replace(
            importAnchor,
            `${importAnchor}\nimport ${packageName}.ZPPackage;`
        );
    }

    // Đăng ký package: thêm new ZPPackage() vào list
    // Expo 50+ dùng Kotlin hoặc Java với getPackages() hoặc PackageList
    // Logic tìm chỗ chèn "new ZPPackage()"
    if (!config.modResults.contents.includes('new ZPPackage()')) {
       // Tìm hàm getPackages() và chèn vào
       // Đây là regex tìm PackageList để chèn thêm
       // Lưu ý: Cấu trúc MainApplication của Expo có thể thay đổi, đây là cách chèn cơ bản
       // Nếu dùng Expo SDK mới, thường file là MainApplication.kt
    }
    
    // LƯU Ý: Với Expo Managed, việc inject vào MainApplication khá rủi ro vì Regex.
    // Cách tốt nhất là để cho Expo Autolinking (nhưng ta đang làm thủ công).
    // => Tạm thời bước này ta sẽ làm thủ công bằng cách sửa file MainApplication.kt nếu plugin tự động thất bại.
    // Nhưng tôi sẽ thêm đoạn code chèn vào MainApplication.kt (Kotlin) cho bạn:
    
    // Pattern cho Kotlin MainApplication (Expo SDK 50+)
    if (mainAppContent.includes('override fun getPackages(): List<ReactPackage>')) {
        if(!mainAppContent.includes('ZPPackage()')) {
             config.modResults.contents = mainAppContent.replace(
                /PackageList\(this\)\.packages/,
                `let list = PackageList(this).packages\n      list.add(ZPPackage())\n      list`
             );
             // Hoặc cách đơn giản hơn là add vào list trả về
             config.modResults.contents = config.modResults.contents.replace(
                 /return PackageList\(this\)\.packages/,
                 `val packages = PackageList(this).packages\n        packages.add(ZPPackage())\n        return packages`
             );
        }
    } 
    // Pattern cho Java MainApplication (Cũ hơn)
    else if (mainAppContent.includes('getPackages()')) {
         if(!mainAppContent.includes('new ZPPackage()')) {
             config.modResults.contents = mainAppContent.replace(
                 /new PackageList\(this\)\.getPackages\(\);/,
                 `List<ReactPackage> packages = new PackageList(this).getPackages();\n      packages.add(new ZPPackage());\n      return packages;`
             );
         }
    }

    return config;
  });

  // 5. CẤU HÌNH MANIFEST (Deep Link)
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    if (mainActivity) {
      // Scheme phải trùng với code Java ở trên: demozpdk
      // Bạn có thể đổi lại thành mobi-client trong file Java và ở đây
      const scheme = 'demozpdk'; 
      const intent = {
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': scheme, 'android:host': 'app' } }],
      };
      if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];
      mainActivity['intent-filter'].push(intent);
    }
    return config;
  });

  return config;
};

module.exports = withZaloPayManual;