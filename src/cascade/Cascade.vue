<template>
  <div class="cascade">
    <CascadePane
      class="pane"
      v-for="(item, index) in paneList"
      :key="index"
      :value="value"
      :nodes="item"
      :trigger="trigger"
      :title="titles[index]"
      :multi="multi"
      :height="height"
      @change="handleChange"
      @expand="handleExpand"
    />
  </div>
</template>

<script>
import CascadePane from "./CascadePane";
import { deepCopy } from '../fn';
export default {
  name: "Cascade",
  components: {CascadePane},
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    dataList: {
      type: Array,
      default: () => [
        /**
         * {
         *    id: '',
         *    name: '',
         *    children: [],
         *  },
         */
      ],
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
    height: {
      type: Number,
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      nodes: [],
      paneList: [],
      expandList: [],
      selectedList: [],
    };
  },
  watch: {
    dataList: {
      handler(val) {
        const nodes = deepCopy(val);
        this.addAttr(nodes, 0);
        this.nodes = nodes;
        this.paneList = [nodes];
        this.$emit('updateNodes', this.nodes);
      },
      deep: true,
      immediate: true,
    },
    value: {
      handler() {
        let value = [...this.value];
        this.updateValue(this.nodes, value);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateValue(list, value) {
      list.forEach(item => {
        if (value.some(v => v.id === item.id)) {
          item.selected = true;
          item.children && this.selectChildrenAll(item.children, true);
          value = value.filter(v => v.id !== item.id);
        } else {
          item.selected = false;
          item.disabled = false;
          if (item.children) {
            this.updateValue(item.children, value);
          }
        }
      });
    },
    selectChildrenAll(list, bool) {
      list.forEach(item => {
        item.disabled = bool;
        if (item.children) {
          this.selectChildrenAll(item.children, bool);
        }
      });
    },
    addAttr(list, level) {
      list.forEach(item => {
        item.level = level;
        item.selected = this.value.some(v => v.id === item.id);
        item.disabled = false;
        if (item.children) {
          this.addAttr(item.children, level + 1);
        }
      });
    },
    handleExpand(node) {
      if (node.children) {
        this.paneList = [...this.paneList.slice(0, node.level + 1), node.children];
        this.expandList = [...this.expandList.slice(0, node.level), node];
      } else {
        this.paneList = this.paneList.slice(0, node.level + 1);
      }
      this.$nextTick(() => {
        this.$emit('expand', node);
      });
    },
    handleChange(val) {
      if (this.multi) {
        this.$emit('change', val);
      } else {
        this.selectedList.forEach(item => item.selected = false);
        this.selectedList = [...this.expandList, val];
        this.selectedList.forEach(item => item.selected = true);
        this.$emit('change', this.selectedList.map(item => ({id: item.id, name: item.name})));
      }
    },
  },
}
</script>

<style lang="scss" scoped>
  .cascade {
    display: flex;
    .pane {
      border-right: 1px solid #3c3c3c;
      &:last-child {
        border-right: none;
      }
    }
  }
</style>
