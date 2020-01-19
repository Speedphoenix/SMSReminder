// dashboard for the sms sender provider at https://ui.smsmode.com/home
// WARNING check that the first api request works too.

function setTriggers() {
  // Deletes all triggers in the current project.
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Create the new trigger every day at 20:00
  ScriptApp.newTrigger("sendReminders")
  .timeBased()
  .atHour(getStatics().sendHour)
  .everyDays(1)
  .create();
}

// returns this sms should have already been sent
// givenTime must be the actual time when the objects will be brought
function shouldBeSent(givenTime, now) {
  const sendHour = getStatics().sendHour - 1; // send the SMS if we've passed 19:00
  const sendMinute = 0;
  
  // the givenTime's offset.
  // If the given time was created using the date (only year, month and day), the time of day is set to 00:00 based on timezone
  var difference = (24 * 60 * 60 * 1000) - (sendHour * 60 * 60 * 1000);
  return (now.getTime() >= givenTime.getTime() - difference);
}

// this returns a valid access token and remembers how many times each access token has been used
function getAccessToken(sheet) {
  const tokenCol = 9;
  const useCountCol= 10;
  var i = 2;
  var count = sheet.getRange(i, useCountCol).getValue();
  var token = sheet.getRange(i, tokenCol).getValue();
  while (token !== "" && count <= 0) {
    i++;
    count = sheet.getRange(i, useCountCol).getValue();
    token = sheet.getRange(i, tokenCol).getValue();
  }
  if (token === "")
    throw 'no more access tokens available';
  
  if (count === '')
    count = 0;
  sheet.getRange(i, useCountCol).setValue(count - 1);
  return sheet.getRange(i, tokenCol).getValue();
  // or if you have just one access token that is guaranteed to work a sufficient amount of times
  // return "thetoken";
}

function getStatics() {
  // provide the sheet's ID if this script is not attached to a sheet, or if SpreadsheetApp.getActiveSheet() does not work for some reason
  const sheetID = "YOUR SHEET ID HERE"; // the sheet's ID here (you can find it in the url of the sheet)
  
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet === null) {
    sheet = SpreadsheetApp.openById(sheetID).getActiveSheet();
    if (sheet === null)
      throw "could not get a sheet";
  }
  
  var returnedObject = {
    sheet: sheet,
    nameCol: 1,
    phoneCol: 2,
    dateCol: 3,
    msgCol: 4,
    isSentCol: 5,
    sendHour: 20,
    emetteur: 'NOISE', // put your name here, like 'BDE + NOISE' or something
  };
  return returnedObject;
}

function makeMessage(name, msg) {
  if (msg === "") {
    return "Hello "+ name + "\n"
    + "N'oublie pas d'apporter tes dons au stand NOISE demain";
  } else {
    return "Hello "+ name + "\n"
    + "N'oublies pas d'apporter ton/ta/tes " + msg + " demain";
  }
}

function sendReminders() {
  var sheet, name, phoneNum, askedTime, message, sendTime, isSent, currentTriggers;
  
  // static consts
  var scs = getStatics();
  sheet = scs.sheet;
  const nameCol = scs.nameCol;
  const phoneCol = scs.phoneCol;
  const dateCol = scs.dateCol;
  const msgCol = scs.msgCol;
  const isSentCol = scs.isSentCol;
  
  var now = new Date();
    
  var i = 2;
  while (sheet.getRange(i, nameCol).getValue() !== "") {
    name = sheet.getRange(i, nameCol).getValue();
    phoneNum = sheet.getRange(i, phoneCol).getValue();
    askedTime = sheet.getRange(i, dateCol).getValue();
    message = sheet.getRange(i, msgCol).getValue();
    isSent = sheet.getRange(i, isSentCol).getValue();
        
    if (isSent === "" && shouldBeSent(askedTime, now)) {
      sendSMSGet(getAccessToken(sheet), makeMessage(name, message), phoneNum, scs.emetteur);
      sheet.getRange(i, isSentCol).setValue("sent");
    }
    i++;
  }
}

// send SMS with GET method
function sendSMSGet(accessToken, message, destinataires, emetteur) {
  
  var finalPath = "https://" + 'api.smsmode.com/http/1.6/sendSMS.do?' + 'accessToken=' + accessToken + '&numero=' + destinataires + 
    "&message=" + encodeURIComponent(message) + '&emetteur=' + emetteur + '&stop=1';
  
  var response = UrlFetchApp.fetch(finalPath);
  Logger.log('' + response.getResponseCode() + ': ' + response.getContentText());
}


/*

// this doesn't seem to be needed, and google sheets properly reads those as dates already...
// for french date formats

function getDateFromString(givenstr) {
  // french dates are (for the moment) formatted as "dd/mm/yyyy hh:mm"
  const year = givenstr.split('/')[2];
  const month = givenstr.split('/')[1];
  const day = givenstr.split('/')[0];
  return new Date(year, month, day, hour, sec);
}

// returns the Date at which to send the sms
// givenTime must be the actual time when the objects will be brought
function timeToSend(givenTime) {
  const sendHour = 20; // send the SMS at 20:00 the day before
  const sendMinute = 0;
  
  // the givenTime's offset.
  // If the given time was created using the date (only year, month and day), the time of day is set to 00:00 based on timezone
  var difference = (24 * 60 * 60 * 1000) - (sendHour * 60 * 60 * 1000);
  return new Date(givenTime.getTime() - difference);
}

function refreshReminders() {
  var sheet, name, phoneNum, askedTime, message, sendTime, isSent, currentTriggers;
  
  // static consts
  var scs = getStatics();
  sheet = scs.sheet;
  const nameCol = scs.nameCol;
  const phoneCol = scs.phoneCol;
  const dateCol = scs.dateCol;
  const msgCol = scs.msgCol;
  const isSentCol = sc.isSendCol;
  
  
  //var now = new Date();
  // the number of milliseconds since January 1st 1970. can do operations on it
  //now.getTime();
  
  // new Date(year, month, day, hours, minutes, seconds, milliseconds);
  // formatDate(date, timeZone, format)
  // Session.getScriptTimeZone();
  // "yyyy-MM-dd'T'HH:mm:ss"
  
  currentTriggers = ScriptApp.getProjectTriggers();
  
  var i = 2;
  while (sheet.getRange(i, nameCol).getValue() !== "") {
    name = sheet.getRange(i, nameCol).getValue();
    phoneNum = sheet.getRange(i, phoneCol).getValue();
    askedTime = getDateFromString(sheet.getRange(i, dateCol).getValue());
    message = sheet.getRange(i, msgCol).getValue();
    isSent = sheet.getRange(i, isSentCol).getValue();
    
    
    if (isSent === "") {
      sendTime = timeToSend(askedTime);
      currentTriggers.forEach(function(element) {
        console.log(element);
      });
      
      ScriptApp.newTrigger("myFunction")
      .timeBased()
      .at(sendTime)
      .create();
    }
    i++;
  }
}
*/
