/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827', // Darker Gray
    background: '#F9FAFB', // Lighter Gray
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F6', // Slightly darker gray than background
    border: '#D1D5DB', // Medium Gray
    tint: '#005A9C', // New Primary Corporate Blue
    primary: '#005A9C', // New Primary Corporate Blue
    primaryMuted: '#CCE4F4', // Lighter shade for muted primary
    primaryText: '#FFFFFF',
    muted: '#6B7280', // Gray
    danger: '#DC2626', // Red
    dangerText: '#FFFFFF',
    success: '#16A34A', // Green
    warning: '#D97706', // Amber
    statusPendingBg: '#FEF3C7', // Amber 50
    statusInProgressBg: '#DBEAFE', // Blue 100
    statusCompletedBg: '#D1FAE5', // Green 100
    statusText: '#1F2937', // Dark Gray
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    icon: '#6B7280', // Gray
    tabIconDefault: '#6B7280',
    tabIconSelected: '#005A9C', // Match new primary
    headerBackground: '#FFFFFF',
    headerText: '#111827',
    quickActionBackground: '#E5E7EB', // Light Gray for secondary actions
    quickActionText: '#1F2937',
  },
  dark: {
    text: '#E5E7EB', // Light Gray
    background: '#111827', // Very Dark Blue/Gray
    surface: '#1F2937', // Dark Blue/Gray
    surfaceMuted: '#374151', // Lighter Blue/Gray
    border: '#4B5563', // Gray
    tint: '#5294E2', // A good tint for the new primary
    primary: '#3B82F6', // Keeping this bright blue for dark mode primary
    primaryMuted: '#1E40AF', // Darker Muted Blue
    primaryText: '#FFFFFF',
    muted: '#9CA3AF', // Lighter Gray
    danger: '#F87171', // Lighter Red
    dangerText: '#1F2937',
    success: '#4ADE80', // Lighter Green
    warning: '#FBBF24', // Lighter Amber
    statusPendingBg: '#4A3B1D', // Dark Amber
    statusInProgressBg: '#1E3A8A', // Dark Blue
    statusCompletedBg: '#166534', // Dark Green
    statusText: '#F3F4F6',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#E5E7EB',
    headerBackground: '#1F2937',
    headerText: '#E5E7EB',
    quickActionBackground: '#374151', // Dark gray for secondary actions
    quickActionText: '#F3F4F6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
