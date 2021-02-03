<template>
  <div class="scroll-bar" ref="scrollBar">
    <div
      class="scroll-wrap"
      :class="{'scroll-hidden': marginRight === 0}"
      :style="scrollWrapSty"
      ref="scrollWrap"
      @scroll="handleScroll"
    >
      <slot ref="slot"></slot>
    </div>
    <div class="scroll-bar-horizontal" v-show="showHorBar">
      <div class="scroll-bar-thumb" :style="thumbHorSty"></div>
    </div>
    <div class="scroll-bar-vertical" v-show="showVerBar">
      <div
        :class="{active}"
        class="scroll-bar-thumb"
        :style="thumbVerSty"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      ></div>
    </div>
    <div class="scroll-bar-mask" v-show="active"></div>
  </div>
</template>

<script>

let observer = null;

export default {
  name: "ScrollBar",
  data() {
    return {
      showHorBar: false,
      showVerBar: false,
      scrollWrapHeight: 0,
      scrollInnerHeight: 0,
      scrollTop: 0,
      active: false,
      x: 0,
      y: 0,
      marginBottom: 0,
      marginRight: 0,
    };
  },
  computed: {
    thumbVerSty() {
      const actualWrapHeight = this.scrollWrapHeight - this.marginRight;
      const heightPercent = actualWrapHeight / this.scrollInnerHeight * 100;
      const scrollPercent = this.scrollTop / (this.scrollInnerHeight - actualWrapHeight) * 100;
      return {
        height: heightPercent + '%',
        transform: `translateY(${(100 / heightPercent - 1) * scrollPercent}%)`,
      };
    },
    thumbHorSty() {
      return {};
    },
    scrollWrapSty() {
      return {
        marginBottom: -this.marginBottom + 'px',
        marginRight: -this.marginRight + 'px',
      };
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setListener();
      window.addEventListener('load', this.getHeight);
      document.addEventListener('mousemove', this.handleMouseMove);
    });
    window.addEventListener('resize', this.getHeight);
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.getHeight);
    window.removeEventListener('load', this.getHeight);
    observer && observer.disconnect();
  },
  methods: {
    setListener() {
      observer = new MutationObserver(() => {
        this.getHeight();
      });
      observer.observe(this.$refs.scrollWrap, {
        attributes: true, childList: true, subtree: true
      });
    },
    getHeight() {
      const scrollWrap = this.$refs.scrollWrap;
      this.marginRight = scrollWrap.offsetWidth - scrollWrap.clientWidth;
      this.marginBottom = scrollWrap.offsetHeight - scrollWrap.clientHeight;
      this.scrollWrapHeight = scrollWrap.offsetHeight;
      let innerHeight = 0;
      const len = this.$refs.scrollWrap.childNodes.length;
      for (let i = 0; i < len; i++) {
        innerHeight += this.$refs.scrollWrap.childNodes[i].offsetHeight;
      }
      this.scrollInnerHeight = innerHeight;
      this.showVerBar = this.scrollWrapHeight - this.marginRight < innerHeight;
    },
    handleScroll(e) {
      this.scrollTop = e.target.scrollTop;
    },
    handleMouseDown() {
      this.active = true;
      this.x = 0;
      this.y = 0;
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
      if (this.y) {
        const actualWrapHeight = this.scrollWrapHeight - this.marginRight;
        const scrollHeight = this.scrollInnerHeight - actualWrapHeight;
        const diff = e.clientY - this.y;
        let scrollDis = diff / actualWrapHeight * scrollHeight;
        if (diff >= 0) {
          scrollDis += 0.3;
          this.scrollTop + scrollDis > scrollHeight ? this.scrollTop = scrollHeight : this.scrollTop += scrollDis;
        } else {
          scrollDis -= 1.4;
          this.scrollTop + scrollDis < 0 ? this.scrollTop = 0 : this.scrollTop += scrollDis;
        }
        this.$refs.scrollWrap.scrollTop = this.scrollTop;
      }
      this.x = e.clientX;
      this.y = e.clientY;
    },
    scrollTo(distance) {
      this.$refs.scrollWrap.scrollTop = distance;
      this.scrollTop = distance;
    },
  },
}
</script>

<style lang="scss" scoped>
  .scroll-bar {
    position: relative;
    overflow: hidden;
    &:hover {
      .scroll-bar-thumb {
        opacity: 1;
      }
    }
    .scroll-wrap {
      overflow: scroll;
      height: calc(100% + 15px);
      &.scroll-hidden {
        height: 100%;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
        &::-webkit-scrollbar {
          display: none; /* Chrome Safari */
        }
      }
    }
    .scroll-bar-horizontal {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 6px;
    }
    .scroll-bar-vertical {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 6px;
    }
    .scroll-bar-thumb {
      opacity: 0;
      background-color: rgba(144,147,153, .3);
      transition: opacity .3s ease, background-color .3s ease;
      border-radius: 3px;
      cursor: pointer;
      &.active {
        opacity: 1;
        background-color: rgba(144,147,153, .5);
      }
      &:hover {
        background-color: rgba(144,147,153, .5);
      }
    }
    .scroll-bar-mask {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
      cursor: pointer;
    }
  }
</style>
