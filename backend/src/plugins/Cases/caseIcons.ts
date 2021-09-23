import { CaseTypes } from "../../data/CaseTypes";

export const caseIcons: Record<CaseTypes, string> = {
  [CaseTypes.Ban]: "<:case_ban:890535999006986281>",
  [CaseTypes.Unban]: "<:case_unban:890535999006990416>",
  [CaseTypes.Note]: "<:case_note:890535999162179604>",
  [CaseTypes.Warn]: "<:case_warn:890535998780489749>",
  [CaseTypes.Kick]: "<:case_kick:890535999149572096>",
  [CaseTypes.Mute]: "<:case_mute:890535998826635265>",
  [CaseTypes.Unmute]: "<:case_unmute:890535998642077707>",
  [CaseTypes.Deleted]: "<:case_deleted:890535998809849867>",
  [CaseTypes.Softban]: "<:case_softban:890535998616903692>",
};
