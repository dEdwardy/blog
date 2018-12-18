Date.prototype.format = function(fmt) {
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  for(let k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt;
}
export default class Utils{
   static format = (val) => {
    if(typeof val!=='number'|'date')return false;
    return  parseInt(val)>9?parseInt(val):'0'+parseInt(val);
  };
    static now = () =>{
    let date = new Date();
    let year = date.getFullYear();
    let month = Utils.format(date.getMonth()+1);
    let day = Utils.format(date.getDate());
    let hour = Utils.format(date.getHours());
    let min = Utils.format(date.getMinutes());
    let sec = Utils.format(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`
  };
}

console.log(Utils.now());
console.log(new Date().format('yyyy-MM-dd hh:mm:ss'))
