import { proofImportIsPossible } from "./arbitrary-plugin-module"
import { DEFAULT_NOTE_NAME} from "./constants"

// --------------------------------------------------------------------------------------
// API Reference: https://www.amplenote.com/help/developing_amplenote_plugins
// Tips on developing plugins: https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
const plugin = {
  // --------------------------------------------------------------------------------------
  constants: {
    noteName: DEFAULT_NOTE_NAME,
    noteNameSettingLabel: "Name of note to store tracker data within",
  },

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  appOption: {
    // --------------------------------------------------------------------------
    "Record data": async function(app) {

    }
  },

  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#replaceText
  replaceText: {
  },

  // There are several other entry points available, check them out here: https://www.amplenote.com/help/developing_amplenote_plugins#Actions
  // You can delete any of the insertText/noteOptions/replaceText keys if you don't need them
};
export default plugin;
