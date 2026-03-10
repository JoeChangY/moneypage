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
  
    const { questionId, selectData, question, evidence, sql, dbTables, userName, userPassword, dbId} = item;
    let { fullPrompt } = item;
  
    common.logToFile(fullPrompt);
  
    return await (async function () {
      const options = new Chrome.Options();
  
      // options.addArguments('--user-data-dir=/Users/joe/Library/Application Support/Google/Chrome/Profile\ 5'); // mac test
      options.setChromeBinaryPath("/opt/google/chrome/chrome");
      // options.addArguments('--user-data-dir=/Users/joe/Library/Application Support/Google/Chrome/Default'); // 使用者資料目錄
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
        await action.jump('https://console.cloud.google.com/bigquery/agents_hub?project=aemon-projects-dev-002', '', '1800-1');
        await loginGoogleAccoiunt(driver, userName, userPassword);
  
        const iframe = await driver.wait(
          until.elementLocated(By.xpath('//iam-permissions-banner//iframe')),
          sleepTime
        );
        await driver.switchTo().frame(iframe);
  
        await driver.sleep(3000);
        const agentMatCardDataBase = await driver.findElement(By.xpath(`//mat-card[.//span[text()=" ${dbId} "]]`));
        await agentMatCardDataBase.click();

        //input prompt
        await action.waitAndInput(fullPrompt, action.selectType.XPATH, '//ca-message-writer//textarea', sleepTime, '1802');
        // await action.waitForStale(action.selectType.XPATH, '//button[@data-test-id="send-message-button"]', sleepTime , 'wait for click send prompt button');
        await action.waitAndClick(action.selectType.XPATH, '//button[@data-test-id="send-message-button"]', sleepTime , 'wait for click send prompt button');
  
        // const sendButtonLocator = By.css('[data-test-id="send-message-button"]');
  
        // await driver.wait(
        //   until.elementLocated(sendButtonLocator)
        // );
  
        // const sendButton = await driver.findElement(sendButtonLocator);
  
        // await driver.wait(async () => {
        //   const isDisabled = await sendButton.getAttribute('disabled');
        //   return isDisabled !== 'true' && isDisabled !== 'disabled';
        // }, sleepTime, 'send button is still disabled');
  
        // await sendButton.click();
        
        // await driver.sendKeys(Key.RETURN);
        const time = new Date();
        const sendPromptTime = moment().format('YYYY-MM-DD HH:mm');
        common.log(`send Prompt time:${time}`);
  
        await action.wait(action.selectType.XPATH, '//div[contains(@class, "response")]//ca-message-feedback//button[@mat-icon-button]', 180000, '1803');
        latency = new Date().getTime() - time.getTime();
        common.log(`latency time:${latency}`);
        common.logToFile(`latency time:${latency}`);
        const responseTime = moment().format('YYYY-MM-DD HH:mm');
        const responseTimePlusOneMinute = moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm');
        common.logToFile(`response Time:${responseTimePlusOneMinute}`);
  
        //input prompt end

        //show reasoning
        let showReasonButton = await driver.findElements(By.xpath("//ca-message-response//button[.//mat-icon[text()='arrow_drop_down']]"));
        if (showReasonButton.length > 0)
          {
            for (let i = 0; i < showReasonButton.length; i++)
              {
                showReasonButton[0].click();
                common.logToFile(`showReasonButton is clicked`);
              }
          }
        
        let snapShotShowReason = await common.screenshotTimestampRecord(driver, item.questionId);
        snapshots.push(snapShotShowReason);

        //find all raw text and table
        common.log("get all raw text and table.");
        await driver.manage().setTimeouts({ implicit: 3000 });
  
        let textResponseXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"text-response")]//ca-markdown-text//p';
        let textResponse = await driver.findElements(By.xpath(textResponseXpath));
  
        if (textResponse.length > 0)
        {
          for (let i = 0; i < textResponse.length; i++)
          {
            rawText += await textResponse[i].getAttribute('textContent')+'\n';
            common.logToFile(`rawTextInfo:${await textResponse[i].getAttribute('textContent')}`);
          }
        } else
        {
          common.logToFile("No text found.");
        }

        let textResponseUlXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"text-response")]//ca-markdown-text//ul';
        let textResponseUl = await driver.findElements(By.xpath(textResponseUlXpath));
  
        if (textResponseUl.length > 0)
        {
          for (let i = 0; i < textResponseUl.length; i++)
          {
            rawText += await textResponseUl[i].getAttribute('textContent')+'\n';
            common.logToFile(`rawTextInfo:${await textResponseUl[i].getAttribute('textContent')}`);
          }
        }

              let textResponseOlXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"text-response")]//ca-markdown-text//ol';
              let textResponseOl = await driver.findElements(By.xpath(textResponseOlXpath));
        
              if (textResponseOl.length > 0)
              {
                for (let i = 0; i < textResponseOl.length; i++)
                {
                  rawText += await textResponseOl[i].getAttribute('textContent') + '\n';
                  common.logToFile(`rawTextInfo:${await textResponseOl[i].getAttribute('textContent')}`);
                }
              }
        
              let textResponseCodeXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"text-response")]//ca-markdown-text//code';
              let textResponseCode = await driver.findElements(By.xpath(textResponseCodeXpath));
        
              if (textResponseCode.length > 0)
              {
                for (let i = 0; i < textResponseCode.length; i++)
                {
                  rawText += await textResponseCode[i].getAttribute('textContent') + '\n';
                  common.logToFile(`rawTextInfo:${await textResponseCode[i].getAttribute('textContent')}`);
                }
              }
  
        let errorTextXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"error-text")]';
        let errorTextResponse = await driver.findElements(By.xpath(errorTextXpath));
        if (errorTextResponse.length > 0)
        {
          for (let i = 0; i < errorTextResponse.length; i++)
          {
            rawText += await errorTextResponse[i].getAttribute('innerHTML');
            common.logToFile(`rawTableInfo:${await errorTextResponse[i].getAttribute('innerHTML')}`);
          }
        }

        let errorTextExpandXpath = '//ca-message-response//mat-expansion-panel-header[.//div[contains(@class,"error-text")]]';
        let errorTextExpandResponse = await driver.findElements(By.xpath(errorTextExpandXpath));
        if (errorTextExpandResponse.length > 0)
        {
          for (let i = 0; i < errorTextExpandResponse.length; i++)
          {
            await errorTextExpandResponse[i].click();
          }
        }
  
        let errorDetailsXpath = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"error-details")]';
        let errorDetailsResponse = await driver.findElements(By.xpath(errorDetailsXpath));
        if (errorDetailsResponse.length > 0)
        {
          for (let i = 0; i < errorDetailsResponse.length; i++)
          {
            rawText += await errorDetailsResponse[i].getAttribute('innerHTML');
          }
        }

        let snapShotExpandItem = await common.screenshotTimestampRecord(driver, item.questionId);
        snapshots.push(snapShotExpandItem);

        await driver.manage().setTimeouts({ implicit: sleepTime });
  
        //$x('//div[contains(@class, "response")]//ca-message-response//button[@data-guidedhelpid="alchemist-how-was-this-calculated"]')
        const calculationInfoButtons = await waitForElement(driver, '//div[contains(@class, "response")]//ca-message-response//button[@data-guidedhelpid="alchemist-how-was-this-calculated"]', 10000);
        let xpathExpression = '//div[contains(@class, "response")]//ca-message-response//div[contains(@class,"text-response")]';
        if (calculationInfoButtons.length > 0)
        {
          common.log(`conversational automation is successful`);
          response = 'conversational automation is successful';

        responseTableHtml = await driver.findElements(By.xpath('//div[contains(@class, "response")]//ca-message-response//div[@class = "table-container"]'));
        if (responseTableHtml.length > 0)
        {
          for (let i = 0; i < responseTableHtml.length; i++)
          {
            rawTable += await responseTableHtml[i].getAttribute('innerHTML');
            common.logToFile(`rawTextInfo:${await responseTableHtml[i].getAttribute('innerHTML')}`);
          }
        }

          const lastCalcButtonIndex = calculationInfoButtons.length;
          common.log(`number:${lastCalcButtonIndex}`);
          let calculationInfoButton = calculationInfoButtons[0];
          await driver.wait(until.elementIsVisible(calculationInfoButton), 5000);
          await driver.wait(until.elementIsEnabled(calculationInfoButton), 5000);
          calculationInfoButton.click();
          await driver.sleep(5000);
  
          await action.wait(selectType.XPATH, '//div[contains(@class, "response")]//ca-message-response//mat-expansion-panel', sleepTime);
          common.log("receive answer details.");
          await driver.manage().setTimeouts({ implicit: 0 }); // Temporarily disable implicit wait to ensure no wait time
          const codeExpandButtons = await driver.findElements(By.xpath('//div[contains(@class, "response")]//ca-message-response//mat-expansion-panel//span[contains(text(), "Code")]'));
          await driver.manage().setTimeouts({ implicit: sleepTime });// Restore the original implicit wait from config
  
          if (codeExpandButtons.length > 0)
          {
            const lastCodeButtonIndex = codeExpandButtons.length;
            codeExpandButtons[lastCodeButtonIndex - 1].click();
          }
  
          await driver.sleep(3000);
          const codeBlockElement = await action.wait(selectType.XPATH, '//div[contains(@class, "response")]//ca-message-response//mat-expansion-panel//ca-code-view', sleepTime);
          if (codeBlockElement)
          {
            rawResponse = await codeBlockElement.getAttribute('textContent');
            common.logToFile(`sqlCode:${rawResponse}`);
          }
  
        }
  
        //start screen shots
        await driver.sleep(5000);
        common.log("get full assistant result.");
        common.log("printe screen shot.");
  
  
        const element = await driver.findElement(By.css('.thread'));
        let currentScroll = 0;
        let scrollHeight = await driver.executeScript("return arguments[0].scrollHeight;", element);
  
        await driver.executeScript("arguments[0].scrollTop += 1000;", element);
        currentScroll = await driver.executeScript("return arguments[0].scrollTop;", element);
        scrollHeight = await driver.executeScript("return arguments[0].scrollHeight;", element);
        await driver.sleep(5000);
  
        let snapShotAgentEnd = await common.screenshotTimestampRecord(driver, item.questionId);
        snapshots.push(snapShotAgentEnd);
        //agent is end
        //here is debug info action
        // await action.waitAndClick(selectType.XPATH, '//div[@class = "debug-info-header-text"]', sleepTime, "debug info header click", '1808');
  
        // await driver.sleep(3000);
  
  
        // let snapShotItem = await common.screenshotTimestampRecord(driver, item.questionId);
        // snapshots.push(snapShotItem);
  
        // await action.waitAndClick(
        //   action.selectType.XPATH,
        //   '//div[contains(@class,"mdc-tab")]//span[text()="Response"]',
        //   sleepTime,
        //   'click Response button.',
        //   '1808-1'
        // );
  
        // await driver.sleep(10000);
  
        // const rawRequestAndRawResponseInfo = await driver.findElements(By.xpath('//div[contains(@class,"mat-mdc-tab-body-content")]//ca-code-view'));
        // const lastInfo = rawRequestAndRawResponseInfo.length - 1;
        // const lastTwoInfo = rawRequestAndRawResponseInfo.length - 2;
  
        // rawRequest = await rawRequestAndRawResponseInfo[lastTwoInfo].getAttribute('textContent');
        // jsonRawResponse = await rawRequestAndRawResponseInfo[lastInfo].getAttribute('textContent');
        // common.logToFile(`here is rawRequest: ${rawRequest}`);
        // common.logToFile(`here is rawResponse: ${jsonRawResponse}`);
        // snapShotItem = await common.screenshotTimestampRecord(driver, item.questionId);
        // snapshots.push(snapShotItem);
        //end of debug info
  
      } catch (error)
      {
      common.log(`here is error happen:`+error);
      response = parseError(error);
      rawResponse = response;
      common.logToFile(JSON.stringify(response));
      common.log(`Error during interaction: ${error}`);
      common.logToFile(`error status,`+JSON.stringify(response));
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
  async function loginGoogleAccoiunt(driver, userName, userPassword) {
    try
    {
      if (!userName)
      {
        userName = "test-sqb1@cienet.com";
        userPassword = "@Cienet12661266";
      }
  
      await action.waitAndInput(userName, action.selectType.ID, 'identifierId', sleepTime, 'input identifierId.', '1801-2');
      await driver.sleep(1000); // 等待輸入框完全處理輸入
      await driver.findElement(By.id('identifierId')).sendKeys(Key.RETURN);
  
      await action.waitAndInput(userPassword, action.selectType.NAME, 'Passwd', sleepTime, '1801-4');
      await driver.sleep(1000); // 等待密碼輸入完成
      await driver.findElement(By.name('Passwd')).sendKeys(Key.RETURN);
  
    } catch (error)
    {
      common.logToFile(`login to google error`)
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

//curl -X POST http://localhost:4000 -H 'Content-Type: application/json' -d "{\"type\": \"CA_BQ_AGENT\", \"resultOid\": 0, \"gAccount\": \"joe.chang@cienet.com\", \"gPassword\": \"gem328pam839\", \"lookerAccount\": \"joe.chang@cienet.com\", \"lookerPassword\": \"Gan0204520@\", \"dbId\": \"california_schools\", \"fullPrompt\": \"Day of the week this year with the least conversations\", \"selectData\": \"transcript_with_messages\", \"sql\": \"SELECT \`Free Meal Count (K-12)\` / \`Enrollment (K-12)\` FROM frpm WHERE \`County Name\` = 'Alameda' ORDER BY (CAST(\`Free Meal Count (K-12)\` AS REAL) / \`Enrollment (K-12)\`) DESC LIMIT 1\", \"dbTables\": [\"transcript_with_messages\"]}"
