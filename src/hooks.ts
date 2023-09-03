import { ref } from 'vue'
export const useOptions = (start=0, end=10) => {
  const arr = new Array()

  for (let index = start; index < end; index++) {
    arr.push({
      label: '选项' + (index + 1),
      value: index + 1
    })
  }
  const options = ref(arr)
  return options
}
