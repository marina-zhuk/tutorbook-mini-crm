var SHEET_NAME = "Записи";
var HEADERS = ["Дата записи", "Имя", "Телефон", "Тип занятия", "Дата", "Время", "Комментарий"];

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    // Проверка конфликта слота
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existing = sheet.getRange(2, 5, lastRow - 1, 2).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (existing[i][0] === data.date && existing[i][1] === data.time) {
          return ContentService
            .createTextOutput(JSON.stringify({ ok: false, error: "slot_taken" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Добавить запись
    sheet.appendRow([
      new Date().toLocaleString("ru-RU"),
      data.studentName,
      data.phone,
      data.lessonType,
      data.date,
      data.time,
      data.comment || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, slots: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getRange(2, 5, lastRow - 1, 2).getValues();
    var slots = data.map(function(row) {
      return { date: row[0], time: row[1] };
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, slots: slots }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
