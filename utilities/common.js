const fs = require("fs");
const os = require("os");
const { WebDriver } = require("selenium-webdriver");

const outputFilename = '{datetime}_{action}_response.json';

/**
 * A datetime sting of now.
 * @returns a date time string that requires by vm name.
 */
const datetimestring = () => {
  const toString = (n) => {
    return n.toString().padStart(2, '0');
  }
  const d = new Date();
  return `${d.getFullYear()}${toString(d.getMonth() + 1)}${toString(d.getDate())}${toString(d.getHours())}${toString(d.getMinutes())}${toString(d.getSeconds())}`;
};

let counter = 1;
/**
 * Take a screenshot and save it in file.
 * @param {WebDriver} driver a selenium web driver.
 */
const screenshot = (driver, resultOid = '') => {
  driver.takeScreenshot().then(function (data) {
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    let fileName = resultOid !== '' ? `out-${datetimestring()}.${resultOid}.png` : `out-${datetimestring()}.png`
    fs.writeFile(fileName, base64Data, 'base64', function (err) {
      if (err)
      {
        console.log(err);
      }
    });
    counter++;
  });
};

const screenshotTimestamp = (driver, resultOid = '') => {
  driver.takeScreenshot().then(function (data) {
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    let fileName = resultOid !== '' ? `${resultOid}-${datetimestring()}.png` : `${datetimestring()}.png`
    fs.writeFile(fileName, base64Data, 'base64', function (err) {
      if (err)
      {
        console.log(err);
      }
    });
    counter++;
  });
};

const screenshotRecord = async (driver, resultOid = '') => {
  const snapshots = await driver.takeScreenshot().then(function (data) {
    const bufferSnapshots = Buffer.from(snapshots, 'base64');
    const fileContent = Array.from(bufferSnapshots);
    let fileName = resultOid !== '' ? `${resultOid}-${datetimestring()}.png` : `${datetimestring()}.png`
    const base64Data = data.replace(/^data:image\/png;base64,/, "");

    const snapshotsList = [{
      fileName: fileName,
      fileContent: fileContent
    }]
    fs.writeFile(fileName, base64Data, 'base64', function (err) {
      if (err)
      {
        console.log(err);
      }
    });
    return snapshotsList;
  });

};

const screenshotTimestampRecord = async (driver, resultOid = '') => {
  console.log('here is exec snapshots')
  const base64Data = await driver.takeScreenshot();
  const datetime = datetimestring();
  const fileName = resultOid ?
    `${resultOid}-${datetime}.png` :
    `${datetime}.png`;
  const bufferSnapshots = Buffer.from(base64Data, 'base64');
  const fileContent = Array.from(bufferSnapshots);

  const snapshotsItem = {
    fileName: fileName,
    fileContent: fileContent
  };

  try
  {

    fs.writeFile(fileName, base64Data, 'base64', function (err) {
      if (err)
      {
        console.log(err);
      }
    });
    console.log(`snapshot is success: ${fileName}`);

  } catch (err)
  {
    console.log(`snapshot is fail: ${fileName}`, err);
  }
  return snapshotsItem;

};

/**
 * Log into console and a list that later will be write into file.
 * @param {string} message element name, element information, url...etc.
 */
const log = (message) => {
  console.log(`[${new Date()}] ${message}`);
};

/**
 * Write log information into a file.
 * @param {string} message A message that will be written into log file.
 * @param {string} path A path that file will be saved.
 */
const logToFile = (message = '', path = 'debug.log') => {
  log(message);
  fs.open(path, 'a', 0o666, function (err, id) {
    if (err)
    {
      log(`Append to log file throws exceptions. ${err}, ${new Date()}`);
    }
    fs.write(id, os.EOL + `[${new Date()}] ${message}`, null, 'utf8', function () {
      fs.close(id, function () {
        console.log('file is updated');
      });
    });
  });
};

/**
 * Append resource information into file.
 * @param {string} path A path that file will be saved.
 * @param {questionId} questionId A question id.
 * @param {string} line A line that will be appended into file.
 */
const appendToFile = (path, questionId, line) => {
  fs.open(path, 'a', 0o666, function (err, id) {
    if (err)
    {
      console.log('Append to file throws exception.', err, new Date());
    }
    let newLine = line + os.EOL;
    if (questionId >= 0)
    {
      newLine = `    "${questionId}": "${line}",${os.EOL}`;
    }
    fs.write(id, `${newLine}`, null, 'utf8', function () {
      fs.close(id, function () {
        console.log('file is updated');
      });
    });
  });
};

module.exports = {
  outputFilename,
  datetimestring,
  screenshot,
  screenshotTimestamp,
  screenshotRecord,
  screenshotTimestampRecord,
  log,
  logToFile,
  appendToFile
};
