<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="confirm-dialog-overlay" @click.self="onCancel">
        <Transition name="scale">
          <div class="confirm-dialog">
            <div class="dialog-content">
              <div class="dialog-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"
                  />
                </svg>
              </div>
              <h3 class="dialog-title">{{ dialogConfig.title }}</h3>
              <p class="dialog-message">{{ dialogConfig.message }}</p>
            </div>
            <div class="dialog-actions">
              <button class="cancel-btn" @click="onCancel">
                {{ dialogConfig.cancelText }}
              </button>
              <button class="confirm-btn" @click="onConfirm">
                {{ dialogConfig.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  title: { type: String, default: "Warning" },
  message: String,
  confirmText: { type: String, default: "Confirm" },
  cancelText: { type: String, default: "Cancel" },
  type: { type: String, default: "info" }, // 可以是 'info', 'warning', 'error', 'success'
});

const dialogConfig = ref({
  title: props.title,
  message: props.message,
  confirmText: props.confirmText,
  cancelText: props.cancelText,
  type: props.type,
});

const visible = ref(false);
let resolvePromise = null;

const show = (options = {}) => {
  dialogConfig.value = { ...dialogConfig.value, ...options };
  visible.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const onConfirm = () => {
  visible.value = false;
  resolvePromise?.(true);
};

const onCancel = () => {
  visible.value = false;
  resolvePromise?.(false);
};

defineExpose({ show });
</script>

<style scoped>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* 对话框样式 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  background: white;
  padding: 24px;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dialog-content {
  margin-bottom: 24px;
}

.dialog-icon {
  margin-bottom: 16px;
}

.dialog-icon svg {
  width: 48px;
  height: 48px;
  color: var(--dialog-icon-color, #8c62b4);
}

.dialog-title {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.dialog-message {
  margin: 0;
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

button {
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  min-width: 80px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.confirm-btn {
  background: #a163dc;
  color: white;
}

.confirm-btn:hover {
  background: #72537e;
  transform: translateY(-1px);
}
</style>
