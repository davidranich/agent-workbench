import { ref, watch } from 'vue';

const STORAGE_KEYS = {
  FONT_SIZE: 'agentWorkbench_fontSize',
  COLOR_SCHEME_LIGHT: 'agentWorkbench_colorSchemeLight',
  COLOR_SCHEME_DARK: 'agentWorkbench_colorSchemeDark',
  CUSTOM_THEME_NAMES: 'agentWorkbench_customThemeNames',
  CUSTOM_THEME_MODES: 'agentWorkbench_customThemeModes',
  CUSTOM_01_LIGHT: 'agentWorkbench_custom01Light',
  CUSTOM_01_DARK: 'agentWorkbench_custom01Dark',
  CUSTOM_02_LIGHT: 'agentWorkbench_custom02Light',
  CUSTOM_02_DARK: 'agentWorkbench_custom02Dark',
  CUSTOM_03_LIGHT: 'agentWorkbench_custom03Light',
  CUSTOM_03_DARK: 'agentWorkbench_custom03Dark',
  CUSTOM_04_LIGHT: 'agentWorkbench_custom04Light',
  CUSTOM_04_DARK: 'agentWorkbench_custom04Dark',
  CUSTOM_05_LIGHT: 'agentWorkbench_custom05Light',
  CUSTOM_05_DARK: 'agentWorkbench_custom05Dark',
  CUSTOM_06_LIGHT: 'agentWorkbench_custom06Light',
  CUSTOM_06_DARK: 'agentWorkbench_custom06Dark',
  TERMINAL_WINDOW_MODE: 'agentWorkbench_terminalWindowMode',
  TERMINAL_SPLIT_DIRECTION: 'agentWorkbench_terminalSplitDirection',
  TERMINAL_SHOW_SPLIT: 'agentWorkbench_terminalShowSplit',
  TERMINAL_WINDOW_WIDTH: 'agentWorkbench_terminalWindowWidth',
  TERMINAL_WINDOW_HEIGHT: 'agentWorkbench_terminalWindowHeight',
};

// Font size options
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
};

export const FONT_SIZE_LABELS = {
  [FONT_SIZES.SMALL]: 'Small',
  [FONT_SIZES.MEDIUM]: 'Medium',
  [FONT_SIZES.LARGE]: 'Large',
  [FONT_SIZES.EXTRA_LARGE]: 'Extra Large',
};

export const FONT_SIZE_VALUES = {
  [FONT_SIZES.SMALL]: '0.875rem', // 14px
  [FONT_SIZES.MEDIUM]: '1rem', // 16px
  [FONT_SIZES.LARGE]: '1.125rem', // 18px
  [FONT_SIZES.EXTRA_LARGE]: '1.25rem', // 20px
};

// Color schemes
export const COLOR_SCHEMES = {
  DEFAULT: 'default',
  AYU: 'ayu',
  BEARDED: 'bearded',
  CYBERPUNK: 'cyberpunk',
  EVA: 'eva',
  GRUVBOX: 'gruvbox',
  CUSTOM_01: 'custom_01',
  CUSTOM_02: 'custom_02',
  CUSTOM_03: 'custom_03',
  CUSTOM_04: 'custom_04',
  CUSTOM_05: 'custom_05',
  CUSTOM_06: 'custom_06',
};

// Terminal settings
export const TERMINAL_WINDOW_MODES = {
  TAB: 'tab',
  WINDOW: 'window',
};

export const TERMINAL_WINDOW_MODE_LABELS = {
  [TERMINAL_WINDOW_MODES.TAB]: 'New Tab',
  [TERMINAL_WINDOW_MODES.WINDOW]: 'New Window',
};

export const TERMINAL_SPLIT_DIRECTIONS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
};

export const TERMINAL_SPLIT_DIRECTION_LABELS = {
  [TERMINAL_SPLIT_DIRECTIONS.VERTICAL]: 'Vertical (Side by Side)',
  [TERMINAL_SPLIT_DIRECTIONS.HORIZONTAL]: 'Horizontal (Top & Bottom)',
};

export const COLOR_SCHEME_LABELS = {
  [COLOR_SCHEMES.DEFAULT]: 'Default Gray',
  [COLOR_SCHEMES.AYU]: 'Ayu Dark',
  [COLOR_SCHEMES.BEARDED]: 'Bearded Black & Gold',
  [COLOR_SCHEMES.CYBERPUNK]: 'Cyberpunk Scarlet',
  [COLOR_SCHEMES.EVA]: 'Eva Dark',
  [COLOR_SCHEMES.GRUVBOX]: 'Gruvbox Dark Hard',
};

export const COLOR_SCHEME_LABELS_LIGHT = {
  [COLOR_SCHEMES.DEFAULT]: 'Default Gray',
  [COLOR_SCHEMES.AYU]: 'Ayu Light',
  [COLOR_SCHEMES.BEARDED]: 'Bearded Black & Gold',
  [COLOR_SCHEMES.CYBERPUNK]: 'Cyberpunk Scarlet',
  [COLOR_SCHEMES.EVA]: 'Eva Light',
  [COLOR_SCHEMES.GRUVBOX]: 'Gruvbox Light',
};

// Define color palettes for each scheme
export const COLOR_PALETTES = {
  // Light mode colors
  light: {
    [COLOR_SCHEMES.DEFAULT]: {
      bg: '#f9fafb',
      bgSecondary: '#f3f4f6',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#3b82f6',
      btnPrimary: '#2563eb',
      btnPrimaryHover: '#1d4ed8',
      btnSecondary: '#7c3aed',
      btnSecondaryHover: '#6d28d9',
      codeInlineBg: '#e5e7eb',
      codeInlineText: '#111827',
      codeBlockBg: '#f6f8fa',
      codeBlockText: '#24292f',
    },
    [COLOR_SCHEMES.AYU]: {
      bg: '#e8f0f7',
      bgSecondary: '#dce6ed',
      border: '#b8c5d0',
      text: '#1a2633',
      textSecondary: '#4a5f7a',
      accent: '#4A90E2',
      btnPrimary: '#4A90E2',
      btnPrimaryHover: '#3A7BC8',
      btnSecondary: '#8B5CF6',
      btnSecondaryHover: '#7C3AED',
      codeInlineBg: '#b8c5d0',
      codeInlineText: '#1a2633',
      codeBlockBg: '#dce6ed',
      codeBlockText: '#1a2633',
    },
    [COLOR_SCHEMES.BEARDED]: {
      bg: '#f5f3f0',
      bgSecondary: '#ebe8e3',
      border: '#d4cfc8',
      text: '#2d2a27',
      textSecondary: '#5a5550',
      accent: '#C6910C',
      btnPrimary: '#C6910C',
      btnPrimaryHover: '#B08209',
      btnSecondary: '#E6A839',
      btnSecondaryHover: '#D09828',
      codeInlineBg: '#d4cfc8',
      codeInlineText: '#2d2a27',
      codeBlockBg: '#ebe8e3',
      codeBlockText: '#2d2a27',
    },
    [COLOR_SCHEMES.CYBERPUNK]: {
      bg: '#f0f0f5',
      bgSecondary: '#e5e5eb',
      border: '#c5c5d0',
      text: '#1a1a20',
      textSecondary: '#4a4a55',
      accent: '#FF0055',
      btnPrimary: '#FF0055',
      btnPrimaryHover: '#E60048',
      btnSecondary: '#00FFC8',
      btnSecondaryHover: '#00E6B3',
      codeInlineBg: '#c5c5d0',
      codeInlineText: '#1a1a20',
      codeBlockBg: '#e5e5eb',
      codeBlockText: '#1a1a20',
    },
    [COLOR_SCHEMES.EVA]: {
      bg: '#F5F6F8',
      bgSecondary: '#ECEEF1',
      border: '#D4D7DC',
      text: '#1A1D22',
      textSecondary: '#4A4F5E',
      accent: '#598DEF',
      btnPrimary: '#598DEF',
      btnPrimaryHover: '#4A7DD9',
      btnSecondary: '#7C8AE0',
      btnSecondaryHover: '#6979CC',
      codeInlineBg: '#D4D7DC',
      codeInlineText: '#1A1D22',
      codeBlockBg: '#ECEEF1',
      codeBlockText: '#1A1D22',
    },
    [COLOR_SCHEMES.GRUVBOX]: {
      bg: '#FBF1C7',
      bgSecondary: '#EADBB2',
      border: '#D5C4A1',
      text: '#3C3836',
      textSecondary: '#504945',
      accent: '#458588',
      btnPrimary: '#458588',
      btnPrimaryHover: '#076678',
      btnSecondary: '#689D6A',
      btnSecondaryHover: '#79740E',
      codeInlineBg: '#D5C4A1',
      codeInlineText: '#3C3836',
      codeBlockBg: '#EADBB2',
      codeBlockText: '#3C3836',
    },
  },
  // Dark mode colors
  dark: {
    [COLOR_SCHEMES.DEFAULT]: {
      bg: '#111827',
      bgSecondary: '#1f2937',
      border: '#374151',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      accent: '#3b82f6',
      btnPrimary: '#2563eb',
      btnPrimaryHover: '#1d4ed8',
      btnSecondary: '#7c3aed',
      btnSecondaryHover: '#6d28d9',
      codeInlineBg: '#374151',
      codeInlineText: '#f9fafb',
      codeBlockBg: '#1f2937',
      codeBlockText: '#e5e7eb',
    },
    [COLOR_SCHEMES.AYU]: {
      bg: '#0A0E14',
      bgSecondary: '#0B0F16',
      border: '#30363D',
      text: '#E6E8EB',
      textSecondary: '#C2C9D6',
      accent: '#4A90E2',
      btnPrimary: '#4A90E2',
      btnPrimaryHover: '#5BA3F5',
      btnSecondary: '#8B5CF6',
      btnSecondaryHover: '#9D6FF7',
      codeInlineBg: '#30363D',
      codeInlineText: '#E6E8EB',
      codeBlockBg: '#0B0F16',
      codeBlockText: '#E6E8EB',
    },
    [COLOR_SCHEMES.BEARDED]: {
      bg: '#221F1D',
      bgSecondary: '#1C1918',
      border: '#3A3532',
      text: '#DEDBD8',
      textSecondary: '#D5D1CF',
      accent: '#C6910C',
      btnPrimary: '#C6910C',
      btnPrimaryHover: '#DBA515',
      btnSecondary: '#E6A839',
      btnSecondaryHover: '#F0B84A',
      codeInlineBg: '#3A3532',
      codeInlineText: '#DEDBD8',
      codeBlockBg: '#1C1918',
      codeBlockText: '#DEDBD8',
    },
    [COLOR_SCHEMES.CYBERPUNK]: {
      bg: '#101116',
      bgSecondary: '#0C0D12',
      border: '#2A2B35',
      text: '#FFFFFF',
      textSecondary: '#E0E0E5',
      accent: '#FF0055',
      btnPrimary: '#FF0055',
      btnPrimaryHover: '#FF1A6B',
      btnSecondary: '#00FFC8',
      btnSecondaryHover: '#1AFFDA',
      codeInlineBg: '#2A2B35',
      codeInlineText: '#FFFFFF',
      codeBlockBg: '#0C0D12',
      codeBlockText: '#FFFFFF',
    },
    [COLOR_SCHEMES.EVA]: {
      bg: '#272C33',
      bgSecondary: '#21252B',
      border: '#3B424D',
      text: '#FFFFFF',
      textSecondary: '#9DA5B3',
      accent: '#598DEF',
      btnPrimary: '#598DEF',
      btnPrimaryHover: '#6FA3F7',
      btnSecondary: '#7C8AE0',
      btnSecondaryHover: '#8F9BED',
      codeInlineBg: '#3B424D',
      codeInlineText: '#FFFFFF',
      codeBlockBg: '#21252B',
      codeBlockText: '#FFFFFF',
    },
    [COLOR_SCHEMES.GRUVBOX]: {
      bg: '#1D2021',
      bgSecondary: '#282828',
      border: '#3C3836',
      text: '#FBF1C7',
      textSecondary: '#EADBB2',
      accent: '#83A598',
      btnPrimary: '#83A598',
      btnPrimaryHover: '#93B5A8',
      btnSecondary: '#689D6A',
      btnSecondaryHover: '#78AD7A',
      codeInlineBg: '#3C3836',
      codeInlineText: '#FBF1C7',
      codeBlockBg: '#282828',
      codeBlockText: '#FBF1C7',
    },
  },
};

// Default custom colors (based on Default Gray theme)
const defaultCustomColorsLight = {
  bg: '#f9fafb',
  bgSecondary: '#f3f4f6',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  accent: '#3b82f6',
  btnPrimary: '#2563eb',
  btnPrimaryHover: '#1d4ed8',
  btnSecondary: '#7c3aed',
  btnSecondaryHover: '#6d28d9',
  codeInlineBg: '#e5e7eb',
  codeInlineText: '#111827',
  codeBlockBg: '#f6f8fa',
  codeBlockText: '#24292f',
};

const defaultCustomColorsDark = {
  bg: '#111827',
  bgSecondary: '#1f2937',
  border: '#374151',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  accent: '#3b82f6',
  btnPrimary: '#2563eb',
  btnPrimaryHover: '#1d4ed8',
  btnSecondary: '#7c3aed',
  btnSecondaryHover: '#6d28d9',
  codeInlineBg: '#374151',
  codeInlineText: '#f9fafb',
  codeBlockBg: '#1f2937',
  codeBlockText: '#e5e7eb',
};

// Initialize settings from localStorage
const fontSize = ref(localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || FONT_SIZES.MEDIUM);
const colorSchemeLight = ref(
  localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME_LIGHT) || COLOR_SCHEMES.DEFAULT
);
const colorSchemeDark = ref(
  localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME_DARK) || COLOR_SCHEMES.DEFAULT
);

// Custom theme names (for the 6 slots)
const customThemeNames = ref(
  JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_THEME_NAMES) || 'null') || {
    custom_01: '',
    custom_02: '',
    custom_03: '',
    custom_04: '',
    custom_05: '',
    custom_06: '',
  }
);

// Custom theme colors for each slot (light and dark)
const customThemeColors = ref({
  custom_01: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_01_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_01_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
  custom_02: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_02_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_02_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
  custom_03: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_03_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_03_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
  custom_04: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_04_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_04_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
  custom_05: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_05_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_05_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
  custom_06: {
    light: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_06_LIGHT) || 'null') || {
      ...defaultCustomColorsLight,
    },
    dark: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_06_DARK) || 'null') || {
      ...defaultCustomColorsDark,
    },
  },
});

// Terminal settings
const terminalWindowMode = ref(
  localStorage.getItem(STORAGE_KEYS.TERMINAL_WINDOW_MODE) || TERMINAL_WINDOW_MODES.WINDOW
);
const terminalSplitDirection = ref(
  localStorage.getItem(STORAGE_KEYS.TERMINAL_SPLIT_DIRECTION) || TERMINAL_SPLIT_DIRECTIONS.VERTICAL
);
const terminalShowSplit = ref(localStorage.getItem(STORAGE_KEYS.TERMINAL_SHOW_SPLIT) !== 'false'); // Default true
const terminalWindowWidth = ref(
  parseInt(localStorage.getItem(STORAGE_KEYS.TERMINAL_WINDOW_WIDTH)) || 1700
);
const terminalWindowHeight = ref(
  parseInt(localStorage.getItem(STORAGE_KEYS.TERMINAL_WINDOW_HEIGHT)) || 450
);

// Watch for changes and save to localStorage
watch(fontSize, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, newValue);
  applyFontSize(newValue);
});

watch(colorSchemeLight, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME_LIGHT, newValue);
  applyColorScheme();
});

watch(colorSchemeDark, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME_DARK, newValue);
  applyColorScheme();
});

// Watch custom theme names
watch(
  customThemeNames,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEME_NAMES, JSON.stringify(newValue));
  },
  { deep: true }
);

// Watch custom theme colors
watch(
  () => customThemeColors.value.custom_01,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_01_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_01_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(
  () => customThemeColors.value.custom_02,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_02_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_02_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(
  () => customThemeColors.value.custom_03,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_03_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_03_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(
  () => customThemeColors.value.custom_04,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_04_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_04_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(
  () => customThemeColors.value.custom_05,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_05_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_05_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(
  () => customThemeColors.value.custom_06,
  (newValue) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_06_LIGHT, JSON.stringify(newValue.light));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_06_DARK, JSON.stringify(newValue.dark));
    applyColorScheme();
  },
  { deep: true }
);

watch(terminalWindowMode, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_WINDOW_MODE, newValue);
});

watch(terminalSplitDirection, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_SPLIT_DIRECTION, newValue);
});

watch(terminalShowSplit, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_SHOW_SPLIT, String(newValue));
});

watch(terminalWindowWidth, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_WINDOW_WIDTH, String(newValue));
});

watch(terminalWindowHeight, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.TERMINAL_WINDOW_HEIGHT, String(newValue));
});

// Apply font size to document
function applyFontSize(size) {
  document.documentElement.style.fontSize = FONT_SIZE_VALUES[size];
}

// Apply color scheme to document
function applyColorScheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const scheme = isDark ? colorSchemeDark.value : colorSchemeLight.value;
  const mode = isDark ? 'dark' : 'light';

  let palette;

  // Check if this is a custom theme slot
  if (scheme.startsWith('custom_')) {
    palette = customThemeColors.value[scheme][mode];
  } else if (COLOR_PALETTES[mode][scheme]) {
    // Use preset theme colors
    palette = COLOR_PALETTES[mode][scheme];
  } else {
    // Fallback to default
    palette = COLOR_PALETTES[mode][COLOR_SCHEMES.DEFAULT];
  }

  // Apply CSS custom properties
  const root = document.documentElement;
  root.style.setProperty('--color-bg', palette.bg);
  root.style.setProperty('--color-bg-secondary', palette.bgSecondary);
  root.style.setProperty('--color-border', palette.border);
  root.style.setProperty('--color-text', palette.text);
  root.style.setProperty('--color-text-secondary', palette.textSecondary);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-btn-primary', palette.btnPrimary);
  root.style.setProperty('--color-btn-primary-hover', palette.btnPrimaryHover);
  root.style.setProperty('--color-btn-secondary', palette.btnSecondary);
  root.style.setProperty('--color-btn-secondary-hover', palette.btnSecondaryHover);
  root.style.setProperty('--color-code-inline-bg', palette.codeInlineBg);
  root.style.setProperty('--color-code-inline-text', palette.codeInlineText);
  root.style.setProperty('--color-code-block-bg', palette.codeBlockBg);
  root.style.setProperty('--color-code-block-text', palette.codeBlockText);

  // Create a semi-transparent version of btnSecondary for focus ring
  const secondaryRgb = hexToRgb(palette.btnSecondary);
  if (secondaryRgb) {
    root.style.setProperty(
      '--color-btn-secondary-shadow',
      `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`
    );
  }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Listen for theme changes
if (typeof window !== 'undefined') {
  window.addEventListener('theme-changed', applyColorScheme);
}

// Get current theme colors (based on selected scheme)
function getCurrentThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  const scheme = isDark ? colorSchemeDark.value : colorSchemeLight.value;
  const mode = isDark ? 'dark' : 'light';

  let colors = {};

  if (scheme.startsWith('custom_')) {
    colors = { ...customThemeColors.value[scheme][mode] };
  } else if (COLOR_PALETTES[mode][scheme]) {
    colors = { ...COLOR_PALETTES[mode][scheme] };
  } else {
    colors = { ...COLOR_PALETTES[mode][COLOR_SCHEMES.DEFAULT] };
  }

  return colors;
}

// Get current theme name
function getCurrentThemeName() {
  const isDark = document.documentElement.classList.contains('dark');
  const scheme = isDark ? colorSchemeDark.value : colorSchemeLight.value;

  if (scheme.startsWith('custom_')) {
    return customThemeNames.value[scheme] || '';
  } else {
    const labels = isDark ? COLOR_SCHEME_LABELS : COLOR_SCHEME_LABELS_LIGHT;
    return labels[scheme] || '';
  }
}

// Save theme to a specific slot
function saveThemeToSlot(slotKey, themeName, lightColors, darkColors) {
  if (!themeName || themeName.trim() === '') {
    throw new Error('Theme name cannot be empty');
  }

  if (!slotKey || !slotKey.startsWith('custom_')) {
    throw new Error('Invalid slot key');
  }

  customThemeNames.value[slotKey] = themeName.trim();
  customThemeColors.value[slotKey].light = { ...lightColors };
  customThemeColors.value[slotKey].dark = { ...darkColors };
}

// Clear a custom theme slot
function clearThemeSlot(slotKey) {
  if (!slotKey || !slotKey.startsWith('custom_')) {
    throw new Error('Invalid slot key');
  }

  customThemeNames.value[slotKey] = '';
  customThemeColors.value[slotKey].light = { ...defaultCustomColorsLight };
  customThemeColors.value[slotKey].dark = { ...defaultCustomColorsDark };

  // If currently using this slot, switch to default
  if (colorSchemeLight.value === slotKey) {
    colorSchemeLight.value = COLOR_SCHEMES.DEFAULT;
  }
  if (colorSchemeDark.value === slotKey) {
    colorSchemeDark.value = COLOR_SCHEMES.DEFAULT;
  }
}

// Get list of custom themes with their metadata
function getCustomThemes() {
  return Object.keys(customThemeNames.value)
    .filter((key) => customThemeNames.value[key] !== '')
    .map((key) => ({
      slotKey: key,
      name: customThemeNames.value[key],
      lightColors: customThemeColors.value[key].light,
      darkColors: customThemeColors.value[key].dark,
    }));
}

export function useSettings() {
  const setFontSize = (size) => {
    if (Object.values(FONT_SIZES).includes(size)) {
      fontSize.value = size;
    }
  };

  const setColorSchemeLight = (scheme) => {
    if (Object.values(COLOR_SCHEMES).includes(scheme)) {
      colorSchemeLight.value = scheme;
    }
  };

  const setColorSchemeDark = (scheme) => {
    if (Object.values(COLOR_SCHEMES).includes(scheme)) {
      colorSchemeDark.value = scheme;
    }
  };

  const setTerminalWindowMode = (mode) => {
    if (Object.values(TERMINAL_WINDOW_MODES).includes(mode)) {
      terminalWindowMode.value = mode;
    }
  };

  const setTerminalSplitDirection = (direction) => {
    if (Object.values(TERMINAL_SPLIT_DIRECTIONS).includes(direction)) {
      terminalSplitDirection.value = direction;
    }
  };

  const setTerminalShowSplit = (show) => {
    terminalShowSplit.value = show;
  };

  const setTerminalWindowWidth = (width) => {
    // Ensure width is between 800 and 3000 pixels
    const validWidth = Math.max(800, Math.min(3000, parseInt(width) || 1700));
    terminalWindowWidth.value = validWidth;
  };

  const setTerminalWindowHeight = (height) => {
    // Ensure height is between 300 and 1500 pixels
    const validHeight = Math.max(300, Math.min(1500, parseInt(height) || 450));
    terminalWindowHeight.value = validHeight;
  };

  const setCustomThemeColor = (slotKey, mode, colorKey, value) => {
    if (!slotKey || !slotKey.startsWith('custom_')) {
      return;
    }

    if (mode === 'light') {
      customThemeColors.value[slotKey].light[colorKey] = value;
    } else {
      customThemeColors.value[slotKey].dark[colorKey] = value;
    }
  };

  const initializeSettings = () => {
    applyFontSize(fontSize.value);
    applyColorScheme();
  };

  const updateColorScheme = () => {
    applyColorScheme();
  };

  return {
    // Font size
    fontSize,
    setFontSize,
    FONT_SIZES,
    FONT_SIZE_LABELS,

    // Color schemes
    colorSchemeLight,
    colorSchemeDark,
    setColorSchemeLight,
    setColorSchemeDark,
    COLOR_SCHEMES,
    COLOR_SCHEME_LABELS,
    COLOR_SCHEME_LABELS_LIGHT,
    COLOR_PALETTES,

    // Custom themes
    customThemeNames,
    customThemeColors,
    getCurrentThemeColors,
    getCurrentThemeName,
    setCustomThemeColor,
    saveThemeToSlot,
    clearThemeSlot,
    getCustomThemes,

    // Terminal settings
    terminalWindowMode,
    terminalSplitDirection,
    terminalShowSplit,
    terminalWindowWidth,
    terminalWindowHeight,
    setTerminalWindowMode,
    setTerminalSplitDirection,
    setTerminalShowSplit,
    setTerminalWindowWidth,
    setTerminalWindowHeight,
    TERMINAL_WINDOW_MODES,
    TERMINAL_WINDOW_MODE_LABELS,
    TERMINAL_SPLIT_DIRECTIONS,
    TERMINAL_SPLIT_DIRECTION_LABELS,

    // Initialize
    initializeSettings,
    updateColorScheme,
  };
}
