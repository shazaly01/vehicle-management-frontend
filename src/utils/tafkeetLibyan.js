/**
 * محرك التفقيط المخصص للدينار الليبي
 * يحول الأرقام إلى كلمات: "فقط ألف ومائتان وخمسون ديناراً وثلاثمائة درهم ليبياً لا غير"
 */

const table = [
  [
    '',
    'واحد',
    'اثنان',
    'ثلاثة',
    'أربعة',
    'خمسة',
    'ستة',
    'سبعة',
    'ثمانية',
    'تسعة',
    'عشرة',
    'أحد عشر',
    'اثنا عشر',
    'ثلاثة عشر',
    'أربعة عشر',
    'خمسة عشر',
    'ستة عشر',
    'سبعة عشر',
    'ثمانية عشر',
    'تسعة عشر',
  ],
  ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'],
  [
    '',
    'مائة',
    'مائتان',
    'ثلاثمائة',
    'أربعمائة',
    'خمسمائة',
    'ستمائة',
    'سبعمائة',
    'ثمانمائة',
    'تسعمائة',
  ],
]

function convertToWords(n) {
  if (n === 0) return ''
  if (n < 20) return table[0][n]
  if (n < 100) return table[1][Math.floor(n / 10)] + (n % 10 !== 0 ? ' و' + table[0][n % 10] : '')
  if (n < 1000)
    return table[2][Math.floor(n / 100)] + (n % 100 !== 0 ? ' و' + convertToWords(n % 100) : '')
  if (n < 1000000)
    return (
      (Math.floor(n / 1000) === 1
        ? 'ألف'
        : Math.floor(n / 1000) === 2
          ? 'ألفان'
          : convertToWords(Math.floor(n / 1000)) + ' ألف') +
      (n % 1000 !== 0 ? ' و' + convertToWords(n % 1000) : '')
    )
  return (
    (Math.floor(n / 1000000) === 1 ? 'مليون' : convertToWords(Math.floor(n / 1000000)) + ' مليون') +
    (n % 1000000 !== 0 ? ' و' + convertToWords(n % 1000000) : '')
  )
}

export function tafkeet(amount) {
  if (amount === 0 || !amount) return 'صفر دينار'

  // تقسيم الرقم إلى دينار ودراهم (3 خانات للدراهم الليبية)
  const fixedAmount = parseFloat(amount).toFixed(3)
  const parts = fixedAmount.split('.')
  const dinars = parseInt(parts[0])
  const dirhams = parseInt(parts[1])

  let result = ''

  // معالجة الدنانير
  if (dinars > 0) {
    result += convertToWords(dinars)
    if (dinars === 1) result = 'دينار واحد'
    else if (dinars === 2) result = 'ديناران'
    else if (dinars >= 3 && dinars <= 10) result += ' دنانير'
    else result += ' ديناراً'
  }

  // معالجة الدراهم
  if (dirhams > 0) {
    if (dinars > 0) result += ' و '

    let dirhamWords = convertToWords(dirhams)
    result += dirhamWords

    if (dirhams === 1)
      result = dinars > 0 ? result.replace(dirhamWords, '') + 'درهم واحد' : 'درهم واحد'
    else if (dirhams === 2)
      result = dinars > 0 ? result.replace(dirhamWords, '') + 'درهمان' : 'درهمان'
    else if (dirhams >= 3 && dirhams <= 10) result += ' دراهم'
    else result += ' درهماً'
  }

  return result + ' ليبياً'
}
