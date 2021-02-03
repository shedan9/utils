<template>
  <div class="cascade-search">
    <ScrollBar class="scroll-container" :style="{height: height + 'px'}">
      <div
        class="list-item"
        :style="{width: width + 'px'}"
        :class="{selected: item.selected}"
        v-for="(item, index) in list"
        :key="index"
        @click="handleSelect(item)"
      >
        <span>{{item.name}}</span>
        <i class="icon el-icon-check" v-show="item.selected"></i>
      </div>
    </ScrollBar>
  </div>
</template>

<script>
import ScrollBar from "../ScrollBar";
export default {
  name: "CascadeSearch",
  components: {ScrollBar},
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  methods: {
    handleSelect(item) {
      item.selected = !item.selected;
      this.$emit('select', item);
    }
  },
}
</script>

<style lang="scss" scoped>
  .cascade-search {
    background: #414960;
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 13px;
      &:hover {
        background: #222A39;
      }
      &.selected {
        color: #D3B882;
      }
    }
  }
</style>
