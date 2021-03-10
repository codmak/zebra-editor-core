import ComponentFactory from ".";
import { OperatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import nextTicket from "../util/next-ticket";

export type listType = "ol" | "ul" | "nl";
export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  listType: listType;
}

class List extends StructureCollection<Block> {
  type = ComponentType.list;
  listType: listType;

  static create(componentFactory: ComponentFactory, raw: IRawType): List {
    let children = raw.children
      ? raw.children.map((item: IRawType) =>
          componentFactory.typeMap[item.type].create(item),
        )
      : [];
    let list = componentFactory.buildList(raw.listType);
    list.add(children);
    return list;
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
  ): Block[] {
    let parent = block.getParent();
    // 属于列表的子元素
    if (parent instanceof List) {
      parent.setListType(args[0]);
      return [block];
    }
    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
    if (prev instanceof List && prev.listType === args[0]) {
      prev.add(block);
    } else {
      // 否则新生成一个 List
      let newList = componentFactory.buildList(args[0]);
      newList.add(block, 0);
      parent.add(newList);
    }
    return [block];
  }

  constructor(
    type: listType = "ul",
    children: (string | Block)[] = [],
    style?: StoreData,
    data?: StoreData,
  ) {
    super(style, data);
    this.listType = type;
    let list = children.map((item) => {
      if (typeof item === "string") {
        return this.getComponentFactory().buildParagraph(item);
      }
      return item;
    });
    this.addChildren(0, list);
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px",
      });
    }
  }

  setListType(type: listType = "ol") {
    if (type === this.listType) return;
    this.listType = type;
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px",
      });
    } else {
      this.decorate.mergeStyle({ remove: "paddingLeft" });
    }
    this.$emit("componentUpdated", [this]);
  }

  getType(): string {
    return `${this.type}>${this.listType}`;
  }

  getStatistic() {
    let res = super.getStatistic();
    res.list += 1;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.listType = this.listType;
    return raw;
  }

  createEmpty(): List {
    return this.getComponentFactory().buildList(
      this.listType,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  addChildren(index: number, block: Block[]) {
    // 列表仅能添加 wrapper 包裹的组件
    let list: Block[] = block.map((item) => {
      if (this.listType === "nl") {
        item.decorate.mergeStyle({ display: "block" });
      } else {
        item.decorate.mergeStyle({ remove: "display" });
      }
      return item;
    });
    return super.addChildren(index, list);
  }

  add(block: Block | Block[], index: number = 0): OperatorType {
    // 连续输入空行，截断列表
    if (typeof index === "number" && index > 1) {
      let now = this.getChild(index - 1);
      if (now?.isEmpty() && !Array.isArray(block) && block.isEmpty()) {
        let focus = this.split(index, block);
        now.removeSelf();
        return focus;
      }
    }
    if (!Array.isArray(block)) block = [block];
    let newList = this.addChildren(index, block);
    return [[this, ...newList]];
  }

  removeChildren(start: number, end: number = 0): Block[] {
    // 若子元素全部删除，将自己也删除
    if (end === this.getSize()) {
      nextTicket(() => {
        if (this.getSize() !== 0) return;
        this.removeSelf();
      });
    }

    let removed = super.removeChildren(start, end);
    return removed;
  }

  childHeadDelete(block: Block): OperatorType {
    let parent = this.getParent();
    let index = this.getParent().findChildrenIndex(this);

    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return [[this]];
      return block.sendTo(prev);
    }

    // 第一项时，直接将该列表项添加到父元素上
    block.removeSelf();
    return parent.add(block, index);
  }

  sendTo(block: Block): OperatorType {
    return block.receive(this);
  }

  receive(block?: Block): OperatorType {
    if (!block) return [[this]];
    block.removeSelf();
    if (block instanceof List) {
      return this.add(block.removeChildren(0));
    } else {
      if (block.isEmpty()) {
        block.removeSelf();
        let last = this.getChild(this.getSize() - 1);
        let lastSize = last.getSize();
        return [[last], { id: last.id, offset: lastSize }];
      }
      return this.add(block);
    }
  }

  snapshoot(): IListSnapshoot {
    let snap = super.snapshoot() as IListSnapshoot;
    snap.listType = this.listType;
    return snap;
  }

  restore(state: IListSnapshoot) {
    this.listType = state.listType;
    super.restore(state);
  }

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    let content = contentBuilder.buildList(
      this.id,
      () =>
        this.children
          .map((item) => contentBuilder.buildListItem(item, onlyDecorate))
          .toArray(),
      this.decorate.getStyle(onlyDecorate),
      {
        ...this.decorate.getData(onlyDecorate),
        tag: this.listType === "nl" ? "ul" : this.listType,
      },
    );
    return content;
  }
}

export default List;
