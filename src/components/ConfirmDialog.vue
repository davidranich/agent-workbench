<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info
    validator: (value) => ['warning', 'danger', 'info'].includes(value),
  },
});

const emit = defineEmits(['close', 'confirm']);

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('close');
};

const getIconClass = () => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-yellow-600 dark:text-yellow-400';
  }
};

const getBackgroundClass = () => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100 dark:bg-red-900/30';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900/30';
    default:
      return 'bg-yellow-100 dark:bg-yellow-900/30';
  }
};

const getButtonClass = () => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700';
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'info':
      return 'bg-blue-600 hover:bg-blue-700';
    default:
      return 'bg-yellow-600 hover:bg-yellow-700';
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75"
      @click.self="handleCancel"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[500px] flex flex-col">
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
          <button
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close"
            @click="handleCancel"
          >
            <font-awesome-icon icon="times" class="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="getBackgroundClass()"
            >
              <font-awesome-icon icon="exclamation-triangle" :class="getIconClass()" />
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ message }}
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
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
            :class="getButtonClass()"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
