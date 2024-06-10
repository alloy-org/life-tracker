import { jest } from "@jest/globals"
import { mockAppWithContent, mockPlugin } from "./test-helpers.js"

// --------------------------------------------------------------------------------------
describe("This here plugin", () => {
  const plugin = mockPlugin();
  plugin.constants.isTestEnvironment = true;

  it("should run some tests", async () => {
    const { app, note } = mockAppWithContent(`To be, or not to be, that is the cool question`);
    app.prompt.mockImplementation(async (text, options) => {
      if (!options) return null;
      return -1;
    });
    await plugin.appOption["Record mood level"];
  })
});
