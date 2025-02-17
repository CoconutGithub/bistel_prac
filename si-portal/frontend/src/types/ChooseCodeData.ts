export interface  ChooseCodeData {
  codeId: number;
  parentId: number;
  codeName: string;
  defaultText: string;
  msgId: number;
  level: number;
  codeOrder: number;
  status: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
  isAdd: boolean;
  isDelete: boolean;
  acode: string;
  bcode: string;
  ccode: string;
  adcode: string;
  ecode: string;
}

/**
 * Represents the properties of a message.
 */
export interface MsgProps{
  msgId: number;
  defaultText: string;
}