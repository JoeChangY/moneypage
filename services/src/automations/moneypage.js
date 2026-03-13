const { Builder, By, Key, until } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const common = require('../../../utilities/common.js');
const moment = require('moment');
const action = require('../../../utilities/action.js');
const selectType = action.selectType;
const config = require('../config/config.js');
let sleepTime = config.DEFAULT_ENV.SLEEP_TIME;


async function executeMoneypageAgent(item) {
  common.log("Starting Google login automation...");
  let preparedPrompt = '';
  let response = null;
  let rawResponse = '';
  let latency = 0;
  let isError = false;
  let catalog = '';
  let snapshots = [];
  let queryId = null;
  let rawText = '';
  let rawTable = '';
  let rawRequest = '';
  let jsonRawResponse = '';

  const { bossName, pickerName, treasures, players, sql, dbTables, userName, userPassword, dbId } = item;
  let { fullPrompt } = item;

  common.logToFile(fullPrompt);

  return await (async function () {
    const options = new Chrome.Options();

    options.setChromeBinaryPath('/usr/bin/chromium-browser');
    // options.setChromeBinaryPath("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"); //mac test

    options.addArguments('--headless');  // 無頭模式
    options.addArguments('--no-sandbox');  // 防止沙盒模式問題
    options.addArguments('--disable-dev-shm-usage');  // 解決一些 Linux 系統中的共享內存問題
    options.addArguments('--remote-debugging-port=9222');  // 啟動 DevTools 端口，對調試很有用
    options.addArguments('--disable-gpu');  // 禁用 GPU 加速，防止一些圖形渲染問題
    options.addArguments('--start-maximized');  // 啟動時最大化窗口
    options.addArguments('--disable-software-rasterizer');  // 禁用軟件光柵器
    options.addArguments('--incognito');  // 開啟無痕模式
    options.windowSize({ width: 1920, height: 1080 });

    const service = new Chrome.ServiceBuilder('/usr/local/bin/chromedriver'); // macOS 上這邊要正確指向 chromedriver
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).setChromeService(service).build();
    await driver.manage().window().setRect({ width: 1920, height: 3000 });
    try
    {
      action.initialize(driver);
      await driver.manage().setTimeouts({ implicit: sleepTime });
      await action.jump('https://money.mmorpg.plus/Identity/Account/Login?ReturnUrl=%2F', '', '1800-1');
      await loginAccount(driver, userName, userPassword);

      await driver.sleep(3000);
      const agentOpenNewOrder = await driver.findElement(By.xpath(`//a[.//span[text()="開單分鑽"]]`));
      await agentOpenNewOrder.click();

      //input prompt
      const agentCreateNewList = await driver.findElement(By.xpath(`//a[contains(text(),"建立全新的分鑽單")]`));
      await agentCreateNewList.click();

      // const sendButtonLocator = By.css('[data-test-id="send-message-button"]');

      //here is select boss
      await action.waitAndClick(action.selectType.ID, 'select2-Input_BossId-container', sleepTime, 'click kill boss', '1801-2');
      await action.waitAndInput(bossName, action.selectType.XPATH, '//input[@aria-controls="select2-Input_BossId-results"]', sleepTime, 'search boss', '1801-2');
      await action.waitAndClick(action.selectType.XPATH, '//ul[@id="select2-Input_BossId-results"]//li', sleepTime, 'click boss');



      for (let item = 0; item < treasures.length; item++)
      {
        await driver.sleep(1000);
        if(item > 0){
          await action.waitAndClick(action.selectType.XPATH, '//div[contains(@class, "item-list__actions")]//button[contains(@class, "btn--green")]', sleepTime, 'click add treasures');
        }
        //here is search picker
        await action.waitAndClick(action.selectType.ID, 'select2-Input_OrderTreasures_0__Picker-container', sleepTime, 'search picker', '1801-2');
        await action.waitAndInput(pickerName, action.selectType.XPATH, '//input[@aria-controls="select2-Input_OrderTreasures_0__Picker-results"]', sleepTime, 'search boss', '1801-2');
        await action.waitAndClick(action.selectType.XPATH, `//ul[@id="select2-Input_OrderTreasures_0__Picker-results"]//li[contains(text(), ${pickerName})]`, sleepTime, 'click boss');

        //here is search orderTreasures
        await action.waitAndClick(action.selectType.ID, `select2-Input_OrderTreasures_${item}__TreasureId-container`, sleepTime, 'search orderTreasures', '1801-2');
        await action.waitAndInput(treasures[item], action.selectType.XPATH, `//input[@aria-controls="select2-Input_OrderTreasures_${item}__TreasureId-results"]`, sleepTime, 'search treasures', '1801-2');
        await action.waitAndClick(action.selectType.XPATH, `//ul[@id="select2-Input_OrderTreasures_${item}__TreasureId-results"]//li[contains(text(), ${treasures[item]})]`, sleepTime, 'click treasures');

      }
      
      ////span[contains(@class, "select2-container")]
      for (let per=0;per<players.length;per++){
        await action.waitAndClick(action.selectType.XPATH, '//div[contains(@class, "form__input")]//select[@id="Input_Player"]', sleepTime, 'click players');
        await action.waitAndInput(players[per], action.selectType.XPATH, '//input[@class="select2-search__field"]]', sleepTime, 'search players', '1801-2');
        await action.waitAndClick(action.selectType.XPATH, `//ul[@id="select2-Input_Player-results"]//li[contains(text(), ${players[per]})]`, sleepTime, 'click players');
      }

      //no image upload to complete
      await action.waitAndClick(action.selectType.XPATH, '//div[contains(@class, "form__footer")]//button[contains(@class, "btn--primary")]', sleepTime, 'click complete');

      //start screen shots
      await driver.sleep(5000);


    } catch (error)
    {
      common.log(`here is error happen:` + error);
      response = parseError(error);
      rawResponse = response;
      common.logToFile(JSON.stringify(response));
      common.log(`Error during interaction: ${error}`);
      common.logToFile(`error status,` + JSON.stringify(response));
      let snapShotItem = await common.screenshotTimestampRecord(driver, item.questionId);
      snapshots.push(snapShotItem);
    } finally
    {
      await action.destory();
      return { rawResponse, latency, isError, snapshots, queryId, fullPrompt, rawTable, rawText, rawRequest, jsonRawResponse };
    }

    function parseError(error) {
      let errorCode = action.getErrorCode() ? action.getErrorCode() : 0;
      let step = action.getStep() ? action.getStep() : "Unknown";
      const errorMessages = {
        0: "Unknown error",
        1800: "connect to Conversational Analytics",
        1801: "login to Conversational Analytics",
        1802: "send prompts",
        1803: "get response",
        1804: "clean up",
        1805: "login to get query id",
        1806: "no SQL response",
        1807: "no query result",
        1808: 'searchbar status'
      };
      const errorStatus = errorMessages[errorCode] + `(${step})` || `Unknown error`;
      const errResponse = { errorCode: errorCode, errorMessage: errorStatus, step: step, rawResponse: '', stackTrace: error };
      if (!response)
      {
        isError = true;
        response = errorStatus;
      }
      return response;
    }

  })();
}

//login function
async function loginAccount(driver, userName, userPassword) {
  try
  {
    if (!userName)
    {
      userName = "accountant";
      userPassword = "oxcr159357";
    }
    await action.waitAndClick(action.selectType.ID, 'select2-Input_TeamsId-container', sleepTime, 'click Input_TeamsId.', '1801-2');
    await action.waitAndInput('壞壞大聯盟', action.selectType.CLASSNAME, 'select2-search__field', sleepTime, 'input select 壞壞.', '1801-2');
    await action.waitAndClick(action.selectType.XPATH, '//li[text()="壞壞大聯盟"]', sleepTime, 'wait for click 聯盟');

    await action.waitAndInput(userName, action.selectType.ID, 'Input_Account', sleepTime, 'input Input_Account.', '1801-2');
    await driver.sleep(1000); // 等待輸入框完全處理輸入

    await action.waitAndInput(userPassword, action.selectType.ID, 'Input_Password', sleepTime, '1801-4');
    await driver.sleep(1000); // 等待密碼輸入完成
    await action.waitAndClick(action.selectType.XPATH, '//button[text()="登入"]', sleepTime, 'wait for click 聯盟');

  } catch (error)
  {
    common.logToFile(`login to google error`)
    common.logToFile(error)
  }
}

async function waitForElement(driver, xpath, timeout) {
  try
  {
    // 使用顯式等待尋找元素
    const elements = await driver.wait(
      until.elementsLocated(By.xpath(xpath)),
      timeout
    );
    return elements; // 返回找到的元素
  } catch (error)
  {
    if (error.name === 'TimeoutError')
    {
      console.log(`Element not found within ${timeout} ms: ${xpath}`);
      return []; // 如果超時返回空陣列
    } else
    {
      throw error; // 如果是其他錯誤則拋出
    }
  }
}


module.exports = {
  execute: executeMoneypageAgent
};

//curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d "{\"bossName\": \"西瑪\", \"pickerName\": \"accountant\", \"userName\": \"accountant\", \"userPassword\": \"oxcr159357\", \"treasures\": [\"魂體轉換\",\"祝武\"], \"players\": [\"極品鮮奶茶\",\"壞孩子\"]}"
//bossName, pickerName, treasures, players,