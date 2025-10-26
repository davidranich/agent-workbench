<script setup>
import { ref, watch } from 'vue';
import { useSettings } from '@/composables/useSettings';
import { useTheme } from '@/composables/useTheme';

const emit = defineEmits(['close']);

const {
  fontSize,
  setFontSize,
  FONT_SIZES,
  FONT_SIZE_LABELS,
  colorSchemeLight,
  colorSchemeDark,
  setColorSchemeLight,
  setColorSchemeDark,
  COLOR_SCHEMES,
  COLOR_SCHEME_LABELS,
  COLOR_SCHEME_LABELS_LIGHT,
  COLOR_PALETTES,
  customThemeNames,
  customThemeColors,
  getCurrentThemeColors,
  getCurrentThemeName,
  setCustomThemeColor,
  saveThemeToSlot,
  clearThemeSlot,
  getCustomThemes,
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
} = useSettings();

const { currentTheme, setTheme } = useTheme();

const activeTab = ref('appearance');

const tabs = [
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
  { id: 'custom-theme', label: 'Customize Theme', icon: 'palette' },
  { id: 'accessibility', label: 'Accessibility', icon: 'book-open' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
];

const colorLabels = {
  bg: 'Main Background (Editor & Preview)',
  bgSecondary: 'Sidebar Background',
  border: 'Borders & Dividers',
  text: 'Primary Text (Headings & Content)',
  textSecondary: 'Secondary Text (Labels & Descriptions)',
  accent: 'Accent Color (Links & Highlights)',
  btnPrimary: 'Primary Button Background',
  btnPrimaryHover: 'Primary Button Hover',
  btnSecondary: 'Secondary Button Background',
  btnSecondaryHover: 'Secondary Button Hover',
  codeInlineBg: 'Inline Code Background (`code`)',
  codeInlineText: 'Inline Code Text Color (`code`)',
  codeBlockBg: 'Code Block Background (```)',
  codeBlockText: 'Code Block Text Color (```)',
};

const themeName = ref(getCurrentThemeName()); // Initialize with current theme name
const saveMessage = ref('');
const saveError = ref('');
const currentColors = ref(getCurrentThemeColors());

// Delete confirmation modal
const showDeleteConfirm = ref(false);
const deleteConfirmTitle = ref('');
const deleteConfirmMessage = ref('');
const deleteConfirmAction = ref(null);

// Get current scheme info
const getCurrentScheme = () => {
  const isDark = currentTheme.value === 'dark';
  return isDark ? colorSchemeDark.value : colorSchemeLight.value;
};

const isCustomTheme = () => {
  return getCurrentScheme().startsWith('custom_');
};

const isDefaultTheme = () => {
  return !getCurrentScheme().startsWith('custom_');
};

// Update colors and name when theme changes
watch([currentTheme, colorSchemeLight, colorSchemeDark], () => {
  currentColors.value = getCurrentThemeColors();
  themeName.value = getCurrentThemeName();
});

// Load collapsed state from localStorage, default to false (collapsed)
const showDefaultThemes = ref(localStorage.getItem('agentWorkbench_showDefaultThemes') === 'true');
const showCustomThemes = ref(localStorage.getItem('agentWorkbench_showCustomThemes') === 'true');

// Save state to localStorage when changed
watch(showDefaultThemes, (newValue) => {
  localStorage.setItem('agentWorkbench_showDefaultThemes', String(newValue));
});

watch(showCustomThemes, (newValue) => {
  localStorage.setItem('agentWorkbench_showCustomThemes', String(newValue));
});

const handleClose = () => {
  emit('close');
};

const handleSaveTheme = () => {
  saveError.value = '';
  saveMessage.value = '';

  if (!isCustomTheme()) {
    saveError.value = 'Cannot save changes to default themes';
    return;
  }

  if (!themeName.value || themeName.value.trim() === '') {
    saveError.value = 'Please enter a theme name';
    return;
  }

  try {
    const scheme = getCurrentScheme();
    const isDark = currentTheme.value === 'dark';

    // Get existing colors for both modes
    const lightColors = { ...customThemeColors.value[scheme].light };
    const darkColors = { ...customThemeColors.value[scheme].dark };

    // Update the colors for the current mode
    if (isDark) {
      Object.assign(darkColors, currentColors.value);
    } else {
      Object.assign(lightColors, currentColors.value);
    }

    // Save to the current slot
    saveThemeToSlot(scheme, themeName.value, lightColors, darkColors);

    saveMessage.value = `Theme "${themeName.value}" saved successfully!`;

    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    saveError.value = error.message || 'Failed to save theme';
  }
};

const handleDeleteTheme = () => {
  if (!isCustomTheme()) {
    return;
  }

  const scheme = getCurrentScheme();
  const name = customThemeNames.value[scheme];

  deleteConfirmTitle.value = 'Delete Theme';
  deleteConfirmMessage.value = name
    ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
    : `Are you sure you want to delete this theme? This action cannot be undone.`;
  deleteConfirmAction.value = () => {
    try {
      clearThemeSlot(scheme);
      saveMessage.value = `Theme deleted successfully!`;

      // Clear message after 3 seconds
      setTimeout(() => {
        saveMessage.value = '';
      }, 3000);
    } catch (error) {
      saveError.value = error.message || 'Failed to delete theme';
    }
  };
  showDeleteConfirm.value = true;
};

const handleClearSlot = (slotKey) => {
  const slotNumber = slotKey.split('_')[1];
  const name = customThemeNames.value[slotKey];

  deleteConfirmTitle.value = 'Delete Theme';
  deleteConfirmMessage.value = name
    ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
    : `Are you sure you want to clear Slot ${slotNumber}? This action cannot be undone.`;
  deleteConfirmAction.value = () => {
    try {
      clearThemeSlot(slotKey);
      saveMessage.value = `Theme deleted successfully!`;

      // Clear message after 3 seconds
      setTimeout(() => {
        saveMessage.value = '';
      }, 3000);
    } catch (error) {
      saveError.value = error.message || 'Failed to clear slot';
    }
  };
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  if (deleteConfirmAction.value) {
    deleteConfirmAction.value();
  }
  showDeleteConfirm.value = false;
  deleteConfirmAction.value = null;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteConfirmAction.value = null;
};

const handleColorChange = (colorKey, value) => {
  currentColors.value[colorKey] = value;

  // Update the custom theme colors immediately
  const isDark = currentTheme.value === 'dark';
  const scheme = isDark ? colorSchemeDark.value : colorSchemeLight.value;

  if (scheme.startsWith('custom_')) {
    setCustomThemeColor(scheme, isDark ? 'dark' : 'light', colorKey, value);
  }
};

const handleCreateNewTheme = () => {
  // Find the first available slot
  const availableSlot = [
    'custom_01',
    'custom_02',
    'custom_03',
    'custom_04',
    'custom_05',
    'custom_06',
  ].find((key) => !customThemeNames.value[key]);

  if (!availableSlot) {
    saveError.value = 'All theme slots are full. Delete a theme to create a new one.';
    setTimeout(() => {
      saveError.value = '';
    }, 3000);
    return;
  }

  try {
    // Create a new theme with default colors and a generic name
    const slotNumber = availableSlot.split('_')[1];
    const newThemeName = `Custom Theme ${slotNumber}`;

    // Get default colors based on current theme colors
    const lightColors = { ...getCurrentThemeColors() };
    const darkColors = { ...getCurrentThemeColors() };

    saveThemeToSlot(availableSlot, newThemeName, lightColors, darkColors);

    // Switch to the new theme
    const isDark = currentTheme.value === 'dark';
    if (isDark) {
      setColorSchemeDark(availableSlot);
    } else {
      setColorSchemeLight(availableSlot);
    }

    saveMessage.value = `New theme "${newThemeName}" created!`;

    // Switch to Customize Theme tab
    activeTab.value = 'custom-theme';

    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    saveError.value = error.message || 'Failed to create theme';
  }
};

const handleCloneTheme = () => {
  // Find the first available slot
  const availableSlot = [
    'custom_01',
    'custom_02',
    'custom_03',
    'custom_04',
    'custom_05',
    'custom_06',
  ].find((key) => !customThemeNames.value[key]);

  if (!availableSlot) {
    saveError.value = 'All theme slots are full (maximum 6). Delete a theme to clone a new one.';
    setTimeout(() => {
      saveError.value = '';
    }, 3000);
    return;
  }

  try {
    const currentScheme = getCurrentScheme();
    const slotNumber = availableSlot.split('_')[1];

    // Get the name of the theme we're cloning
    const sourceThemeName = getCurrentThemeName();
    const newThemeName = `${sourceThemeName} (Copy)`;

    // Get colors from the current theme for both light and dark modes
    let lightColors, darkColors;

    if (currentScheme.startsWith('custom_')) {
      // Cloning a custom theme - get both modes
      lightColors = { ...customThemeColors.value[currentScheme].light };
      darkColors = { ...customThemeColors.value[currentScheme].dark };
    } else {
      // Cloning a default theme - get colors for both modes from presets
      lightColors = COLOR_PALETTES.light[currentScheme]
        ? { ...COLOR_PALETTES.light[currentScheme] }
        : { ...COLOR_PALETTES.light[COLOR_SCHEMES.DEFAULT] };

      darkColors = COLOR_PALETTES.dark[currentScheme]
        ? { ...COLOR_PALETTES.dark[currentScheme] }
        : { ...COLOR_PALETTES.dark[COLOR_SCHEMES.DEFAULT] };
    }

    saveThemeToSlot(availableSlot, newThemeName, lightColors, darkColors);

    // Switch to the new cloned theme
    const isDark = currentTheme.value === 'dark';
    if (isDark) {
      setColorSchemeDark(availableSlot);
    } else {
      setColorSchemeLight(availableSlot);
    }

    saveMessage.value = `Theme "${newThemeName}" created successfully!`;

    // Switch to Customize Theme tab
    activeTab.value = 'custom-theme';

    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    saveError.value = error.message || 'Failed to clone theme';
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click.self="handleClose"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[700px] max-h-[80vh] flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center gap-3">
            <font-awesome-icon icon="cog" class="text-gray-600 dark:text-gray-400" size="lg" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close settings"
            @click="handleClose"
          >
            <font-awesome-icon icon="times" class="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Sidebar Tabs -->
          <div class="w-56 border-r border-gray-200 dark:border-gray-700 p-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center gap-3"
              :class="
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              "
              @click="activeTab = tab.id"
            >
              <font-awesome-icon :icon="tab.icon" class="w-4" />
              <span class="text-sm">{{ tab.label }}</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Appearance Tab -->
            <div v-if="activeTab === 'appearance'" class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>

                <!-- Theme Toggle -->
                <div class="space-y-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                  <div class="flex gap-3">
                    <button
                      class="flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2"
                      :class="
                        currentTheme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTheme('light')"
                    >
                      <font-awesome-icon icon="sun" />
                      <span>Light</span>
                    </button>
                    <button
                      class="flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2"
                      :class="
                        currentTheme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTheme('dark')"
                    >
                      <font-awesome-icon icon="moon" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <!-- Clone Current Theme -->
                <div class="space-y-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Quick Actions</label
                  >
                  <button
                    :disabled="Object.values(customThemeNames).filter((name) => name).length >= 6"
                    class="w-full px-4 py-3 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    :class="
                      Object.values(customThemeNames).filter((name) => name).length >= 6
                        ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300'
                    "
                    title="Create a copy of the current theme"
                    @click="handleCloneTheme"
                  >
                    <font-awesome-icon icon="copy" />
                    Clone Current Theme
                  </button>
                  <p class="text-xs text-gray-500 dark:text-gray-500">
                    <span v-if="Object.values(customThemeNames).filter((name) => name).length >= 6">
                      You have reached the maximum number of custom themes (6). You must delete one
                      first.
                    </span>
                    <span v-else>
                      Creates a copy of "{{ getCurrentThemeName() }}" that you can customize.
                    </span>
                  </p>
                </div>

                <!-- Default Themes Section (Collapsible) -->
                <div
                  class="mt-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                >
                  <button
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                    @click="showDefaultThemes = !showDefaultThemes"
                  >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span v-if="currentTheme === 'light'">Default Light Themes</span>
                      <span v-else>Default Dark Themes</span>
                      ({{ Object.keys(COLOR_SCHEME_LABELS).length }})
                    </span>
                    <font-awesome-icon
                      :icon="showDefaultThemes ? 'chevron-up' : 'chevron-down'"
                      class="text-gray-600 dark:text-gray-400 text-sm"
                    />
                  </button>
                  <div v-show="showDefaultThemes" class="p-4 space-y-6">
                    <!-- Color Scheme Light (only shown in light mode) -->
                    <div v-if="currentTheme === 'light'" class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          v-for="(label, key) in COLOR_SCHEME_LABELS_LIGHT"
                          :key="key"
                          class="px-4 py-3 rounded-lg border-2 transition-all text-sm"
                          :class="
                            colorSchemeLight === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          "
                          @click="setColorSchemeLight(key)"
                        >
                          {{ label }}
                        </button>
                      </div>
                    </div>

                    <!-- Color Scheme Dark (only shown in dark mode) -->
                    <div v-if="currentTheme === 'dark'" class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          v-for="(label, key) in COLOR_SCHEME_LABELS"
                          :key="key"
                          class="px-4 py-3 rounded-lg border-2 transition-all text-sm"
                          :class="
                            colorSchemeDark === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          "
                          @click="setColorSchemeDark(key)"
                        >
                          {{ label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Custom Themes Section (Collapsible) -->
                <div
                  class="mt-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                >
                  <button
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                    @click="showCustomThemes = !showCustomThemes"
                  >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span v-if="currentTheme === 'light'">Custom Light Themes</span>
                      <span v-else>Custom Dark Themes</span>
                      ({{ Object.values(customThemeNames).filter((name) => name).length }})
                    </span>
                    <font-awesome-icon
                      :icon="showCustomThemes ? 'chevron-up' : 'chevron-down'"
                      class="text-gray-600 dark:text-gray-400 text-sm"
                    />
                  </button>
                  <div v-show="showCustomThemes" class="p-4 space-y-6">
                    <!-- Custom Themes for Light Mode (only shown in light mode) -->
                    <div v-if="currentTheme === 'light'" class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          v-for="slotKey in [
                            'custom_01',
                            'custom_02',
                            'custom_03',
                            'custom_04',
                            'custom_05',
                            'custom_06',
                          ]"
                          v-show="customThemeNames[slotKey]"
                          :key="`light-${slotKey}`"
                          class="px-4 py-3 rounded-lg border-2 transition-all text-sm relative group"
                          :class="
                            colorSchemeLight === slotKey
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          "
                          @click="setColorSchemeLight(slotKey)"
                        >
                          {{ customThemeNames[slotKey] }}
                          <span
                            class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all cursor-pointer"
                            role="button"
                            tabindex="0"
                            title="Delete theme"
                            @click.stop="handleClearSlot(slotKey)"
                            @keydown.enter.stop="handleClearSlot(slotKey)"
                            @keydown.space.prevent.stop="handleClearSlot(slotKey)"
                          >
                            <font-awesome-icon
                              icon="trash"
                              class="text-red-600 dark:text-red-400 text-xs"
                            />
                          </span>
                        </button>
                      </div>

                      <!-- Create New Theme Button -->
                      <button
                        class="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-sm font-medium flex items-center justify-center gap-2"
                        @click="handleCreateNewTheme"
                      >
                        <font-awesome-icon icon="plus" />
                        Create New Theme
                      </button>

                      <p
                        v-if="!Object.values(customThemeNames).some((name) => name)"
                        class="text-xs text-gray-500 dark:text-gray-500"
                      >
                        Click "Create New Theme" to get started.
                      </p>
                    </div>

                    <!-- Custom Themes for Dark Mode (only shown in dark mode) -->
                    <div v-if="currentTheme === 'dark'" class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          v-for="slotKey in [
                            'custom_01',
                            'custom_02',
                            'custom_03',
                            'custom_04',
                            'custom_05',
                            'custom_06',
                          ]"
                          v-show="customThemeNames[slotKey]"
                          :key="`dark-${slotKey}`"
                          class="px-4 py-3 rounded-lg border-2 transition-all text-sm relative group"
                          :class="
                            colorSchemeDark === slotKey
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          "
                          @click="setColorSchemeDark(slotKey)"
                        >
                          {{ customThemeNames[slotKey] }}
                          <span
                            class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all cursor-pointer"
                            role="button"
                            tabindex="0"
                            title="Delete theme"
                            @click.stop="handleClearSlot(slotKey)"
                            @keydown.enter.stop="handleClearSlot(slotKey)"
                            @keydown.space.prevent.stop="handleClearSlot(slotKey)"
                          >
                            <font-awesome-icon
                              icon="trash"
                              class="text-red-600 dark:text-red-400 text-xs"
                            />
                          </span>
                        </button>
                      </div>

                      <!-- Create New Theme Button -->
                      <button
                        class="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-sm font-medium flex items-center justify-center gap-2"
                        @click="handleCreateNewTheme"
                      >
                        <font-awesome-icon icon="plus" />
                        Create New Theme
                      </button>

                      <p
                        v-if="!Object.values(customThemeNames).some((name) => name)"
                        class="text-xs text-gray-500 dark:text-gray-500"
                      >
                        Click "Create New Theme" to get started.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Theme Tab -->
            <div v-if="activeTab === 'custom-theme'" class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customize Theme
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Editing: {{ getCurrentThemeName() || 'Current Theme' }} ({{
                    currentTheme === 'light' ? 'Light Mode' : 'Dark Mode'
                  }})
                </p>

                <!-- Theme Name Input -->
                <div class="space-y-2 mb-6">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Theme Name</label
                  >
                  <input
                    v-model="themeName"
                    type="text"
                    :disabled="isDefaultTheme()"
                    placeholder="Enter theme name..."
                    class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <!-- Color Pickers -->
                <div class="space-y-4 mb-6">
                  <div
                    v-for="(label, key) in colorLabels"
                    :key="key"
                    class="flex items-center gap-4"
                  >
                    <label class="text-sm text-gray-700 dark:text-gray-300 w-48">{{ label }}</label>
                    <input
                      type="color"
                      :value="currentColors[key]"
                      class="w-16 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      @input="handleColorChange(key, $event.target.value)"
                    />
                    <input
                      type="text"
                      :value="currentColors[key]"
                      placeholder="#000000"
                      class="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      @input="handleColorChange(key, $event.target.value)"
                    />
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 mb-4">
                  <button
                    :disabled="isDefaultTheme()"
                    class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-2 disabled:border-gray-400 dark:disabled:border-gray-600"
                    @click="handleDeleteTheme"
                  >
                    Delete Theme
                  </button>
                  <button
                    :disabled="isDefaultTheme()"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-2 disabled:border-gray-400 dark:disabled:border-gray-600"
                    @click="handleSaveTheme"
                  >
                    Save Theme
                  </button>
                </div>

                <!-- Success/Error Messages -->
                <div
                  v-if="saveMessage"
                  class="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <p class="text-sm text-green-800 dark:text-green-300">{{ saveMessage }}</p>
                </div>
                <div
                  v-if="saveError"
                  class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p class="text-sm text-red-800 dark:text-red-300">{{ saveError }}</p>
                </div>
              </div>
            </div>

            <!-- Accessibility Tab -->
            <div v-if="activeTab === 'accessibility'" class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Accessibility
                </h3>

                <!-- Font Size -->
                <div class="space-y-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Font Size</label
                  >
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      v-for="(label, key) in FONT_SIZE_LABELS"
                      :key="key"
                      class="px-4 py-3 rounded-lg border-2 transition-all"
                      :class="
                        fontSize === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setFontSize(key)"
                    >
                      <span class="text-sm">{{ label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Preview Text -->
                <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p class="text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <p class="text-gray-900 dark:text-white">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    This is how text will appear with your current font size setting.
                  </p>
                </div>
              </div>
            </div>

            <!-- Terminal Tab -->
            <div v-if="activeTab === 'terminal'" class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Terminal (iTerm2 only)
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Configure how Claude Code launches in iTerm2. These settings only apply when
                  iTerm2 is selected as your terminal.
                </p>

                <!-- Window Mode -->
                <div class="space-y-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Window Mode</label
                  >
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      v-for="(label, key) in TERMINAL_WINDOW_MODE_LABELS"
                      :key="key"
                      class="px-4 py-3 rounded-lg border-2 transition-all text-sm"
                      :class="
                        terminalWindowMode === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTerminalWindowMode(key)"
                    >
                      {{ label }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Choose whether to open Claude Code in a new tab or a new window.
                  </p>
                </div>

                <!-- Show Split Pane -->
                <div class="space-y-3 mt-6">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Split Pane</label
                  >
                  <div class="flex items-center gap-3">
                    <button
                      class="flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm"
                      :class="
                        terminalShowSplit
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTerminalShowSplit(true)"
                    >
                      Show Split
                    </button>
                    <button
                      class="flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm"
                      :class="
                        !terminalShowSplit
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTerminalShowSplit(false)"
                    >
                      No Split
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Enable to automatically create a split pane with a regular terminal in the same
                    directory.
                  </p>
                </div>

                <!-- Split Direction (only shown when split is enabled) -->
                <div v-if="terminalShowSplit" class="space-y-3 mt-6">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Split Direction</label
                  >
                  <div class="grid grid-cols-1 gap-3">
                    <button
                      v-for="(label, key) in TERMINAL_SPLIT_DIRECTION_LABELS"
                      :key="key"
                      class="px-4 py-3 rounded-lg border-2 transition-all text-sm text-left"
                      :class="
                        terminalSplitDirection === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      "
                      @click="setTerminalSplitDirection(key)"
                    >
                      {{ label }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Choose how to split the terminal panes.
                  </p>
                </div>

                <!-- Window Size (only for window mode) -->
                <div v-if="terminalWindowMode === 'window'" class="space-y-3 mt-6">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Window Size</label
                  >
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Width -->
                    <div class="space-y-2">
                      <label class="text-xs text-gray-600 dark:text-gray-400">Width (px)</label>
                      <input
                        v-model.number="terminalWindowWidth"
                        type="number"
                        min="800"
                        max="3000"
                        step="50"
                        class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        @blur="setTerminalWindowWidth(terminalWindowWidth)"
                      />
                    </div>
                    <!-- Height -->
                    <div class="space-y-2">
                      <label class="text-xs text-gray-600 dark:text-gray-400">Height (px)</label>
                      <input
                        v-model.number="terminalWindowHeight"
                        type="number"
                        min="300"
                        max="1500"
                        step="50"
                        class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        @blur="setTerminalWindowHeight(terminalWindowHeight)"
                      />
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Set custom window dimensions. Width: 800-3000px, Height: 300-1500px.
                  </p>
                </div>

                <!-- Preview Info Box -->
                <div
                  class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div class="flex items-start gap-3">
                    <font-awesome-icon
                      icon="info-circle"
                      class="text-blue-600 dark:text-blue-400 mt-0.5"
                    />
                    <div class="flex-1">
                      <p class="text-sm text-blue-900 dark:text-blue-300 font-medium mb-1">
                        Preview
                      </p>
                      <p class="text-xs text-blue-800 dark:text-blue-400">
                        <span v-if="terminalWindowMode === 'window'"
                          >Will open a new iTerm window</span
                        >
                        <span v-else>Will open a new tab in the current iTerm window</span>
                        <span v-if="terminalShowSplit">
                          with Claude Code on the
                          <span v-if="terminalSplitDirection === 'vertical'">left</span
                          ><span v-else>top</span> and a regular terminal on the
                          <span v-if="terminalSplitDirection === 'vertical'">right</span
                          ><span v-else>bottom</span>.
                        </span>
                        <span v-else> with Claude Code only. </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            @click="handleClose"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75"
      @click.self="cancelDelete"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[500px] flex flex-col">
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ deleteConfirmTitle }}
          </h3>
          <button
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close"
            @click="cancelDelete"
          >
            <font-awesome-icon icon="times" class="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
            >
              <font-awesome-icon
                icon="exclamation-triangle"
                class="text-red-600 dark:text-red-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ deleteConfirmMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-sm font-medium border border-gray-300 dark:border-gray-600"
            @click="cancelDelete"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            @click="confirmDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
