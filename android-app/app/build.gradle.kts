plugins {
    id("com.android.application")
}

android {
    namespace = "com.tyvon.intelligence"
    compileSdk = 36
    buildToolsVersion = "36.0.0"

    defaultConfig {
        applicationId = "com.tyvon.intelligence"
        minSdk = 24
        targetSdk = 36
        versionCode = 3
        versionName = "1.2.0"
    }

    signingConfigs {
        create("upload") {
            val keyPath = System.getenv("TYVON_KEYSTORE_PATH")
            if (!keyPath.isNullOrBlank()) {
                storeFile = file(keyPath)
                storePassword = System.getenv("TYVON_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("TYVON_KEY_ALIAS")
                keyPassword = System.getenv("TYVON_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("upload")
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

val verifyUploadSigning by tasks.registering {
    doLast {
        listOf("TYVON_KEYSTORE_PATH", "TYVON_KEYSTORE_PASSWORD", "TYVON_KEY_ALIAS", "TYVON_KEY_PASSWORD").forEach {
            require(!System.getenv(it).isNullOrBlank()) { "Configure $it para gerar um artefato release assinado." }
        }
    }
}
tasks.configureEach {
    if (name == "validateSigningRelease") dependsOn(verifyUploadSigning)
}
