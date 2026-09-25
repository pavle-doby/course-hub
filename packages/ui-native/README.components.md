# Missing Components

Components that exist in `@repo/ui-web` but not yet in `@repo/ui-native`.

## Build manually (not in react-native-reusables)

| Component     | Suggested approach                                           |
| ------------- | ------------------------------------------------------------ |
| sheet         | Single bottom-sheet component (e.g. `@gorhom/bottom-sheet`)  |
| drawer        | Same bottom-sheet component as `sheet`                       |
| spinner       | Wrap `ActivityIndicator` from `react-native`                 |
| table         | Desktop-web pattern; use list layouts on native              |
| pagination    | Desktop-web pattern; use infinite scroll on native           |
| sidebar       | Desktop-web pattern; use navigation drawer or tabs on native |
| attachment    | Custom component; port from `@repo/ui-web`                   |
| questionnaire | Custom component; port from `@repo/ui-web`                   |
| button-group  | Custom component; port from `@repo/ui-web`                   |

### Bottom sheet (`sheet` / `drawer`) setup

Nothing needs to be installed in `apps/native`. Before you use the sheet there, make sure of two things:

- The app root is wrapped in `<GestureHandlerRootView style={{ flex: 1 }}>`.
- If you use `BottomSheetModal`, the app root is also wrapped in `<BottomSheetModalProvider>`.
