let formatDate = (timestamp, year = true) => {
  let date = new Date(timestamp)
  return `${(date.getDate() < 10 ? '0' : '') + date.getDate()}/${(date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)}` + (year ? `/${date.getFullYear()}` : '')
}

// get week day starting on Monday (so, Sunday is 6)
let weekDay = timestamp => new Date(timestamp).getDay() == 0 ? 6 : new Date(timestamp).getDay() - 1


export default {
    weekDay: weekDay,
    formatDate: formatDate
}
