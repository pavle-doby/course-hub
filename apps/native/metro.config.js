const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// @repo/ui-theme imports @react-navigation/native. Resolve it from expo-router, which rejects a
// standalone react-navigation copy (SDK 56+). Other singletons are deduped by the hoisted install
// + pnpm-workspace.yaml overrides.
const expoRouterOrigin = require.resolve("expo-router/package.json");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isNavigation =
    moduleName === "@react-navigation/native" || moduleName.startsWith("@react-navigation/native/");
  return context.resolveRequest(
    isNavigation ? { ...context, originModulePath: expoRouterOrigin } : context,
    moduleName,
    platform
  );
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
