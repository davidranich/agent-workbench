<script setup>
import { computed, ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { useAgentStore } from '@/stores/agentStore';
import { useElectronAPI } from '@/composables/useElectronAPI';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import TurndownService from 'turndown';
import hljs from 'highlight.js/lib/core';
import FindReplaceDialog from './FindReplaceDialog.vue';
import BaseModal from './BaseModal.vue';

// Import common languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import cpp from 'highlight.js/lib/languages/cpp';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);

const agentStore = useAgentStore();
const { writeFile } = useElectronAPI();

// Edit mode: 'markdown' or 'richtext'
const editMode = ref('markdown');

// Refs for scroll sync
const editorRef = ref(null);
const previewRef = ref(null);
const richEditorRef = ref(null);
let isSyncing = false;

// Resizable panes
const editorPaneRef = ref(null);
const previewPaneRef = ref(null);
const editorWidth = ref(50); // percentage
const isResizing = ref(false);

// Find/Replace state
const showFindReplace = ref(false);
const findReplaceMode = ref('find'); // 'find' or 'replace'
const findReplaceDialogRef = ref(null);
const currentSearchTerm = ref('');
const currentSearchCaseSensitive = ref(false);

// Link dialog state
const showLinkDialog = ref(false);
const linkText = ref('');
const linkUrl = ref('');
const linkTextInputRef = ref(null);
let savedSelection = null;

// Link hover tooltip state
const showLinkTooltip = ref(false);
const linkTooltipPosition = ref({ x: 0, y: 0 });
let hoveredLink = null;
let editingExistingLink = false;
let hideTooltipTimeout = null;

// Handle pane resizing
const startResize = () => {
  isResizing.value = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
};

const handleResize = (event) => {
  if (!isResizing.value || !editorPaneRef.value) {
    return;
  }

  const container = editorPaneRef.value.parentElement;
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const offsetX = event.clientX - containerRect.left;
  const newWidth = (offsetX / containerWidth) * 100;

  // Constrain between 20% and 80%
  if (newWidth >= 20 && newWidth <= 80) {
    editorWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';

  // Save to localStorage
  localStorage.setItem('agentWorkbench_editorWidth', editorWidth.value.toString());
};

// Load saved width on mount
onMounted(() => {
  const savedWidth = localStorage.getItem('agentWorkbench_editorWidth');
  if (savedWidth) {
    editorWidth.value = parseFloat(savedWidth);
  }

  // Add global event listeners for resize
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Configure marked with syntax highlighting using the new API
marked.use({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
});

// Add custom renderer for code blocks with syntax highlighting
const renderer = new marked.Renderer();
const originalCodeRenderer = renderer.code.bind(renderer);

renderer.code = function (code, infostring) {
  const lang = infostring || '';
  console.log('Rendering code block with language:', lang);

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(code, { language: lang }).value;
      console.log('Successfully highlighted code');
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Syntax highlighting error:', err);
    }
  }

  console.log('No highlighting applied, using default');
  return originalCodeRenderer(code, infostring);
};

marked.use({ renderer });

// Render markdown with sanitization
const renderMarkdown = (markdown) => {
  if (!markdown) {
    return '';
  }
  try {
    const rawHtml = marked.parse(markdown);
    // Configure DOMPurify to allow hljs classes for syntax highlighting and mark tags for search highlights
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['mark'],
      ADD_ATTR: ['class'],
      ALLOWED_ATTR: ['class', 'href', 'title', 'alt', 'src'],
      KEEP_CONTENT: true,
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<p class="text-red-400">Error rendering markdown</p>';
  }
};

// Render markdown with search highlighting
const renderMarkdownWithHighlights = computed(() => {
  if (!agentStore.fileContent) {
    return '';
  }

  // Render the markdown first
  let html = renderMarkdown(agentStore.fileContent);

  // If there's an active search with non-empty term, highlight matches
  if (currentSearchTerm.value && currentSearchTerm.value.trim() !== '') {
    const searchTerm = currentSearchTerm.value;
    const flags = currentSearchCaseSensitive.value ? 'g' : 'gi';

    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex to find matches
    const regex = new RegExp(escapedTerm, flags);

    // Wrap matches in mark tags
    // We need to be careful not to match inside HTML tags
    html = html.replace(regex, (match) => `<mark class="search-highlight">${match}</mark>`);
  }

  return html;
});

// Scroll synchronization - improved for fluid sync
const handleEditorScroll = () => {
  const activeEditor = editMode.value === 'markdown' ? editorRef.value : richEditorRef.value;
  if (!activeEditor || !previewRef.value || isSyncing) {
    return;
  }

  isSyncing = true;

  requestAnimationFrame(() => {
    const scrollPercentage =
      activeEditor.scrollTop / (activeEditor.scrollHeight - activeEditor.clientHeight);
    const targetScrollTop =
      scrollPercentage * (previewRef.value.scrollHeight - previewRef.value.clientHeight);

    previewRef.value.scrollTop = targetScrollTop;

    setTimeout(() => {
      isSyncing = false;
    }, 10);
  });
};

const handlePreviewScroll = () => {
  const activeEditor = editMode.value === 'markdown' ? editorRef.value : richEditorRef.value;
  if (!activeEditor || !previewRef.value || isSyncing) {
    return;
  }

  isSyncing = true;

  requestAnimationFrame(() => {
    const scrollPercentage =
      previewRef.value.scrollTop / (previewRef.value.scrollHeight - previewRef.value.clientHeight);
    const targetScrollTop =
      scrollPercentage * (activeEditor.scrollHeight - activeEditor.clientHeight);

    activeEditor.scrollTop = targetScrollTop;

    setTimeout(() => {
      isSyncing = false;
    }, 10);
  });
};

const content = computed({
  get: () => agentStore.fileContent,
  set: (value) => agentStore.updateFileContent(value),
});

// Rich text content (for contenteditable)
const richContent = ref('');
let isEditingRichText = false;

// Update rich content when file changes or mode switches (but not while actively editing)
watch(
  [() => agentStore.fileContent, editMode],
  () => {
    if (editMode.value === 'richtext' && !isEditingRichText) {
      richContent.value = renderMarkdown(agentStore.fileContent);
    }
  },
  { immediate: true }
);

// Clear search highlights when find dialog closes
watch(showFindReplace, (newVal) => {
  if (!newVal) {
    // Clear search term when dialog closes
    currentSearchTerm.value = '';
    currentSearchCaseSensitive.value = false;
  }
});

// Auto-focus link text input when dialog opens
watch(showLinkDialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      linkTextInputRef.value?.focus();
    });
  }
});

// Handle rich text editing
const handleRichTextInput = (event) => {
  isEditingRichText = true;
  const html = event.target.innerHTML;

  // Convert HTML back to markdown and update store
  const markdown = turndownService.turndown(html);
  agentStore.updateFileContent(markdown);

  // Reset flag after a short delay
  setTimeout(() => {
    isEditingRichText = false;
  }, 100);
};

// Toggle between edit modes
const toggleEditMode = () => {
  editMode.value = editMode.value === 'markdown' ? 'richtext' : 'markdown';
};

// WYSIWYG formatting commands
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value);
  richEditorRef.value?.focus();
};

const formatBold = () => execCommand('bold');
const formatItalic = () => execCommand('italic');
const formatUnderline = () => execCommand('underline');
const formatStrikethrough = () => execCommand('strikethrough');
const formatHeading = (level) => execCommand('formatBlock', `h${level}`);
const formatOrderedList = () => execCommand('insertOrderedList');
const formatUnorderedList = () => execCommand('insertUnorderedList');
const formatBlockquote = () => execCommand('formatBlock', 'blockquote');
const formatCode = () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const code = document.createElement('code');
    code.textContent = range.toString();
    range.deleteContents();
    range.insertNode(code);
  }
};

const insertLink = () => {
  editingExistingLink = false;

  // Save the current selection
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0);
    // Pre-populate text field with selected text
    linkText.value = selection.toString();
  } else {
    linkText.value = '';
  }

  linkUrl.value = '';
  showLinkDialog.value = true;
};

// Handle link hover in rich text editor
const handleRichEditorMouseMove = (event) => {
  if (editMode.value !== 'richtext') {return;}

  const target = event.target;

  // Check if hovering over a link
  if (target.tagName === 'A') {
    // Clear any pending hide timeout
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }

    hoveredLink = target;
    const rect = target.getBoundingClientRect();
    linkTooltipPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 5,
    };
    showLinkTooltip.value = true;
  } else {
    // Set a delay before hiding the tooltip
    if (showLinkTooltip.value && !hideTooltipTimeout) {
      hideTooltipTimeout = setTimeout(() => {
        showLinkTooltip.value = false;
        hoveredLink = null;
        hideTooltipTimeout = null;
      }, 300); // 300ms delay
    }
  }
};

// Keep tooltip visible when hovering over it
const handleTooltipMouseEnter = () => {
  if (hideTooltipTimeout) {
    clearTimeout(hideTooltipTimeout);
    hideTooltipTimeout = null;
  }
};

const handleTooltipMouseLeave = () => {
  hideTooltipTimeout = setTimeout(() => {
    showLinkTooltip.value = false;
    hoveredLink = null;
    hideTooltipTimeout = null;
  }, 100); // Shorter delay when leaving tooltip
};

// Edit existing link
// Normalize URL to ensure it has a protocol
const normalizeUrl = (url) => {
  if (!url) {return '';}

  // Trim whitespace
  url = url.trim();

  // Check if URL already has a protocol
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
    return url;
  }

  // Add https:// if no protocol
  return 'https://' + url;
};

const editLink = () => {
  if (!hoveredLink) {return;}

  editingExistingLink = true;
  linkText.value = hoveredLink.textContent || '';
  // Use getAttribute to get the raw href value, not the resolved URL
  linkUrl.value = hoveredLink.getAttribute('href') || '';
  showLinkTooltip.value = false;
  showLinkDialog.value = true;
};

const handleInsertLink = () => {
  if (linkUrl.value && linkText.value) {
    // Normalize the URL to ensure it has a protocol
    const normalizedUrl = normalizeUrl(linkUrl.value);

    if (editingExistingLink && hoveredLink) {
      // Update existing link
      hoveredLink.href = normalizedUrl;
      hoveredLink.textContent = linkText.value;
      hoveredLink = null;
    } else {
      // Create new link
      const selection = window.getSelection();

      if (savedSelection) {
        // Restore the selection
        selection.removeAllRanges();
        selection.addRange(savedSelection);

        // Delete the current selection content
        savedSelection.deleteContents();

        // Create a new link element with the custom text
        const link = document.createElement('a');
        link.href = normalizedUrl;
        link.textContent = linkText.value;

        // Insert the link at the cursor position
        savedSelection.insertNode(link);

        // Move cursor after the link
        const range = document.createRange();
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // No selection - insert at cursor position
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = normalizedUrl;
        link.textContent = linkText.value;
        range.insertNode(link);

        // Move cursor after the link
        const newRange = document.createRange();
        newRange.setStartAfter(link);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    // Trigger input event to update markdown
    if (richEditorRef.value) {
      richEditorRef.value.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  showLinkDialog.value = false;
  linkText.value = '';
  linkUrl.value = '';
  savedSelection = null;
  editingExistingLink = false;
  richEditorRef.value?.focus();
};

const insertHorizontalRule = () => {
  execCommand('insertHorizontalRule');
};

const clearFormatting = () => {
  execCommand('removeFormat');
  execCommand('unlink'); // Also remove links
};

const saveFile = async () => {
  if (!agentStore.currentFilePath) {
    console.error('No file selected');
    return;
  }

  try {
    await writeFile(agentStore.currentFilePath, agentStore.fileContent);
    agentStore.markAsSaved();
    console.log('File saved successfully');
  } catch (error) {
    console.error('Error saving file:', error);
  }
};

// Keyboard shortcuts for save and tab handling
const handleKeydown = (event) => {
  // Save shortcut (Cmd/Ctrl + S)
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault();
    saveFile();
    return;
  }

  // Find shortcut (Cmd/Ctrl + F)
  if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
    event.preventDefault();
    findReplaceMode.value = 'find';
    showFindReplace.value = true;
    return;
  }

  // Replace shortcut (Cmd/Ctrl + H)
  if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
    event.preventDefault();
    findReplaceMode.value = 'replace';
    showFindReplace.value = true;
    return;
  }

  // Tab key handling for markdown editor
  if (event.key === 'Tab' && editMode.value === 'markdown') {
    event.preventDefault();

    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const spaces = '  '; // 2 spaces (you can change to '    ' for 4 spaces)

    // Insert spaces at cursor position
    const newValue = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);

    // Update the content
    content.value = newValue;

    // Restore cursor position after the inserted spaces
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
    });
  }

  // Tab key handling for rich text editor (indent/outdent lists)
  if (event.key === 'Tab' && editMode.value === 'richtext') {
    event.preventDefault();

    if (event.shiftKey) {
      // Shift+Tab: Outdent (move list item up one level)
      document.execCommand('outdent');
    } else {
      // Tab: Indent (create nested list item)
      document.execCommand('indent');
    }

    // Trigger input event to update markdown
    if (richEditorRef.value) {
      richEditorRef.value.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
};

// Find/Replace functionality
const handleFindNext = (searchData, keepFocus = false) => {
  const textarea = editMode.value === 'markdown' ? editorRef.value : richEditorRef.value;
  if (!textarea || !agentStore.fileContent) {
    return;
  }

  const { text, caseSensitive } = searchData;

  // Always update current search term for highlighting in preview (even if empty)
  currentSearchTerm.value = text;
  currentSearchCaseSensitive.value = caseSensitive;

  // Update match count (will reset to 0/0 if empty)
  updateMatchCount(searchData);

  // If search is empty, just return
  if (!text) {
    return;
  }

  const content = agentStore.fileContent;
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchContent = caseSensitive ? content : content.toLowerCase();

  // If there's a selection and it matches the search text, start after it
  const selectionStart = textarea.selectionStart || 0;
  const selectionEnd = textarea.selectionEnd || 0;
  const hasSelection = selectionStart !== selectionEnd;
  const selectedText = content.substring(selectionStart, selectionEnd);
  const selectedMatches = caseSensitive
    ? selectedText === text
    : selectedText.toLowerCase() === searchText;

  // Start searching from after the current selection if it matches, otherwise from cursor
  const startPos = hasSelection && selectedMatches ? selectionEnd : selectionStart;
  let index = searchContent.indexOf(searchText, startPos);

  // If not found after cursor, wrap around to start
  if (index === -1) {
    index = searchContent.indexOf(searchText);
  }

  if (index !== -1) {
    // Store the currently focused element
    const previouslyFocused = keepFocus ? document.activeElement : null;

    // Select the found text
    textarea.setSelectionRange(index, index + text.length);

    // Scroll to the match
    const lineHeight = 20; // approximate line height
    const scrollPosition = (index / content.length) * textarea.scrollHeight;
    textarea.scrollTop = Math.max(0, scrollPosition - textarea.clientHeight / 2);

    // Only focus the textarea if we're not keeping focus elsewhere
    if (!keepFocus) {
      textarea.focus();
    } else if (previouslyFocused) {
      // Restore focus to the find dialog
      previouslyFocused.focus();
    }

    // Update match count
    updateMatchCount(searchData);
  }
};

const handleFindPrevious = (searchData, keepFocus = false) => {
  const textarea = editMode.value === 'markdown' ? editorRef.value : richEditorRef.value;
  if (!textarea || !agentStore.fileContent) {
    return;
  }

  const { text, caseSensitive } = searchData;

  // Always update current search term for highlighting in preview (even if empty)
  currentSearchTerm.value = text;
  currentSearchCaseSensitive.value = caseSensitive;

  // Update match count (will reset to 0/0 if empty)
  updateMatchCount(searchData);

  // If search is empty, just return
  if (!text) {
    return;
  }

  const content = agentStore.fileContent;
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchContent = caseSensitive ? content : content.toLowerCase();

  // If there's a selection and it matches the search text, start before it
  const selectionStart = textarea.selectionStart || 0;
  const selectionEnd = textarea.selectionEnd || 0;
  const hasSelection = selectionStart !== selectionEnd;
  const selectedText = content.substring(selectionStart, selectionEnd);
  const selectedMatches = caseSensitive
    ? selectedText === text
    : selectedText.toLowerCase() === searchText;

  // Start searching backwards from before the current selection if it matches, otherwise from cursor
  const startPos = hasSelection && selectedMatches ? selectionStart - 1 : selectionStart - 1;
  let index = searchContent.lastIndexOf(searchText, startPos);

  // If not found before cursor, wrap around to end
  if (index === -1) {
    index = searchContent.lastIndexOf(searchText);
  }

  if (index !== -1) {
    // Store the currently focused element
    const previouslyFocused = keepFocus ? document.activeElement : null;

    // Select the found text
    textarea.setSelectionRange(index, index + text.length);

    // Scroll to the match
    const lineHeight = 20; // approximate line height
    const scrollPosition = (index / content.length) * textarea.scrollHeight;
    textarea.scrollTop = Math.max(0, scrollPosition - textarea.clientHeight / 2);

    // Only focus the textarea if we're not keeping focus elsewhere
    if (!keepFocus) {
      textarea.focus();
    } else if (previouslyFocused) {
      // Restore focus to the find dialog
      previouslyFocused.focus();
    }

    // Update match count
    updateMatchCount(searchData);
  }
};

const handleReplace = (replaceData) => {
  const textarea = editMode.value === 'markdown' ? editorRef.value : richEditorRef.value;
  if (!textarea || !agentStore.fileContent) {
    return;
  }

  const { find, replace, caseSensitive } = replaceData;
  const selectionStart = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;
  const selectedText = agentStore.fileContent.substring(selectionStart, selectionEnd);

  // Check if current selection matches find text
  const matches = caseSensitive
    ? selectedText === find
    : selectedText.toLowerCase() === find.toLowerCase();

  if (matches) {
    // Replace the selected text
    const newContent =
      agentStore.fileContent.substring(0, selectionStart) +
      replace +
      agentStore.fileContent.substring(selectionEnd);

    content.value = newContent;

    // Move to next match
    nextTick(() => {
      textarea.selectionStart = selectionStart + replace.length;
      handleFindNext({ text: find, caseSensitive });
    });
  } else {
    // Find next match
    handleFindNext({ text: find, caseSensitive });
  }
};

const handleReplaceAll = (replaceData) => {
  const { find, replace, caseSensitive } = replaceData;
  let newContent = agentStore.fileContent;

  if (caseSensitive) {
    newContent = newContent.split(find).join(replace);
  } else {
    // Case-insensitive replace all
    const regex = new RegExp(escapeRegex(find), 'gi');
    newContent = newContent.replace(regex, replace);
  }

  content.value = newContent;

  // Close find/replace dialog after replace all
  showFindReplace.value = false;
};

// Helper function to escape regex special characters
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Update match count in the dialog
const updateMatchCount = (searchData) => {
  const { text, caseSensitive } = searchData;

  // If search is empty, reset the count
  if (!text || text.trim() === '') {
    if (findReplaceDialogRef.value) {
      findReplaceDialogRef.value.setMatches(0, 0);
    }
    return;
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const content = caseSensitive ? agentStore.fileContent : agentStore.fileContent.toLowerCase();

  const matches = content.split(searchText).length - 1;
  const currentPos = editorRef.value?.selectionStart || 0;

  // Count matches before current position
  const beforeContent = content.substring(0, currentPos);
  const currentMatch = beforeContent.split(searchText).length;

  if (findReplaceDialogRef.value) {
    findReplaceDialogRef.value.setMatches(currentMatch, matches);
  }
};

// Open find dialog
const openFind = () => {
  findReplaceMode.value = 'find';
  showFindReplace.value = true;
};

// Open replace dialog
const openReplace = () => {
  findReplaceMode.value = 'replace';
  showFindReplace.value = true;
};
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900">
    <!-- Editor Header -->
    <div
      class="h-14 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6"
    >
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Editor</h2>
        <span v-if="agentStore.currentFileName" class="text-sm text-gray-600 dark:text-gray-400">
          {{ agentStore.currentFileName }}
        </span>
        <span
          v-if="agentStore.hasUnsavedChanges"
          class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded"
        >
          Unsaved
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="agentStore.selectedFile"
          class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          title="Find (Cmd/Ctrl+F)"
          @click="openFind"
        >
          <font-awesome-icon icon="search" />
        </button>
        <button
          v-if="agentStore.selectedFile"
          class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          title="Find & Replace (Cmd/Ctrl+H)"
          @click="openReplace"
        >
          <font-awesome-icon icon="rotate" />
        </button>
        <button
          v-if="agentStore.selectedFile"
          class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          title="Toggle edit mode"
          @click="toggleEditMode"
        >
          <font-awesome-icon icon="repeat" />
          Swap
        </button>
        <button
          v-if="agentStore.selectedFile"
          :disabled="!agentStore.hasUnsavedChanges"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 text-white rounded-lg transition-colors text-sm font-medium"
          :class="{
            'cursor-not-allowed': !agentStore.hasUnsavedChanges,
          }"
          @click="saveFile"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel (Editor) -->
      <div
        ref="editorPaneRef"
        class="flex flex-col border-r border-gray-200 dark:border-gray-700"
        :style="{ width: editorWidth + '%' }"
      >
        <div
          class="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
        >
          <h3
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
          >
            {{ editMode === 'markdown' ? 'Markdown' : 'Rich Text Editor' }}
          </h3>
        </div>

        <!-- WYSIWYG Toolbar -->
        <div
          v-if="editMode === 'richtext' && agentStore.selectedFile"
          class="wysiwyg-toolbar px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1"
        >
          <!-- Text Formatting -->
          <div class="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Bold (Ctrl+B)"
              @click="formatBold"
            >
              <font-awesome-icon icon="bold" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Italic (Ctrl+I)"
              @click="formatItalic"
            >
              <font-awesome-icon icon="italic" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Underline (Ctrl+U)"
              @click="formatUnderline"
            >
              <font-awesome-icon icon="underline" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Strikethrough"
              @click="formatStrikethrough"
            >
              <font-awesome-icon icon="strikethrough" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded transition-colors"
              title="Clear Formatting"
              @click="clearFormatting"
            >
              <font-awesome-icon icon="eraser" />
            </button>
          </div>

          <!-- Headings -->
          <div class="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Heading 1"
              @click="formatHeading(1)"
            >
              H1
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Heading 2"
              @click="formatHeading(2)"
            >
              H2
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Heading 3"
              @click="formatHeading(3)"
            >
              H3
            </button>
          </div>

          <!-- Lists -->
          <div class="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Bullet List"
              @click="formatUnorderedList"
            >
              <font-awesome-icon icon="list-ul" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Numbered List"
              @click="formatOrderedList"
            >
              <font-awesome-icon icon="list-ol" />
            </button>
          </div>

          <!-- Special -->
          <div class="flex gap-1">
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Insert Link"
              @click="insertLink"
            >
              <font-awesome-icon icon="link" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Code"
              @click="formatCode"
            >
              <font-awesome-icon icon="code" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Quote"
              @click="formatBlockquote"
            >
              <font-awesome-icon icon="quote-left" />
            </button>
            <button
              class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded transition-colors"
              title="Horizontal Rule"
              @click="insertHorizontalRule"
            >
              <font-awesome-icon icon="minus" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-hidden">
          <!-- Markdown Editor -->
          <textarea
            v-if="agentStore.selectedFile && editMode === 'markdown'"
            ref="editorRef"
            v-model="content"
            class="w-full h-full p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            placeholder="Start writing your agent instructions..."
            spellcheck="false"
            @keydown="handleKeydown"
            @scroll="handleEditorScroll"
          ></textarea>

          <!-- Rich Text Editor -->
          <div
            v-else-if="agentStore.selectedFile && editMode === 'richtext'"
            ref="richEditorRef"
            contenteditable="true"
            class="w-full h-full p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm overflow-y-auto focus:outline-none leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            spellcheck="false"
            @input="handleRichTextInput"
            @keydown="handleKeydown"
            @scroll="handleEditorScroll"
            @mousemove="handleRichEditorMouseMove"
            v-html="richContent"
          ></div>

          <!-- Empty State -->
          <div
            v-else
            class="flex items-center justify-center h-full"
            style="color: var(--color-text-secondary)"
          >
            <div class="text-center">
              <div class="mb-3">
                <font-awesome-icon icon="file-lines" size="3x" />
              </div>
              <div class="text-lg">No file selected</div>
              <div class="text-sm mt-2">Select an agent file from the sidebar to begin editing</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resize Handle -->
      <div
        class="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
        :class="{ 'bg-blue-500 dark:bg-blue-500': isResizing }"
        @mousedown="startResize"
      ></div>

      <!-- Right Panel (Preview) -->
      <div
        ref="previewPaneRef"
        class="flex flex-col bg-gray-50 dark:bg-gray-900"
        :style="{ width: 100 - editorWidth + '%' }"
      >
        <div
          class="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
        >
          <h3
            class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
          >
            {{ editMode === 'markdown' ? 'Rich Text Preview' : 'Markdown Preview' }}
          </h3>
        </div>
        <div
          ref="previewRef"
          class="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900"
          @scroll="handlePreviewScroll"
        >
          <!-- Rich Text Preview (from Markdown) -->
          <div
            v-if="agentStore.selectedFile && agentStore.fileContent && editMode === 'markdown'"
            class="prose dark:prose-invert prose-sm max-w-none"
            v-html="renderMarkdownWithHighlights"
          ></div>

          <!-- Markdown Preview (from Rich Text) -->
          <pre
            v-else-if="agentStore.selectedFile && agentStore.fileContent && editMode === 'richtext'"
            class="text-gray-700 dark:text-gray-300 font-mono text-xs leading-relaxed whitespace-pre-wrap"
            >{{ agentStore.fileContent }}</pre
          >

          <!-- Empty State -->
          <div
            v-else
            class="flex items-center justify-center h-full"
            style="color: var(--color-text-secondary)"
          >
            <div class="text-center">
              <div class="mb-3">
                <font-awesome-icon icon="book-open" size="3x" />
              </div>
              <div>Preview will appear here</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Find/Replace Dialog -->
    <FindReplaceDialog
      ref="findReplaceDialogRef"
      :show="showFindReplace"
      :mode="findReplaceMode"
      @close="showFindReplace = false"
      @live-search="(data) => handleFindNext(data, true)"
      @find-next="(data) => handleFindNext(data, true)"
      @find-previous="(data) => handleFindPrevious(data, true)"
      @replace="handleReplace"
      @replace-all="handleReplaceAll"
    />

    <!-- Link Dialog -->
    <BaseModal
      :show="showLinkDialog"
      :title="editingExistingLink ? 'Edit Link' : 'Insert Link'"
      width="w-96"
      :close-on-backdrop-click="false"
      @close="showLinkDialog = false"
    >
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Text
      </label>
      <input
        ref="linkTextInputRef"
        v-model="linkText"
        type="text"
        placeholder="Link text"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        @keydown.enter.prevent.stop="handleInsertLink"
        @keydown.esc.stop="showLinkDialog = false"
      />

      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> URL </label>
      <input
        v-model="linkUrl"
        type="url"
        placeholder="https://example.com"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keydown.enter.prevent.stop="handleInsertLink"
        @keydown.esc.stop="showLinkDialog = false"
      />

      <template #footer>
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          @click="showLinkDialog = false"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="handleInsertLink"
        >
          {{ editingExistingLink ? 'Update' : 'Insert' }}
        </button>
      </template>
    </BaseModal>

    <!-- Link Hover Tooltip -->
    <div
      v-if="showLinkTooltip"
      class="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2"
      :style="{
        left: linkTooltipPosition.x + 'px',
        top: linkTooltipPosition.y + 'px',
      }"
      @mouseenter="handleTooltipMouseEnter"
      @mouseleave="handleTooltipMouseLeave"
    >
      <div
        class="bg-gray-800 dark:bg-gray-700 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-2"
      >
        <button
          class="text-xs hover:text-blue-400 transition-colors flex items-center gap-1"
          @click="editLink"
        >
          <font-awesome-icon icon="pen" class="text-xs" />
          Edit Link
        </button>
      </div>
      <div
        class="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"
      ></div>
    </div>
  </div>
</template>

<style>
/* Contenteditable Rich Text Editor */
[contenteditable='true'] {
  outline: none;
  cursor: text;
}

[contenteditable='true']:empty:before {
  content: 'Start writing your agent instructions...';
  color: #6b7280;
}

/* WYSIWYG Toolbar Buttons */
.wysiwyg-toolbar button {
  min-width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wysiwyg-toolbar button:active {
  transform: scale(0.95);
}

.wysiwyg-toolbar button:hover {
  background-color: #4b5563;
}

.prose {
  color: var(--color-text, #111827);
  line-height: 1.8;
}

.dark .prose {
  color: var(--color-text, #e5e7eb);
}

/* Headings */
.prose h1 {
  color: var(--color-text, #111827);
  font-size: 2em;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 0.75em;
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--color-border, #e5e7eb);
}

.dark .prose h1 {
  color: var(--color-text, #f9fafb);
  border-bottom-color: var(--color-border, #374151);
}

.prose h2 {
  color: var(--color-text, #111827);
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  padding-bottom: 0.2em;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.dark .prose h2 {
  color: var(--color-text, #f9fafb);
  border-bottom-color: var(--color-border, #374151);
}

.prose h3 {
  color: var(--color-text, #111827);
  font-size: 1.25em;
  font-weight: bold;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
}

.dark .prose h3 {
  color: var(--color-text, #f9fafb);
}

.prose h4 {
  color: var(--color-text, #111827);
  font-size: 1.1em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.dark .prose h4 {
  color: var(--color-text, #f9fafb);
}

/* Paragraphs */
.prose p {
  margin-bottom: 1em;
}

/* Inline code */
.prose code {
  background-color: var(--color-code-inline-bg, #f6f8fa);
  padding: 0.2em 0.15em;
  border-radius: 0.25em;
  font-size: 0.875em;
  color: var(--color-code-inline-text, #dc2626);
  border: 1px solid var(--color-border, #d0d7de);
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
}

.dark .prose code {
  background-color: var(--color-code-inline-bg, #1f2937);
  color: var(--color-code-inline-text, #fbbf24);
  border-color: var(--color-border, #374151);
}

/* Code blocks */
.prose pre {
  background-color: var(--color-code-block-bg, #f6f8fa) !important;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid var(--color-border, #d0d7de);
}

.dark .prose pre {
  background-color: var(--color-code-block-bg, #1f2937) !important;
  border-color: var(--color-border, #374151);
}

/* Ensure hljs code blocks also respect the custom background */
.prose pre.hljs,
.prose pre code.hljs {
  background-color: transparent !important;
}

/* Override all syntax highlighting backgrounds */
.prose pre *,
.prose pre code *,
.prose .hljs * {
  background-color: transparent !important;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: var(--color-code-block-text, #24292f);
  border: none;
  font-weight: 400;
  font-size: 0.9em;
  line-height: 1.6;
}

.dark .prose pre code {
  color: var(--color-code-block-text, #e5e7eb);
}

/* Syntax highlighting colors - Light mode */
.prose .hljs-comment,
.prose .hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.prose .hljs-keyword,
.prose .hljs-selector-tag,
.prose .hljs-type,
.prose .hljs-deletion {
  color: #d73a49;
  font-weight: bold;
}

.prose .hljs-string,
.prose .hljs-attr,
.prose .hljs-addition {
  color: #032f62;
}

.prose .hljs-number,
.prose .hljs-literal,
.prose .hljs-variable,
.prose .hljs-template-variable,
.prose .hljs-link {
  color: #005cc5;
}

.prose .hljs-title,
.prose .hljs-function,
.prose .hljs-class,
.prose .hljs-title.class_ {
  color: #6f42c1;
  font-weight: bold;
}

.prose .hljs-built_in,
.prose .hljs-builtin-name,
.prose .hljs-name,
.prose .hljs-section {
  color: #e36209;
}

.prose .hljs-property,
.prose .hljs-attribute {
  color: #005cc5;
}

.prose .hljs-meta,
.prose .hljs-meta .hljs-keyword {
  color: #6f42c1;
}

.prose .hljs-punctuation,
.prose .hljs-operator {
  color: #24292f;
}

/* Syntax highlighting colors - Dark mode */
.dark .prose .hljs-comment,
.dark .prose .hljs-quote {
  color: #8b949e;
  font-style: italic;
}

.dark .prose .hljs-keyword,
.dark .prose .hljs-selector-tag,
.dark .prose .hljs-type,
.dark .prose .hljs-deletion {
  color: #ff7b72;
  font-weight: bold;
}

.dark .prose .hljs-string,
.dark .prose .hljs-attr,
.dark .prose .hljs-addition {
  color: #a5d6ff;
}

.dark .prose .hljs-number,
.dark .prose .hljs-literal,
.dark .prose .hljs-variable,
.dark .prose .hljs-template-variable,
.dark .prose .hljs-link {
  color: #79c0ff;
}

.dark .prose .hljs-title,
.dark .prose .hljs-function,
.dark .prose .hljs-class,
.dark .prose .hljs-title.class_ {
  color: #d2a8ff;
  font-weight: bold;
}

.dark .prose .hljs-built_in,
.dark .prose .hljs-builtin-name,
.dark .prose .hljs-name,
.dark .prose .hljs-section {
  color: #ffa657;
}

.dark .prose .hljs-property,
.dark .prose .hljs-attribute {
  color: #79c0ff;
}

.dark .prose .hljs-meta,
.dark .prose .hljs-meta .hljs-keyword {
  color: #d2a8ff;
}

.dark .prose .hljs-punctuation,
.dark .prose .hljs-operator {
  color: #c9d1d9;
}

/* Links */
.prose a {
  color: #2563eb;
  text-decoration: underline;
  transition: color 0.2s;
}

.prose a:hover {
  color: #1d4ed8;
}

.dark .prose a {
  color: #60a5fa;
}

.dark .prose a:hover {
  color: #93c5fd;
}

/* Text formatting */
.prose strong {
  font-weight: bold;
  color: var(--color-text, #111827);
}

.dark .prose strong {
  color: var(--color-text, #f9fafb);
}

.prose em {
  font-style: italic;
}

/* Lists */
.prose ul,
.prose ol {
  margin: 1em 0;
  padding-left: 2em;
}

.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose li {
  margin-bottom: 0.5em;
}

.prose li > ul,
.prose li > ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

/* Blockquotes */
.prose blockquote {
  border-left: 4px solid #2563eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #4b5563;
  font-style: italic;
  background-color: #f9fafb;
  padding: 0.75em 1em;
  border-radius: 0 0.25em 0.25em 0;
}

.dark .prose blockquote {
  border-left-color: #60a5fa;
  color: #d1d5db;
  background-color: #1f2937;
}

.prose blockquote p {
  margin: 0;
}

/* Horizontal rule */
.prose hr {
  border: none;
  border-top: 2px solid var(--color-border, #e5e7eb);
  margin: 2em 0;
}

.dark .prose hr {
  border-top-color: var(--color-border, #374151);
}

/* Tables */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.prose th {
  background-color: #f3f4f6;
  color: #111827;
  font-weight: bold;
  padding: 0.75em;
  text-align: left;
  border: 1px solid #d1d5db;
}

.dark .prose th {
  background-color: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

.prose td {
  padding: 0.75em;
  border: 1px solid #d1d5db;
}

.dark .prose td {
  border-color: #4b5563;
}

.prose tr:nth-child(even) {
  background-color: #f9fafb;
}

.dark .prose tr:nth-child(even) {
  background-color: #1f2937;
}

/* Task lists (GitHub style) */
.prose input[type='checkbox'] {
  margin-right: 0.5em;
}

/* Highlight search results in textarea - when focused */
textarea::selection {
  background-color: #fbbf24;
  color: #000;
}

.dark textarea::selection {
  background-color: #f59e0b;
  color: #fff;
}

/* Search highlights in preview pane */
.prose mark.search-highlight {
  background-color: #fbbf24;
  color: #000;
  padding: 2px 0;
  border-radius: 2px;
  font-weight: inherit;
}

.dark .prose mark.search-highlight {
  background-color: #f59e0b;
  color: #fff;
}
</style>
