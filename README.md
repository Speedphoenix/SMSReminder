# SMSReminder
A Google Apps script to send SMS reminders automatically

## Instructions for use
1) Create a [Google Spreadsheet](https://docs.google.com/spreadsheets/) using your Google Account
2) Fill in the sheet with the names and credentials of the people to remind, along with the date before which they need to be reminded (see [Default syntax of the sheet](#default-syntax-of-the-sheet) below)
3) Add a script to the page using Tools>Script Editor, or create a project on [script.google.com](https://script.google.com/home)
4) Edit the script, and paste the code from [Code.gs](Code.gs) in this repository
5) If you created a new project instead of adding a script directly in the sheet, change the constant `sheetID` to the [spreadsheet ID](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id) of your sheet
6) Run the function `setTriggers()`
7) If you haven't saved your script yet, it will prompt you to do so
8) There may be a warning saying this script is not yet approved by google, go to "more options" and say you agree
9) When Google prompts you, give the authorization to your script to edit your spreadsheet etc
10) Enjoy! You can check or make it so that the script is set to run every day by going to Edit-> Current project triggers

### Default syntax of the sheet

Lines for remindees start on the second line

By default, for each reminded person:

|Column|Content|
|--|--|
|A|Name|
|B|Phone number|
|C|Date before which they need to be reminded|
|D|Thing to remember (optional)|
|E|This column is used by the script to remember whether a reminder was sent already|

**:warning:The first row will be ignored by the script.** You can put labels there

These can be changed in the `getStatics()` function.
> If you want a reminder to be sent again, empty the corresponding cell in the 'sent' column (column `E`)

Make sure you do not have empty lines before the end of your significant entries.  
The script will stop at the first line with an empty `name` cell

**You can change the message that is sent in the `makeMessage()` function**

---

Running the function `setTriggers()` will ensure that the script is run every day at the hour specified by `sendHour` in `getStatics()`. If you change `sendHour`, make sure you run `setTriggers()` again.  
**Do not change the trigger manually from outside the script** as that will not change what the script sees as the right time to send the SMS, and you may have it send remminders a day late.

### Using an SMS api

This scrip is compatible with the [SMSmode API](https://www.smsmode.com/en/).  
You can create an SMSmode account on [their website](https://ui.smsmode.com/register).

Credits are necessary to send SMS. You will receive 20 free credits upon providing your phone number, but you will need to buy credits if that is not enough. (One SMS sent goes for one credit) 

From the dashboard, go to Settings -> Access Token and create an access token.

You have two ways of adding the access token to your script:

1. Put it as the return value of the `getAccessToken()` function
2. Put it in the sheet, along with its number of remaining credits.  
This goes by default in columns `I` and `J` (starting from the second row).
    > This is especially useful if there are multiple people with different accounts and you are not sure whether a single account's credits will sufice.

