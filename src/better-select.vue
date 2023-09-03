<template>
  <div class="better_select">
    <div ref="selectDivRef" class="select_div" @click="showSelect">
      <template v-if="tempValue.length">
        <span v-for="item in tempValue.slice(0, 2)">{{ item.label }}</span>
        <span v-if="tempValue.length >= 3">...</span>
      </template>
      <template v-else>
        <span class="tag_placehoder">{{ placehoder }}</span>
      </template>
      <span class="right_img">
        <img
          :class="[{ reverse: !listPopup }]"
          style="font-size: 16px; width: 16px; height: 16px"
          src="./assets/打开.png"
          alt=""
        />
      </span>
    </div>
    <div
      v-if="listPopup"
      tabindex="-1"
      ref="selectListRef"
      class="select_list"
      @keydown.up.prevent="navigateOption('prev')"
      @keydown.down.prevent="navigateOption('next')"
      @keydown.enter.prevent="entryClick"
    >
      <div class="select_search" v-if="filterable">
        <input
          v-model="searchValue"
          @input="searchChange"
          class="select_search_input"
          type="text"
          ref="searchInputRef"
          placeholder="搜索"
          :disabled="lazyLoading"
        />
      </div>
      <div class="select_ui_wrap">
        <div
          ref="selectUlRef"
          :class="['select_ul', { move_hover: openMousemove }]"
          @click.prevent="clickItem"
          @mouseover.prevent="onMouseover"
          @mousemove.prevent="openMousemove = true"
          @scroll.prevent="onScroll"
        >
          <template :key="item.value" v-for="(item, index) in renderOptions">
            <div
              v-if="!item._type"
              :data-index="index"
              :class="[
                'item',
                {
                  active_keydown_hover: index === keydownIndex && !activeObj[item.value],
                  active_selected: activeObj[item.value]
                }
              ]"
            >
              <slot name="custom" :item="item">{{ item.label }}</slot>
            </div>
            <div v-else-if="item._type === 'group'" :data-index="index" class="item_group">
              {{ item.label }}
            </div>
          </template>

          <div v-show="lazy && lazyLoading">加载更多数据。。。</div>
        </div>
        <div v-if="loading" class="select_ui_loading">加载中</div>
      </div>
    </div>
  </div>
</template>
<!-- 
    1.搜索 对勾
    2.多选  对勾
    3.分组  对勾
    4.远程搜索
    5.down up 键盘标识
    6.enter 按键确认
    7.远程 搜索loading
    8. 滚动，加载更多
 -->
<script lang="ts" setup>
import { ref, nextTick, reactive, computed, toValue, watch } from 'vue'
import { createPopper } from '@popperjs/core'
import { keyBy } from 'lodash-es'
import { onClickOutside, useVModel } from '@vueuse/core'
const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  multiple: Boolean,
  remote: Boolean,
  modelValue: [String, Array, Number],
  loading: Boolean,
  placehoder: String,
  lazy: {
    type: Boolean,
    default: false
  },
  finished: {
    type: Boolean,
    default: true
  },
  lazyLoading: {
    type: Boolean,
    default: false
  },
  filterable: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['search', 'update:modelValue', 'update:searchValue', 'scroll'])
const searchValue = ref('')
const selectDivRef = ref()
const selectListRef = ref<HTMLElement>()
const selectUlRef = ref<HTMLElement>()
const searchInputRef = ref()
const listPopup = ref(false)
const tempValue = ref([])
const keydownIndex = ref(null)
let openMousemove = true //开启移动定义

const activeObj = computed(() => {
  return keyBy(tempValue.value, 'value')
})

// 搜索选项
const searchOptions = ref([])
const searchChange = () => {
  if (props.remote) {
    emit('search', searchValue.value) //不管
  } else {
    // 内部搜索
    const str = searchValue.value.toLowerCase()
    if (!str) {
      return (searchOptions.value = []) //没有搜索字段，清空
    }
    searchOptions.value = tempOptions.value.filter((item) => {
      return item.label.toLowerCase().includes(str)
    })
  }
}
// 监听源数据，将 已有的value对应的obj对象取出c
const tempOptions = ref([])
// 监听源选项
watch(
  () => props.options,
  () => {
    // 将options拍扁
    let result = []
    props.options.forEach((item) => {
      if (Array.isArray(item.options)) {
        result.push({
          label: item.label,
          value: item.label + Math.random(), //分组标记一个随机id
          _type: 'group'
        })
        item.options.forEach((item) => {
          result.push(item)
        })
      } else {
        result.push(item)
      }
    })
    tempOptions.value = result
  },
  { immediate: true }
)
// 监听选项值
watch(
  () => props.modelValue,
  () => {
    const objMap = new Map(tempOptions.value.map((item: { value: any }) => [item.value, item])) // 数据
    const oldObjMap = new Map(tempValue.value.map((item: { value: any }) => [item.value, item])) //已有数据

    let keys = props.multiple
      ? props.modelValue
      : Boolean(props.modelValue)
      ? [props.modelValue]
      : []

    // 根据变动的value，扫描出对应的label,不存在的选项，使用上一轮数据补上
    tempValue.value = keys.map((key) => {
      return {
        label: objMap.get(key)?.label ?? oldObjMap.get(key)?.label ?? key,
        value: key
      }
    })
  },
  { immediate: true }
)

// 实际渲染
const renderOptions = computed(() => {
  return searchOptions.value.length ? searchOptions.value : tempOptions.value
})

// 移动索引
const onMouseover = (e) => {
  // 防止滚动时，自触发
  if (!openMousemove) {
    return
  }
  const dom = e.target as HTMLElement

  if (dom) {
    const index = dom.getAttribute('data-index')
    if (index === 0 || index) {
      keydownIndex.value = parseInt(index)
    }
  }
}
// 按键索引
const navigateOption = (type) => {
  openMousemove = false //关闭鼠标移动
  const findIndex = type === 'prev' ? 'findLastIndex' : 'findIndex'
  if (keydownIndex.value !== null) {
    const start = renderOptions.value.slice(0, keydownIndex.value)
    const end = renderOptions.value.slice(keydownIndex.value + 1)
    if (type === 'prev') {
      // 向上  index-keydownIndex
      let index = [...end, ...start].reverse().findIndex((item) => {
        return !Boolean(item._type)
      })
      const tempIndex = keydownIndex.value - index - 1
      keydownIndex.value = tempIndex < 0 ? tempIndex + renderOptions.value.length : tempIndex
    } else {
      // 向下  index+keydownIndex
      let index = [...end, ...start].findIndex((item) => {
        return !Boolean(item._type)
      })
      const tempIndex = keydownIndex.value + index + 1
      console.log('索引发现', tempIndex)

      keydownIndex.value =
        tempIndex > renderOptions.value.length - 1
          ? tempIndex - renderOptions.value.length
          : tempIndex
      console.log('最终得index', keydownIndex.value)
    }

    // 修正范围
  } else {
    const index = renderOptions.value[findIndex]((item) => {
      return !Boolean(item._type)
    })
    if (index > -1) {
      keydownIndex.value = index
    }
  }
  if (keydownIndex.value !== null) {
    console.log(keydownIndex.value)

    let targetDom: HTMLElement = selectUlRef.value?.children[keydownIndex.value]

    //   关闭 mouseover
    let flag = isElementInParentViewport(selectUlRef.value, targetDom)
    if (flag) {
      console.log("Child element is in the parent's viewport")
    } else {
      targetDom.scrollIntoView(type === 'prev')
      console.log("Child element is not in the parent's viewport")
    }
  }
}
function isElementInParentViewport(parentElement, childElement) {
  if (!parentElement) {
    console.warn('父级元素不存在')
    return true
  }
  if (!childElement) {
    console.warn('子级元素不存在')
    return true
  }
  var parentRect = parentElement.getBoundingClientRect()
  var childRect = childElement.getBoundingClientRect()

  return (
    childRect.top >= parentRect.top &&
    childRect.left >= parentRect.left &&
    childRect.bottom <= parentRect.bottom &&
    childRect.right <= parentRect.right
  )
}

// 滚动
const onScroll = (e) => {
  if (props.finished || !props.lazy || props.lazyLoading) {
    return
  }

  const dom: HTMLElement = e.target
  // console.log(dom.scrollTop)
  // console.log(dom.offsetHeight)
  // console.log(dom.scrollHeight)
  
  if (dom.scrollTop + dom.offsetHeight >= dom.scrollHeight - 50) {
    console.log('滚动到底部吗')
    emit('scroll')
  }
}

const showSelect = () => {
  listPopup.value = !listPopup.value
}
let cleanOutsideFn: Function | null
// 监听popup弹窗
watch(
  () => listPopup.value,
  (newVal) => {
    keydownIndex.value = null
    if (newVal) {
      nextTick(() => {
        let dom = selectListRef.value
        cleanOutsideFn = onClickOutside(
          dom,
          () => {
            listPopup.value = false //关闭，并清空弹窗
            cleanOutsideFn && cleanOutsideFn()
            cleanOutsideFn = null
          },
          { ignore: [selectDivRef.value] }
        )
        searchInputRef.value?.focus()
        const popper = createPopper(selectDivRef.value, selectListRef.value)
      })
    } else {
      cleanOutsideFn && cleanOutsideFn()
      cleanOutsideFn = null
    }
  }
)
// watch(
//   () => keydownIndex.value,
//   (newVal) => {
//     console.log('当前计数', newVal)
//   }
// )
/**
 * 点击单项
 * @param e
 */
const clickItem = (e) => {
  const dom = e.target
  clickDom(dom)
}

/**
 * 回车确认
 */
const entryClick = () => {
  console.log('点击进入')
  openMousemove = false //关闭鼠标移动
  if (keydownIndex.value !== null) {
    const dom = selectUlRef.value?.children[keydownIndex.value]
    clickDom(dom)
  }
}

/**
 * 点击dom
 * @param dom
 */
const clickDom = (dom: HTMLElement) => {
  const index = dom.getAttribute('data-index') || dom.parentElement!.getAttribute('data-index')

  if (!index) {
    return
  }
  // 是否为搜索状态
  let item = renderOptions.value[index]
  // 分组 禁用时,不关闭
  if (item._type || item.disabled) {
    return
  }

  // 选中还是取消
  if (props.multiple) {
    const index = tempValue.value.findIndex((i) => i.value === item.value)

    if (index > -1) {
      tempValue.value.splice(index, 1)
    } else {
      tempValue.value.push(item)
    }
    const val = tempValue.value.map((item) => item.value)
    emit('update:modelValue', val)
  } else {
    tempValue.value = [item]
    showSelect()
    emit('update:modelValue', tempValue.value?.[0]?.value ?? null)
  }
}

//
const searchHeight = computed(() => {
  return props.filterable ? '40px' : '0px'
})
</script>

<style lang="scss">
.better_select {
  --selectWidth: 170px;
  position: relative;
  height: 32px;
  line-height: 32px;
  width: var(--selectWidth);
  z-index: auto;
  .select_div {
    padding: 0 8px;
    padding-right: 26px;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    border: 1px solid #ccc;
    &:hover {
      border: 1px solid #a8a2a2;
      cursor: pointer;
    }
    .tag_placehoder {
      color: #ccc;
    }
    .right_img {
      position: absolute;
      right: 6px;
    }
  }
  .select_list {
    z-index: 2003;
    outline: none;
    overflow: hidden;
    position: relative;
    height: 274px;
    width: var(--selectWidth);
    border-radius: 4px;
    box-sizing: border-box;
    border: 1px solid #e4e7ed;
    background-color: #fff;
    .select_search {
      height: v-bind(searchHeight);
      .select_search_input {
        outline: none;
        border: none;
        border-bottom: 1px solid #ccc;
        height: 100%;
      }
    }
    .select_ui_wrap {
      height: calc(100% - v-bind(searchHeight));
      overflow: hidden;
      position: relative;
      .select_ul {
        overflow-y: auto;
        height: 100%;
        .item_group {
          font-size: 12px;
          cursor: default;
          color: rgba(0, 0, 0, 0.45);
          padding: 5px 12px;
        }
        .item {
          font-size: 14px;
          padding: 0 32px 0 20px;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #606266;
          height: 34px;
          line-height: 34px;
          box-sizing: border-box;
          cursor: pointer;
        }

        // 选中元素
        .active_selected {
          background: #00b899 !important;
          color: #fff;
        }
        // hover滑动
        .active_keydown_hover {
          background-color: #f5f7fa;
        }
      }
      .move_hover .item:hover {
        background-color: #f5f7fa;
      }
      .select_ui_loading {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
      }
    }
  }
}
.reverse {
  transform: rotate(180deg);
}
</style>
