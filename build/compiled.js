(() => {
  // lib/plugin.js
  var plugin = {
    // --------------------------------------------------------------------------------------
    constants: {
      DEFAULT_NOTE_DATA_NAME: "LifeTracker Data",
      DEFAULT_NOTE_DATA_TAGS: ["data"],
      NOTE_DATA_SETTING_KEY: "Note Data Name"
    },
    // --------------------------------------------------------------------------------------
    dailyJotOption: {
      "Record mood level": {
        async run(app) {
          await this._queryRecordMoodLevel(app);
        },
        async check(app) {
          const note = await this._fetchDataNote(app);
          if (!note)
            return false;
          return true;
        }
      }
    },
    // --------------------------------------------------------------------------------------
    appOption: {
      "Record mood level": async function(app) {
        await this._queryRecordMoodLevel(app);
      }
    },
    // --------------------------------------------------------------------------------------
    _queryRecordMoodLevel: async function(app) {
      const noteDataName = await this._fetchNoteDataName(app);
      const moodOptions = [1, 2, 3, 4, 5].map((value) => ({ value, label: value }));
      const result = await app.prompt("Record your current state", { inputs: [
        { label: "Mood level", type: "radio", options: moodOptions },
        { label: "What happened in the time leading up to this rating?", type: "text" }
      ] });
      const lifeDataNote = await this._fetchDataNote(app, { noteDataName });
      await this._persistData(app, lifeDataNote, "Mood level", result);
    },
    // --------------------------------------------------------------------------------------
    _persistData: async function(app, note, sectionName, result) {
      const content = await app.getNoteContent(note);
      let existingTable = "";
      if (content.includes(`# ${sectionName}`)) {
        existingTable = await this._sectionContent(content, sectionName);
        if (existingTable?.length) {
          const tableRows = existingTable.split("\n");
          while (tableRows.length) {
            const row = tableRows.shift();
            if (row.includes("**Date**")) {
              break;
            }
          }
          existingTable = tableRows.join("\n");
        }
      } else {
        await app.insertNoteContent(note, `# ${sectionName}
`);
      }
      let tableMarkdown = `# ${sectionName}
`;
      tableMarkdown += `| **Date** | **Mood** | **Precipitating events** |
| --- | --- | --- |
`;
      tableMarkdown += `| ${(/* @__PURE__ */ new Date()).toISOString()} | ${result[0]} | ${result[1]} |
`;
      tableMarkdown += existingTable;
      await app.replaceNoteContent(note, tableMarkdown, { heading: { text: sectionName, level: 2 } });
    },
    // --------------------------------------------------------------------------------------
    _fetchDataNote: async function(app, { noteDataName = null } = {}) {
      if (this._noteHandle)
        return this._noteHandle;
      noteDataName = noteDataName || await this._fetchNoteDataName(app);
      const existingNote = await app.findNote({ name: noteDataName });
      if (existingNote) {
        this._noteHandle = existingNote;
        return existingNote;
      }
      const note = await app.createNote(noteDataName, this.constants.DEFAULT_NOTE_DATA_TAGS);
      this._noteHandle = note;
      return note;
    },
    // --------------------------------------------------------------------------------------
    _fetchNoteDataName: async function(app) {
      let noteDataName = await app.settings[this.constants.NOTE_DATA_SETTING_KEY];
      if (!noteDataName) {
        const result = await app.prompt(
          `Enter the name of the note in which you'd like to record life data (default is "${this.constants.DEFAULT_NOTE_DATA_NAME}")`,
          { inputs: [{ type: "text" }] }
        );
        const noteName = result[0] || this.constants.DEFAULT_NOTE_DATA_NAME;
        noteDataName = noteName;
        await app.setSetting(this.constants.NOTE_DATA_SETTING_KEY, noteDataName);
      }
      return noteDataName;
    },
    // --------------------------------------------------------------------------------------
    // Return all of the markdown within a section that begins with `sectionHeadingText`
    // `sectionHeadingText` Text of the section heading to grab, with or without preceding `#`s
    // `depth` Capture all content at this depth, e.g., if grabbing depth 2 of a second-level heading, this will return all potential h3s that occur up until the next h1 or h2
    _sectionContent(noteContent, headingTextOrSectionObject) {
      console.debug(`_sectionContent()`);
      let sectionHeadingText;
      if (typeof headingTextOrSectionObject === "string") {
        sectionHeadingText = headingTextOrSectionObject;
      } else {
        sectionHeadingText = headingTextOrSectionObject.heading.text;
      }
      try {
        sectionHeadingText = sectionHeadingText.replace(/^#+\s*/, "");
      } catch (err) {
        if (err.name === "TypeError") {
          throw new Error(`${err.message} (line 1054)`);
        }
      }
      const { startIndex, endIndex } = this._sectionRange(noteContent, sectionHeadingText);
      return noteContent.slice(startIndex, endIndex);
    },
    // --------------------------------------------------------------------------------------
    // Return {startIndex, endIndex} where startIndex is the index at which the content of a section
    // starts, and endIndex the index at which it ends.
    _sectionRange(bodyContent, sectionHeadingText) {
      console.debug(`_sectionRange`);
      const sectionRegex = /^#+\s*([^#\n\r]+)/gm;
      const indexes = Array.from(bodyContent.matchAll(sectionRegex));
      const sectionMatch = indexes.find((m) => m[1].trim() === sectionHeadingText.trim());
      if (!sectionMatch) {
        console.error("Could not find section", sectionHeadingText, "that was looked up. This might be expected");
        return { startIndex: null, endIndex: null };
      } else {
        const level = sectionMatch[0].match(/^#+/)[0].length;
        const nextMatch = indexes.find((m) => m.index > sectionMatch.index && m[0].match(/^#+/)[0].length <= level);
        const endIndex = nextMatch ? nextMatch.index : bodyContent.length;
        return { startIndex: sectionMatch.index + sectionMatch[0].length + 1, endIndex };
      }
    }
    // There are several other entry points available, check them out here: https://www.amplenote.com/help/developing_amplenote_plugins#Actions
    // You can delete any of the insertText/noteOptions/replaceText keys if you don't need them
  };
  var plugin_default = plugin;
})();
