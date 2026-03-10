const { WebDriver, By, until, WebElement, Key } = require('selenium-webdriver');
const { log, screenshot } = require('./common.js');

/**
 * action class that wrap selenium actions.
 */
class action {
  constructor() {
    this.stepStatus = ''; // Initialize stepStatus as a class property
  }
  /**
   * Initialize action by sending a selenium web driver object.
   * @param {WebDriver} driver A selenium web driver.
   */
  initialize(driver) {
    this.driver = driver;
    this.stepStatus = '';
  }
  /**
   * Destory and clean action class.
   */
  async destory() {
    if (this.driver)
    {
      await this.driver.sleep(2000);
      await this.driver.quit();
    }
    log("Finishing script...");
    this.driver = null;
    this.stepStatus = '';
  }
  /**
   * Handle exception and log it then throw it.
   * @param {Error} error 
   */
  handlerError(error, resultOid = '') {
    log(error);
    screenshot(this.driver, resultOid);
    throw error;
  }
  /**
   * Select type matches Selenium By class method.
   */
  selectType = {
    ID: "id",
    CSS: "css",
    XPATH: "xpath",
    NAME: "name",
    LINKTEXT: "linkText",
    CLASSNAME: "className"
  }
  /**
   * Formate date string.
   * @param {Date} d A Date object.
   * @returns {string} Formatted date string. Ex: 2022-08-26 03:42:02.281 UTC
   */
  parseDateString = (d) => {
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()} ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}.${d.getUTCMilliseconds()} UTC`;
  }
  /**
   * Generates a log object. 
   * @param {WebElement} element A selenium web element.
   * @param {Date} startTime A date object.
   * @param {string} text Extra information that required.
   * @returns {string} A log object that json stringified.
   */
  async generateLog(element, startTime, text) {
    let id = null;
    if (element && element.getId)
    {
      id = await element.getId();
    }
    const logInfo = {
      "startTime": this.parseDateString(startTime),
      "logContent": {
        "uiElement": id,
        "url": await this.driver.getCurrentUrl(),
        "custom": ""
      },
      "message": text,
      "endTime": this.parseDateString(new Date())
    };

    return JSON.stringify(logInfo);
  }

  async setStepStatus(status) {
    this.stepStatus = status;
  }

  getErrorCode() {
    let errorCode = this.stepStatus;
    if (this.stepStatus && this.stepStatus.split("-")[0]) errorCode = this.stepStatus.split("-")[0];
    return errorCode;
  }

  getStep() {
    let step = this.stepStatus;
    if (this.stepStatus && this.stepStatus.split("-")[1]) step = this.stepStatus.split("-")[1];
    return step;
  }

  /**
   * Input and log.
   * @param {string} text Text that will be send.
   * @param {string} selectType Which select type should you use.
   * @param {string} selector Selector that will use to find html element.
   * @param {string} logMessage Message that will be logged.
   */
  async input(text, selectType, selector, logMessage, stepStatus = "") {
    const startTime = new Date();
    const input = await this.driver.findElement(By[selectType](selector));
    await input.sendKeys(text);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Input and log.
   * @param {string} text Text that will be send.
   * @param {element} input element found by driver.
   * @param {string} logMessage Message that will be logged.
   */
  async sendKeys(text, input, logMessage, stepStatus = "") {
    const startTime = new Date();
    await input.sendKeys(text);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Input with a enter and log.
   * @param {string} text Text that will be send.
   * @param {string} selectType Which select type should you use.
   * @param {string} selector Selector that will use to find html element.
   * @param {string} logMessage Message that will be logged.
   */
  async inputWithEnter(text, selectType, selector, logMessage, stepStatus = "") {
    const startTime = new Date();
    const input = await this.driver.findElement(By[selectType](selector));
    await input.sendKeys(text);
    await input.sendKeys(Key.ENTER);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Input with a enter and log.
   * @param {string} text Text that will be send.
   * @param {element} input element found by driver.
   * @param {string} logMessage Message that will be logged.
   */
  async sendKeysWithEnter(text, input, logMessage, stepStatus = "") {
    const startTime = new Date();
    await input.sendKeys(text);
    await input.sendKeys(Key.ENTER);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Clear input and type text.
   * @param {string} text Text that will be send.
   * @param {string} selectType Which select type should you use.
   * @param {string} selector Selector that will use to find html element.
   * @param {string} logMessage Message that will be logged.
   */
  async clearAndInput(text, selectType, selector, logMessage, stepStatus = "") {
    const startTime = new Date();
    const input = await this.driver.findElement(By[selectType](selector));
    await input.clear();
    await input.sendKeys(text);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Clear input and type text.
   * @param {string} text Text that will be send.
   * @param {WebElement} input A WebElement found by driver.
   * @param {string} logMessage Message that will be logged.
   */
  async clearAndSendKeys(text, input, logMessage, stepStatus = "") {
    const startTime = new Date();
    await input.clear();
    await input.sendKeys(text);
    log(await this.generateLog(input, startTime, `${logMessage}\n${text}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Click and log.
   * @param {string} selectType Which select type should you use.
   * @param {string} selector Selector that will use to find html element.
   * @param {string} logMessage Message that will be logged.
   */
  async click(selectType, selector, logMessage, stepStatus = "") {
    const startTime = new Date();
    const button = await this.driver.findElement(By[selectType](selector));
    await button.click();
    log(await this.generateLog(button, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Click and log.
   * @param {element} element element found by driver.
   * @param {string} logMessage Message that will be logged.
   */
  async clickElement(element, logMessage, stepStatus = "") {
    const startTime = new Date();
    await element.click();
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Execute script that given.
   * @param {string} script A script that will be executed.
   * @param {string} logMessage Message that will be logged.
   */
  async execute(script, logMessage, elem, stepStatus = "") {
    const startTime = new Date();
    await this.driver.executeScript(script, elem);
    log(await this.generateLog(null, startTime, `${logMessage}\n${script}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }
  /**
   * Wait element to be located.
   * @param {string} selectType Which selector type you will be used.
   * @param {string} selector Selector that will use to find html element.
   * @param {number} timeout Wait time in milisecond.
   * @param {string} logMessage Message that will be logged.
   * @return {Promise<WebElement>} A WebElement that you found. 
   */
  async wait(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.wait(until.elementLocated(By[selectType](selector)), timeout);
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
    return element;
  }

  async waitWithoutError(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const originalTimeouts = await this.driver.manage().getTimeouts();

    try
    {
      await this.driver.manage().setTimeouts({ implicit: 0 });
      const element = await this.driver.wait(
        until.elementLocated(By[selectType](selector)),
        timeout
      );
      log(await this.generateLog(element, startTime, logMessage));
      if (stepStatus) await this.setStepStatus(stepStatus);
      return element;
    } catch (err)
    {
      log(`wait(${selector}) timeout after ${timeout}ms:`, err.message);
      return null;
    } finally {
    await this.driver.manage().setTimeouts(originalTimeouts);
    }
  }
  /**
   * Wait element to be enabled.
   * @param {string} selectType Which selector type y ou will be used.
   * @param {string} selector Selector that will use to find html element.
   * @param {number} timeout Wait time in milisecond. 
   * @param {string} logMessage Message that will be logged.
   * @return {Promise<WebElement>} A WebElement that you found.
   */
  async waitForEnable(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.findElement(By[selectType](selector));
    await this.driver.wait(until.elementIsEnabled(element), timeout);
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
    return element;
  }
  /**
   * Wait elment to be visibile. 
   * @param {string} selectType 
   * @param {string} selector 
   * @param {number} timeout 
   * @param {string} logMessage 
   * @returns {Promise<WebElement>} A WebElement that you found.
   */
  async waitForVisible(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.findElement(By[selectType](selector));
    await this.driver.wait(until.elementIsVisible(element), timeout);
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
    return element;
  }
  /**
   * Wait element to be stale.
   * @param {string} selectType 
   * @param {string} selector 
   * @param {number} timeout 
   * @param {string} logMessage 
   */
  async waitForStale(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.findElement(By[selectType](selector));
    await this.driver.wait(until.stalenessOf(element), timeout);
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }
  /**
   * Wait document title to be changed to.
   * @param {string} title A regex string that title will be.
   * @param {number} timeout Wait time in milisecond.
   * @param {string} logMessage Message that will be logged.
   */
  async waitForTitle(title, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    await this.driver.wait(until.titleMatches(title), timeout);
    log(await this.generateLog(this.driver, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }
  /**
   * Wait for an element and input.
   * @param {string} text Text that will be send.
   * @param {string} selectType Which selector type you will be used.
   * @param {string} selector Selector that will use to find html element.
   * @param {number} timeout Wait time in milisecond.
   * @param {string} logMessage Message that will be logged.
   */
  async waitAndInput(text, selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.wait(until.elementLocated(By[selectType](selector)), timeout);
    await element.sendKeys(text);
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Wait for a element and click.
   * @param {string} selectType Which selector type you will be used.
   * @param {string} selector Selector that will use to find html element.
   * @param {number} timeout Wait time in milisecond.
   * @param {string} logMessage Message that will be logged.
   */
  async waitAndClick(selectType, selector, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.wait(until.elementLocated(By[selectType](selector)), timeout);
    await element.click();
    log(await this.generateLog(element, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Wait for a element by javascript execute.
   * @param {Function} func A function that will be execute in wait.
   * @param {[]} args An array that represents parameters will be inject in function.
   * @param {number} timeout Wait time in milisecond.
   * @param {string} logMessage Message that will be logged.
   */
  async waitByJs(func, args, timeout, logMessage, stepStatus = "") {
    const startTime = new Date();
    await this.driver.wait(until.elementLocated(By.js(func, args)), timeout);
    log(await this.generateLog(null, startTime, `Executed function: ${func}, args: ${args}, ${logMessage}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }
  /**
   * Find element and scroll it into view.
   * @param {string} selectType Which select type should you use.
   * @param {string} selector Selector that will use to find html element.
   * @param {string} logMessage Message that will be logged.
   */
  async scrollIntoView(selectType, selector, logMessage, stepStatus = "") {
    const startTime = new Date();
    const element = await this.driver.findElement(By[selectType](selector));
    const script = 'arguments[0].scrollIntoView({ block: "center" });';
    await this.driver.executeScript(script, element);
    log(await this.generateLog(element, startTime, `${logMessage}\n${script}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Find element and scroll it into view.
   * @param {WebElement} element A WebElement taht found by driver.
   * @param {string} logMessage Message that will be logged.
   */
  async scrollIntoViewForElem(element, logMessage, stepStatus = "") {
    const startTime = new Date();
    const script = 'arguments[0].scrollIntoView({ block: "center" });';
    await this.driver.executeScript(script, element);
    log(await this.generateLog(element, startTime, `${logMessage}\n${script}`));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }
  /**
   * Jump to the url.
   * @param {string} url A url that will be jumped.
   * @param {string} logMessage Message that will be logged.
   */
  async jump(url, logMessage, stepStatus = "") {
    const startTime = new Date();
    await this.driver.get(url);
    log(await this.generateLog(null, startTime, logMessage));
    if (stepStatus) await this.setStepStatus(stepStatus);
  }

  /**
   * Switch to another iframe.
   * @param {string} id Id that can be found to idenity an iframe.
   */
  async switchFrame(id) {
    await this.driver.switchTo().frame(id);
  }

  /**
   * Switch back to default content.
   */
  async switchToDefault() {
    await this.driver.switchTo().defaultContent();
  }

  /**
   * Sending text in control speed.
   * @param {string} text Text that you wish to send.
   * @param {number} ms Milliseconds delay in each character.
   */
  async sendTextPerMilliSecond(text, ms = 100) {
    const list = text.split('');

    for (const s of list)
    {
      if (s === '\r' || s === '\n')
      {
        // simulation Shift + Enter
        await this.driver.actions()
          .keyDown(Key.SHIFT)
          .sendKeys(Key.ENTER)
          .keyUp(Key.SHIFT)
          .perform();
      } else
      {
        await this.driver.actions().sendKeys(s).perform();
      }

      await this.driver.sleep(ms);
    }
  }

}

module.exports = new action();