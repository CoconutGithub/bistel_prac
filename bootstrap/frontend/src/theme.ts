// src/theme.ts
import { ModuleRegistry, AllCommunityModule, themeQuartz, iconSetAlpine } from 'ag-grid-community';

// Register all community modules (filters, menus, export, etc.)
ModuleRegistry.registerModules([AllCommunityModule]);

// Build a custom Quartz-based theme
export const myTheme = themeQuartz
    .withPart(iconSetAlpine)
    .withParams({
        accentColor: "#382017",
        backgroundColor: "#F1EDE1",
        borderColor: "#98968F",
        borderRadius: 0,
        browserColorScheme: "light",
        chromeBackgroundColor: { ref: "backgroundColor" },
        // fontFamily: { googleFont: "Pixelify Sans" },
        fontSize: 15,
        foregroundColor: "#605E57",
        headerBackgroundColor: "#E4DAD1",
        headerFontSize: 15,
        headerFontWeight: 700,
        headerTextColor: "#3C3A35",
        rowVerticalPaddingScale: 1.2,
        spacing: 5,
        wrapperBorderRadius: 0,
    });
