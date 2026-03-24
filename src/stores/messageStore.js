import { defineStore } from 'pinia'
import { ref } from 'vue'
import messageService from '@/services/MessageService'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const loading = ref(false)
  const error = ref(null)

  /**
   * جلب الرسائل من السيرفر
   */
  async function fetchMessages(page = 1, search = '', status = '') {
    loading.value = true
    error.value = null
    try {
      const response = await messageService.getMessages({
        page,
        search,
        status,
        limit: 15,
      })
      messages.value = response.data.data
      pagination.value = response.data.meta // تأكد أن الباك-أند يرسل مصفوفة meta للترقيم
    } catch (err) {
      error.value = 'فشل في جلب سجل الرسائل.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إرسال رسالة جديدة
   */
  async function sendMessage(messageData) {
    loading.value = true
    try {
      await messageService.sendMessage(messageData)
      await fetchMessages() // تحديث القائمة بعد الإرسال
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إرسال الرسالة.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * إعادة إرسال رسالة فاشلة
   */
  async function resendMessage(id) {
    try {
      await messageService.resendMessage(id)
      await fetchMessages(pagination.value.current_page) // تحديث الصفحة الحالية
      return true
    } catch (err) {
      error.value = 'فشل في إعادة الإرسال.'
      return false
    }
  }

  /**
   * حذف رسالة
   */
  async function deleteMessage(id) {
    try {
      await messageService.deleteMessage(id)
      messages.value = messages.value.filter((m) => m.id !== id)
      return true
    } catch (err) {
      error.value = 'فشل في حذف السجل.'
      return false
    }
  }

  return {
    messages,
    pagination,
    loading,
    error,
    fetchMessages,
    sendMessage,
    resendMessage,
    deleteMessage,
  }
})
