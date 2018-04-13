import { analyse, IScrutinyAnalysis } from '@app/index';
import { Logger, LogLevel } from '@scrutiny/core/util';
import { expect } from 'chai';
import { ITestCallbackContext } from 'mocha';

Logger.setLogLevel(LogLevel.none);

describe("analysis", () => {
  it("[INTEGRATION] (smoke test) can analyse a package", async function testFunc(this: ITestCallbackContext) {
    // Setup
    this.timeout(30000);
    const packageSpecifiers: string[] = ['mana@0.1.41'];

    // Test
    let scrutinyAnalysis: IScrutinyAnalysis = await analyse(...packageSpecifiers);

    // Assert
    return expect(scrutinyAnalysis).to.exist;
  });
});