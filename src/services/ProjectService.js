import apiClient from './apiClient'

const resource = '/projects'

export default {
  // جلب المشاريع مع دعم رقم الصفحة والبحث (مفيد للبحث عن مشروع بالاسم أو الموقع)
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search,
      },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
