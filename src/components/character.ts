import Inline from "./inline";
import ComponentType from "../const/component-type";
import { storeData } from "../decorate";
import StructureType from "../const/structure-type";

export default class Character extends Inline {
  type = ComponentType.character;
  structureType = StructureType.none;
  content: string;

  constructor(content: string, style?: storeData, data?: storeData) {
    super(style, data);
    this.content = content;
  }

  setContent(char: string) {
    this.content = char;
  }

  render() {
    return this.content;
  }
}
