// 组件工厂
import ComponentFactory from "./components";

// 内容生成器
import ContentBuilder from "./content/content-builder";
import { getBlockById } from "./components/util";

// 用户操作处理
import UserOperator from "./user-operator";

// 选区相关操作
import focusAt from "./rich-util/focus-at";
import getSelection from "./selection-operator/get-selection";
import insertBlock from "./selection-operator/insert-block";
import insertInline from "./selection-operator/insert-inline";
import modifyDecorate from "./selection-operator/modify-decorate";
import modifySelectionDecorate from "./selection-operator/modify-selection-decorate";
import modifyTable from "./selection-operator/modify-table";
import {
  getContainDocument,
  getContainWindow
} from "./selection-operator/util";

// 操作内容
import mount from "./util/mount";
import createEmptyArticle from "./util/create-empty-article";
import getHtml from "./util/get-html";
import getRawData from "./util/get-raw-data";
import createByRaw from "./util/create-by-raw";
import updateComponent from "./util/update-component";

// 文章历史相关
import { initRecord, createRecord, undo, redo } from "./record/util";

// 一些快捷操作
export * from "./quick-util";

export {
  ComponentFactory,
  getBlockById,
  ContentBuilder,
  UserOperator,
  focusAt,
  getSelection,
  insertBlock,
  insertInline,
  modifyDecorate,
  modifySelectionDecorate,
  modifyTable,
  updateComponent,
  mount,
  createEmptyArticle,
  getHtml,
  getRawData,
  createByRaw,
  initRecord,
  createRecord,
  undo,
  redo,
  getContainDocument,
  getContainWindow
};
