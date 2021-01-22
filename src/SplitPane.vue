<template>
  <div class="split-pane" @mousemove="handleMouseMove">
    <div class="first-pane" :class="dir" :style="firstPaneStyle">
      <slot name="firstPane"></slot>
    </div>
    <div class="divide-line" :class="dir" :style="divideStyle" @mousedown="handleMouseDown">
      <slot name="divide"></slot>
    </div>
    <div class="second-pane" :class="dir" :style="secondPaneStyle">
      <slot name="secondPane"></slot>
    </div>
    <div class="split-pane-mask" :class="dir" v-show="active"></div>
  </div>
</template>

<script>
export default {
  name: "SplitPane",
  props: {
    dir: {
      type: String,
      validator: value => ['vertical', 'horizontal'].includes(value),
      default: () => 'vertical',
    },
    defaultPercent: {
      type: Number,
      default: () => 50,
    },
    minPercent: {
      type: Number,
      default: () => 0,
    },
    maxPercent: {
      type: Number,
      default: () => 100,
    },
  },
  data() {
    return {
      percent: 50,
      active: false,
    };
  },
  watch: {
    defaultPercent: {
      handler(val) {
        this.percent = val;
      },
      immediate: true,
    },
  },
  computed: {
    firstPaneStyle() {
      let num = this.percent;
      if (this.dir === 'vertical') {
        return {
          width: num + '%',
        };
      } else {
        return {
          height: num + '%',
        };
      }
    },
    divideStyle() {
      let num = this.percent;
      if (this.dir === 'vertical') {
        return {
          left: num + '%',
        };
      } else {
        return {
          top: num + '%',
        };
      }
    },
    secondPaneStyle() {
      let num = 100 - this.percent;
      if (this.dir === 'vertical') {
        return {
          width: num + '%',
        };
      } else {
        return {
          height: num + '%',
        };
      }
    },
  },
  mounted() {
    document.body.addEventListener('mouseup', this.handleMouseUp);
  },
  beforeDestroy() {
    document.body.removeEventListener('mouseup', this.handleMouseUp);
  },
  methods: {
    handleMouseDown() {
      this.active = true;
    },
    handleMouseUp() {
      if (this.active) {
        this.active = false;
      }
    },
    handleMouseMove(e) {
      if (!this.active) return;
      if (!e.buttons) {
        this.active = false;
      }
      const target = e.currentTarget;
      let el = target;
      const offset = {
        left: 0,
        top: 0,
      };
      while (el) {
        offset.left = offset.left + el.offsetLeft;
        offset.top = offset.top + el.offsetTop;
        el = el.offsetParent;
      }
      const n = this.dir === 'vertical' ? (e.pageX - offset.left) / target.offsetWidth * 100 :
        (e.pageY - offset.top) / target.offsetHeight * 100;
      if (n < this.maxPercent && n > this.minPercent) {
        if (n >= this.maxPercent - 2) {
          this.percent = this.maxPercent;
        } else if (n <= this.minPercent + 2) {
          this.percent = this.minPercent;
        } else {
          this.percent = n;
        }
      }
      this.$emit('resize', this.percent);
    },
  },
}
</script>

<style lang="scss" scoped>
  .split-pane {
    width: 100%;
    height: 100%;
    position: relative;
    .first-pane {
      position: absolute;
      left: 0;
      top: 0;
      &.vertical {
        height: 100%;
      }
      &.horizontal {
        width: 100%;
      }
    }
    .divide-line {
      position: absolute;
      z-index: 10;
      &.vertical {
        height: 100%;
        width: 5px;
        cursor: col-resize;
      }
      &.horizontal {
        width: 100%;
        height: 5px;
        cursor: row-resize;
      }
    }
    .second-pane {
      position: absolute;
      right: 0;
      bottom: 0;
      &.vertical {
        height: 100%;
      }
      &.horizontal {
        width: 100%;
      }
    }
    .split-pane-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      &.vertical {
        cursor: col-resize;
      }
      &.horizontal {
        cursor: row-resize;
      }
    }
  }
</style>
