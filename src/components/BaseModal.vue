<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    default: 'w-[500px]',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  closeOnBackdropClick: {
    type: Boolean,
    default: false,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdropClick) {
    handleClose();
  }
};

const handleEscape = (event) => {
  if (props.closeOnEscape && event.key === 'Escape' && props.show) {
    handleClose();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75"
      @click.self="handleBackdropClick"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col" :class="width">
        <!-- Header -->
        <div
          v-if="showHeader"
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
          <button
            v-if="showCloseButton"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close"
            @click="handleClose"
          >
            <font-awesome-icon icon="times" class="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 flex-1 overflow-y-auto">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div
          v-if="showFooter"
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
