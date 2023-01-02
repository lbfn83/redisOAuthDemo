// https://stackoverflow.com/questions/563406/how-to-add-days-to-date
// 답변 157 번 참조
// https://www.toptal.com/software/definitive-guide-to-datetime-manipulation

// getTime 대신에 new Date().valueOf() 사용도 가능함. 


let ms = new Date().getTime() + 60*60*1000
let ms2 = new Date().valueOf() + 7*60*60*1000
// 이걸 그냥 Date로 해버리면 변하기 전의 원본 시간이 나오네
let oneHourLater = new Date(ms)

const myDate = new Date("July 20, 2016 15:00:00");
const nextDayOfMonth = myDate.getDate() + 20;
myDate.setDate(nextDayOfMonth);
const newDate = myDate.toLocaleString();



console.log(oneHourLater)