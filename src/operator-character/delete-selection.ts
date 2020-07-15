import focusAt from "../operator-selection/focus-at";
import { cursorType, getSelectedIdList } from "../operator-selection/util";
import { getBlockById } from "../components/util";

// 删除 start - end 的内容
const deleteSelection = (start: cursorType, end?: cursorType) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    return;
  }
  let idList = getSelectedIdList(start.id, end.id);
  // 选中多行
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getBlockById(idList[0]);
    let focus = component.remove(start.offset, end.offset);
    return focusAt(focus);
  }

  let firstComponent = getBlockById(idList[0]);
  let lastComponent = getBlockById(idList[idList.length - 1]);
  firstComponent.remove(start.offset);
  lastComponent.remove(0, end.offset);

  // 其他情况，删除中间行，首尾行合并
  lastComponent.sendTo(firstComponent);
  for (let i = 1; i < idList.length - 1; i++) {
    getBlockById(idList[i]).removeSelf();
  }
  return focusAt({
    id: firstComponent.id,
    offset: start.offset
  });
};

export default deleteSelection;