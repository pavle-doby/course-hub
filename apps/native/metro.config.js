const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// pnpm installs isolated per-package copies, so @repo/ui-native would otherwise get its own
// nativewind / react instances (a second cssInterop registry, duplicate React). Resolve these
// from the app so every workspace package shares one copy.
// Each singleton is resolved from where it's visible: css-interop is only a nativewind dependency.
const appOrigin = path.join(__dirname, "package.json");
const nativewindOrigin = require.resolve("nativewind/package.json");
const SINGLETONS = {
  react: appOrigin,
  "react-native": appOrigin,
  nativewind: appOrigin,
  "expo-localization": appOrigin,
  "react-native-css-interop": nativewindOrigin,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = Object.keys(SINGLETONS).find(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`)
  );
  if (name) {
    return context.resolveRequest(
      { ...context, originModulePath: SINGLETONS[name] },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
