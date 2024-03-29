import { Map } from "immutable";
import { v4 as uuidv4 } from "uuid";
import Decorate, { AnyObject } from "../decorate";
import Record from "../record";
import Collection from "./collection";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { Cursor } from "../selection/util";
import { ListType } from "./list";
import { HeadingEnum } from "./heading";
import { TableCellEnum } from "./table";

export type OperatorType = [Cursor?, Cursor?] | undefined;

export interface JSONType {
  id?: string;
  type: ComponentType | string;
  children?: JSONType[];
  style?: AnyObject;
  data?: AnyObject;
  // for CharacterList
  content?: string;
  // for Media or InlineImage
  src?: string;
  // for Media
  mediaType?: string;
  // fro Heading
  headingType?: HeadingEnum;
  // for List
  listType?: ListType;
  // for TableRow
  cellType?: TableCellEnum;
  size?: number;
  // for CodeBlock
  language?: string;
  // for CustomCollection
  tag?: string;
}

export interface Snapshoot {
  style: Map<string, string>;
  data: Map<string, string>;
}

abstract class Component {
  id: string = uuidv4();
  parent?: Collection<Component>;
  decorate: Decorate;
  record: Record;
  abstract type: ComponentType | string;
  abstract structureType: StructureType;
  data: AnyObject = {};
  style: AnyObject = {};

  constructor() {
    this.decorate = new Decorate(this);
    this.record = new Record(this);
  }

  modifyDecorate(style?: AnyObject, data?: AnyObject) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
  }

  snapshoot(): Snapshoot {
    return {
      style: this.decorate.style,
      data: this.decorate.data,
    };
  }

  restore(state: Snapshoot) {
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }

  getType(): string {
    return this.type;
  }

  getJSON(): JSONType {
    let json: JSONType = {
      type: this.type,
    };
    if (!this.decorate.styleIsEmpty()) {
      json.style = this.decorate.copyStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      json.data = this.decorate.copyData();
    }
    return json;
  }

  destory() {}

  abstract render(contentView: AbstractView): any;
}

export default Component;
