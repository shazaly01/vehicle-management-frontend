import apiClient from './apiClient'

const resource = '/suppliers'

export default {
  // جلب قائمة الموردين مع دعم البحث والصفحات
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search,
      },
    })
  },

  // جلب بيانات مورد واحد
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إضافة مورد جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث بيانات مورد
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مورد
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
