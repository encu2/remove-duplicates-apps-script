"use strict";

const MAX_ROW_CHECK = 1000;

class preventDuplicate{
  constructor(){
    this._sheetName = '';
    this.spreadsheetDoc;
    this.nextRow = 1;
    this.excludeSheet = '';
  }
  set docID(id){
    this.spreadsheetDoc = SpreadsheetApp.openById(id);
  }
  set docSheetName(sheet){
    this._sheetName = sheet;
  }
  getSheetPosition(arrSheets, nameSheet){ // => number
    const nameSheetsArray = [];
    for(const sheet of arrSheets){
      nameSheetsArray.push(sheet.getSheetName())
    }

    return nameSheetsArray.indexOf(nameSheet);
  }
  workingSheet(activeDoc){ // call getSheetPosition => number
    return this.getSheetPosition(activeDoc.getSheets(), this._sheetName);
  }
  checkIsUrl(arrUrls){// arrUrls[][]
    const valid = [];

    for(const url of arrUrls){
      if(url[0].length > 0 && url[0].slice(0,4).indexOf('http') > -1){
        valid.push(url[0]);
      }
    }

    return valid
  }
  getValidDomain(url){ // Filter the Valid Domain
    return url.match(/((?<=https?:\/\/)([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})?)/g)[0];
  }
  check(list) { // Check duplicate items
    console.log(`Before Filter ==> ${list.length}`);
    const activeSheetPosition = this.workingSheet(this.spreadsheetDoc);
    const targetSheet = this.spreadsheetDoc.getSheets()[activeSheetPosition];
    const urlsActiveRange = targetSheet.getRange(1, 1, MAX_ROW_CHECK * 10, 1);

    let result = [];
    let getUrlArr = urlsActiveRange.getValues().map(e => e[0]);

    for(let i = 0;i < list.length; i++){
      let isAvailable = getUrlArr.indexOf(this.getValidDomain(list[i]));

      if(isAvailable == -1){
        result.push(list[i])
      }
    }

    console.log(`After Filter ==> ${result.length}\n`);
    const print = targetSheet.getRange('L4');
    print.setValue(result.join('\n')); // Write on working sheets L4
    console.log("check cell L4");
  }
  updateBatch(){
    console.log('Update List Batch Start');
    const saveBatchArrPosition = this.workingSheet(this.spreadsheetDoc);
    let arrSheets = this.spreadsheetDoc.getSheets();
    
    for(const [idx, sheet] of arrSheets.entries()){

      if(idx == saveBatchArrPosition || sheet.getSheetName === this.excludeSheet){
        continue;
      }

      const activeRanges = sheet.getRange(1, 1, MAX_ROW_CHECK * 10, 10);
      const getUrlArr = this.checkIsUrl(activeRanges.getValues()).map(e=>{
        return this.getValidDomain(e)
      });

      const rows = arrSheets[saveBatchArrPosition].getRange(1,1, MAX_ROW_CHECK * 10, 1);
      for(let i = this.nextRow; i < (this.nextRow + getUrlArr.length); i++){
        rows.getCell(i,1).setValue(getUrlArr[(i - this.nextRow)]);
      }

      this.nextRow += getUrlArr.length;
    }
    console.log('Update List Batch End')
  }
}
