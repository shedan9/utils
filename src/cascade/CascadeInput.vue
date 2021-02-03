<template>
  <div class="cascade-input" ref="cascadeInput">
    <input
      v-model="inputValue"
      type="text"
      class="input"
      :placeholder="placeholder"
      :readonly="!filterable"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
    />
    <div
      ref="dropShow"
      v-show="dropShow"
      class="input-drop-down"
      :style="{left: dropLeft + 'px', top: dropTop + 'px'}"
      @mouseenter="overDrop = true"
      @mouseleave="overDrop = false"
    >
      <Cascade
        ref="cascade"
        v-show="cascadeShow"
        v-model="cascadeValue"
        :multi="multi"
        :dataList="dataList"
        :trigger="trigger"
        :titles="titles"
        :height="height"
        @expand="handleExpand"
        @updateNodes="updateSearchList"
      />
      <CascadeSearch v-show="searchShow" :list="filterList" @select="handleSelect" :height="height + 40" :width="searchWidth" />
    </div>
  </div>
</template>

<script>
import Cascade from "./Cascade";
import CascadeSearch from "./CascadeSearch";
export default {
  name: "CascadeInput",
  components: {CascadeSearch, Cascade},
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    dataList: {
      type: Array,
      default: () => [],
    },
    titles: {
      type: Array,
      default: () => [],
    },
    trigger: {
      type: String,
      default: () => 'click',
      validator: value => ['click', 'hover'].includes(value),
    },
    multi: {
      type: Boolean,
    },
    placeholder: {
      type: String,
      default: () => '请选择',
    },
    filterable: {
      type: Boolean,
      default: () => false,
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      inputValue: '',
      dropShow: false,
      overDrop: false,
      dropLeft: 0,
      dropTop: 0,
      dropLeftOrigin: 0,
      searchList: [],
      filterList: [],
      height: 0,
      searchWidth: 0,
    };
  },
  mounted() {
    window.addEventListener('resize', this.getHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getHeight);
  },
  computed: {
    searchShow() {
      return this.filterable && !!this.inputValue;
    },
    cascadeShow() {
      return !this.searchShow;
    },
    cascadeValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('change', val);
      },
    },
  },
  watch: {
    dropShow(val) {
      if (val) {
        setTimeout(() => {
          document.addEventListener('click', this.handleDocumentClick);
        }, 200);
        this.$nextTick(() => {
          this.computedDropOffset();
          this.getHeight();
        });
      } else {
        document.removeEventListener('click', this.handleDocumentClick);
      }
    },
  },
  methods: {
    getHeight() {
      const winHeight = (document.documentElement || document.body).clientHeight;
      let el = this.$refs.cascadeInput, top = 0;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      this.height = winHeight - top - 32 - 20 - 40;
      this.searchWidth = this.$refs.cascadeInput.offsetWidth;
    },
    updateSearchList(nodes) {
      if (this.filterable) {
        this.initSearchList(nodes);
      }
    },
    initSearchList(list) {
      list.forEach(item => {
        this.searchList.push(item);
        if (item.children) {
          this.initSearchList(item.children);
        }
      });
    },
    handleFocus() {
      this.dropShow = true;
    },
    handleBlur() {
      if (!this.overDrop) {
        this.inputValue = '';
        this.dropShow = false;
      }
    },
    handleInput() {
      const inputVal = this.inputValue.trim();
      if (!inputVal) return this.filterList = [];
      this.filterList = this.searchList.filter(item => item.name.indexOf(inputVal) !== -1);
    },
    handleSelect(item) {
      let ret = [...this.value];
      if (item.selected) {
        ret.push(item);
      } else {
        ret = ret.filter(r => r.id !== item.id);
      }
      this.$emit('change', ret);
    },
    computedDropOffset() {
      let el = this.$refs.cascadeInput, left = 0, top = 0;
      while (el) {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent;
      }
      const winWidth = (document.documentElement || document.body).clientWidth;
      const cascadeWith = this.$refs.cascade.$el.offsetWidth;
      if (cascadeWith + this.dropLeftOrigin > winWidth) {
        const overflow = this.dropLeftOrigin + cascadeWith - winWidth;
        this.dropLeft = this.dropLeftOrigin - overflow;
      } else {
        this.dropLeft = left;
        this.dropLeftOrigin = left;
      }
      this.dropTop = top + 32;
    },
    handleDocumentClick(e) {
      let el = e.target, show = false;
      while (el) {
        if (el === this.$refs.cascadeInput) {
          show = true;
          break;
        } else {
          el = el.parentNode;
        }
      }
      this.dropShow = show;
    },
    handleExpand(node) {
      const winWidth = (document.documentElement || document.body).clientWidth;
      const cascadeWith = this.$refs.cascade.$el.offsetWidth;
      if (cascadeWith + this.dropLeftOrigin > winWidth) {
        const overflow = this.dropLeftOrigin + cascadeWith - winWidth;
        this.dropLeft = this.dropLeftOrigin - overflow;
      } else {
        this.dropLeft = this.dropLeftOrigin;
      }
      this.$emit('expand', node);
    },
  },
}
</script>

<style lang="scss" scoped>
  .cascade-input {
    position: relative;
    .input {
      width: 100%;
      height: 32px;
      background: #010101;
      padding-left: 12px;
      color: #fff;
      &::-webkit-input-placeholder { /* WebKit browsers */
        color: rgba(255, 255, 255, .6);
        font-size: 13px;
      }

      &::-moz-placeholder { /* Mozilla Firefox 19+ */
        color: rgba(255, 255, 255, .6);
        font-size: 13px;
      }

      &:-ms-input-placeholder { /* Internet Explorer 10+ */
        color: rgba(255, 255, 255, .6);
        font-size: 13px;
      }
      &:focus {
        outline: none;
        /*&::-webkit-input-placeholder {*/
        /*  color: #83898F;*/
        /*}*/
        /*&::-moz-placeholder {*/
        /*  color: #83898F;*/
        /*}*/

        /*&:-ms-input-placeholder {*/
        /*  color: #83898F;*/
        /*}*/
      }
    }
    .input-drop-down {
      position: fixed;
      z-index: 999;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
</style>
