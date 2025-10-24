<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  imagePath: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const imageUrl = ref('');
const imageError = ref(false);
const zoomLevel = ref(100);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imagePosition = ref({ x: 0, y: 0 });

// Load image as base64 data URL
onMounted(async () => {
  try {
    const buffer = await window.electronAPI.readFileBinary(props.imagePath);
    // Detect image type from file extension
    const ext = props.imageName.toLowerCase().split('.').pop();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp'
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(buffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    imageUrl.value = `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error loading image:', error);
    imageError.value = true;
  }
});

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close');
  } else if (event.key === '+' || event.key === '=') {
    zoomIn();
  } else if (event.key === '-' || event.key === '_') {
    zoomOut();
  } else if (event.key === '0') {
    resetZoom();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 25, 500);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 25, 25);
};

const resetZoom = () => {
  zoomLevel.value = 100;
  imagePosition.value = { x: 0, y: 0 };
};

const fitToScreen = () => {
  zoomLevel.value = 100;
  imagePosition.value = { x: 0, y: 0 };
};

// Image dragging
const startDrag = (event) => {
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - imagePosition.value.x,
    y: event.clientY - imagePosition.value.y
  };
};

const onDrag = (event) => {
  if (!isDragging.value) return;
  imagePosition.value = {
    x: event.clientX - dragStart.value.x,
    y: event.clientY - dragStart.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
};

const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value / 100}) translate(${imagePosition.value.x}px, ${imagePosition.value.y}px)`,
  cursor: isDragging.value ? 'grabbing' : 'grab'
}));
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90" @click="emit('close')">
    <!-- Toolbar -->
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-4 shadow-lg z-10" @click.stop>
      <span class="text-white text-sm font-medium">{{ imageName }}</span>
      <div class="h-4 w-px bg-gray-600"></div>
      <span class="text-gray-400 text-sm">{{ zoomLevel }}%</span>
      <div class="flex items-center gap-2">
        <button
          @click="zoomOut"
          class="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="Zoom Out (-)"
        >
          <font-awesome-icon icon="minus" />
        </button>
        <button
          @click="resetZoom"
          class="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="Reset Zoom (0)"
        >
          <font-awesome-icon icon="expand" />
        </button>
        <button
          @click="zoomIn"
          class="p-2 text-white hover:bg-gray-700 rounded transition-colors"
          title="Zoom In (+)"
        >
          <font-awesome-icon icon="plus" />
        </button>
      </div>
      <div class="h-4 w-px bg-gray-600"></div>
      <button
        @click="emit('close')"
        class="p-2 text-white hover:bg-gray-700 rounded transition-colors"
        title="Close (Esc)"
      >
        <font-awesome-icon icon="times" />
      </button>
    </div>

    <!-- Image Container -->
    <div
      class="w-full h-full flex items-center justify-center overflow-hidden"
      @click.stop
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
    >
      <img
        v-if="!imageError && imageUrl"
        :src="imageUrl"
        :alt="imageName"
        :style="imageStyle"
        class="max-w-none transition-transform select-none"
        draggable="false"
      />
      <div v-else-if="imageError" class="text-white text-center">
        <font-awesome-icon icon="exclamation-triangle" size="3x" class="mb-4" />
        <p class="text-lg">Failed to load image</p>
        <p class="text-sm text-gray-400 mt-2">{{ imageName }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Prevent text selection while dragging */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
