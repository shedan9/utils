<template>
  <div class="cascade-pane">
    <div class="header" v-if="title">{{title}}</div>
    <ScrollBar class="scroll-container" :style="{height: height + 'px'}">
      <div class="cascade-content">
        <div
          class="cascade-item"
          v-for="item in nodes"
          :key="item.id"
          :class="{selected: item.selected, active: expand.id === item.id, multi, disabled: item.disabled}"
          @click="handleClick(item)"
          @mouseenter="handleMouseEnter(item)"
        >
          <div class="item-content">
            <div class="left">
              <el-checkbox
                :disabled="item.disabled"
                class="checkbox"
                v-if="multi"
                v-model="item.selected"
                size="mini"
                @click.native.prevent.stop="handleCheckboxClick(item)"
              ></el-checkbox>
              <i class="icon el-icon-check" v-else-if="!item.children && item.selected"></i>
              <span class="text">{{item.name}}</span>
            </div>
            <i class="icon el-icon-arrow-right" v-if="item.children"></i>
          </div>
        </div>
      </div>
      <div class="extra">
        <slot name="extra"></slot>
      </div>
    </ScrollBar>
  </div>
</template>

<script>
import ScrollBar from "../ScrollBar";
export default {
  name: "CascadePane",
  components: {ScrollBar},
  props: {
    value: {
      type: Array,
    },
    nodes: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
    },
    trigger: {
      type: String,
      default: () => 'click',
      validator: value => ['click', 'hover'].includes(value),
    },
    multi: {
      type: Boolean,
    },
    height: {
      type: Number,
      default: () => 300,
    },
  },
  data() {
    return {
      expand: {},
    };
  },
  methods: {
    handleClick(item) {
      if (this.trigger === 'click') {
        this.handleTrigger(item);
      } else if (this.multi) {
        this.handleCheckboxClick(item);
      }
      if (!item.children && !this.multi && !item.disabled && !item.selected) {
        this.nodes.forEach(n => n.selected = false);
        item.selected = true;
        this.$emit('change', item);
      }
    },
    handleMouseEnter(item) {
      if (this.trigger === 'hover') {
        this.handleTrigger(item);
      }
    },
    handleTrigger(item) {
      this.expand = item;
      this.$emit('expand', item);
    },
    handleCheckboxClick(item) {
      if (item.disabled) return;
      item.selected = !item.selected;
      let ret = [];
      if (item.selected) {
        item.children && this.selectChildrenAll(item.children, true);
        ret = [...this.value, {id: item.id, name: item.name}];
      } else {
        item.children && this.selectChildrenAll(item.children, false);
        ret = this.value.filter(v => v.id !== item.id);
      }
      this.$emit('change', ret);
    },
    selectChildrenAll(list, bool) {
      list.forEach(item => {
        item.disabled = bool;
        if (item.children) {
          this.selectChildrenAll(item.children, bool);
        }
      });
    },
  },
}
</script>

<style lang="scss" scoped>
  .cascade-pane {
    min-width: 180px;
    background: #262626;
    .header {
      position: relative;
      height: 40px;
      line-height: 40px;
      text-align: center;
      font-size: 13px;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        height: 1px;
        width: calc(100% - 34px);
        background: #3c3c3c;
      }
    }
    .scroll-container {
      .cascade-content {
        .cascade-item {
          position: relative;
          padding: 10px 10px 10px 25px;
          font-size: 13px;
          cursor: pointer;
          &:hover {
            background: #333;
          }
          &.multi {
            padding: 10px 8px;
          }
          &:not(.disabled) {

          }
          &.active {
            color: #2094fa;
          }
          &.selected {
            color: #D3B882;
          }
          &.disabled {
            color: #AEB5BC;
          }
          .item-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .left {
              display: flex;
              align-items: baseline;
              .checkbox {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 8px;
              }
              .icon {
                position: absolute;
                left: 8px;
              }
            }
          }
        }
      }
    }
  }
</style>
<style lang="scss">
  .cascade-pane {
    .el-checkbox__inner {
      width: 10px;
      height: 10px;
      background: transparent;
      border: 1px solid #73798A;
      border-radius: 0;
      &::after {
        width: 2px;
        height: 5px;
        top: 0;
        left: 2px;
        border-color: #273145;
      }
    }
    .el-checkbox__input.is-disabled .el-checkbox__inner {
      background: #73798A;
      border-color: #73798A;
      &::after {
        content: '';
        transform: rotate(45deg) scaleY(1);
        width: 2px;
        height: 5px;
        position: absolute;
        top: 0;
        left: 2px;
        box-sizing: content-box;
        border: 1px solid #273145;
        border-left: 0;
        border-top: 0;
      }
    }
  }
</style>
