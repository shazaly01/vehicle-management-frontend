import apiClient from './apiClient'

const resource = '/messages'

export default {
  /**
   * جلب سجل الرسائل مع دعم البحث والفلترة والترقيم
   */
  getMessages(params = {}) {
    return apiClient.get(resource, { params })
  },

  /**
   * إرسال رسالة جديدة (يدوياً)
   * @param {Object} data { content, recipient_type, recipient_id }
   */
  sendMessage(data) {
    return apiClient.post(resource, data)
  },

  /**
   * عرض تفاصيل رسالة محددة
   */
  getMessage(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  /**
   * حذف سجل رسالة
   */
  deleteMessage(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  /**
   * إعادة إرسال رسالة فاشلة
   */
  resendMessage(id) {
    return apiClient.post(`${resource}/${id}/resend`)
  },
}
