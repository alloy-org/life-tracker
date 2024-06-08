import { proofImportIsPossible } from "./arbitrary-plugin-module"

// --------------------------------------------------------------------------------------
// API Reference: https://www.amplenote.com/help/developing_amplenote_plugins
// Tips on developing plugins: https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
const plugin = {
  // --------------------------------------------------------------------------------------
  constants: {
    DEFAULT_NOTE_DATA_NAME: "LifeTracker Data",
    DEFAULT_NOTE_DATA_TAGS: [ "data" ],
    NOTE_DATA_SETTING_KEY: "Note Data Name"
  },

  // --------------------------------------------------------------------------------------
  appOption: {
    "Record mood level": async function(app) {
      const noteDataName = await this._fetchNoteDataName(app);
      const moodOptions = [ 1, 2, 3, 4, 5 ].map(value => ({ value, label: value }));
      const result = await app.prompt("Record your current state", inputs: [
        { label: "Mood level", type: "radio", options: moodOptions },
        { label: "What happened in the time leading up to this rating?", type: "text" },
      ]);

      const lifeDataNote = await this._fetchData(app, noteDataName);
      await this._persistData(app, lifeDataNote, "Mood level", result);

    }
  },

  // --------------------------------------------------------------------------------------
  _persistData: async function(app, note, sectionName, result) {
    const content = await app.getNoteSections(note);
    let existingTable = "";
    if (content.includes(`# ${ sectionName }`)) {
      existingTable = await note.getSectionContent(sectionName);
    } else {
      await note.insertContent(`# ${ sectionName }\n`);
    }
    let tableMarkdown = `| Date | Mood | Precipitating events |\n| --- | --- | --- |\n`;
    tableMarkDown += `| ${ new Date().toISOString() } | ${ result[0] } | ${ result[1] } |\n`;
    await note.replaceNoteContent(tableMarkdown, { heading: { text: sectionName, level: 2 }});

  },

  // --------------------------------------------------------------------------------------
  _fetchData: async function(app, noteDataName) {
    const existingNote = await app.findNote({ name: noteDataName });
    if (existingNote) {
      return existingNote;
    }
    const note = await app.createNote(noteDataName, this.constants.DEFAULT_NOTE_DATA_TAGS);
    return note;
  },

  // --------------------------------------------------------------------------------------
  _fetchNoteDataName: async function(app) {
    let noteDataName = await app.settings[this.constants.NOTE_DATA_SETTING_KEY];
    if (!noteDataName) {
      const result = await app.prompt(`Enter the name of the note in which you'd like to record life data (default is "${ this.constants.DEFAULT_NOTE_DATA_NAME }")`,
        inputs: [ { type: "text" } ]
      );
      const noteName = result[0] || this.constants.DEFAULT_NOTE_DATA_NAME;
      noteDataName = noteName;
      await app.setSetting(this.constants.NOTE_DATA_SETTING_KEY, noteDataName);
    }

    return noteDataName;
  },


  // There are several other entry points available, check them out here: https://www.amplenote.com/help/developing_amplenote_plugins#Actions
  // You can delete any of the insertText/noteOptions/replaceText keys if you don't need them
};
export default plugin;
